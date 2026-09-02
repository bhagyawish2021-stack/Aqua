'use strict';

const express = require('express');
const { body } = require('express-validator');
const { chat } = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const chatRules = [
  body('question')
    .trim()
    .notEmpty().withMessage('Question is required.')
    .isLength({ max: 1000 }).withMessage('Question must be 1000 characters or fewer.'),
  body('pond_id').optional().isUUID().withMessage('pond_id must be a valid UUID.'),
];

router.post('/chat', authenticate, aiLimiter, chatRules, chat);

module.exports = router;
