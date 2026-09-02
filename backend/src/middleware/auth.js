'use strict';

/**
 * auth.js — JWT authentication middleware
 *
 * Validates the Supabase JWT from the Authorization header.
 * On success, attaches the decoded user to req.user.
 * Usage: router.use(authenticate) or router.get('/route', authenticate, handler)
 */

const { supabase } = require('../config/supabase');
const { ApiError } = require('./errorHandler');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Authorization header missing or malformed. Expected: Bearer <token>'));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new ApiError(401, 'Token not provided.'));
    }

    // Verify the JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return next(new ApiError(401, 'Invalid or expired token. Please log in again.'));
    }

    // Attach user to request object for downstream handlers
    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    next(new ApiError(500, 'Authentication service error.'));
  }
}

module.exports = { authenticate };
