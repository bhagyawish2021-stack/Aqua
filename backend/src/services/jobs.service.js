'use strict';

/**
 * jobs.service.js — Service & Provider for Aquaculture Jobs & Workers Marketplace.
 * Connects aquaculture farmers with specialized pond technicians and farm labor.
 */

const { supabaseAdmin } = require('../config/supabase');

// ─── Standard Aquaculture Job Taxonomy ─────────────────────────────────────────
const JOB_TYPES = [
  { id: 'pond_technician', name: 'Pond Technician', telugu_name: 'చెరువు టెక్నీషియన్', icon: '🔬' },
  { id: 'water_quality_technician', name: 'Water-Quality Technician', telugu_name: 'నీటి నాణ్యత నిపుణుడు', icon: '💧' },
  { id: 'feeding_worker', name: 'Feeding Worker', telugu_name: 'మేత వేసే కార్మికుడు', icon: '🍤' },
  { id: 'morning_worker', name: 'Morning Shift Worker', telugu_name: 'ఉదయం షిఫ్ట్ కార్మికుడు', icon: '🌅' },
  { id: 'night_worker', name: 'Night Watch & Aerator Worker', telugu_name: 'రాత్రి కాపలా & ఏరియేటర్ వర్కర్', icon: '🌙' },
  { id: 'pond_maintenance_worker', name: 'Pond Maintenance Worker', telugu_name: 'చెరువు నిర్వహణ కార్మికుడు', icon: '🛠️' },
  { id: 'harvesting_worker', name: 'Harvesting Worker', telugu_name: 'రొయ్యలు/చేపలు పట్టే కార్మికుడు', icon: '🎣' },
  { id: 'machinery_operator', name: 'Machinery & Generator Operator', telugu_name: 'మోటార్లు & జనరేటర్ ఆపరేటర్', icon: '⚙️' },
  { id: 'general_farm_worker', name: 'General Farm Worker', telugu_name: 'సాధారణ ఫారం కార్మికుడు', icon: '🌾' },
  { id: 'security_worker', name: 'Security & Watchman', telugu_name: 'సెక్యూరిటీ / కాపలాదారు', icon: '🛡️' },
];

const SKILLS_LIST = [
  'DO & pH Testing',
  'Ammonia & Salinity Titration',
  'Check Tray Feeding & Appetite Monitoring',
  'Paddlewheel Aerator Maintenance',
  'Diesel Generator Operation & Servicing',
  'Probiotics & Lime Dosing',
  'Shrimp Sampling & ABW Calculation',
  'Cast Net & Bag Netting',
  'Night Guard & Alarm Monitoring',
  'Biofloc / Nursery Tank Care',
  'Pond Sludge & Siphon Cleaning',
];

// ─── In-Memory Store & Baseline Seed Data ─────────────────────────────────────
let memoryJobs = [
  {
    id: 'job-001',
    farmer_id: '00000000-0000-0000-0000-000000000001',
    farmer_name: 'Sri Rama Aqua Farms',
    title: 'Senior Pond & Water Quality Technician',
    job_type: 'pond_technician',
    description: 'Looking for an experienced pond technician for a 6-pond Vannamei farm. Responsible for daily DO/pH testing, feed check tray management, and probiotic dosing schedule.',
    required_skills: ['DO & pH Testing', 'Check Tray Feeding & Appetite Monitoring', 'Probiotics & Lime Dosing'],
    location: 'Undi Road, Bhimavaram',
    state: 'Andhra Pradesh',
    district: 'West Godavari',
    salary: 22000,
    salary_type: 'monthly',
    working_hours: '6:00 AM - 6:00 PM (with farm stay)',
    start_date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    workers_needed: 1,
    contact_phone: '+91 98480 23456',
    status: 'open',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'job-002',
    farmer_id: '00000000-0000-0000-0000-000000000001',
    farmer_name: 'Krishna Coastal Shrimp',
    title: 'Night Shift Aeration & Security Watcher',
    job_type: 'night_worker',
    description: 'Need dependable night worker to monitor paddlewheel aerators, monitor DO drops between 2:00 AM - 5:00 AM, and alert supervisor in case of power trips.',
    required_skills: ['Paddlewheel Aerator Maintenance', 'Night Guard & Alarm Monitoring'],
    location: 'Indukurpet Coastal Area',
    state: 'Andhra Pradesh',
    district: 'Nellore',
    salary: 650,
    salary_type: 'daily',
    working_hours: '8:00 PM - 6:00 AM',
    start_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    workers_needed: 2,
    contact_phone: '+91 94401 78901',
    status: 'open',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'job-003',
    farmer_id: '00000000-0000-0000-0000-000000000002',
    farmer_name: 'Narmada Estuary Prawns',
    title: 'Feeding Worker for Vannamei Ponds',
    job_type: 'feeding_worker',
    description: 'Experienced feeding worker required for 4 times daily feeding (6AM, 10AM, 2PM, 6PM) and feed tray inspection.',
    required_skills: ['Check Tray Feeding & Appetite Monitoring'],
    location: 'Olpad Aqua Belt',
    state: 'Gujarat',
    district: 'Surat',
    salary: 18000,
    salary_type: 'monthly',
    working_hours: '6:00 AM - 6:30 PM',
    start_date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    workers_needed: 1,
    contact_phone: '+91 98250 12345',
    status: 'open',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'job-004',
    farmer_id: '00000000-0000-0000-0000-000000000003',
    farmer_name: 'Kakinada Brackish Farms',
    title: 'Urgent: Shrimp Harvesting Crew Members',
    job_type: 'harvesting_worker',
    description: 'Urgent requirement for bag-net and cast-net shrimp harvesting crew for 3 ponds night harvest. Food and transport provided.',
    required_skills: ['Cast Net & Bag Netting', 'Pond Sludge & Siphon Cleaning'],
    location: 'Kakinada Port Area',
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    salary: 850,
    salary_type: 'daily',
    working_hours: '10:00 PM - 5:00 AM',
    start_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    workers_needed: 4,
    contact_phone: '+91 98661 55667',
    status: 'open',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

let memoryWorkerProfiles = [
  {
    id: 'wp-001',
    user_id: 'usr-worker-01',
    full_name: 'V. Rambabu',
    phone: '+91 98481 11223',
    state: 'Andhra Pradesh',
    district: 'West Godavari',
    primary_job_type: 'pond_technician',
    skills: ['DO & pH Testing', 'Ammonia & Salinity Titration', 'Check Tray Feeding & Appetite Monitoring', 'Probiotics & Lime Dosing'],
    experience_years: 8,
    availability: 'immediate',
    expected_salary: 22000,
    salary_type: 'monthly',
    preferred_hours: 'Day / Full Farm Residence',
    bio: '8 years hands-on experience in Vannamei and Black Tiger shrimp ponds. Certified in water quality titration and disease early warning.',
    is_verified: true,
    rating: 4.9,
    reviews_count: 14,
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'wp-002',
    user_id: 'usr-worker-02',
    full_name: 'M. Suresh Kumar',
    phone: '+91 94402 33445',
    state: 'Andhra Pradesh',
    district: 'Nellore',
    primary_job_type: 'water_quality_technician',
    skills: ['DO & pH Testing', 'Ammonia & Salinity Titration', 'Shrimp Sampling & ABW Calculation'],
    experience_years: 5,
    availability: 'immediate',
    expected_salary: 20000,
    salary_type: 'monthly',
    preferred_hours: 'Morning Shift (6AM - 2PM)',
    bio: 'Diploma in Aquaculture. Expert in digital DO meters, optical refractometers, and chemical correction.',
    is_verified: true,
    rating: 4.8,
    reviews_count: 9,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'wp-003',
    user_id: 'usr-worker-03',
    full_name: 'K. Venkat Rao',
    phone: '+91 97003 44556',
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    primary_job_type: 'night_worker',
    skills: ['Paddlewheel Aerator Maintenance', 'Diesel Generator Operation & Servicing', 'Night Guard & Alarm Monitoring'],
    experience_years: 6,
    availability: 'immediate',
    expected_salary: 700,
    salary_type: 'daily',
    preferred_hours: 'Night Shift (8PM - 6AM)',
    bio: 'Experienced in motor wiring, belt replacement, auto-phase starters, and overnight pond monitoring.',
    is_verified: true,
    rating: 4.9,
    reviews_count: 22,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'wp-004',
    user_id: 'usr-worker-04',
    full_name: 'Govind Bhai Patel',
    phone: '+91 98251 66778',
    state: 'Gujarat',
    district: 'Surat',
    primary_job_type: 'feeding_worker',
    skills: ['Check Tray Feeding & Appetite Monitoring', 'Pond Sludge & Siphon Cleaning'],
    experience_years: 4,
    availability: 'within_week',
    expected_salary: 17000,
    salary_type: 'monthly',
    preferred_hours: 'Full Day Feeding Schedule',
    bio: 'Trained feeder for high-density Vannamei biofloc culture. Careful inspection of molting stages on check trays.',
    is_verified: true,
    rating: 4.7,
    reviews_count: 7,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

let memoryApplications = [
  {
    id: 'app-001',
    job_id: 'job-001',
    worker_id: 'usr-worker-01',
    worker_name: 'V. Rambabu',
    worker_phone: '+91 98481 11223',
    worker_experience: 8,
    worker_rating: 4.9,
    worker_job_type: 'pond_technician',
    worker_is_verified: true,
    note: 'Residing in Undi, 4km from Bhimavaram. Have worked 3 years at nearby CP farm.',
    status: 'shortlisted',
    applied_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'app-002',
    job_id: 'job-002',
    worker_id: 'usr-worker-03',
    worker_name: 'K. Venkat Rao',
    worker_phone: '+91 97003 44556',
    worker_experience: 6,
    worker_rating: 4.9,
    worker_job_type: 'night_worker',
    worker_is_verified: true,
    note: 'Available for daily night shifts. Own two-wheeler for commuting.',
    status: 'applied',
    applied_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

let memoryReviews = [
  {
    id: 'rev-001',
    job_id: 'job-001',
    reviewer_id: '00000000-0000-0000-0000-000000000001',
    reviewer_name: 'Sri Rama Aqua Farms',
    reviewee_id: 'usr-worker-01',
    target_type: 'worker',
    rating: 5,
    review_text: 'Excellent pond technician. Highly punctual with morning DO tests and feeding adjustments.',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'rev-002',
    job_id: 'job-002',
    reviewer_id: 'usr-worker-03',
    reviewer_name: 'K. Venkat Rao',
    reviewee_id: '00000000-0000-0000-0000-000000000001',
    target_type: 'employer',
    rating: 5,
    review_text: 'Prompt weekly settlement of wages. Provided tea, snacks, and proper shelter at the pond.',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

let memoryReports = [];

// ─── Service Methods ─────────────────────────────────────────────────────────

function getTaxonomy() {
  return {
    jobTypes: JOB_TYPES,
    skills: SKILLS_LIST,
  };
}

/**
 * Get jobs list with multi-criteria filtering
 */
async function getJobs(filters = {}) {
  const { job_type, state, district, salary_type, min_salary, search, farmer_id } = filters;

  let list = [...memoryJobs];

  if (farmer_id) {
    list = list.filter(j => j.farmer_id === farmer_id);
  }

  if (job_type && job_type !== 'all') {
    list = list.filter(j => j.job_type === job_type);
  }

  if (state && state !== 'all') {
    list = list.filter(j => j.state.toLowerCase() === state.toLowerCase());
  }

  if (district && district !== 'all') {
    list = list.filter(j => j.district.toLowerCase() === district.toLowerCase());
  }

  if (salary_type && salary_type !== 'all') {
    list = list.filter(j => j.salary_type === salary_type);
  }

  if (min_salary) {
    list = list.filter(j => j.salary >= parseFloat(min_salary));
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      j.district.toLowerCase().includes(q) ||
      (j.required_skills && j.required_skills.some(s => s.toLowerCase().includes(q)))
    );
  }

  // Attach applicant counts
  const enriched = list.map(job => {
    const apps = memoryApplications.filter(a => a.job_id === job.id);
    return {
      ...job,
      jobTypeInfo: JOB_TYPES.find(jt => jt.id === job.job_type) || { name: job.job_type, telugu_name: job.job_type, icon: '💼' },
      applicationsCount: apps.length,
      shortlistedCount: apps.filter(a => a.status === 'shortlisted').length,
      acceptedCount: apps.filter(a => a.status === 'accepted').length,
    };
  });

  return enriched;
}

/**
 * Get job by ID with applicants (if farmer is owner)
 */
async function getJobById(jobId, currentUserId) {
  const job = memoryJobs.find(j => j.id === jobId);
  if (!job) return null;

  const applications = memoryApplications.filter(a => a.job_id === jobId);
  const jobTypeInfo = JOB_TYPES.find(jt => jt.id === job.job_type) || { name: job.job_type, telugu_name: job.job_type, icon: '💼' };

  return {
    ...job,
    jobTypeInfo,
    applications: job.farmer_id === currentUserId ? applications : [],
    applicationsCount: applications.length,
  };
}

/**
 * Post a new job as farmer
 */
async function createJob(farmerId, farmerName, jobData) {
  const {
    title,
    job_type,
    description,
    required_skills = [],
    location,
    state,
    district,
    salary,
    salary_type = 'monthly',
    working_hours,
    start_date,
    workers_needed = 1,
    contact_phone,
  } = jobData;

  const newJob = {
    id: `job-${Date.now()}`,
    farmer_id: farmerId,
    farmer_name: farmerName || 'Aqua Farmer',
    title,
    job_type,
    description,
    required_skills: Array.isArray(required_skills) ? required_skills : [required_skills],
    location,
    state,
    district,
    salary: parseFloat(salary),
    salary_type,
    working_hours: working_hours || 'Day Shift',
    start_date: start_date || new Date().toISOString().slice(0, 10),
    workers_needed: parseInt(workers_needed, 10) || 1,
    contact_phone,
    status: 'open',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryJobs.unshift(newJob);
  return getJobById(newJob.id, farmerId);
}

/**
 * Update existing job
 */
async function updateJob(jobId, farmerId, updates) {
  const index = memoryJobs.findIndex(j => j.id === jobId && j.farmer_id === farmerId);
  if (index === -1) throw new Error('Job not found or unauthorized.');

  memoryJobs[index] = {
    ...memoryJobs[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return getJobById(jobId, farmerId);
}

/**
 * Delete a job
 */
async function deleteJob(jobId, farmerId) {
  const index = memoryJobs.findIndex(j => j.id === jobId && j.farmer_id === farmerId);
  if (index === -1) throw new Error('Job not found or unauthorized.');

  memoryJobs.splice(index, 1);
  // Remove applications for this job
  memoryApplications = memoryApplications.filter(a => a.job_id !== jobId);
  return { success: true };
}

/**
 * Browse workers with filters
 */
async function getWorkers(filters = {}) {
  const { job_type, state, district, availability, search } = filters;

  let list = [...memoryWorkerProfiles];

  if (job_type && job_type !== 'all') {
    list = list.filter(w => w.primary_job_type === job_type);
  }

  if (state && state !== 'all') {
    list = list.filter(w => w.state.toLowerCase() === state.toLowerCase());
  }

  if (district && district !== 'all') {
    list = list.filter(w => w.district.toLowerCase() === district.toLowerCase());
  }

  if (availability && availability !== 'all') {
    list = list.filter(w => w.availability === availability);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(w =>
      w.full_name.toLowerCase().includes(q) ||
      w.district.toLowerCase().includes(q) ||
      (w.skills && w.skills.some(s => s.toLowerCase().includes(q))) ||
      (w.bio && w.bio.toLowerCase().includes(q))
    );
  }

  return list.map(w => ({
    ...w,
    jobTypeInfo: JOB_TYPES.find(jt => jt.id === w.primary_job_type) || { name: w.primary_job_type, telugu_name: w.primary_job_type, icon: '👷' },
  }));
}

/**
 * Get worker profile by user_id
 */
async function getWorkerProfile(userId) {
  const worker = memoryWorkerProfiles.find(w => w.user_id === userId);
  if (!worker) return null;

  const reviews = memoryReviews.filter(r => r.reviewee_id === userId);
  return {
    ...worker,
    jobTypeInfo: JOB_TYPES.find(jt => jt.id === worker.primary_job_type) || { name: worker.primary_job_type, telugu_name: worker.primary_job_type, icon: '👷' },
    reviews,
  };
}

/**
 * Create or update worker profile
 */
async function saveWorkerProfile(userId, profileData) {
  const {
    full_name,
    phone,
    state,
    district,
    primary_job_type,
    skills = [],
    experience_years,
    availability = 'immediate',
    expected_salary,
    salary_type = 'daily',
    preferred_hours,
    bio,
  } = profileData;

  let existing = memoryWorkerProfiles.find(w => w.user_id === userId);

  if (existing) {
    Object.assign(existing, {
      full_name: full_name || existing.full_name,
      phone: phone || existing.phone,
      state: state || existing.state,
      district: district || existing.district,
      primary_job_type: primary_job_type || existing.primary_job_type,
      skills: skills || existing.skills,
      experience_years: parseInt(experience_years, 10) || existing.experience_years,
      availability: availability || existing.availability,
      expected_salary: expected_salary ? parseFloat(expected_salary) : existing.expected_salary,
      salary_type: salary_type || existing.salary_type,
      preferred_hours: preferred_hours || existing.preferred_hours,
      bio: bio || existing.bio,
      updated_at: new Date().toISOString(),
    });
    return getWorkerProfile(userId);
  } else {
    const newProfile = {
      id: `wp-${Date.now()}`,
      user_id: userId,
      full_name,
      phone,
      state,
      district,
      primary_job_type: primary_job_type || 'pond_technician',
      skills: Array.isArray(skills) ? skills : [skills],
      experience_years: parseInt(experience_years, 10) || 0,
      availability,
      expected_salary: parseFloat(expected_salary) || 500,
      salary_type,
      preferred_hours: preferred_hours || 'Day Shift',
      bio: bio || 'Aquaculture technician ready for pond work.',
      is_verified: true,
      rating: 5.0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryWorkerProfiles.unshift(newProfile);
    return getWorkerProfile(userId);
  }
}

/**
 * Apply for a job as a worker
 */
async function applyForJob(workerId, jobId, applicationData) {
  const { note, contact_phone, worker_name } = applicationData;

  const job = memoryJobs.find(j => j.id === jobId);
  if (!job) throw new Error('Job does not exist.');

  // Check if already applied
  const existing = memoryApplications.find(a => a.job_id === jobId && a.worker_id === workerId);
  if (existing) {
    throw new Error('You have already applied for this job.');
  }

  // Pull profile info if available
  const profile = memoryWorkerProfiles.find(w => w.user_id === workerId);

  const newApp = {
    id: `app-${Date.now()}`,
    job_id: jobId,
    job_title: job.title,
    job_location: job.location,
    farmer_name: job.farmer_name,
    salary: job.salary,
    salary_type: job.salary_type,
    worker_id: workerId,
    worker_name: profile?.full_name || worker_name || 'Technician',
    worker_phone: contact_phone || profile?.phone || '+91 98480 00000',
    worker_experience: profile?.experience_years || 1,
    worker_rating: profile?.rating || 5.0,
    worker_job_type: profile?.primary_job_type || job.job_type,
    worker_is_verified: profile?.is_verified ?? true,
    note: note || '',
    status: 'applied', // applied, shortlisted, accepted, rejected, completed
    applied_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  memoryApplications.unshift(newApp);
  return newApp;
}

/**
 * Get applications for a specific job (Farmer view)
 */
async function getJobApplications(jobId, farmerId) {
  const job = memoryJobs.find(j => j.id === jobId);
  if (!job) throw new Error('Job not found.');
  if (job.farmer_id !== farmerId) throw new Error('Unauthorized.');

  return memoryApplications.filter(a => a.job_id === jobId);
}

/**
 * Get all applications submitted by a worker (Worker view)
 */
async function getMyApplications(workerId) {
  const apps = memoryApplications.filter(a => a.worker_id === workerId);
  return apps.map(app => {
    const job = memoryJobs.find(j => j.id === app.job_id);
    return {
      ...app,
      job: job || { title: app.job_title, location: app.job_location, salary: app.salary, salary_type: app.salary_type },
    };
  });
}

/**
 * Update application status (shortlisted, accepted, rejected, completed)
 */
async function updateApplicationStatus(applicationId, newStatus, currentUserId) {
  const app = memoryApplications.find(a => a.id === applicationId);
  if (!app) throw new Error('Application not found.');

  const validStatuses = ['applied', 'shortlisted', 'accepted', 'rejected', 'completed'];
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid application status.');
  }

  app.status = newStatus;
  app.updated_at = new Date().toISOString();

  // If completed or accepted, check job status
  if (newStatus === 'completed') {
    const job = memoryJobs.find(j => j.id === app.job_id);
    if (job) job.status = 'filled';
  }

  return app;
}

/**
 * Post a Review & Star Rating
 */
async function submitReview(reviewerId, reviewerName, reviewData) {
  const { job_id, reviewee_id, target_type, rating, review_text } = reviewData;

  const newReview = {
    id: `rev-${Date.now()}`,
    job_id: job_id || null,
    reviewer_id: reviewerId,
    reviewer_name: reviewerName || 'Verified User',
    reviewee_id,
    target_type, // 'worker' or 'employer'
    rating: parseInt(rating, 10),
    review_text,
    created_at: new Date().toISOString(),
  };

  memoryReviews.unshift(newReview);

  // Recalculate rating if review is for a worker
  if (target_type === 'worker') {
    const worker = memoryWorkerProfiles.find(w => w.user_id === reviewee_id);
    if (worker) {
      const workerReviews = memoryReviews.filter(r => r.reviewee_id === reviewee_id && r.target_type === 'worker');
      const avg = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length;
      worker.rating = Math.round(avg * 10) / 10;
      worker.reviews_count = workerReviews.length;
    }
  }

  return newReview;
}

async function getReviewsForUser(userId) {
  return memoryReviews.filter(r => r.reviewee_id === userId);
}

/**
 * Report a user or job
 */
async function submitReport(reporterId, reportData) {
  const { reported_type, target_id, reason } = reportData;

  const newReport = {
    id: `rep-${Date.now()}`,
    reporter_id: reporterId,
    reported_type, // 'job', 'worker', 'farmer'
    target_id,
    reason,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  memoryReports.push(newReport);
  return { success: true, message: 'Report submitted for review.' };
}

module.exports = {
  JOB_TYPES,
  SKILLS_LIST,
  getTaxonomy,
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getWorkers,
  getWorkerProfile,
  saveWorkerProfile,
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  submitReview,
  getReviewsForUser,
  submitReport,
};
