'use strict';

const express = require('express');
const { body, param, query } = require('express-validator');
const { predict, getPredictionHistory, mlHealth } = require('../controllers/ml.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const predictRules = [
  body('pond_id').optional().isUUID().withMessage('pond_id must be a valid UUID.'),
  body('temperature').optional().isFloat({ min: 0, max: 50 }).withMessage('Temperature must be 0–50°C.'),
  body('ph').optional().isFloat({ min: 0, max: 14 }).withMessage('pH must be 0–14.'),
  body('dissolved_oxygen').optional().isFloat({ min: 0 }).withMessage('Dissolved oxygen must be positive.'),
  body('salinity').optional().isFloat({ min: 0 }).withMessage('Salinity must be positive.'),
  body('ammonia').optional().isFloat({ min: 0 }).withMessage('Ammonia must be positive.'),
];

const historyRules = [
  param('pondId').isUUID().withMessage('pondId must be a valid UUID.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100.'),
];

router.get('/health',              mlHealth);                                    // public — no auth
router.post('/predict',            authenticate, predictRules, predict);
router.get('/history/:pondId',     authenticate, historyRules, getPredictionHistory);

module.exports = router;
