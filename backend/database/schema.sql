-- ============================================================
-- AquaMitra — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor to set up the database.
-- ============================================================

-- ─── Enable UUID extension ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- One profile per authenticated user (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  village     TEXT,
  district    TEXT,
  language    TEXT NOT NULL DEFAULT 'en',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: ponds
-- A farmer can own multiple ponds
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ponds (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  size_acres       NUMERIC(10, 2),
  species          TEXT NOT NULL,   -- e.g., 'Vannamei', 'Tiger Shrimp'
  stocking_date    DATE,
  stocking_density INTEGER,         -- prawns per square meter
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'idle')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: water_quality
-- Water quality readings per pond
-- ============================================================
CREATE TABLE IF NOT EXISTS public.water_quality (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pond_id            UUID NOT NULL REFERENCES public.ponds(id) ON DELETE CASCADE,
  temperature        NUMERIC(5, 2),   -- Celsius
  ph                 NUMERIC(4, 2),
  dissolved_oxygen   NUMERIC(5, 2),   -- mg/L
  salinity           NUMERIC(5, 2),   -- ppt
  ammonia            NUMERIC(6, 4),   -- mg/L
  alkalinity         NUMERIC(6, 2),   -- mg/L as CaCO3
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: feed_records
-- Daily feed log per pond
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feed_records (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pond_id      UUID NOT NULL REFERENCES public.ponds(id) ON DELETE CASCADE,
  feed_type    TEXT NOT NULL,
  quantity_kg  NUMERIC(8, 2) NOT NULL,
  cost         NUMERIC(10, 2),
  recorded_at  DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ============================================================
-- TABLE: growth_records
-- Periodic growth sampling per pond
-- ============================================================
CREATE TABLE IF NOT EXISTS public.growth_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pond_id        UUID NOT NULL REFERENCES public.ponds(id) ON DELETE CASCADE,
  abw_grams      NUMERIC(8, 3),     -- Average Body Weight in grams
  survival_pct   NUMERIC(5, 2),     -- Survival percentage (0–100)
  biomass_kg     NUMERIC(10, 2),    -- Total estimated biomass
  recorded_at    DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ============================================================
-- TABLE: business_records
-- Financial records per pond (expenses + revenue)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.business_records (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pond_id           UUID NOT NULL REFERENCES public.ponds(id) ON DELETE CASCADE,
  feed_expense      NUMERIC(12, 2) DEFAULT 0,
  labor_expense     NUMERIC(12, 2) DEFAULT 0,
  medicine_expense  NUMERIC(12, 2) DEFAULT 0,
  other_expense     NUMERIC(12, 2) DEFAULT 0,
  harvest_revenue   NUMERIC(12, 2) DEFAULT 0,
  -- Computed: revenue - (feed + labor + medicine + other)
  profit            NUMERIC(12, 2) GENERATED ALWAYS AS (
    harvest_revenue - (feed_expense + labor_expense + medicine_expense + other_expense)
  ) STORED,
  recorded_at       DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically keeps updated_at current on any row update
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_ponds_updated_at
  BEFORE UPDATE ON public.ponds
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Farmers can only access their own data
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmer can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Farmer can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Farmer can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ponds
ALTER TABLE public.ponds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmer can manage own ponds" ON public.ponds
  USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

-- water_quality (access via pond ownership)
ALTER TABLE public.water_quality ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmer can manage own water quality" ON public.water_quality
  USING (pond_id IN (SELECT id FROM public.ponds WHERE farmer_id = auth.uid()))
  WITH CHECK (pond_id IN (SELECT id FROM public.ponds WHERE farmer_id = auth.uid()));

-- feed_records
ALTER TABLE public.feed_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmer can manage own feed records" ON public.feed_records
  USING (pond_id IN (SELECT id FROM public.ponds WHERE farmer_id = auth.uid()))
  WITH CHECK (pond_id IN (SELECT id FROM public.ponds WHERE farmer_id = auth.uid()));

-- growth_records
ALTER TABLE public.growth_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmer can manage own growth records" ON public.growth_records
  USING (pond_id IN (SELECT id FROM public.ponds WHERE farmer_id = auth.uid()))
  WITH CHECK (pond_id IN (SELECT id FROM public.ponds WHERE farmer_id = auth.uid()));

-- business_records
ALTER TABLE public.business_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Farmer can manage own business records" ON public.business_records
  USING (pond_id IN (SELECT id FROM public.ponds WHERE farmer_id = auth.uid()))
  WITH CHECK (pond_id IN (SELECT id FROM public.ponds WHERE farmer_id = auth.uid()));

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- When a user signs up via Supabase Auth, create their profile row
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Farmer'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE: ml_predictions
-- Stores historical ML risk prediction results per pond.
-- Allows farmers and the system to review past prediction trends.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ml_predictions (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pond_id            UUID NOT NULL REFERENCES public.ponds(id) ON DELETE CASCADE,

  -- Water quality snapshot used as model input at prediction time
  temperature        NUMERIC(5, 2),   -- Celsius
  ph                 NUMERIC(4, 2),
  dissolved_oxygen   NUMERIC(5, 2),   -- mg/L
  salinity           NUMERIC(5, 2),   -- ppt
  ammonia            NUMERIC(6, 4),   -- mg/L

  -- Model output
  predicted_risk     TEXT NOT NULL CHECK (predicted_risk IN ('LOW RISK', 'MODERATE RISK', 'HIGH RISK')),
  confidence         NUMERIC(5, 4),   -- e.g. 0.9123  (0.0000 to 1.0000)

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── RLS: ml_predictions ─────────────────────────────────────────────────────
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;

-- Farmers can only read predictions for their own ponds
CREATE POLICY "Farmer can view own ml predictions" ON public.ml_predictions
  FOR SELECT
  USING (pond_id IN (SELECT id FROM public.ponds WHERE farmer_id = auth.uid()));

-- Backend inserts predictions on behalf of the farmer (admin client bypasses RLS,
-- but this policy covers any direct DB inserts)
CREATE POLICY "Farmer can insert own ml predictions" ON public.ml_predictions
  FOR INSERT
  WITH CHECK (pond_id IN (SELECT id FROM public.ponds WHERE farmer_id = auth.uid()));

-- Farmers can delete their own prediction history
CREATE POLICY "Farmer can delete own ml predictions" ON public.ml_predictions
  FOR DELETE
  USING (pond_id IN (SELECT id FROM public.ponds WHERE farmer_id = auth.uid()));

-- ============================================================
-- PERFORMANCE INDEXES
-- Speeds up the most common query patterns:
--   • Listing records for a pond ordered by date (all dashboards)
--   • Subquery joins in RLS policies (pond ownership checks)
-- ============================================================

-- ponds: fast lookup by farmer (used in every RLS subquery)
CREATE INDEX IF NOT EXISTS idx_ponds_farmer_id
  ON public.ponds (farmer_id);

-- water_quality: most common read is "all readings for pond X, newest first"
CREATE INDEX IF NOT EXISTS idx_water_quality_pond_recorded
  ON public.water_quality (pond_id, recorded_at DESC);

-- feed_records
CREATE INDEX IF NOT EXISTS idx_feed_records_pond_recorded
  ON public.feed_records (pond_id, recorded_at DESC);

-- growth_records
CREATE INDEX IF NOT EXISTS idx_growth_records_pond_recorded
  ON public.growth_records (pond_id, recorded_at DESC);

-- business_records
CREATE INDEX IF NOT EXISTS idx_business_records_pond_recorded
  ON public.business_records (pond_id, recorded_at DESC);

-- ml_predictions: latest prediction per pond is the most frequent read
CREATE INDEX IF NOT EXISTS idx_ml_predictions_pond_created
  ON public.ml_predictions (pond_id, created_at DESC);

