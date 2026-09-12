'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const preventionController = require('../controllers/prevention.controller');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

const router = express.Router();

// 1. Evaluate Pond Health & Disease Risk
router.post(
  '/evaluate',
  [
    body('species').trim().notEmpty().withMessage('Aquaculture species is required'),
    body('pond_id').trim().notEmpty().withMessage('Pond ID is required')
  ],
  validate,
  preventionController.evaluatePondHealth
);

// 2. Health Assessment History
router.get('/history', preventionController.getHistory);
router.get('/history/pond/:pondId', preventionController.getPondHistory);

// 3. Preventive Daily & Weekly Tasks (Checklists)
router.get('/tasks/:pondId', preventionController.getPondTasks);
router.patch(
  '/tasks/:taskId/toggle',
  [
    param('taskId').trim().notEmpty().withMessage('Task ID is required')
  ],
  validate,
  preventionController.toggleTask
);

// 4. Notifications
router.get('/notifications', preventionController.getNotifications);
router.patch(
  '/notifications/:id/read',
  [
    param('id').trim().notEmpty().withMessage('Notification ID is required')
  ],
  validate,
  preventionController.markNotificationRead
);

module.exports = router;
