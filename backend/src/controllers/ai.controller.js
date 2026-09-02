'use strict';

/**
 * ai.controller.js — AI assistant endpoint handler.
 *
 * Flow:
 *  1. Validate farmer's question
 *  2. Optionally fetch pond data and latest water quality from DB
 *  3. Optionally run ML prediction if water quality data exists
 *  4. Call the local AquaMitra rule-based assistant (no external API)
 *  5. Return answer with pond context
 */

const { askAssistant } = require('../services/ai.service');
const { predictPondHealth } = require('../services/ml.service');
const { supabaseAdmin } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * POST /api/ai/chat
 */
async function chat(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const { question, pond_id } = req.body;

    let pond = null;
    let latestWaterQuality = null;
    let mlPrediction = null;

    if (pond_id) {
      // Fetch pond (must belong to farmer)
      const { data: pondData } = await supabaseAdmin
        .from('ponds')
        .select('*')
        .eq('id', pond_id)
        .eq('farmer_id', req.userId)
        .single();

      pond = pondData;

      if (pond) {
        // Fetch latest water quality
        const { data: wqData } = await supabaseAdmin
          .from('water_quality')
          .select('*')
          .eq('pond_id', pond_id)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single();

        latestWaterQuality = wqData;

        // Get ML prediction if water quality data is available
        if (latestWaterQuality) {
          try {
            mlPrediction = await predictPondHealth({
              temperature: latestWaterQuality.temperature,
              ph: latestWaterQuality.ph,
              dissolved_oxygen: latestWaterQuality.dissolved_oxygen,
              salinity: latestWaterQuality.salinity,
              ammonia: latestWaterQuality.ammonia,
            });
          } catch {
            // ML service being down should not block the AI assistant
            mlPrediction = null;
          }
        }
      }
    }

    const answer = await askAssistant(question, { pond, latestWaterQuality, mlPrediction });

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        source: 'local_aquamitra_assistant',
        context: {
          pond_id: pond?.id || null,
          used_water_quality: !!latestWaterQuality,
          used_ml_prediction: !!mlPrediction,
          ml_risk_level: mlPrediction?.risk_level || null,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { chat };
