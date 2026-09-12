'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const diseaseController = require('../controllers/disease.controller');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

const router = express.Router();

// 1. Submit image, symptoms and water quality for AI screening
router.post(
  '/analyze',
  [
    body('species').trim().notEmpty().withMessage('Aquaculture species is required'),
    body('image_url').trim().notEmpty().withMessage('Specimen image URL/data is required')
  ],
  validate,
  diseaseController.analyzeSpecimen
);

// 2. Fetch screening history
router.get('/history', diseaseController.getHistory);
router.get('/history/pond/:pondId', diseaseController.getPondHistory);

// 3. Request expert veterinary consultation
router.patch(
  '/:id/expert-consultation',
  [
    param('id').trim().notEmpty().withMessage('Analysis ID is required')
  ],
  validate,
  diseaseController.requestConsultation
);

// 4. Alerts
router.get('/alerts', diseaseController.getAlerts);
router.patch(
  '/alerts/:alertId/read',
  [
    param('alertId').trim().notEmpty().withMessage('Alert ID is required')
  ],
  validate,
  diseaseController.markAlertRead
);

module.exports = router;
