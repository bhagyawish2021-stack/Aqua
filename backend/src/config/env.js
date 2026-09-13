'use strict';

/**
 * env.js — Environment variable validation
 * Fails fast at startup if any required variable is missing.
 */

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn('⚠️ Missing recommended environment variables:');
    missing.forEach((key) => console.warn(`   - ${key}`));
    console.warn('💡 Continuing with safe local fallback mode.');
  } else {
    console.log('✅ Required environment variables validated.');
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn('ℹ️ OPENAI_API_KEY not set. AI Assistant will use built-in aquaculture knowledge base.');
  }
}

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  mlApiUrl: process.env.ML_API_URL,
  openaiApiKey: process.env.OPENAI_API_KEY,
  frontendUrl: process.env.FRONTEND_URL,
};

module.exports = { validateEnv, config };
