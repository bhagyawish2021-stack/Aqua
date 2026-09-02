'use strict';

/**
 * env.js — Environment variable validation
 * Fails fast at startup if any required variable is missing.
 */

const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ML_API_URL',
  'OPENAI_API_KEY',
  'FRONTEND_URL',
];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('💡 Copy .env.example to .env and fill in all values.');
    process.exit(1);
  }

  console.log('✅ Environment variables validated.');
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
