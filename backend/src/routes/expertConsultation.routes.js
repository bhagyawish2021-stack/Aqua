'use strict';

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const consultationController = require('../controllers/expertConsultation.controller');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

const router = express.Router();

// 1. Specializations & Expert Discovery (Public)
router.get('/specializations', consultationController.getSpecializations);
router.get('/experts', consultationController.getExperts);
router.get('/experts/:id', consultationController.getExpertById);

// 2. Booking Appointments (Farmer)
router.post(
  '/appointments',
  [
    body('expert_id').trim().notEmpty().withMessage('Expert ID is required'),
    body('consultation_type')
      .isIn(['chat', 'voice', 'video', 'appointment'])
      .withMessage('Consultation type must be chat, voice, video, or appointment'),
    body('scheduled_date').trim().notEmpty().withMessage('Scheduled date is required'),
    body('problem_description')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Problem description must be at least 5 characters')
  ],
  validate,
  consultationController.bookAppointment
);

// 3. Consultation History & Appointments (Role Scoped)
router.get('/appointments/farmer', consultationController.getFarmerAppointments);
router.get('/appointments/expert/:expertId', consultationController.getExpertAppointments);

// 4. Update Status & Clinical Recommendations
router.patch(
  '/appointments/:id/status',
  [
    param('id').trim().notEmpty().withMessage('Appointment ID is required'),
    body('status')
      .isIn(['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Status must be requested, confirmed, in_progress, completed, or cancelled')
  ],
  validate,
  consultationController.updateAppointmentStatus
);

// 5. Submit Expert Review
router.post(
  '/experts/:id/reviews',
  [
    param('id').trim().notEmpty().withMessage('Expert ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5'),
    body('review_text')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Review text must be at least 3 characters')
  ],
  validate,
  consultationController.submitReview
);

module.exports = router;
