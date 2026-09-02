'use strict';

const express = require('express');
const { body } = require('express-validator');
const { getFeedRecords, createFeedRecord, deleteFeedRecord } = require('../controllers/feed.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

const createRules = [
  body('feed_type').trim().notEmpty().withMessage('Feed type is required.'),
  body('quantity_kg').isFloat({ min: 0 }).withMessage('Quantity must be a positive number.'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number.'),
  body('recorded_at').optional().isDate().withMessage('recorded_at must be a valid date (YYYY-MM-DD).'),
];

router.use(authenticate);

router.get('/',       getFeedRecords);
router.post('/',      createRules, createFeedRecord);
router.delete('/:id', deleteFeedRecord);

module.exports = router;
