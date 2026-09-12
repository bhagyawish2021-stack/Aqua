-- ============================================================
-- AquaMitra — Phase 6: Disease Prevention & Pond Health Monitoring Schema
-- ============================================================

-- 1. POND HEALTH ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.pond_health_assessments (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id                       UUID NOT NULL, -- references profiles(id)
  pond_id                         TEXT NOT NULL,
  pond_name                       TEXT NOT NULL,
  species                         TEXT NOT NULL,
  doc_days                        INTEGER NOT NULL,
  stocking_density                NUMERIC(8, 2) NOT NULL,
  water_parameters                JSONB NOT NULL DEFAULT '{}'::jsonb, -- { ph, temperature, dissolved_oxygen, salinity, ammonia, nitrite }
  feeding_pattern                 TEXT NOT NULL,
  weather_condition               TEXT NOT NULL,
  previous_disease_history        TEXT NOT NULL,
  health_score                    INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  risk_score                      INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level                      TEXT NOT NULL CHECK (risk_level IN ('Low', 'Moderate', 'High', 'Critical')),
  water_warnings                  JSONB[] DEFAULT '{}',
  biosecurity_recommendations     TEXT[] DEFAULT '{}',
  feeding_recommendations         TEXT[] DEFAULT '{}',
  pond_prep_guidance              TEXT[] DEFAULT '{}',
  early_warning_signs             TEXT[] DEFAULT '{}',
  prevention_tips                 TEXT[] DEFAULT '{}',
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pond_health_assessments_farmer ON public.pond_health_assessments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_pond_health_assessments_pond ON public.pond_health_assessments(pond_id);
CREATE INDEX IF NOT EXISTS idx_pond_health_assessments_created ON public.pond_health_assessments(created_at DESC);

-- 2. PREVENTIVE HEALTH TASKS TABLE (Daily & Weekly Checklists)
CREATE TABLE IF NOT EXISTS public.pond_health_tasks (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id                       UUID NOT NULL,
  pond_id                         TEXT NOT NULL,
  task_type                       TEXT NOT NULL CHECK (task_type IN ('daily', 'weekly')),
  task_key                        TEXT NOT NULL,
  title                           TEXT NOT NULL,
  telugu_title                    TEXT NOT NULL,
  description                     TEXT NOT NULL,
  is_completed                    BOOLEAN NOT NULL DEFAULT false,
  completed_at                    TIMESTAMPTZ,
  due_date                        DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_pond_health_tasks_pond ON public.pond_health_tasks(pond_id, task_type);
CREATE INDEX IF NOT EXISTS idx_pond_health_tasks_completed ON public.pond_health_tasks(is_completed);

-- 3. POND HEALTH NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.pond_health_notifications (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id                       UUID NOT NULL,
  pond_id                         TEXT NOT NULL,
  pond_name                       TEXT NOT NULL,
  notification_type               TEXT NOT NULL CHECK (notification_type IN ('health_score_drop', 'water_warning', 'biosecurity_alert')),
  severity                        TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'danger', 'critical')),
  title                           TEXT NOT NULL,
  message                         TEXT NOT NULL,
  is_read                         BOOLEAN NOT NULL DEFAULT false,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pond_health_notifications_farmer ON public.pond_health_notifications(farmer_id);
