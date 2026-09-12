'use strict';

/**
 * market.controller.js — Live Seafood Market Prices Controller
 */

const { validationResult } = require('express-validator');
const { ApiError } = require('../middleware/errorHandler');
const marketService = require('../services/marketPrice.service');

/**
 * GET /api/market/overview
 */
async function getOverview(req, res, next) {
  try {
    const { category, species_id, state, district, market_name, variety, search } = req.query;

    const data = await marketService.getMarketPrices({
      category,
      species_id,
      state,
      district,
      market_name,
      variety,
      search,
    });

    const species = await marketService.getSpeciesList();
    const locations = await marketService.getLocationsList();

    res.status(200).json({
      success: true,
      data: {
        ...data,
        species,
        locations,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/market/species
 */
async function getSpecies(req, res, next) {
  try {
    const species = await marketService.getSpeciesList();
    res.status(200).json({ success: true, data: species });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/market/locations
 */
async function getLocations(req, res, next) {
  try {
    const locations = await marketService.getLocationsList();
    res.status(200).json({ success: true, data: locations });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/market/history/:priceId
 */
async function getHistory(req, res, next) {
  try {
    const { priceId } = req.params;
    const { range = 'daily' } = req.query;

    const result = await marketService.getPriceHistory(priceId, range);
    if (!result) {
      return next(new ApiError(404, 'Market price item not found.'));
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/market/watchlist
 */
async function getWatchlist(req, res, next) {
  try {
    const userId = req.userId || '00000000-0000-0000-0000-000000000001';
    const watchlist = await marketService.getUserWatchlist(userId);
    res.status(200).json({ success: true, data: watchlist });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/market/watchlist/:priceId
 */
async function addToWatchlist(req, res, next) {
  try {
    const userId = req.userId || '00000000-0000-0000-0000-000000000001';
    const { priceId } = req.params;
    const updated = await marketService.addToWatchlist(userId, priceId);
    res.status(200).json({ success: true, message: 'Added to watchlist.', data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/market/watchlist/:priceId
 */
async function removeFromWatchlist(req, res, next) {
  try {
    const userId = req.userId || '00000000-0000-0000-0000-000000000001';
    const { priceId } = req.params;
    const updated = await marketService.removeFromWatchlist(userId, priceId);
    res.status(200).json({ success: true, message: 'Removed from watchlist.', data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/market/alerts
 */
async function getAlerts(req, res, next) {
  try {
    const userId = req.userId || '00000000-0000-0000-0000-000000000001';
    const alerts = await marketService.getUserAlerts(userId);
    res.status(200).json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/market/alerts
 */
async function createAlert(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const userId = req.userId || '00000000-0000-0000-0000-000000000001';
    const alerts = await marketService.createPriceAlert(userId, req.body);
    res.status(201).json({ success: true, message: 'Price alert created.', data: alerts });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/market/alerts/:alertId
 */
async function deleteAlert(req, res, next) {
  try {
    const userId = req.userId || '00000000-0000-0000-0000-000000000001';
    const { alertId } = req.params;
    const alerts = await marketService.deletePriceAlert(userId, alertId);
    res.status(200).json({ success: true, message: 'Price alert removed.', data: alerts });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/market/admin/price
 */
async function updatePriceAdmin(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const updated = await marketService.updateMarketPriceAdmin(req.body);
    res.status(200).json({
      success: true,
      message: 'Market price updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

// ─── AquaSangham Live Table Integration ──────────────────────────────────────
const aquasanghamService = require('../services/aquasangham.service');

/**
 * GET /api/market/aquasangham/live
 */
async function getAquaSanghamLive(req, res, next) {
  try {
    const { state, region, species } = req.query;
    const data = await aquasanghamService.getLiveMarketData({ state, region, species });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/market/aquasangham/sync
 */
async function syncAquaSanghamLive(req, res, next) {
  try {
    const syncRes = await aquasanghamService.syncFromAquaSangham();
    const data = await aquasanghamService.getLiveMarketData(req.body || {});
    res.status(200).json({
      success: true,
      message: 'Synced successfully with AquaSangham live market.',
      sync: syncRes,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/market/aquasangham/update-rate
 */
async function updateAquaSanghamRate(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const result = aquasanghamService.updateCountRate(req.body);
    const data = await aquasanghamService.getLiveMarketData({
      state: req.body.state,
      region: req.body.region,
      species: req.body.species,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/market/aquasangham/reset-rates
 */
async function resetAquaSanghamRates(req, res, next) {
  try {
    const result = aquasanghamService.resetCountRates(req.body || {});
    const data = await aquasanghamService.getLiveMarketData({
      state: req.body.state,
      region: req.body.region,
      species: req.body.species,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverview,
  getSpecies,
  getLocations,
  getHistory,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getAlerts,
  createAlert,
  deleteAlert,
  updatePriceAdmin,
  getAquaSanghamLive,
  syncAquaSanghamLive,
  updateAquaSanghamRate,
  resetAquaSanghamRates,
};
