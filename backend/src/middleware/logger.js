'use strict';

/**
 * logger.js — HTTP request logging middleware using Morgan.
 * Uses 'dev' format in development and 'combined' in production.
 */

const morgan = require('morgan');
const { config } = require('../config/env');

// Custom token: highlight status codes
morgan.token('status-colored', (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // cyan
  return `\x1b[32m${status}\x1b[0m`;                    // green
});

const devFormat = ':method :url :status-colored :response-time ms - :res[content-length]';

const logger = config.isDev
  ? morgan(devFormat)
  : morgan('combined');

module.exports = logger;
