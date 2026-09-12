'use strict';

const { validationResult } = require('express-validator');
const { ApiError } = require('../middleware/errorHandler');
const seafoodService = require('../services/seafood.service');

const DEFAULT_FARMER_ID = 'farmer-demo';
const DEFAULT_BUYER_ID = 'buyer-demo';

/**
 * GET /api/seafood/taxonomy
 */
async function getTaxonomy(req, res, next) {
  try {
    const data = seafoodService.getTaxonomy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/seafood/listings
 */
async function getListings(req, res, next) {
  try {
    const {
      species,
      min_quantity,
      max_quantity,
      min_price,
      max_price,
      count_grade,
      district,
      max_distance_km,
      search,
      verified_only,
      sort_by,
      lat,
      lng
    } = req.query;

    const buyerLat = lat || req.headers['x-buyer-lat'] || null;
    const buyerLng = lng || req.headers['x-buyer-lng'] || null;

    const listings = seafoodService.getListings(
      {
        species,
        min_quantity,
        max_quantity,
        min_price,
        max_price,
        count_grade,
        district,
        max_distance_km,
        search,
        verified_only,
        sort_by
      },
      buyerLat,
      buyerLng
    );

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/seafood/listings/:id
 */
async function getListingById(req, res, next) {
  try {
    const { lat, lng } = req.query;
    const buyerLat = lat || req.headers['x-buyer-lat'] || null;
    const buyerLng = lng || req.headers['x-buyer-lng'] || null;

    const listing = seafoodService.getListingById(req.params.id, buyerLat, buyerLng);
    if (!listing) {
      throw new ApiError(404, 'Seafood listing not found');
    }

    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/seafood/listings
 * Farmer creates catch listing
 */
async function createListing(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const farmerId = req.userId || req.headers['x-farmer-id'] || DEFAULT_FARMER_ID;
    const farmerName = req.body.farmer_name || req.userName || 'Aqua Farmer';
    const farmerPhone = req.body.farmer_phone || '+91 98480 12345';

    const listing = seafoodService.createListing(req.body, farmerId, farmerName, farmerPhone);

    res.status(201).json({
      success: true,
      message: 'Seafood catch listed successfully for direct commercial buyer discovery',
      data: listing
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/seafood/offers
 * Buyer sends inquiry or initial offer
 */
async function submitInquiryOrOffer(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const buyerId = req.userId || req.headers['x-buyer-id'] || DEFAULT_BUYER_ID;
    const buyerName = req.body.buyer_name || req.userName || 'Commercial Buyer';
    const buyerCompany = req.body.buyer_company || 'Coastal Seafood Procurement';

    const offer = seafoodService.submitInquiryOrOffer(req.body, buyerId, buyerName, buyerCompany);

    res.status(201).json({
      success: true,
      message: 'Offer submitted to farmer. Negotiation thread opened.',
      data: offer
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/seafood/offers/farmer
 */
async function getFarmerOffers(req, res, next) {
  try {
    const farmerId = req.userId || req.headers['x-farmer-id'] || DEFAULT_FARMER_ID;
    const offers = seafoodService.getFarmerOffers(farmerId);
    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/seafood/offers/buyer
 */
async function getBuyerOffers(req, res, next) {
  try {
    const buyerId = req.userId || req.headers['x-buyer-id'] || DEFAULT_BUYER_ID;
    const offers = seafoodService.getBuyerOffers(buyerId);
    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/seafood/offers/:id
 */
async function getOfferById(req, res, next) {
  try {
    const offer = seafoodService.getOfferById(req.params.id);
    if (!offer) {
      throw new ApiError(404, 'Trade offer not found');
    }
    res.status(200).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/seafood/offers/:id/counter
 * Counter offer by farmer or buyer
 */
async function submitCounterOffer(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { sender_role, price_per_kg, quantity_kg, message } = req.body;
    const offer = seafoodService.submitCounterOffer(
      req.params.id,
      sender_role,
      price_per_kg,
      quantity_kg,
      message
    );

    if (!offer) {
      throw new ApiError(404, 'Trade offer not found');
    }

    res.status(200).json({
      success: true,
      message: 'Counter-offer submitted',
      data: offer
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/seafood/offers/:id/accept
 */
async function acceptOffer(req, res, next) {
  try {
    const senderRole = req.body.sender_role || 'farmer';
    const offer = seafoodService.acceptOffer(req.params.id, senderRole);

    if (!offer) {
      throw new ApiError(404, 'Trade offer not found');
    }

    res.status(200).json({
      success: true,
      message: 'Offer accepted! Direct farmgate trade agreement locked.',
      data: offer
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/seafood/offers/:id/reject
 */
async function rejectOffer(req, res, next) {
  try {
    const { sender_role, rejection_reason } = req.body;
    const offer = seafoodService.rejectOffer(req.params.id, sender_role, rejection_reason);

    if (!offer) {
      throw new ApiError(404, 'Trade offer not found');
    }

    res.status(200).json({
      success: true,
      message: 'Offer declined',
      data: offer
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/seafood/offers/:id/status
 * Transition trade status: 'processing' | 'completed'
 */
async function updateTradeStatus(req, res, next) {
  try {
    const { status, actual_weighed_quantity_kg, dispatch_notes, cancellation_reason } = req.body;
    const offer = seafoodService.updateTradeStatus(req.params.id, status, {
      actual_weighed_quantity_kg,
      dispatch_notes,
      cancellation_reason
    });

    if (!offer) {
      throw new ApiError(404, 'Trade offer not found');
    }

    res.status(200).json({
      success: true,
      message: `Trade status updated to '${status}'`,
      data: offer
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/seafood/offers/:id/reviews
 */
async function submitTradeReview(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const reviewerId = req.userId || req.headers['x-user-id'] || 'user-demo';
    const reviewerRole = req.body.reviewer_role || 'buyer';
    const reviewerName = req.body.reviewer_name || 'Verified Trader';

    const review = seafoodService.submitTradeReview(
      req.params.id,
      req.body,
      reviewerId,
      reviewerRole,
      reviewerName
    );

    if (!review) {
      throw new ApiError(404, 'Trade offer not found');
    }

    res.status(201).json({
      success: true,
      message: 'Trade review submitted successfully',
      data: review
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTaxonomy,
  getListings,
  getListingById,
  createListing,
  submitInquiryOrOffer,
  getFarmerOffers,
  getBuyerOffers,
  getOfferById,
  submitCounterOffer,
  acceptOffer,
  rejectOffer,
  updateTradeStatus,
  submitTradeReview
};
