'use strict';

require('dotenv').config();

const { validateEnv, config } = require('./src/config/env');

// Validate all required environment variables before booting
validateEnv();

const app = require('./src/app');

const server = app.listen(config.port, () => {
  console.log('');
  console.log('🦐 ====================================');
  console.log('   AquaMitra API Server');
  console.log('🦐 ====================================');
  console.log(`   Status   : Running`);
  console.log(`   Port     : ${config.port}`);
  console.log(`   Env      : ${config.nodeEnv}`);
  console.log(`   Health   : http://localhost:${config.port}/api/health`);
  console.log('🦐 ====================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
