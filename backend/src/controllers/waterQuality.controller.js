'use strict';

/**
 * waterQuality.controller.js — Water quality records CRUD
 */

const { supabaseAdmin } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/** Verify the pond belongs to the authenticated farmer */
async function verifyPondOwnership(pondId, userId) {
  const { data } = await supabaseAdmin
    .from('ponds')
    .select('id')
    .eq('id', pondId)
    .eq('farmer_id', userId)
    .single();
  return !!data;
}

/**
 * GET /api/ponds/:pondId/water-quality
 */
async function getWaterQuality(req, res, next) {
  try {
    const owned = await verifyPondOwnership(req.params.pondId, req.userId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { data, error } = await supabaseAdmin
      .from('water_quality')
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
 * POST /api/ponds/:pondId/water-quality
 */
async function createWaterQuality(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const owned = await verifyPondOwnership(req.params.pondId, req.userId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { temperature, ph, dissolved_oxygen, salinity, ammonia, alkalinity } = req.body;

    const { data, error } = await supabaseAdmin
      .from('water_quality')
      .insert({ pond_id: req.params.pondId, temperature, ph, dissolved_oxygen, salinity, ammonia, alkalinity })
      .select()
      .single();

    if (error) return next(new ApiError(400, error.message));

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
    const owned = await verifyPondOwnership(req.params.pondId, req.userId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { error } = await supabaseAdmin
      .from('water_quality')
      .delete()
      .eq('id', req.params.id)
      .eq('pond_id', req.params.pondId);

    if (error) return next(new ApiError(400, error.message));

    res.status(200).json({ success: true, message: 'Water quality record deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getWaterQuality, createWaterQuality, deleteWaterQuality };
