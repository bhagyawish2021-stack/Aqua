'use strict';

const express = require('express');
const { body } = require('express-validator');
const {
  getBusinessRecords,
  createBusinessRecord,
  getBusinessSummary,
  deleteBusinessRecord,
} = require('../controllers/business.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

const createRules = [
  body('feed_expense').optional().isFloat({ min: 0 }).withMessage('Feed expense must be positive.'),
  body('labor_expense').optional().isFloat({ min: 0 }).withMessage('Labor expense must be positive.'),
  body('medicine_expense').optional().isFloat({ min: 0 }).withMessage('Medicine expense must be positive.'),
  body('other_expense').optional().isFloat({ min: 0 }).withMessage('Other expense must be positive.'),
  body('harvest_revenue').optional().isFloat({ min: 0 }).withMessage('Harvest revenue must be positive.'),
  body('recorded_at').optional().isDate().withMessage('recorded_at must be a valid date (YYYY-MM-DD).'),
];

router.use(authenticate);

router.get('/summary', getBusinessSummary);   // Must be before /:id routes
router.get('/',        getBusinessRecords);
router.post('/',       createRules, createBusinessRecord);
router.delete('/:id',  deleteBusinessRecord);

module.exports = router;
