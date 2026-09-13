'use strict';

/**
 * business.controller.js — Business / financial records CRUD
 * Uses pondStore service with automatic Supabase and in-memory resilience.
 */

const pondStore = require('../services/pondStore.service');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

const DEFAULT_FARMER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/ponds/:pondId/business
 */
async function getBusinessRecords(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const data = await pondStore.getBusinessRecords(req.params.pondId);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ponds/:pondId/business
 */
async function createBusinessRecord(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { feed_expense, labor_expense, medicine_expense, other_expense, harvest_revenue, recorded_at } = req.body;

    const data = await pondStore.createBusinessRecord(req.params.pondId, {
      feed_expense,
      labor_expense,
      medicine_expense,
      other_expense,
      harvest_revenue,
      recorded_at
    });

    res.status(201).json({ success: true, message: 'Business record added.', data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ponds/:pondId/business/summary
 */
async function getBusinessSummary(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const summary = await pondStore.getBusinessSummary(req.params.pondId);
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/ponds/:pondId/business/:id
 */
async function deleteBusinessRecord(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    await pondStore.deleteBusinessRecord(req.params.id);
    res.status(200).json({ success: true, message: 'Business record deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBusinessRecords, createBusinessRecord, getBusinessSummary, deleteBusinessRecord };
