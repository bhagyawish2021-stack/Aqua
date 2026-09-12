-- ============================================================
-- AquaMitra — Phase 5: AI-Powered Disease Detection & Monitoring Schema
-- ============================================================

-- 1. DISEASE DETECTION & SCREENING LOGS
CREATE TABLE IF NOT EXISTS public.disease_analyses (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id                       UUID NOT NULL, -- references profiles(id)
  pond_id                         TEXT NOT NULL,
  pond_name                       TEXT NOT NULL,
  species                         TEXT NOT NULL, -- 'vannamei_shrimp', 'tiger_prawn', 'tilapia', 'carp', 'seabass', 'mud_crab', 'other'
  image_url                       TEXT NOT NULL,
  symptoms                        TEXT[] DEFAULT '{}',
  water_parameters                JSONB NOT NULL DEFAULT '{}'::jsonb, -- { ph, temperature, dissolved_oxygen, salinity, ammonia, nitrite, turbidity }
  farmer_notes                    TEXT,
  ai_result                       JSONB NOT NULL DEFAULT '{}'::jsonb, -- detailed screening result
  risk_level                      TEXT NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
  confidence                      NUMERIC(5, 2) NOT NULL,
  expert_status                   TEXT NOT NULL DEFAULT 'none' CHECK (expert_status IN ('none', 'requested', 'in_review', 'completed')),
  expert_notes                    TEXT,
  disclaimer                      TEXT NOT NULL,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disease_analyses_farmer ON public.disease_analyses(farmer_id);
CREATE INDEX IF NOT EXISTS idx_disease_analyses_pond ON public.disease_analyses(pond_id);
CREATE INDEX IF NOT EXISTS idx_disease_analyses_created ON public.disease_analyses(created_at DESC);

-- 2. DISEASE & WATER QUALITY ALERTS
CREATE TABLE IF NOT EXISTS public.disease_alerts (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id                       UUID NOT NULL,
  pond_id                         TEXT NOT NULL,
  pond_name                       TEXT NOT NULL,
  analysis_id                     UUID REFERENCES public.disease_analyses(id) ON DELETE CASCADE,
  alert_type                      TEXT NOT NULL CHECK (alert_type IN ('high_risk_disease', 'repeated_abnormality', 'abnormal_water_parameters')),
  severity                        TEXT NOT NULL CHECK (severity IN ('warning', 'danger', 'critical')),
  title                           TEXT NOT NULL,
  message                         TEXT NOT NULL,
  is_read                         BOOLEAN NOT NULL DEFAULT false,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disease_alerts_farmer ON public.disease_alerts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_disease_alerts_pond ON public.disease_alerts(pond_id);
CREATE INDEX IF NOT EXISTS idx_disease_alerts_read ON public.disease_alerts(is_read);
