'use strict';

/**
 * health.routes.js — Health check endpoint.
 * Used by deployment platforms (Render, etc.) to verify the service is alive.
 * Includes a safe Supabase connectivity check using a read-only query.
 */

const express = require('express');
const { config } = require('../config/env');
const { supabase } = require('../config/supabase');

const router = express.Router();

/**
 * GET /api/health
 * Returns server status, environment, timestamp, and Supabase connectivity.
 * No authentication required.
 *
 * Supabase check: performs a lightweight SELECT against the public `profiles`
 * table (limit 1, head:true so no rows are transferred) purely to confirm the
 * database connection is reachable.  Secrets are never included in the response.
 */
router.get('/', async (req, res) => {
  // ── Supabase connectivity probe ──────────────────────────────────────────
  let supabaseStatus = 'disconnected';
  let supabaseError  = null;

  try {
    const { error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });  // head:true → no rows returned

    if (error) {
      // A known Supabase API error (e.g. table not found, RLS denial)
      supabaseStatus = 'disconnected';
      supabaseError  = error.message || 'Supabase query returned an error.';
    } else {
      supabaseStatus = 'connected';
    }
  } catch (err) {
    // Network-level failure — do not expose stack trace or secrets
    supabaseStatus = 'disconnected';
    supabaseError  = 'Unable to reach Supabase. Check network or project URL.';
  }

  // ── Response ──────────────────────────────────────────────────────────────
  const responseBody = {
    success: true,
    message: 'AquaMitra backend is running',
    data: {
      status: 'OK',
      service: 'AquaMitra API',
      version: '1.0.0',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
      supabase: supabaseStatus,
    },
  };

  // Include a safe, non-sensitive error hint only in non-production environments
  if (supabaseError && !config.isProd) {
    responseBody.data.supabaseError = supabaseError;
  }

  res.status(200).json(responseBody);
});

module.exports = router;
