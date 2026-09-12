'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const equipmentController = require('../controllers/equipment.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// ─── Categories & Public Listings ─────────────────────────────────────────────
router.get('/categories', equipmentController.getCategories);
router.get('/favorites/me', equipmentController.getFavorites);
router.get('/', equipmentController.getListings);
router.get('/:id', equipmentController.getListingById);

// ─── Seller CRUD ─────────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Product title is required.'),
    body('category').custom((val, { req }) => {
      if (!val && !req.body.category_id) {
        throw new Error('Category is required.');
      }
      return true;
    }),
    body('price').isFloat({ min: 1 }).withMessage('Valid price is required.'),
    body('location').notEmpty().withMessage('Location is required.'),
    body('state').notEmpty().withMessage('State is required.'),
    body('district').notEmpty().withMessage('District is required.'),
    body('contact_phone').notEmpty().withMessage('Contact phone is required.'),
  ],
  equipmentController.createListing
);

router.put('/:id', equipmentController.updateListing);
router.patch('/:id/status', equipmentController.markListingStatus);
router.delete('/:id', equipmentController.deleteListing);

// ─── Favorites, Trust & Inquiries ──────────────────────────────────────────
router.post('/:id/favorite', equipmentController.toggleFavorite);
router.post('/:id/inquire', equipmentController.recordInquiry);

router.post(
  '/reviews',
  [
    body('seller_id').notEmpty().withMessage('Seller ID is required.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  ],
  equipmentController.submitReview
);

router.post(
  '/reports',
  [
    body('listing_id').notEmpty().withMessage('Listing ID is required.'),
    body('reason').notEmpty().withMessage('Reason is required.'),
  ],
  equipmentController.submitReport
);

module.exports = router;
