'use strict';

/**
 * waterQuality.controller.js — Water quality records CRUD
 * Uses pondStore service with automatic Supabase and in-memory resilience.
 */

const pondStore = require('../services/pondStore.service');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

const DEFAULT_FARMER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/ponds/:pondId/water-quality
 */
async function getWaterQuality(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const data = await pondStore.getWaterQuality(req.params.pondId);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ponds/:pondId/water-quality
 */
async function createWaterQuality(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { temperature, ph, dissolved_oxygen, salinity, ammonia, alkalinity, recorded_at } = req.body;

    const data = await pondStore.createWaterQuality(req.params.pondId, {
      temperature,
      ph,
      dissolved_oxygen,
      salinity,
      ammonia,
      alkalinity,
      recorded_at
    });

    res.status(201).json({ success: true, message: 'Water quality record added.', data });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/ponds/:pondId/water-quality/:id
 */
async function deleteWaterQuality(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    await pondStore.deleteWaterQuality(req.params.id);
    res.status(200).json({ success: true, message: 'Water quality record deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getWaterQuality, createWaterQuality, deleteWaterQuality };
