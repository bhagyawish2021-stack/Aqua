'use strict';

/**
 * auth.controller.js — Authentication handlers
 * Delegates to Supabase Auth for register, login, and logout.
 */

const { supabase } = require('../config/supabase');
const { supabaseAdmin } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * POST /api/auth/register
 * Creates a Supabase Auth user. The profile row is auto-created via DB trigger.
 */
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'Validation failed', errors.array()));
    }

    const { email, password, name, phone, village, district, language = 'en' } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, language }, // stored in raw_user_meta_data, used by DB trigger
      },
    });

    if (error) {
      console.log('Supabase Login Error:', error.message);
      return next(new ApiError(401, error.message));
    }

    // Update profile with extra fields that the trigger doesn't handle
    if (data.user) {
      await supabaseAdmin
        .from('profiles')
        .update({ phone, village, district, language })
        .eq('id', data.user.id);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to confirm your account.',
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'Validation failed', errors.array()));
    }

    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return next(new ApiError(401, 'Invalid email or password.'));
    }

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      await supabase.auth.admin.signOut(token);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout };
