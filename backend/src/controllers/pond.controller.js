'use strict';

/**
 * pond.controller.js — Pond management CRUD handlers
 */

const { supabaseAdmin } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * GET /api/ponds — List all ponds for the authenticated farmer
 */
async function getPonds(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('ponds')
      .select('*')
      .eq('farmer_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) return next(new ApiError(400, error.message));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ponds — Create a new pond
 */
async function createPond(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const { name, size_acres, species, stocking_date, stocking_density, status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('ponds')
      .insert({ farmer_id: req.userId, name, size_acres, species, stocking_date, stocking_density, status: status || 'active' })
      .select()
      .single();

    if (error) return next(new ApiError(400, error.message));

    res.status(201).json({ success: true, message: 'Pond created.', data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ponds/:id — Get single pond (must belong to farmer)
 */
async function getPondById(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('ponds')
      .select('*')
      .eq('id', req.params.id)
      .eq('farmer_id', req.userId)
      .single();

    if (error || !data) return next(new ApiError(404, 'Pond not found.'));

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/ponds/:id — Update a pond
 */
async function updatePond(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const { name, size_acres, species, stocking_date, stocking_density, status } = req.body;

    const updates = {};
    if (name !== undefined)              updates.name = name;
    if (size_acres !== undefined)        updates.size_acres = size_acres;
    if (species !== undefined)           updates.species = species;
    if (stocking_date !== undefined)     updates.stocking_date = stocking_date;
    if (stocking_density !== undefined)  updates.stocking_density = stocking_density;
    if (status !== undefined)            updates.status = status;

    const { data, error } = await supabaseAdmin
      .from('ponds')
      .update(updates)
      .eq('id', req.params.id)
      .eq('farmer_id', req.userId)
      .select()
      .single();

    if (error || !data) return next(new ApiError(404, 'Pond not found or update failed.'));

    res.status(200).json({ success: true, message: 'Pond updated.', data });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/ponds/:id — Delete a pond (cascades all related records)
 */
async function deletePond(req, res, next) {
  try {
    const { error } = await supabaseAdmin
      .from('ponds')
      .delete()
      .eq('id', req.params.id)
      .eq('farmer_id', req.userId);

    if (error) return next(new ApiError(400, error.message));

    res.status(200).json({ success: true, message: 'Pond and all related records deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPonds, createPond, getPondById, updatePond, deletePond };
