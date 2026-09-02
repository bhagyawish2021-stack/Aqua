'use strict';

const express = require('express');
const { body } = require('express-validator');
const { getWaterQuality, createWaterQuality, deleteWaterQuality } = require('../controllers/waterQuality.controller');
const { authenticate } = require('../middleware/auth');

// Mounted at /api/ponds/:pondId/water-quality via app.js
const router = express.Router({ mergeParams: true });

const createRules = [
  body('temperature').optional().isFloat({ min: 0, max: 50 }).withMessage('Temperature must be between 0 and 50°C.'),
  body('ph').optional().isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14.'),
  body('dissolved_oxygen').optional().isFloat({ min: 0 }).withMessage('Dissolved oxygen must be positive.'),
  body('salinity').optional().isFloat({ min: 0 }).withMessage('Salinity must be positive.'),
  body('ammonia').optional().isFloat({ min: 0 }).withMessage('Ammonia must be positive.'),
  body('alkalinity').optional().isFloat({ min: 0 }).withMessage('Alkalinity must be positive.'),
];

router.use(authenticate);

router.get('/',       getWaterQuality);
router.post('/',      createRules, createWaterQuality);
router.delete('/:id', deleteWaterQuality);

module.exports = router;
