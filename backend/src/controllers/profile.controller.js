'use strict';

/**
 * profile.controller.js — Farmer profile handlers
 */

const { supabaseAdmin } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * GET /api/profile
 */
async function getProfile(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error || !data) {
      return next(new ApiError(404, 'Profile not found.'));
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/profile
 */
async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'Validation failed', errors.array()));
    }

    const { name, phone, village, district, language } = req.body;

    const updates = {};
    if (name !== undefined)     updates.name = name;
    if (phone !== undefined)    updates.phone = phone;
    if (village !== undefined)  updates.village = village;
    if (district !== undefined) updates.district = district;
    if (language !== undefined) updates.language = language;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.userId)
      .select()
      .single();

    if (error) {
      return next(new ApiError(400, error.message));
    }

    res.status(200).json({ success: true, message: 'Profile updated.', data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
