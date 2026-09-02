'use strict';

/**
 * supabase.js — Supabase client configuration
 *
 * Two clients are exported:
 *  - supabase      : Uses the anon key (for Auth operations like sign-up / sign-in)
 *  - supabaseAdmin : Uses the service role key (for server-side DB queries that
 *                    bypass RLS — use with caution, only in trusted server code)
 */

const { createClient } = require('@supabase/supabase-js');
const { config } = require('./env');

// Anon client — safe to use for auth flows
const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Admin client — bypasses Row Level Security; NEVER expose to the frontend
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

module.exports = { supabase, supabaseAdmin };
