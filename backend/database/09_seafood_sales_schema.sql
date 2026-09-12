-- ============================================================
-- AquaMitra — Phase 9: Direct Seafood Sales & Buyer Marketplace Schema
-- ============================================================

-- 1. SEAFOOD LISTINGS TABLE (Farmer harvests for sale)
CREATE TABLE IF NOT EXISTS public.seafood_listings (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id               UUID NOT NULL, -- references profiles(id)
  farmer_name             TEXT NOT NULL,
  farmer_phone            TEXT NOT NULL,
  farmer_whatsapp         TEXT,
  pond_name               TEXT,
  species                 TEXT NOT NULL, -- 'vannamei_shrimp', 'tiger_prawn', 'asian_seabass', 'tilapia', 'rohu_catla', 'mud_crab', 'freshwater_scampi'
  species_label           TEXT NOT NULL,
  quantity_kg             NUMERIC(10, 2) NOT NULL,
  min_order_quantity_kg   NUMERIC(10, 2) NOT NULL DEFAULT 500,
  size_grade              TEXT NOT NULL, -- e.g. '30 Count (33g/pc)', '40 Count (25g/pc)', '500-800g/pc'
  count_per_kg            INTEGER,
  quality_info            TEXT[] DEFAULT '{}', -- e.g. 'Antibiotic-Free Certified', 'Pre-harvest Water Tested', 'Harvested with Slush Ice'
  harvest_date            DATE NOT NULL,
  availability_date       DATE NOT NULL,
  is_immediate_harvest    BOOLEAN NOT NULL DEFAULT false,
  expected_price_per_kg   NUMERIC(10, 2) NOT NULL,
  location_name           TEXT NOT NULL,
  district                TEXT NOT NULL,
  state                   TEXT NOT NULL DEFAULT 'Andhra Pradesh',
  latitude                NUMERIC(10, 6) NOT NULL,
  longitude               NUMERIC(10, 6) NOT NULL,
  images                  TEXT[] DEFAULT '{}',
  description             TEXT NOT NULL,
  status                  TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'negotiating', 'sold', 'closed')),
  farmer_rating           NUMERIC(3, 2) NOT NULL DEFAULT 4.90,
  reviews_count           INTEGER NOT NULL DEFAULT 0,
  is_verified             BOOLEAN NOT NULL DEFAULT true,
  verification_badge      TEXT DEFAULT 'CAA Registered Farm',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seafood_listings_species ON public.seafood_listings(species);
CREATE INDEX IF NOT EXISTS idx_seafood_listings_district ON public.seafood_listings(district);
CREATE INDEX IF NOT EXISTS idx_seafood_listings_status ON public.seafood_listings(status);

-- 2. SEAFOOD INQUIRIES & NEGOTIATION OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.seafood_offers (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id                  UUID NOT NULL REFERENCES public.seafood_listings(id) ON DELETE CASCADE,
  farmer_id                   UUID NOT NULL,
  farmer_name                 TEXT NOT NULL,
  buyer_id                    UUID NOT NULL,
  buyer_name                  TEXT NOT NULL,
  buyer_company               TEXT NOT NULL,
  buyer_type                  TEXT NOT NULL CHECK (buyer_type IN ('exporter', 'processor', 'wholesaler', 'retailer', 'restaurant', 'local_buyer')),
  buyer_phone                 TEXT NOT NULL,
  buyer_location              TEXT NOT NULL,
  buyer_district              TEXT NOT NULL,
  buyer_verified              BOOLEAN NOT NULL DEFAULT true,
  buyer_verification_badge    TEXT DEFAULT 'MPEDA Licensed Exporter',
  initial_asking_price        NUMERIC(10, 2) NOT NULL,
  offered_price_per_kg        NUMERIC(10, 2) NOT NULL,
  requested_quantity_kg       NUMERIC(10, 2) NOT NULL,
  proposed_harvest_date       DATE NOT NULL,
  pickup_terms                TEXT NOT NULL DEFAULT 'Farmgate / Pond-side Reefer Truck Pickup',
  payment_terms               TEXT NOT NULL DEFAULT 'Direct Bank Transfer upon Pond-side Weighment',
  status                      TEXT NOT NULL DEFAULT 'offer' CHECK (status IN ('inquiry', 'offer', 'negotiation', 'accepted', 'processing', 'completed', 'rejected', 'cancelled')),
  negotiation_history         JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of { sender: 'buyer'|'farmer', price_per_kg, quantity_kg, message, created_at }
  final_agreed_price_per_kg   NUMERIC(10, 2),
  final_agreed_quantity_kg    NUMERIC(10, 2),
  final_total_value           NUMERIC(12, 2),
  actual_weighed_quantity_kg  NUMERIC(10, 2),
  rejection_reason            TEXT,
  cancellation_reason         TEXT,
  dispatch_notes              TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seafood_offers_listing ON public.seafood_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_seafood_offers_buyer ON public.seafood_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_seafood_offers_farmer ON public.seafood_offers(farmer_id);
CREATE INDEX IF NOT EXISTS idx_seafood_offers_status ON public.seafood_offers(status);

-- 3. B2B SEAFOOD TRADE REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.seafood_trade_reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id        UUID NOT NULL REFERENCES public.seafood_offers(id) ON DELETE CASCADE,
  listing_id      UUID NOT NULL REFERENCES public.seafood_listings(id) ON DELETE CASCADE,
  reviewer_id     UUID NOT NULL,
  reviewer_role   TEXT NOT NULL CHECK (reviewer_role IN ('buyer', 'farmer')),
  reviewer_name   TEXT NOT NULL,
  reviewee_id     UUID NOT NULL,
  rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text     TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seafood_trade_reviews_offer ON public.seafood_trade_reviews(offer_id);
