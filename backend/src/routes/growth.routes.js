'use strict';

const express = require('express');
const { body } = require('express-validator');
const { getGrowthRecords, createGrowthRecord, deleteGrowthRecord } = require('../controllers/growth.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

const createRules = [
  body('abw_grams').optional().isFloat({ min: 0 }).withMessage('ABW must be a positive number.'),
  body('survival_pct').optional().isFloat({ min: 0, max: 100 }).withMessage('Survival % must be between 0 and 100.'),
  body('biomass_kg').optional().isFloat({ min: 0 }).withMessage('Biomass must be a positive number.'),
  body('recorded_at').optional().isDate().withMessage('recorded_at must be a valid date (YYYY-MM-DD).'),
];

router.use(authenticate);

router.get('/',       getGrowthRecords);
router.post('/',      createRules, createGrowthRecord);
router.delete('/:id', deleteGrowthRecord);

module.exports = router;
