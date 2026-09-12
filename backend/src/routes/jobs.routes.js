'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const jobsController = require('../controllers/jobs.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// ─── Taxonomy & Public Views ──────────────────────────────────────────────────
router.get('/taxonomy', jobsController.getTaxonomy);
router.get('/workers', jobsController.getWorkers);
router.get('/workers/me', jobsController.getMyWorkerProfile);

router.post(
  '/workers/me',
  [
    body('full_name').notEmpty().withMessage('Full name is required.'),
    body('phone').notEmpty().withMessage('Phone number is required.'),
    body('primary_job_type').notEmpty().withMessage('Primary job role is required.'),
    body('state').notEmpty().withMessage('State is required.'),
    body('district').notEmpty().withMessage('District is required.'),
  ],
  jobsController.saveMyWorkerProfile
);

// ─── Applications ─────────────────────────────────────────────────────────────
router.get('/applications/me', jobsController.getMyApplications);
router.patch('/applications/:id/status', jobsController.updateApplicationStatus);

// ─── Jobs CRUD ────────────────────────────────────────────────────────────────
router.get('/', jobsController.getJobs);
router.get('/:id', jobsController.getJobById);

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Job title is required.'),
    body('job_type').notEmpty().withMessage('Job type is required.'),
    body('description').notEmpty().withMessage('Description is required.'),
    body('location').notEmpty().withMessage('Location is required.'),
    body('state').notEmpty().withMessage('State is required.'),
    body('district').notEmpty().withMessage('District is required.'),
    body('salary').isFloat({ min: 1 }).withMessage('Valid salary amount is required.'),
    body('contact_phone').notEmpty().withMessage('Contact phone number is required.'),
  ],
  jobsController.createJob
);

router.put('/:id', jobsController.updateJob);
router.delete('/:id', jobsController.deleteJob);

router.post('/:id/apply', jobsController.applyForJob);
router.get('/:id/applications', jobsController.getJobApplications);

// ─── Reviews & Trust ──────────────────────────────────────────────────────────
router.post(
  '/reviews',
  [
    body('reviewee_id').notEmpty().withMessage('Reviewee ID is required.'),
    body('target_type').isIn(['worker', 'employer']).withMessage('Target type must be worker or employer.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  ],
  jobsController.submitReview
);

router.post(
  '/reports',
  [
    body('reported_type').isIn(['job', 'worker', 'farmer']).withMessage('Invalid reported type.'),
    body('target_id').notEmpty().withMessage('Target ID is required.'),
    body('reason').notEmpty().withMessage('Reason is required.'),
  ],
  jobsController.submitReport
);

module.exports = router;
