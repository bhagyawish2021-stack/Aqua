-- ============================================================
-- AquaMitra — Phase 7: Aquaculture Expert Consultation Schema
-- ============================================================

-- 1. AQUACULTURE EXPERTS TABLE
CREATE TABLE IF NOT EXISTS public.aquaculture_experts (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                         UUID NOT NULL, -- references profiles(id)
  name                            TEXT NOT NULL,
  title                           TEXT NOT NULL, -- e.g. 'Senior Shrimp Pathologist & CIBA Consultant'
  profile_photo                   TEXT NOT NULL,
  specialization                  TEXT NOT NULL CHECK (specialization IN ('shrimp_pathology', 'water_soil_chemistry', 'fish_nutrition', 'hatchery_biosecurity', 'general_aquaculture')),
  specialization_label            TEXT NOT NULL,
  qualification                   TEXT NOT NULL, -- e.g. 'M.F.Sc, Ph.D (Fish Pathology)'
  experience_years                INTEGER NOT NULL DEFAULT 5,
  institution                     TEXT NOT NULL, -- e.g. 'State Fishery Research / ICAR-CIBA Alum'
  location                        TEXT NOT NULL,
  district                        TEXT NOT NULL,
  state                           TEXT NOT NULL,
  languages                       TEXT[] DEFAULT '{"Telugu", "English"}',
  consultation_fee                NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  rating                          NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  reviews_count                   INTEGER NOT NULL DEFAULT 0,
  availability_status             TEXT NOT NULL DEFAULT 'available_today' CHECK (availability_status IN ('available_today', 'busy', 'next_available')),
  available_days                  TEXT[] DEFAULT '{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"}',
  available_slots                 TEXT[] DEFAULT '{"09:00 AM - 11:00 AM", "02:00 PM - 05:00 PM", "06:00 PM - 08:00 PM"}',
  supported_types                 TEXT[] DEFAULT '{"chat", "voice", "video", "appointment"}',
  is_verified                     BOOLEAN NOT NULL DEFAULT false,
  verification_status             TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by                     TEXT,
  verified_at                     TIMESTAMPTZ,
  bio                             TEXT,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aquaculture_experts_specialization ON public.aquaculture_experts(specialization);
CREATE INDEX IF NOT EXISTS idx_aquaculture_experts_district ON public.aquaculture_experts(district);
CREATE INDEX IF NOT EXISTS idx_aquaculture_experts_verified ON public.aquaculture_experts(is_verified, verification_status);

-- 2. CONSULTATION APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.consultation_appointments (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_number              TEXT NOT NULL UNIQUE,
  farmer_id                       UUID NOT NULL, -- references profiles(id)
  farmer_name                     TEXT NOT NULL,
  farmer_phone                    TEXT NOT NULL,
  farmer_location                 TEXT NOT NULL,
  expert_id                       UUID NOT NULL REFERENCES public.aquaculture_experts(id) ON DELETE CASCADE,
  expert_name                     TEXT NOT NULL,
  consultation_type               TEXT NOT NULL CHECK (consultation_type IN ('chat', 'voice', 'video', 'appointment')),
  scheduled_date                  DATE NOT NULL,
  scheduled_time_slot             TEXT NOT NULL,
  pond_id                         TEXT,
  pond_name                       TEXT,
  problem_description             TEXT NOT NULL,
  specimen_images                 TEXT[] DEFAULT '{}',
  disease_report_summary          TEXT,
  disease_analysis_id             TEXT,
  water_parameters                JSONB DEFAULT '{}'::jsonb,
  consultation_fee                NUMERIC(10, 2) NOT NULL,
  status                          TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  expert_recommendations          TEXT,
  prescribed_actions              TEXT[] DEFAULT '{}',
  follow_up_date                  DATE,
  rejection_reason                TEXT,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_appointments_farmer ON public.consultation_appointments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_consultation_appointments_expert ON public.consultation_appointments(expert_id);
CREATE INDEX IF NOT EXISTS idx_consultation_appointments_status ON public.consultation_appointments(status);

-- 3. EXPERT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.expert_reviews (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id                       UUID NOT NULL REFERENCES public.aquaculture_experts(id) ON DELETE CASCADE,
  appointment_id                  UUID REFERENCES public.consultation_appointments(id) ON DELETE SET NULL,
  farmer_id                       UUID NOT NULL,
  farmer_name                     TEXT NOT NULL,
  rating                          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text                     TEXT,
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expert_reviews_expert ON public.expert_reviews(expert_id);
