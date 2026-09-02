'use strict';

/**
 * errorHandler.js — Global Express error handling middleware
 * Provides consistent JSON error responses across the entire API.
 */

const { config } = require('../config/env');

/**
 * Custom API Error class for controlled error throwing.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * 404 handler — mount BEFORE the global error handler, AFTER all routes.
 */
function notFoundHandler(req, res, next) {
  const err = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(err);
}

/**
 * Global error handler — must have exactly 4 parameters for Express to recognise it.
 */
// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;

  // Always log server errors; log client errors only in dev mode
  if (isServerError || config.isDev) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${statusCode}`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: isServerError && config.isProd ? 'Internal server error' : err.message,
      ...(err.details && { details: err.details }),
      ...(config.isDev && isServerError && { stack: err.stack }),
    },
  });
}

module.exports = { ApiError, notFoundHandler, globalErrorHandler };
