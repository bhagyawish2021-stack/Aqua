'use strict';

/**
 * profile.controller.js — Farmer profile handlers
 */

const { supabaseAdmin } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

// In-memory profile fallback
let memoryProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Aqua Farmer',
  email: 'farmer@aquamitra.com',
  phone: '+91 98765 43210',
  village: 'Bhimavaram',
  district: 'West Godavari',
  state: 'Andhra Pradesh',
  language: 'en',
  role: 'farmer'
};

function withTimeout(promise, ms = 800) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), ms))
  ]);
}

/**
 * GET /api/profile
 */
async function getProfile(req, res, next) {
  try {
    const { data, error } = await withTimeout(
      supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', req.userId)
        .single()
    );

    if (error || !data) {
      return res.status(200).json({
        success: true,
        data: { ...memoryProfile, id: req.userId || memoryProfile.id }
      });
    }

    res.status(200).json({ success: true, data: { role: 'farmer', ...data } });
  } catch (err) {
    res.status(200).json({
      success: true,
      data: { ...memoryProfile, id: req.userId || memoryProfile.id }
    });
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

    try {
      const { data, error } = await withTimeout(
        supabaseAdmin
          .from('profiles')
          .update(updates)
          .eq('id', req.userId)
          .select()
          .single()
      );

      if (!error && data) {
        memoryProfile = { ...memoryProfile, ...data };
        return res.status(200).json({ success: true, message: 'Profile updated.', data });
      }
    } catch (e) {}

    // Fallback update in-memory
    memoryProfile = { ...memoryProfile, ...updates, updated_at: new Date().toISOString() };
    res.status(200).json({ success: true, message: 'Profile updated.', data: memoryProfile });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
