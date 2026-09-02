'use strict';

const express = require('express');
const { body } = require('express-validator');
const { register, login, logout } = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation rules
const registerRules = [
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('name').trim().notEmpty().withMessage('Name is required.'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.post('/register', authLimiter, registerRules, register);
router.post('/login',    authLimiter, loginRules, login);
router.post('/logout',   logout);

module.exports = router;
