'use strict';

const { validationResult } = require('express-validator');
const { ApiError } = require('../middleware/errorHandler');
const equipmentService = require('../services/equipment.service');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/equipment/categories
 */
async function getCategories(req, res, next) {
  try {
    const categories = equipmentService.getCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/equipment
 */
async function getListings(req, res, next) {
  try {
    const userId = req.userId || DEFAULT_USER_ID;
    const {
      category,
      condition,
      state,
      district,
      min_price,
      max_price,
      search,
      sort,
      my_listings,
      favorites_only,
    } = req.query;

    const filters = {
      category,
      condition,
      state,
      district,
      min_price,
      max_price,
      search,
      sort,
      seller_id: my_listings === 'true' ? userId : undefined,
      favorites_only,
      current_user_id: userId,
    };

    const listings = await equipmentService.getListings(filters);
    res.status(200).json({ success: true, count: listings.length, data: listings });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/equipment/:id
 */
async function getListingById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.userId || DEFAULT_USER_ID;

    const listing = await equipmentService.getListingById(id, userId);
    if (!listing) return next(new ApiError(404, 'Equipment listing not found.'));

    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/equipment
 */
async function createListing(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const userId = req.userId || DEFAULT_USER_ID;
    const userName = req.user?.name || req.user?.user_metadata?.name || 'Aqua Farmer';
    const userPhone = req.user?.phone || '+91 98480 00000';

    const listing = await equipmentService.createListing(userId, userName, userPhone, req.body);
    res.status(201).json({ success: true, message: 'Equipment listing published.', data: listing });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/equipment/:id
 */
async function updateListing(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const { id } = req.params;
    const userId = req.userId || DEFAULT_USER_ID;

    const updated = await equipmentService.updateListing(id, userId, req.body);
    res.status(200).json({ success: true, message: 'Listing updated.', data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/equipment/:id/status
 */
async function markListingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId || DEFAULT_USER_ID;

    const updated = await equipmentService.markListingStatus(id, userId, status);
    res.status(200).json({ success: true, message: `Listing marked as ${status}.`, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/equipment/:id
 */
async function deleteListing(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.userId || DEFAULT_USER_ID;

    await equipmentService.deleteListing(id, userId);
    res.status(200).json({ success: true, message: 'Listing deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/equipment/favorites/me
 */
async function getFavorites(req, res, next) {
  try {
    const userId = req.userId || DEFAULT_USER_ID;
    const favorites = await equipmentService.getUserFavorites(userId);
    res.status(200).json({ success: true, count: favorites.length, data: favorites });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/equipment/:id/favorite
 */
async function toggleFavorite(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.userId || DEFAULT_USER_ID;
    let { action } = req.body || {};

    if (!action) {
      const userFavs = await equipmentService.getUserFavorites(userId);
      const alreadyFav = userFavs.some(f => f.id === id);
      action = alreadyFav ? 'remove' : 'add';
    }

    const result = action === 'remove'
      ? await equipmentService.removeFavorite(userId, id)
      : await equipmentService.addFavorite(userId, id);

    res.status(200).json({
      success: true,
      is_favorited: result.isFavorited,
      message: result.isFavorited ? 'Added to wishlist' : 'Removed from wishlist',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/equipment/reviews
 */
async function submitReview(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const userId = req.userId || DEFAULT_USER_ID;
    const userName = req.user?.name || req.user?.user_metadata?.name || 'Verified Buyer';

    const review = await equipmentService.submitSellerReview(userId, userName, req.body);
    res.status(201).json({ success: true, message: 'Review submitted.', data: review });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/equipment/reports
 */
async function submitReport(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const userId = req.userId || DEFAULT_USER_ID;
    const result = await equipmentService.submitListingReport(userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  getListings,
  getListingById,
  createListing,
  updateListing,
  markListingStatus,
  deleteListing,
  getFavorites,
  toggleFavorite,
  submitReview,
  submitReport,
};
