'use strict';

const { validationResult } = require('express-validator');
const { ApiError } = require('../middleware/errorHandler');
const expertConsultationService = require('../services/expertConsultation.service');

const DEFAULT_FARMER_ID = 'farmer-demo';
const DEFAULT_EXPERT_ID = 'exp-001';

/**
 * GET /api/consultations/specializations
 */
async function getSpecializations(req, res, next) {
  try {
    const specializations = expertConsultationService.getSpecializations();
    res.status(200).json({ success: true, data: specializations });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consultations/experts
 */
async function getExperts(req, res, next) {
  try {
    const {
      specialization,
      district,
      search,
      consultation_type,
      verified_only,
      sort_by
    } = req.query;

    const experts = expertConsultationService.getExperts({
      specialization,
      district,
      search,
      consultation_type,
      verified_only,
      sort_by
    });

    res.status(200).json({
      success: true,
      count: experts.length,
      data: experts
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consultations/experts/:id
 */
async function getExpertById(req, res, next) {
  try {
    const expert = expertConsultationService.getExpertById(req.params.id);
    if (!expert) {
      throw new ApiError(404, 'Aquaculture expert not found');
    }
    res.status(200).json({ success: true, data: expert });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/consultations/appointments
 * Farmer books an appointment
 */
async function bookAppointment(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const farmerId = req.userId || req.headers['x-farmer-id'] || DEFAULT_FARMER_ID;
    const farmerName = req.body.farmer_name || req.userName || 'Aqua Farmer';
    const farmerPhone = req.body.farmer_phone || '+91 98480 00000';
    const farmerLocation = req.body.farmer_location || 'Andhra Pradesh';

    const appointment = expertConsultationService.bookAppointment(
      req.body,
      farmerId,
      farmerName,
      farmerPhone,
      farmerLocation
    );

    res.status(201).json({
      success: true,
      message: 'Consultation appointment scheduled successfully with expert',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consultations/appointments/farmer
 * Get all appointments for current farmer (role-scoped, private)
 */
async function getFarmerAppointments(req, res, next) {
  try {
    const farmerId = req.userId || req.headers['x-farmer-id'] || DEFAULT_FARMER_ID;
    const appointments = expertConsultationService.getFarmerAppointments(farmerId);
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/consultations/appointments/expert/:expertId
 * Get all appointments assigned to an expert (role-scoped)
 */
async function getExpertAppointments(req, res, next) {
  try {
    const expertId = req.params.expertId || DEFAULT_EXPERT_ID;
    const appointments = expertConsultationService.getExpertAppointments(expertId);
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/consultations/appointments/:id/status
 * Update status (accept/reject/complete) & add recommendations
 */
async function updateAppointmentStatus(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { status, expert_recommendations, prescribed_actions, follow_up_date, rejection_reason } = req.body;
    const updated = expertConsultationService.updateAppointmentStatus(
      req.params.id,
      status,
      { expert_recommendations, prescribed_actions, follow_up_date, rejection_reason }
    );

    if (!updated) {
      throw new ApiError(404, 'Consultation appointment not found');
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to '${status}'`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/consultations/experts/:id/reviews
 * Farmer submits review
 */
async function submitReview(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { appointment_id, rating, review_text, farmer_name } = req.body;
    const farmerId = req.userId || req.headers['x-farmer-id'] || DEFAULT_FARMER_ID;

    const review = expertConsultationService.submitReview(
      req.params.id,
      appointment_id,
      rating,
      review_text,
      farmerId,
      farmer_name || 'Verified Farmer'
    );

    if (!review) {
      throw new ApiError(404, 'Aquaculture expert not found');
    }

    res.status(201).json({
      success: true,
      message: 'Expert review submitted successfully',
      data: review
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSpecializations,
  getExperts,
  getExpertById,
  bookAppointment,
  getFarmerAppointments,
  getExpertAppointments,
  updateAppointmentStatus,
  submitReview
};
