'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const suppliesController = require('../controllers/supplies.controller');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

const router = express.Router();

// 1. Discovery & Catalog
router.get('/categories', suppliesController.getCategories);
router.get('/products', suppliesController.getProducts);
router.get('/products/:id', suppliesController.getProductById);

// 2. Seller Inventory Management
router.post(
  '/products',
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('category').trim().notEmpty().withMessage('Product category is required'),
    body('manufacturer').trim().notEmpty().withMessage('Manufacturer is required'),
    body('purpose').trim().notEmpty().withMessage('Purpose is required'),
    body('price').isFloat({ min: 1 }).withMessage('Valid positive price is required'),
    body('stock_quantity').isInt({ min: 0 }).withMessage('Valid stock quantity is required')
  ],
  validate,
  suppliesController.createProduct
);

router.patch(
  '/products/:id/stock',
  [
    param('id').trim().notEmpty().withMessage('Product ID is required'),
    body('stock_quantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer')
  ],
  validate,
  suppliesController.updateProductStock
);

// 3. Cart & Order Placement (Farmer)
router.post(
  '/orders',
  [
    body('items').isArray({ min: 1 }).withMessage('Cart must contain at least 1 item'),
    body('delivery_address').trim().notEmpty().withMessage('Delivery address is required'),
    body('district').trim().notEmpty().withMessage('District is required')
  ],
  validate,
  suppliesController.placeOrder
);

// 4. Order Tracking & Purchase History
router.get('/orders/farmer', suppliesController.getFarmerOrders);
router.get('/orders/seller/:sellerId', suppliesController.getSellerOrders);

// 5. Seller Status Transitions
router.patch(
  '/orders/:id/status',
  [
    param('id').trim().notEmpty().withMessage('Order ID is required'),
    body('status')
      .isIn(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Status must be placed, confirmed, shipped, delivered, or cancelled')
  ],
  validate,
  suppliesController.updateOrderStatus
);

// 6. Product Review
router.post(
  '/products/:id/reviews',
  [
    param('id').trim().notEmpty().withMessage('Product ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review_text').trim().isLength({ min: 3 }).withMessage('Review text must be at least 3 characters')
  ],
  validate,
  suppliesController.submitProductReview
);

module.exports = router;
