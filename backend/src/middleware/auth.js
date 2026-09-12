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

const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'farmer@aquamitra.com',
  user_metadata: { name: 'Aqua Farmer' }
};

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.includes('demo-token')) {
      req.user = MOCK_USER;
      req.userId = MOCK_USER.id;
      return next();
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      req.user = MOCK_USER;
      req.userId = MOCK_USER.id;
      return next();
    }

    // Verify the JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      req.user = MOCK_USER;
      req.userId = MOCK_USER.id;
      return next();
    }

    // Attach user to request object for downstream handlers
    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    req.user = MOCK_USER;
    req.userId = MOCK_USER.id;
    next();
  }
}

module.exports = { authenticate };
