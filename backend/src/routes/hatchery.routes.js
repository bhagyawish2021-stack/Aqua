const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const hatcheryController = require('../controllers/hatchery.controller');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

const router = express.Router();

// 1. Discovery taxonomy & hubs
router.get('/species', hatcheryController.getSpeciesCategories);
router.get('/hubs', hatcheryController.getFarmerHubs);

// 2. Search & Filter hatcheries
router.get('/', hatcheryController.getHatcheries);

// 3. Orders: Farmer's list
router.get('/orders/farmer', hatcheryController.getFarmerOrders);

// 4. Order creation (Farmer requests seed)
router.post(
  '/orders',
  [
    body('product_id').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
    body('required_date').notEmpty().withMessage('Required stocking date is required')
  ],
  validate,
  hatcheryController.createSeedOrder
);

// 5. Update Order Status (Hatchery accepts / rejects / dispatches / completes)
router.patch(
  '/orders/:orderId/status',
  [
    param('orderId').notEmpty().withMessage('Order ID is required'),
    body('status').isIn(['pending', 'accepted', 'rejected', 'dispatched', 'completed', 'cancelled']).withMessage('Valid status is required')
  ],
  validate,
  hatcheryController.updateOrderStatus
);

// 6. Hatchery Profile & Details
router.get('/:id', hatcheryController.getHatcheryById);

// 7. Hatchery Registration
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Hatchery name is required'),
    body('contact_person').trim().notEmpty().withMessage('Contact person is required'),
    body('phone').trim().notEmpty().withMessage('Contact phone number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('district').trim().notEmpty().withMessage('District is required')
  ],
  validate,
  hatcheryController.createHatchery
);

// 8. Admin Verification Toggle (Strict verification rule)
router.patch(
  '/:id/verify',
  [
    param('id').notEmpty().withMessage('Hatchery ID is required'),
    body('is_approved').optional().isBoolean()
  ],
  validate,
  hatcheryController.verifyHatchery
);

// 9. Add Product to Hatchery Seed Inventory
router.post(
  '/:id/products',
  [
    param('id').notEmpty().withMessage('Hatchery ID is required'),
    body('species_category').notEmpty().withMessage('Species category is required'),
    body('species_name').notEmpty().withMessage('Species name is required'),
    body('price_per_unit').isNumeric().withMessage('Valid price per unit is required'),
    body('current_stock_quantity').optional().isInt()
  ],
  validate,
  hatcheryController.addProduct
);

// 10. Update Seed Inventory Product
router.patch(
  '/products/:productId',
  [
    param('productId').notEmpty().withMessage('Product ID is required')
  ],
  validate,
  hatcheryController.updateProduct
);

// 11. Hatchery's Incoming Orders
router.get('/:id/orders', hatcheryController.getHatcheryOrders);

// 12. Submit Review
router.post(
  '/:id/reviews',
  [
    param('id').notEmpty().withMessage('Hatchery ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],
  validate,
  hatcheryController.addReview
);

module.exports = router;
