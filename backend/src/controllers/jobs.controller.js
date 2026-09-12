'use strict';

const { validationResult } = require('express-validator');
const { ApiError } = require('../middleware/errorHandler');
const jobsService = require('../services/jobs.service');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/jobs/taxonomy
 */
async function getTaxonomy(req, res, next) {
  try {
    const data = jobsService.getTaxonomy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/jobs
 */
async function getJobs(req, res, next) {
  try {
    const { job_type, state, district, salary_type, min_salary, search, my_jobs } = req.query;
    const userId = req.userId || DEFAULT_USER_ID;

    const filters = {
      job_type,
      state,
      district,
      salary_type,
      min_salary,
      search,
      farmer_id: my_jobs === 'true' ? userId : undefined,
    };

    const jobs = await jobsService.getJobs(filters);
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/jobs/:id
 */
async function getJobById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.userId || DEFAULT_USER_ID;
    const job = await jobsService.getJobById(id, userId);
    if (!job) return next(new ApiError(404, 'Job not found.'));

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/jobs
 */
async function createJob(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const userId = req.userId || DEFAULT_USER_ID;
    const userName = req.user?.name || req.user?.user_metadata?.name || 'Aqua Farmer';

    const job = await jobsService.createJob(userId, userName, req.body);
    res.status(201).json({ success: true, message: 'Job posted successfully.', data: job });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/jobs/:id
 */
async function updateJob(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const { id } = req.params;
    const userId = req.userId || DEFAULT_USER_ID;

    const updated = await jobsService.updateJob(id, userId, req.body);
    res.status(200).json({ success: true, message: 'Job updated.', data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/jobs/:id
 */
async function deleteJob(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.userId || DEFAULT_USER_ID;

    await jobsService.deleteJob(id, userId);
    res.status(200).json({ success: true, message: 'Job deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/jobs/workers
 */
async function getWorkers(req, res, next) {
  try {
    const { job_type, state, district, availability, search } = req.query;
    const workers = await jobsService.getWorkers({ job_type, state, district, availability, search });
    res.status(200).json({ success: true, count: workers.length, data: workers });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/jobs/workers/me
 */
async function getMyWorkerProfile(req, res, next) {
  try {
    const userId = req.userId || DEFAULT_USER_ID;
    const profile = await jobsService.getWorkerProfile(userId);
    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/jobs/workers/me
 */
async function saveMyWorkerProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const userId = req.userId || DEFAULT_USER_ID;
    const profile = await jobsService.saveWorkerProfile(userId, req.body);
    res.status(200).json({ success: true, message: 'Worker profile saved.', data: profile });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/jobs/:id/apply
 */
async function applyForJob(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.userId || DEFAULT_USER_ID;

    const application = await jobsService.applyForJob(userId, id, req.body);
    res.status(201).json({ success: true, message: 'Application submitted successfully.', data: application });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/jobs/:id/applications
 */
async function getJobApplications(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.userId || DEFAULT_USER_ID;

    const applications = await jobsService.getJobApplications(id, userId);
    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/jobs/applications/me
 */
async function getMyApplications(req, res, next) {
  try {
    const userId = req.userId || DEFAULT_USER_ID;
    const applications = await jobsService.getMyApplications(userId);
    res.status(200).json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/jobs/applications/:id/status
 */
async function updateApplicationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId || DEFAULT_USER_ID;

    const updated = await jobsService.updateApplicationStatus(id, status, userId);
    res.status(200).json({ success: true, message: `Application status updated to ${status}.`, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/jobs/reviews
 */
async function submitReview(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const userId = req.userId || DEFAULT_USER_ID;
    const userName = req.user?.name || req.user?.user_metadata?.name || 'Verified User';

    const review = await jobsService.submitReview(userId, userName, req.body);
    res.status(201).json({ success: true, message: 'Review submitted successfully.', data: review });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/jobs/reports
 */
async function submitReport(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const userId = req.userId || DEFAULT_USER_ID;
    const result = await jobsService.submitReport(userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTaxonomy,
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getWorkers,
  getMyWorkerProfile,
  saveMyWorkerProfile,
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  submitReview,
  submitReport,
};
