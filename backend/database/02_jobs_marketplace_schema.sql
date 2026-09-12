-- ============================================================
-- AquaMitra — Phase 2: Aquaculture Jobs and Workers Marketplace Schema
-- ============================================================

-- 1. SKILLS TAXONOMY
CREATE TABLE IF NOT EXISTS public.job_skills (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  telugu_name TEXT,
  category    TEXT DEFAULT 'general',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id         UUID NOT NULL, -- references auth.users(id) or profiles(id)
  title             TEXT NOT NULL,
  job_type          TEXT NOT NULL CHECK (job_type IN (
    'pond_technician',
    'water_quality_technician',
    'feeding_worker',
    'morning_worker',
    'night_worker',
    'pond_maintenance_worker',
    'harvesting_worker',
    'machinery_operator',
    'general_farm_worker',
    'security_worker'
  )),
  description       TEXT NOT NULL,
  required_skills   TEXT[] DEFAULT '{}',
  location          TEXT NOT NULL,
  state             TEXT NOT NULL,
  district          TEXT NOT NULL,
  salary            NUMERIC(10, 2) NOT NULL,
  salary_type       TEXT NOT NULL CHECK (salary_type IN ('hourly', 'daily', 'monthly')),
  working_hours     TEXT NOT NULL, -- e.g. '6:00 AM - 2:00 PM' or 'Night Shift'
  start_date        DATE NOT NULL,
  workers_needed    INTEGER NOT NULL DEFAULT 1,
  contact_phone     TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. WORKER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE, -- 1-to-1 with profile/user
  full_name         TEXT NOT NULL,
  phone             TEXT NOT NULL,
  state             TEXT NOT NULL,
  district          TEXT NOT NULL,
  primary_job_type  TEXT NOT NULL,
  skills            TEXT[] DEFAULT '{}',
  experience_years  INTEGER NOT NULL DEFAULT 0,
  availability      TEXT NOT NULL DEFAULT 'immediate' CHECK (availability IN ('immediate', 'within_week', 'part_time', 'unavailable')),
  expected_salary   NUMERIC(10, 2),
  salary_type       TEXT NOT NULL DEFAULT 'daily' CHECK (salary_type IN ('hourly', 'daily', 'monthly')),
  preferred_hours   TEXT, -- e.g. 'Morning / Day shift'
  bio               TEXT,
  is_verified       BOOLEAN NOT NULL DEFAULT false,
  rating            NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  reviews_count     INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id            UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id         UUID NOT NULL, -- references worker_profiles(user_id)
  note              TEXT,
  contact_phone     TEXT,
  status            TEXT NOT NULL DEFAULT 'applied' CHECK (status IN (
    'applied',
    'shortlisted',
    'accepted',
    'rejected',
    'completed'
  )),
  applied_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, worker_id)
);

-- 5. REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id            UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  reviewer_id       UUID NOT NULL,
  reviewee_id       UUID NOT NULL,
  target_type       TEXT NOT NULL CHECK (target_type IN ('worker', 'employer')),
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. USER/JOB REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.user_reports (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id       UUID NOT NULL,
  reported_type     TEXT NOT NULL CHECK (reported_type IN ('job', 'worker', 'farmer')),
  target_id         TEXT NOT NULL,
  reason            TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_jobs_location_status
  ON public.jobs (state, district, status);

CREATE INDEX IF NOT EXISTS idx_jobs_farmer
  ON public.jobs (farmer_id);

CREATE INDEX IF NOT EXISTS idx_worker_profiles_type_loc
  ON public.worker_profiles (primary_job_type, state, district);

CREATE INDEX IF NOT EXISTS idx_job_applications_job
  ON public.job_applications (job_id, status);

CREATE INDEX IF NOT EXISTS idx_job_applications_worker
  ON public.job_applications (worker_id, status);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee
  ON public.marketplace_reviews (reviewee_id, target_type);
