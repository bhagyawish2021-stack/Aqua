'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const seafoodController = require('../controllers/seafood.controller');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

const router = express.Router();

// 1. Taxonomy & Seafood Catch Discovery
router.get('/taxonomy', seafoodController.getTaxonomy);
router.get('/listings', seafoodController.getListings);
router.get('/listings/:id', seafoodController.getListingById);

// 2. Farmer Creates Catch Listing
router.post(
  '/listings',
  [
    body('species').trim().notEmpty().withMessage('Aquaculture species is required'),
    body('quantity_kg').isFloat({ min: 10 }).withMessage('Minimum 10 kg quantity required'),
    body('size_grade').trim().notEmpty().withMessage('Size grade or count is required'),
    body('expected_price_per_kg').isFloat({ min: 1 }).withMessage('Valid expected price required')
  ],
  validate,
  seafoodController.createListing
);

// 3. Buyer Inquiry / Offer
router.post(
  '/offers',
  [
    body('listing_id').trim().notEmpty().withMessage('Listing ID is required'),
    body('offered_price_per_kg').isFloat({ min: 1 }).withMessage('Offered price is required'),
    body('requested_quantity_kg').isFloat({ min: 10 }).withMessage('Requested quantity is required')
  ],
  validate,
  seafoodController.submitInquiryOrOffer
);

// 4. Role-based Offers View
router.get('/offers/farmer', seafoodController.getFarmerOffers);
router.get('/offers/buyer', seafoodController.getBuyerOffers);
router.get('/offers/:id', seafoodController.getOfferById);

// 5. Negotiation & Decisions
router.post(
  '/offers/:id/counter',
  [
    param('id').trim().notEmpty().withMessage('Offer ID is required'),
    body('price_per_kg').isFloat({ min: 1 }).withMessage('Counter price is required'),
    body('quantity_kg').isFloat({ min: 10 }).withMessage('Quantity is required')
  ],
  validate,
  seafoodController.submitCounterOffer
);

router.patch(
  '/offers/:id/accept',
  [param('id').trim().notEmpty().withMessage('Offer ID is required')],
  validate,
  seafoodController.acceptOffer
);

router.patch(
  '/offers/:id/reject',
  [param('id').trim().notEmpty().withMessage('Offer ID is required')],
  validate,
  seafoodController.rejectOffer
);

// 6. Processing & Completion
router.patch(
  '/offers/:id/status',
  [
    param('id').trim().notEmpty().withMessage('Offer ID is required'),
    body('status')
      .isIn(['processing', 'completed', 'cancelled'])
      .withMessage('Status must be processing, completed, or cancelled')
  ],
  validate,
  seafoodController.updateTradeStatus
);

// 7. Reviews
router.post(
  '/offers/:id/reviews',
  [
    param('id').trim().notEmpty().withMessage('Offer ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review_text').trim().isLength({ min: 3 }).withMessage('Review text must be at least 3 characters')
  ],
  validate,
  seafoodController.submitTradeReview
);

module.exports = router;
