'use strict';

/**
 * rateLimiter.js — API rate limiting middleware using express-rate-limit.
 * Protects the API from abuse and brute force attacks.
 */

const rateLimit = require('express-rate-limit');

/**
 * General rate limiter — applied to all /api routes.
 * Allows 1500 requests per 15-minute window per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please try again after 15 minutes.',
    },
  },
});

/**
 * Strict rate limiter — applied to auth routes (login, register).
 * Allows 30 requests per 15-minute window per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
});

/**
 * AI limiter — applied to AI assistant endpoint.
 * Prevents excessive OpenAI API calls.
 * Allows 20 requests per 60-minute window per IP.
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'AI request limit reached. Please try again after 1 hour.',
    },
  },
});

module.exports = { generalLimiter, authLimiter, aiLimiter };
