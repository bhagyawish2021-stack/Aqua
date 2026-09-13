'use strict';

/**
 * pond.controller.js — Pond management CRUD handlers
 * Uses pondStore service with automatic Supabase and in-memory resilience.
 */

const pondStore = require('../services/pondStore.service');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

const DEFAULT_FARMER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/ponds — List all ponds for the authenticated farmer
 */
async function getPonds(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const data = await pondStore.getPonds(farmerId);
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

    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const { name, size_acres, species, stocking_date, stocking_density, status } = req.body;

    const data = await pondStore.createPond(farmerId, {
      name,
      size_acres,
      species,
      stocking_date,
      stocking_density,
      status
    });

    res.status(201).json({ success: true, message: 'Pond created.', data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ponds/:id — Get single pond
 */
async function getPondById(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const data = await pondStore.getPondById(req.params.id, farmerId);
    if (!data) return next(new ApiError(404, 'Pond not found.'));

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

    const farmerId = req.userId || DEFAULT_FARMER_ID;
    const { name, size_acres, species, stocking_date, stocking_density, status } = req.body;

    const updates = {};
    if (name !== undefined)              updates.name = name;
    if (size_acres !== undefined)        updates.size_acres = size_acres;
    if (species !== undefined)           updates.species = species;
    if (stocking_date !== undefined)     updates.stocking_date = stocking_date;
    if (stocking_density !== undefined)  updates.stocking_density = stocking_density;
    if (status !== undefined)            updates.status = status;

    const data = await pondStore.updatePond(req.params.id, farmerId, updates);
    if (!data) return next(new ApiError(404, 'Pond not found or update failed.'));

    res.status(200).json({ success: true, message: 'Pond updated.', data });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/ponds/:id — Delete a pond
 */
async function deletePond(req, res, next) {
  try {
    const farmerId = req.userId || DEFAULT_FARMER_ID;
    await pondStore.deletePond(req.params.id, farmerId);
    res.status(200).json({ success: true, message: 'Pond and all related records deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPonds, createPond, getPondById, updatePond, deletePond };
