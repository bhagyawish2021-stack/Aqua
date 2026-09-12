-- ============================================================
-- AquaMitra — Phase 4: Hatchery Discovery & Aquaculture Seed Marketplace Schema
-- ============================================================

-- 1. HATCHERIES TABLE
CREATE TABLE IF NOT EXISTS public.hatcheries (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id              UUID NOT NULL, -- references profiles(id)
  name                  TEXT NOT NULL,
  registration_number   TEXT,
  caa_license_number    TEXT, -- Coastal Aquaculture Authority license
  contact_person        TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  whatsapp              TEXT,
  email                 TEXT,
  website               TEXT,
  address               TEXT NOT NULL,
  location_name         TEXT NOT NULL,
  district              TEXT NOT NULL,
  state                 TEXT NOT NULL,
  latitude              NUMERIC(10, 6) NOT NULL,
  longitude             NUMERIC(10, 6) NOT NULL,
  experience_years      INTEGER NOT NULL DEFAULT 1,
  bio                   TEXT,
  certifications        TEXT[] DEFAULT '{}', -- e.g. 'CAA Approved', 'SPF Broodstock', 'MPEDA Registered', 'ISO 9001'
  quality_standards     TEXT[] DEFAULT '{}', -- e.g. '100% PCR Negative', 'SIS Broodstock', 'Salinity Acclimatized'
  is_verified           BOOLEAN NOT NULL DEFAULT false, -- Strict admin verification
  verification_status   TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by           UUID, -- references profiles(id)
  verified_at           TIMESTAMPTZ,
  rating                NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  reviews_count         INTEGER NOT NULL DEFAULT 0,
  images                TEXT[] DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on spatial coords and district
CREATE INDEX IF NOT EXISTS idx_hatcheries_district ON public.hatcheries(district);
CREATE INDEX IF NOT EXISTS idx_hatcheries_verification ON public.hatcheries(verification_status, is_verified);

-- 2. HATCHERY PRODUCTS / SEED INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.hatchery_products (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hatchery_id             UUID NOT NULL REFERENCES public.hatcheries(id) ON DELETE CASCADE,
  species_category        TEXT NOT NULL CHECK (species_category IN ('vannamei_shrimp', 'tiger_prawn', 'fish', 'crab', 'other')),
  species_name            TEXT NOT NULL,
  variety                 TEXT NOT NULL,
  stage                   TEXT NOT NULL, -- e.g. 'PL-8', 'PL-10', 'PL-12', 'Fry', 'Fingerling', 'Crablet'
  price_per_unit          NUMERIC(10, 2) NOT NULL,
  unit_label              TEXT NOT NULL DEFAULT 'per 1,000 seeds', -- 'per 1,000 seeds', 'per Lakh', 'per piece'
  min_order_quantity      INTEGER NOT NULL DEFAULT 10000,
  stock_status            TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'limited', 'pre_order_only', 'out_of_stock')),
  current_stock_quantity  INTEGER NOT NULL DEFAULT 0,
  survival_guarantee_rate NUMERIC(5, 2) DEFAULT 95.00, -- e.g. 98.00%
  salinity_tolerance      TEXT DEFAULT '10-35 ppt',
  pcr_tested              BOOLEAN NOT NULL DEFAULT true,
  broodstock_origin       TEXT, -- e.g. 'SIS Hawaii SPF', 'RGCA', 'Local Broodstock'
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hatchery_products_category ON public.hatchery_products(species_category);
CREATE INDEX IF NOT EXISTS idx_hatchery_products_hatchery ON public.hatchery_products(hatchery_id);

-- 3. SEED ORDERS / REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.seed_orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number          TEXT NOT NULL UNIQUE,
  farmer_id             UUID NOT NULL, -- references profiles(id)
  farmer_name           TEXT NOT NULL,
  farmer_phone          TEXT NOT NULL,
  hatchery_id           UUID NOT NULL REFERENCES public.hatcheries(id) ON DELETE CASCADE,
  product_id            UUID NOT NULL REFERENCES public.hatchery_products(id) ON DELETE CASCADE,
  species_name          TEXT NOT NULL,
  stage                 TEXT NOT NULL,
  quantity              INTEGER NOT NULL,
  unit_label            TEXT NOT NULL,
  unit_price            NUMERIC(10, 2) NOT NULL,
  total_amount          NUMERIC(12, 2) NOT NULL,
  required_date         DATE NOT NULL,
  delivery_location     TEXT NOT NULL,
  pond_salinity_ppt     NUMERIC(5, 2),
  notes                 TEXT,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'dispatched', 'completed', 'cancelled')),
  rejection_reason      TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seed_orders_farmer ON public.seed_orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_seed_orders_hatchery ON public.seed_orders(hatchery_id);

-- 4. HATCHERY REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.hatchery_reviews (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hatchery_id           UUID NOT NULL REFERENCES public.hatcheries(id) ON DELETE CASCADE,
  farmer_id             UUID NOT NULL, -- references profiles(id)
  farmer_name           TEXT NOT NULL,
  farmer_location       TEXT,
  rating                INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  seed_survival_rate    NUMERIC(5, 2), -- e.g. 96.5%
  review_text           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hatchery_reviews_hatchery ON public.hatchery_reviews(hatchery_id);
