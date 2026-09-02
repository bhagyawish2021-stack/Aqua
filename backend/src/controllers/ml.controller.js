'use strict';

/**
 * ml.controller.js — Handles pond health risk prediction requests.
 *
 * Flow:
 *  1. Validate request body
 *  2. Optionally fetch the latest water quality record from DB if pond_id provided
 *  3. Call ML service
 *  4. Optionally store result / return to frontend
 */

const { predictPondHealth, checkMlServiceHealth } = require('../services/ml.service');
const { supabaseAdmin } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * POST /api/ml/predict
 * Accepts explicit parameters OR fetches latest water quality for a given pond_id.
 */
async function predict(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    let { pond_id, temperature, ph, dissolved_oxygen, salinity, ammonia } = req.body;

    // If pond_id is given but no explicit params, auto-fetch the latest water quality record
    if (pond_id && (temperature === undefined || ph === undefined)) {
      // Verify the farmer owns this pond
      const { data: pond } = await supabaseAdmin
        .from('ponds')
        .select('id')
        .eq('id', pond_id)
        .eq('farmer_id', req.userId)
        .single();

      if (!pond) return next(new ApiError(403, 'Pond not found or access denied.'));

      const { data: wq } = await supabaseAdmin
        .from('water_quality')
        .select('temperature, ph, dissolved_oxygen, salinity, ammonia')
        .eq('pond_id', pond_id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      if (!wq) return next(new ApiError(404, 'No water quality records found for this pond. Please add water quality data first.'));

      ({ temperature, ph, dissolved_oxygen, salinity, ammonia } = wq);
    }

    const prediction = await predictPondHealth({ temperature, ph, dissolved_oxygen, salinity, ammonia });

    // Enrich the response with a human-readable message if the ML service didn't include one
    if (!prediction.message) {
      const messages = {
        LOW:      'Pond conditions are healthy. Continue current management practices.',
        MODERATE: 'Some parameters are outside ideal ranges. Monitor closely and consider corrective action.',
        HIGH:     'Pond is at high risk! Immediate corrective action is strongly recommended.',
      };
      prediction.message = messages[prediction.risk_level] || 'Prediction received.';
    }

    // Persist prediction to history (fire-and-forget — failure must not block the response)
    if (pond_id) {
      // Normalise risk_level ("HIGH" → "HIGH RISK") to match DB CHECK constraint
      const riskLabelMap = { LOW: 'LOW RISK', MODERATE: 'MODERATE RISK', HIGH: 'HIGH RISK' };
      const dbRisk = riskLabelMap[prediction.risk_level] || prediction.risk_level;

      supabaseAdmin
        .from('ml_predictions')
        .insert({
          pond_id,
          temperature,
          ph,
          dissolved_oxygen,
          salinity,
          ammonia,
          predicted_risk: dbRisk,
          confidence: prediction.confidence ?? null,
        })
        .then(({ error }) => {
          if (error) console.warn('[ML] Could not persist prediction:', error.message);
        });
    }


    res.status(200).json({
      success: true,
      data: {
        pond_id: pond_id || null,
        input: { temperature, ph, dissolved_oxygen, salinity, ammonia },
        prediction,
      },
    });
  } catch (err) {
    // Wrap ML service errors as 503 Service Unavailable
    if (err.message.includes('unavailable') || err.message.includes('ECONNREFUSED')) {
      return next(new ApiError(503, err.message));
    }
    next(err);
  }
}

/**
 * GET /api/ml/history/:pondId
 * Returns saved ML prediction history for a pond (newest first).
 * Query param: ?limit=20 (default 20, max 100)
 */
async function getPredictionHistory(req, res, next) {
  try {
    const { pondId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    // Verify pond belongs to farmer
    const { data: pond } = await supabaseAdmin
      .from('ponds')
      .select('id')
      .eq('id', pondId)
      .eq('farmer_id', req.userId)
      .single();

    if (!pond) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { data, error } = await supabaseAdmin
      .from('ml_predictions')
      .select('*')
      .eq('pond_id', pondId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return next(new ApiError(400, error.message));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ml/health
 * Check if the ML service is reachable.
 */
async function mlHealth(req, res, next) {
  try {
    const result = await checkMlServiceHealth();
    res.status(result.available ? 200 : 503).json({
      success: result.available,
      data: {
        mlService: result.available ? 'available' : 'unavailable',
        details: result.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { predict, getPredictionHistory, mlHealth };
