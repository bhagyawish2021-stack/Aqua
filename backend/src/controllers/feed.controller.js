'use strict';

/**
 * feed.controller.js — Feed records CRUD
 */

const { supabaseAdmin } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

async function verifyPondOwnership(pondId, userId) {
  const { data } = await supabaseAdmin
    .from('ponds').select('id').eq('id', pondId).eq('farmer_id', userId).single();
  return !!data;
}

/**
 * GET /api/ponds/:pondId/feed
 */
async function getFeedRecords(req, res, next) {
  try {
    const owned = await verifyPondOwnership(req.params.pondId, req.userId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { data, error } = await supabaseAdmin
      .from('feed_records')
      .select('*')
      .eq('pond_id', req.params.pondId)
      .order('recorded_at', { ascending: false });

    if (error) return next(new ApiError(400, error.message));

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

    const owned = await verifyPondOwnership(req.params.pondId, req.userId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { feed_type, quantity_kg, cost, recorded_at } = req.body;

    const { data, error } = await supabaseAdmin
      .from('feed_records')
      .insert({ pond_id: req.params.pondId, feed_type, quantity_kg, cost, recorded_at })
      .select()
      .single();

    if (error) return next(new ApiError(400, error.message));

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
    const owned = await verifyPondOwnership(req.params.pondId, req.userId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { error } = await supabaseAdmin
      .from('feed_records')
      .delete()
      .eq('id', req.params.id)
      .eq('pond_id', req.params.pondId);

    if (error) return next(new ApiError(400, error.message));

    res.status(200).json({ success: true, message: 'Feed record deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFeedRecords, createFeedRecord, deleteFeedRecord };
