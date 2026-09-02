'use strict';

/**
 * ml.service.js — Communicates with the FastAPI ML prediction service.
 *
 * The ML model (Random Forest) predicts pond health risk based on water
 * quality parameters. This service acts as a typed client for the FastAPI API.
 *
 * FastAPI expected endpoint:
 *   POST /predict
 *   Body: { temperature, ph, dissolved_oxygen, salinity, ammonia }
 *   Response: { risk_level: "LOW"|"MODERATE"|"HIGH", confidence: 0.91 }
 */

const axios = require('axios');
const { config } = require('../config/env');

const ML_PREDICT_PATH = '/predict';

/**
 * @param {Object} params - Water quality parameters
 * @param {number} params.temperature
 * @param {number} params.ph
 * @param {number} params.dissolved_oxygen
 * @param {number} params.salinity
 * @param {number} params.ammonia
 * @returns {Promise<{ risk_level: string, confidence: number, message: string }>}
 */
async function predictPondHealth(params) {
  try {
    const response = await axios.post(`${config.mlApiUrl}${ML_PREDICT_PATH}`, params, {
      timeout: 10000, // 10 second timeout
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      throw new Error('ML service is unavailable. Please try again later.');
    }
    if (err.response) {
      throw new Error(`ML service error: ${err.response.data?.detail || err.response.statusText}`);
    }
    throw new Error(`ML service request failed: ${err.message}`);
  }
}

/**
 * Health check for the ML service
 */
async function checkMlServiceHealth() {
  try {
    const response = await axios.get(`${config.mlApiUrl}/health`, { timeout: 5000 });
    return { available: true, status: response.data };
  } catch {
    return { available: false, status: null };
  }
}

module.exports = { predictPondHealth, checkMlServiceHealth };
