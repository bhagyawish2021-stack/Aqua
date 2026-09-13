'use strict';

/**
 * feed.controller.js — Feed records CRUD
 * Uses pondStore service with automatic Supabase and in-memory resilience.
 */

const pondStore = require('../services/pondStore.service');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

const DEFAULT_FARMER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/ponds/:pondId/feed
 */
async function getFeedRecords(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const data = await pondStore.getFeed(req.params.pondId);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ponds/:pondId/feed
 */
async function createFeedRecord(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { feed_type, quantity_kg, cost, recorded_at, feeding_time } = req.body;

    const data = await pondStore.createFeed(req.params.pondId, {
      feed_type,
      quantity_kg,
      cost,
      feeding_time,
      recorded_at
    });

    res.status(201).json({ success: true, message: 'Feed record added.', data });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/ponds/:pondId/feed/:id
 */
async function deleteFeedRecord(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const owned = await pondStore.verifyPondOwnership(req.params.pondId, farmerId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    await pondStore.deleteFeed(req.params.id);
    res.status(200).json({ success: true, message: 'Feed record deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFeedRecords, createFeedRecord, deleteFeedRecord };
