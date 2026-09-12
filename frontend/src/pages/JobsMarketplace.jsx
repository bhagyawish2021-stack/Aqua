import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import {
  getTaxonomy,
  getJobs,
  createJob,
  deleteJob,
  getWorkers,
  getMyWorkerProfile,
  saveMyWorkerProfile,
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  submitReview,
  submitReport,
} from '../services/jobsService';
import { getErrorMsg } from '../helpers/errorMsg';

// ─── Bilingual Dictionary ───────────────────────────────────────────────────
const I18N = {
  en: {
    pageTitle: 'Jobs & Workers Marketplace',
    pageSubtitle: 'Hire trusted pond technicians, night watch, feeders & harvest labor',
    tabJobs: 'Find Jobs',
    tabWorkers: 'Find Workers',
    tabMyJobs: 'My Posted Jobs',
    tabMyApps: 'My Applications',
    tabWorkerProfile: 'Worker Profile',
    postJobBtn: '+ Post a Job',
    searchPlaceholder: 'Search by role, skills, or location...',
    allRoles: 'All Job Roles',
    allLocations: 'All States',
    allSalaryTypes: 'Any Salary Type',
    daily: 'Daily',
    monthly: 'Monthly',
    hourly: 'Hourly',
    needed: 'needed',
    starts: 'Starts',
    experience: 'Exp',
    applyNow: 'Apply Now',
    applied: 'Applied',
    shortlist: 'Shortlist',
    accept: 'Accept',
    reject: 'Reject',
    completeAndRate: 'Complete & Rate',
    callNow: 'Call',
    report: 'Report',
    rateWorker: 'Rate Worker',
    verified: 'Verified',
    availableImmediate: 'Available Immediately',
    availableWeek: 'Available in a week',
    saveProfile: 'Save Worker Profile',
    applicants: 'Applicants',
    noJobsFound: 'No jobs found matching your criteria.',
    noWorkersFound: 'No workers found in this category.',
    noMyJobs: 'You have not posted any jobs yet.',
    noMyApps: 'You have not applied to any aquaculture jobs yet.',
  },
  te: {
    pageTitle: 'ఆక్వాకల్చర్ ఉద్యోగాలు & కార్మికుల మార్కెట్',
    pageSubtitle: 'చెరువు టెక్నీషియన్లు, ఫీడింగ్ వర్కర్లు & హార్వెస్టింగ్ బృందాలను నియమించుకోండి',
    tabJobs: 'ఉద్యోగాలు వెతకండి',
    tabWorkers: 'కార్మికులను వెతకండి',
    tabMyJobs: 'నేను పోస్ట్ చేసినవి',
    tabMyApps: 'నా దరఖాస్తులు',
    tabWorkerProfile: 'కార్మికుడి ప్రొఫైల్',
    postJobBtn: '+ ఉద్యోగం పోస్ట్ చేయి',
    searchPlaceholder: 'పని రకం, నైపుణ్యాలు లేదా ప్రాంతం వెతకండి...',
    allRoles: 'అన్ని రకాల పనులు',
    allLocations: 'అన్ని రాష్ట్రాలు',
    allSalaryTypes: 'ఏ జీతమైనా',
    daily: 'రోజువారీ',
    monthly: 'నెలకు',
    hourly: 'గంటకు',
    needed: 'అవసరం',
    starts: 'ప్రారంభం',
    experience: 'అనుభవం',
    applyNow: 'దరఖాస్తు చేసుకోండి',
    applied: 'దరఖాస్తు చేశారు',
    shortlist: 'షార్ట్‌లిస్ట్ చేయి',
    accept: 'ఆమోదించు',
    reject: 'తిరస్కరించు',
    completeAndRate: 'పూర్తి చేసి రేటింగ్ ఇవ్వు',
    callNow: 'కాల్ చేయండి',
    report: 'రిపోర్ట్ చేయి',
    rateWorker: 'రేటింగ్ ఇవ్వండి',
    verified: 'ధృవీకరించబడింది',
    availableImmediate: 'వెంటనే పనికి సిద్ధం',
    availableWeek: 'వారంలో అందుబాటులో',
    saveProfile: 'ప్రొఫైల్ సేవ్ చేయి',
    applicants: 'దరఖాస్తుదారులు',
    noJobsFound: 'మీ ఫిల్టర్లకు సరిపోయే ఉద్యోగాలు లేవు.',
    noWorkersFound: 'ఈ విభాగంలో కార్మికులు కనుగొనబడలేదు.',
    noMyJobs: 'మీరు ఇంకా ఎటువంటి ఉద్యోగాలు పోస్ట్ చేయలేదు.',
    noMyApps: 'మీరు ఇంకా ఎటువంటి ఉద్యోగాలకు దరఖాస్తు చేయలేదు.',
  },
};

export default function JobsMarketplace() {
  const [lang, setLang] = useState('en');
  const t = I18N[lang];

  // Primary active tab: 'jobs' | 'workers' | 'my_jobs' | 'my_applications' | 'profile'
  const [activeTab, setActiveTab] = useState('jobs');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Taxonomy
  const [jobTypes, setJobTypes] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);

  // Data
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState({}); // jobId -> list of applicants

  // Filtering
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedSalaryType, setSelectedSalaryType] = useState('all');

  // Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    job_type: 'pond_technician',
    description: '',
    required_skills: [],
    location: '',
    state: 'Andhra Pradesh',
    district: 'West Godavari',
    salary: '',
    salary_type: 'monthly',
    working_hours: '6:00 AM - 6:00 PM',
    start_date: new Date().toISOString().slice(0, 10),
    workers_needed: 1,
    contact_phone: '',
  });

  const [applyModalJob, setApplyModalJob] = useState(null);
  const [applyNote, setApplyNote] = useState('');
  const [applyPhone, setApplyPhone] = useState('');

  const [reviewModalTarget, setReviewModalTarget] = useState(null); // { revieweeId, revieweeName, targetType, jobId }
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [reportTarget, setReportTarget] = useState(null); // { type, id }
  const [reportReason, setReportReason] = useState('');

  // Worker Profile state
  const [workerProfileForm, setWorkerProfileForm] = useState({
    full_name: '',
    phone: '',
    state: 'Andhra Pradesh',
    district: 'West Godavari',
    primary_job_type: 'pond_technician',
    skills: [],
    experience_years: 3,
    availability: 'immediate',
    expected_salary: 20000,
    salary_type: 'monthly',
    preferred_hours: 'Day Shift',
    bio: '',
  });

  // Load Initial Data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [taxRes, jobsRes, workersRes, myAppsRes, myJobsRes, profileRes] = await Promise.all([
        getTaxonomy(),
        getJobs(),
        getWorkers(),
        getMyApplications(),
        getJobs({ my_jobs: 'true' }),
        getMyWorkerProfile().catch(() => ({ data: { data: null } })),
      ]);

      setJobTypes(taxRes.data.data?.jobTypes || []);
      setAvailableSkills(taxRes.data.data?.skills || []);
      setJobs(jobsRes.data.data || []);
      setWorkers(workersRes.data.data || []);
      setMyApplications(myAppsRes.data.data || []);
      setMyJobs(myJobsRes.data.data || []);

      if (profileRes.data?.data) {
        setWorkerProfileForm(prev => ({
          ...prev,
          ...profileRes.data.data,
        }));
      }
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load applicants for a farmer's posted job
  async function loadApplicantsForJob(jobId) {
    try {
      const res = await getJobApplications(jobId);
      setSelectedJobApplicants(prev => ({ ...prev, [jobId]: res.data.data || [] }));
    } catch {}
  }

  // Handle Create Job
  async function handlePostJobSubmit(e) {
    e.preventDefault();
    try {
      await createJob(postForm);
      setShowPostModal(false);
      setSuccessMsg('Job posted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  // Handle Delete Job
  async function handleDeleteJob(jobId) {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await deleteJob(jobId);
      loadData();
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  // Handle Apply
  async function handleApplySubmit(e) {
    e.preventDefault();
    if (!applyModalJob) return;
    try {
      await applyForJob(applyModalJob.id, {
        note: applyNote,
        contact_phone: applyPhone,
      });
      setApplyModalJob(null);
      setApplyNote('');
      setApplyPhone('');
      setSuccessMsg('Application submitted to farmer successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  // Handle Application Status Change (Shortlist, Accept, Reject, Complete)
  async function handleStatusChange(applicationId, newStatus, jobId, applicant) {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      loadApplicantsForJob(jobId);
      loadData();

      // If completed, prompt review
      if (newStatus === 'completed') {
        setReviewModalTarget({
          revieweeId: applicant.worker_id,
          revieweeName: applicant.worker_name,
          targetType: 'worker',
          jobId,
        });
      }
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  // Handle Review Submit
  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewModalTarget) return;
    try {
      await submitReview({
        reviewee_id: reviewModalTarget.revieweeId,
        target_type: reviewModalTarget.targetType,
        job_id: reviewModalTarget.jobId,
        rating: reviewRating,
        review_text: reviewText,
      });
      setReviewModalTarget(null);
      setReviewText('');
      setSuccessMsg('Review and rating published successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  // Handle Report Submit
  async function handleReportSubmit(e) {
    e.preventDefault();
    if (!reportTarget) return;
    try {
      await submitReport({
        reported_type: reportTarget.type,
        target_id: reportTarget.id,
        reason: reportReason,
      });
      setReportTarget(null);
      setReportReason('');
      setSuccessMsg('Report submitted to moderation team.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  // Handle Save Worker Profile
  async function handleSaveProfileSubmit(e) {
    e.preventDefault();
    try {
      await saveMyWorkerProfile(workerProfileForm);
      setSuccessMsg('Worker profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  // Toggle Skill Checkbox in forms
  function toggleSkill(skillList, setFn, skillName) {
    if (skillList.includes(skillName)) {
      setFn(skillList.filter(s => s !== skillName));
    } else {
      setFn([...skillList, skillName]);
    }
  }

  // Filter Jobs
  const filteredJobs = jobs.filter(job => {
    if (selectedRole !== 'all' && job.job_type !== selectedRole) return false;
    if (selectedSalaryType !== 'all' && job.salary_type !== selectedSalaryType) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const match =
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.district.toLowerCase().includes(q) ||
        (job.required_skills && job.required_skills.some(s => s.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });

  // Filter Workers
  const filteredWorkers = workers.filter(worker => {
    if (selectedRole !== 'all' && worker.primary_job_type !== selectedRole) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const match =
        worker.full_name.toLowerCase().includes(q) ||
        worker.district.toLowerCase().includes(q) ||
        (worker.skills && worker.skills.some(s => s.toLowerCase().includes(q))) ||
        (worker.bio && worker.bio.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <Layout title={t.pageTitle}>
      {/* Header with Title and Language Toggle */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h2>{t.pageTitle}</h2>
          <p>{t.pageSubtitle}</p>
        </div>
        <div className="market-header-actions">
          <div className="lang-toggle" aria-label="Toggle language">
            <button
              className={lang === 'en' ? 'active' : ''}
              onClick={() => setLang('en')}
            >
              English
            </button>
            <button
              className={lang === 'te' ? 'active' : ''}
              onClick={() => setLang('te')}
            >
              తెలుగు
            </button>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowPostModal(true)}
          >
            {t.postJobBtn}
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Tabs */}
      <div className="market-tabs">
        <button
          className={'market-tab' + (activeTab === 'jobs' ? ' active' : '')}
          onClick={() => setActiveTab('jobs')}
        >
          🔍 {t.tabJobs} ({jobs.length})
        </button>
        <button
          className={'market-tab' + (activeTab === 'workers' ? ' active' : '')}
          onClick={() => setActiveTab('workers')}
        >
          👷 {t.tabWorkers} ({workers.length})
        </button>
        <button
          className={'market-tab' + (activeTab === 'my_jobs' ? ' active' : '')}
          onClick={() => setActiveTab('my_jobs')}
        >
          📋 {t.tabMyJobs} ({myJobs.length})
        </button>
        <button
          className={'market-tab' + (activeTab === 'my_applications' ? ' active' : '')}
          onClick={() => setActiveTab('my_applications')}
        >
          📥 {t.tabMyApps} ({myApplications.length})
        </button>
        <button
          className={'market-tab' + (activeTab === 'profile' ? ' active' : '')}
          onClick={() => setActiveTab('profile')}
        >
          👤 {t.tabWorkerProfile}
        </button>
      </div>

      {/* ─── TAB 1: FIND JOBS ──────────────────────────────────────────────── */}
      {activeTab === 'jobs' && (
        <>
          {/* Filters */}
          <div className="market-filter-bar">
            <div>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
              >
                <option value="all">{t.allRoles}</option>
                {jobTypes.map(jt => (
                  <option key={jt.id} value={jt.id}>
                    {jt.icon} {lang === 'te' ? jt.telugu_name : jt.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedSalaryType}
                onChange={e => setSelectedSalaryType(e.target.value)}
              >
                <option value="all">{t.allSalaryTypes}</option>
                <option value="monthly">{t.monthly}</option>
                <option value="daily">{t.daily}</option>
                <option value="hourly">{t.hourly}</option>
              </select>
            </div>
            {(search || selectedRole !== 'all' || selectedSalaryType !== 'all') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  setSelectedRole('all');
                  setSelectedSalaryType('all');
                }}
              >
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <Loading />
          ) : filteredJobs.length === 0 ? (
            <EmptyState icon="💼" title="No jobs found" message={t.noJobsFound} />
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map(job => {
                const roleTitle = lang === 'te' ? job.jobTypeInfo?.telugu_name : job.jobTypeInfo?.name;
                return (
                  <div key={job.id} className="job-card">
                    <div>
                      <div className="job-card-header">
                        <span className="job-role-badge">
                          <span>{job.jobTypeInfo?.icon || '💼'}</span>
                          <span>{roleTitle}</span>
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          📍 {job.district}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                        {job.title}
                      </h3>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                        🏢 {job.farmer_name} • {job.location}
                      </div>

                      <div className="job-salary-box">
                        <div>
                          <div className="job-salary-amount">₹{job.salary.toLocaleString('en-IN')}</div>
                          <div className="job-salary-type">
                            / {job.salary_type === 'monthly' ? t.monthly : job.salary_type === 'daily' ? t.daily : t.hourly}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>
                          <div>👥 {job.workers_needed} {t.needed}</div>
                          <div>🕒 {job.working_hours}</div>
                        </div>
                      </div>

                      <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 10 }}>
                        {job.description}
                      </p>

                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="skill-pills-wrap">
                          {job.required_skills.map((sk, idx) => (
                            <span key={idx} className="skill-pill">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => {
                          setApplyModalJob(job);
                          setApplyPhone(workerProfileForm.phone || '');
                        }}
                      >
                        {t.applyNow}
                      </button>
                      <a
                        href={`tel:${job.contact_phone}`}
                        className="btn btn-secondary"
                        title={job.contact_phone}
                      >
                        📞 {t.callNow}
                      </a>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '8px' }}
                        title="Report job"
                        onClick={() => setReportTarget({ type: 'job', id: job.id })}
                      >
                        🚩
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: FIND WORKERS ───────────────────────────────────────────── */}
      {activeTab === 'workers' && (
        <>
          <div className="market-filter-bar">
            <div>
              <input
                type="text"
                placeholder="Search technician by name, skill, or district..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
              >
                <option value="all">{t.allRoles}</option>
                {jobTypes.map(jt => (
                  <option key={jt.id} value={jt.id}>
                    {jt.icon} {lang === 'te' ? jt.telugu_name : jt.name}
                  </option>
                ))}
              </select>
            </div>
            {search && (
              <button className="btn btn-secondary btn-sm" onClick={() => setSearch('')}>
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <Loading />
          ) : filteredWorkers.length === 0 ? (
            <EmptyState icon="👷" title="No technicians found" message={t.noWorkersFound} />
          ) : (
            <div className="jobs-grid">
              {filteredWorkers.map(worker => {
                const initials = worker.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                const roleTitle = lang === 'te' ? worker.jobTypeInfo?.telugu_name : worker.jobTypeInfo?.name;

                return (
                  <div key={worker.id} className="worker-card">
                    <div>
                      <div className="worker-avatar-row">
                        <div className="worker-avatar-bubble">{initials}</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{worker.full_name}</h3>
                            {worker.is_verified && (
                              <span className="verified-badge">✓ {t.verified}</span>
                            )}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                            {roleTitle}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            📍 {worker.district}, {worker.state} • {worker.experience_years} Yrs {t.experience}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                        <span className="rating-stars">
                          ⭐ {worker.rating} ({worker.reviews_count})
                        </span>
                        <span style={{ fontSize: 12, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                          {worker.availability === 'immediate' ? t.availableImmediate : t.availableWeek}
                        </span>
                      </div>

                      <div className="job-salary-box" style={{ padding: '8px 12px' }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>
                            ₹{worker.expected_salary.toLocaleString('en-IN')}
                            <span style={{ fontSize: 11, fontWeight: 'normal', color: 'var(--text-secondary)' }}>
                              {' '}/ {worker.salary_type === 'monthly' ? t.monthly : t.daily}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            🕒 {worker.preferred_hours}
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 10 }}>
                        {worker.bio}
                      </p>

                      {worker.skills && (
                        <div className="skill-pills-wrap">
                          {worker.skills.map((sk, idx) => (
                            <span key={idx} className="skill-pill">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', gap: 8 }}>
                      <a
                        href={`tel:${worker.phone}`}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        📞 {t.callNow} ({worker.phone})
                      </a>
                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          setReviewModalTarget({
                            revieweeId: worker.user_id,
                            revieweeName: worker.full_name,
                            targetType: 'worker',
                          })
                        }
                      >
                        ⭐ {t.rateWorker}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── TAB 3: MY POSTED JOBS & APPLICANTS (FARMER VIEW) ──────────────── */}
      {activeTab === 'my_jobs' && (
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          {myJobs.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No jobs posted yet"
              message="Click '+ Post a Job' at the top to publish your farm requirements."
            />
          ) : (
            myJobs.map(job => {
              const applicants = selectedJobApplicants[job.id] || [];
              const isLoaded = selectedJobApplicants[job.id] !== undefined;

              return (
                <div key={job.id} className="card" style={{ marginBottom: 18 }}>
                  <div className="card-header">
                    <div>
                      <span className="job-role-badge" style={{ marginBottom: 6 }}>
                        {job.jobTypeInfo?.icon} {job.jobTypeInfo?.name}
                      </span>
                      <h3 style={{ fontSize: 17, fontWeight: 700 }}>{job.title}</h3>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        📍 {job.location} • ₹{job.salary}/{job.salary_type} • Posted{' '}
                        {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          if (isLoaded) {
                            setSelectedJobApplicants(prev => {
                              const copy = { ...prev };
                              delete copy[job.id];
                              return copy;
                            });
                          } else {
                            loadApplicantsForJob(job.id);
                          }
                        }}
                      >
                        👥 {t.applicants} ({job.applicationsCount || 0})
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Applicants Accordion */}
                  {isLoaded && (
                    <div style={{ padding: 16, background: '#fafbfc', borderTop: '1px solid var(--border)' }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                        Applicants for this position:
                      </h4>
                      {applicants.length === 0 ? (
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: 10 }}>
                          No workers have applied to this posting yet.
                        </div>
                      ) : (
                        applicants.map(app => (
                          <div key={app.id} className="pipeline-item">
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <strong style={{ fontSize: 15 }}>{app.worker_name}</strong>
                                <span className="verified-badge">✓ Verified</span>
                                <span className="rating-stars">⭐ {app.worker_rating}</span>
                                <span className={`status-pill status-${app.status}`}>
                                  {app.status}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                                📞 {app.worker_phone} • {app.worker_experience} Yrs Experience
                              </div>
                              {app.note && (
                                <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 6, fontStyle: 'italic' }}>
                                  "{app.note}"
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {app.status === 'applied' && (
                                <>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleStatusChange(app.id, 'shortlisted', job.id, app)}
                                  >
                                    ⭐ {t.shortlist}
                                  </button>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleStatusChange(app.id, 'accepted', job.id, app)}
                                  >
                                    ✓ {t.accept}
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    style={{ color: 'var(--danger)' }}
                                    onClick={() => handleStatusChange(app.id, 'rejected', job.id, app)}
                                  >
                                    ✕ {t.reject}
                                  </button>
                                </>
                              )}
                              {app.status === 'shortlisted' && (
                                <>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleStatusChange(app.id, 'accepted', job.id, app)}
                                  >
                                    ✓ {t.accept}
                                  </button>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    style={{ color: 'var(--danger)' }}
                                    onClick={() => handleStatusChange(app.id, 'rejected', job.id, app)}
                                  >
                                    ✕ {t.reject}
                                  </button>
                                </>
                              )}
                              {app.status === 'accepted' && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleStatusChange(app.id, 'completed', job.id, app)}
                                >
                                  🎉 {t.completeAndRate}
                                </button>
                              )}
                              {app.status === 'completed' && (
                                <span style={{ fontSize: 12, color: '#7e22ce', fontWeight: 600 }}>
                                  ✓ Completed
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── TAB 4: MY APPLICATIONS (WORKER VIEW) ─────────────────────────── */}
      {activeTab === 'my_applications' && (
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {myApplications.length === 0 ? (
            <EmptyState
              icon="📥"
              title="No applications submitted"
              message={t.noMyApps}
            />
          ) : (
            myApplications.map(app => (
              <div key={app.id} className="card" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                      {app.job_title}
                    </h3>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      🏢 {app.farmer_name} • 📍 {app.job_location} • ₹{app.salary}/{app.salary_type}
                    </div>
                    {app.note && (
                      <div style={{ fontSize: 13, background: '#f8fafc', padding: '8px 12px', borderRadius: 8 }}>
                        <strong>My Note:</strong> {app.note}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`status-pill status-${app.status}`}>
                      {app.status}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── TAB 5: WORKER PROFILE ─────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">👷 {t.tabWorkerProfile}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Visible to aquaculture farmers looking to hire
              </span>
            </div>
            <form onSubmit={handleSaveProfileSubmit} style={{ padding: 4 }}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={workerProfileForm.full_name}
                  onChange={e => setWorkerProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="e.g. V. Rambabu"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={workerProfileForm.phone}
                    onChange={e => setWorkerProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98480 00000"
                  />
                </div>
                <div className="form-group">
                  <label>Primary Role</label>
                  <select
                    value={workerProfileForm.primary_job_type}
                    onChange={e => setWorkerProfileForm(prev => ({ ...prev, primary_job_type: e.target.value }))}
                  >
                    {jobTypes.map(jt => (
                      <option key={jt.id} value={jt.id}>
                        {jt.icon} {jt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    required
                    value={workerProfileForm.state}
                    onChange={e => setWorkerProfileForm(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>District / Area</label>
                  <input
                    type="text"
                    required
                    value={workerProfileForm.district}
                    onChange={e => setWorkerProfileForm(prev => ({ ...prev, district: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={workerProfileForm.experience_years}
                    onChange={e => setWorkerProfileForm(prev => ({ ...prev, experience_years: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Availability</label>
                  <select
                    value={workerProfileForm.availability}
                    onChange={e => setWorkerProfileForm(prev => ({ ...prev, availability: e.target.value }))}
                  >
                    <option value="immediate">{t.availableImmediate}</option>
                    <option value="within_week">{t.availableWeek}</option>
                    <option value="part_time">Part Time</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expected Rate (₹)</label>
                  <input
                    type="number"
                    min="100"
                    value={workerProfileForm.expected_salary}
                    onChange={e => setWorkerProfileForm(prev => ({ ...prev, expected_salary: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Rate Type</label>
                  <select
                    value={workerProfileForm.salary_type}
                    onChange={e => setWorkerProfileForm(prev => ({ ...prev, salary_type: e.target.value }))}
                  >
                    <option value="daily">{t.daily}</option>
                    <option value="monthly">{t.monthly}</option>
                    <option value="hourly">{t.hourly}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Skills & Qualifications</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6, maxHeight: 160, overflowY: 'auto', padding: 8, background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)' }}>
                  {availableSkills.map((sk, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={workerProfileForm.skills?.includes(sk)}
                        onChange={() =>
                          toggleSkill(
                            workerProfileForm.skills || [],
                            updated => setWorkerProfileForm(prev => ({ ...prev, skills: updated })),
                            sk
                          )
                        }
                      />
                      {sk}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Bio / Experience Summary</label>
                <textarea
                  rows="3"
                  value={workerProfileForm.bio}
                  onChange={e => setWorkerProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Describe your pond experience, farms worked at, and specific techniques mastered..."
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                {t.saveProfile}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: POST A JOB ─────────────────────────────────────────────── */}
      {showPostModal && (
        <Modal title={t.postJobBtn} onClose={() => setShowPostModal(false)}>
          <form onSubmit={handlePostJobSubmit}>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Pond Technician for 6 Vannamei Ponds"
                value={postForm.title}
                onChange={e => setPostForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Job Role</label>
                <select
                  value={postForm.job_type}
                  onChange={e => setPostForm(prev => ({ ...prev, job_type: e.target.value }))}
                >
                  {jobTypes.map(jt => (
                    <option key={jt.id} value={jt.id}>
                      {jt.icon} {jt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Workers Needed</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={postForm.workers_needed}
                  onChange={e => setPostForm(prev => ({ ...prev, workers_needed: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Wage / Salary (₹)</label>
                <input
                  type="number"
                  min="100"
                  required
                  placeholder="e.g. 22000"
                  value={postForm.salary}
                  onChange={e => setPostForm(prev => ({ ...prev, salary: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Salary Frequency</label>
                <select
                  value={postForm.salary_type}
                  onChange={e => setPostForm(prev => ({ ...prev, salary_type: e.target.value }))}
                >
                  <option value="monthly">{t.monthly}</option>
                  <option value="daily">{t.daily}</option>
                  <option value="hourly">{t.hourly}</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  required
                  value={postForm.state}
                  onChange={e => setPostForm(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>District / Mandi Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. West Godavari"
                  value={postForm.district}
                  onChange={e => setPostForm(prev => ({ ...prev, district: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Farm Location / Address</label>
              <input
                type="text"
                required
                placeholder="e.g. Undi Road, Bhimavaram"
                value={postForm.location}
                onChange={e => setPostForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Working Hours</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6:00 AM - 6:00 PM (or Night Shift)"
                  value={postForm.working_hours}
                  onChange={e => setPostForm(prev => ({ ...prev, working_hours: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98480 12345"
                  value={postForm.contact_phone}
                  onChange={e => setPostForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description & Responsibilities</label>
              <textarea
                rows="3"
                required
                placeholder="Describe daily duties, check tray routines, water tests, accommodation details..."
                value={postForm.description}
                onChange={e => setPostForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Select Required Skills</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6, maxHeight: 130, overflowY: 'auto', padding: 8, background: '#f8fafc', borderRadius: 8, border: '1px solid var(--border)' }}>
                {availableSkills.map((sk, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={postForm.required_skills.includes(sk)}
                      onChange={() =>
                        toggleSkill(
                          postForm.required_skills,
                          updated => setPostForm(prev => ({ ...prev, required_skills: updated })),
                          sk
                        )
                      }
                    />
                    {sk}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPostModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Publish Job
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: APPLY FOR JOB ──────────────────────────────────────────── */}
      {applyModalJob && (
        <Modal
          title={`Apply for: ${applyModalJob.title}`}
          onClose={() => setApplyModalJob(null)}
        >
          <form onSubmit={handleApplySubmit}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Farm: <strong>{applyModalJob.farmer_name}</strong> • Location: <strong>{applyModalJob.location}</strong>
            </div>

            <div className="form-group">
              <label>Contact Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+91 98480 00000"
                value={applyPhone}
                onChange={e => setApplyPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Application Note / Pitch to Farmer</label>
              <textarea
                rows="3"
                placeholder="Mention your relevant pond experience, immediate availability, and current location..."
                value={applyNote}
                onChange={e => setApplyNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setApplyModalJob(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Application
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: RATE & REVIEW ──────────────────────────────────────────── */}
      {reviewModalTarget && (
        <Modal
          title={`Rate & Review: ${reviewModalTarget.revieweeName}`}
          onClose={() => setReviewModalTarget(null)}
        >
          <form onSubmit={handleReviewSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Star Rating
              </label>
              <div className="star-rating-input">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{ color: star <= reviewRating ? '#f59e0b' : '#cbd5e1' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Review & Feedback</label>
              <textarea
                rows="3"
                required
                placeholder="Share your experience working with this technician/employer (punctuality, test accuracy, payment honesty)..."
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setReviewModalTarget(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Rating
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: REPORT USER/JOB ────────────────────────────────────────── */}
      {reportTarget && (
        <Modal title="Report Listing" onClose={() => setReportTarget(null)}>
          <form onSubmit={handleReportSubmit}>
            <div className="form-group">
              <label>Reason for reporting</label>
              <textarea
                rows="3"
                required
                placeholder="Explain why this listing violates terms (spam, misleading rates, abusive behavior)..."
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setReportTarget(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ background: 'var(--danger)' }}>
                Submit Report
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
