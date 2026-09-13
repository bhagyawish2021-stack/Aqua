'use strict';

/**
 * growth.controller.js — Growth records CRUD
 * Uses pondStore service with automatic Supabase and in-memory resilience.
 */

const pondStore = require('../services/pondStore.service');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

const DEFAULT_FARMER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/ponds/:pondId/growth
 */
async function getGrowthRecords(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const data = await pondStore.getGrowth(req.params.pondId);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ponds/:pondId/growth
 */
async function createGrowthRecord(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { abw_grams, survival_pct, biomass_kg, recorded_at, sample_date, sample_count, notes } = req.body;

    const data = await pondStore.createGrowth(req.params.pondId, {
      abw_grams,
      survival_pct,
      biomass_kg,
      sample_date: sample_date || recorded_at,
      sample_count,
      notes
    });

    res.status(201).json({ success: true, message: 'Growth record added.', data });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/ponds/:pondId/growth/:id
 */
async function deleteGrowthRecord(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    await pondStore.deleteGrowth(req.params.id);
    res.status(200).json({ success: true, message: 'Growth record deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getGrowthRecords, createGrowthRecord, deleteGrowthRecord };
