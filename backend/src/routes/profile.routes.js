'use strict';

const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile } = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const updateRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number.'),
  body('language').optional().isIn(['en', 'te']).withMessage('Language must be en or te.'),
];

router.use(authenticate); // All profile routes require auth

router.get('/',  getProfile);
router.put('/',  updateRules, updateProfile);

module.exports = router;
