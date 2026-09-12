-- ============================================================
-- AquaMitra — Phase 3: Aquaculture Machinery & Equipment Marketplace Schema
-- ============================================================

-- 1. EQUIPMENT CATEGORIES TAXONOMY
CREATE TABLE IF NOT EXISTS public.equipment_categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  telugu_name TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT '⚙️',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. EQUIPMENT LISTINGS TABLE (OLX-style Classifieds)
CREATE TABLE IF NOT EXISTS public.equipment_listings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id         UUID NOT NULL, -- references profiles(id)
  seller_name       TEXT NOT NULL,
  title             TEXT NOT NULL,
  category          TEXT NOT NULL, -- references equipment_categories(id)
  condition         TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
  price             NUMERIC(12, 2) NOT NULL,
  is_negotiable     BOOLEAN NOT NULL DEFAULT false,
  description       TEXT NOT NULL,
  location          TEXT NOT NULL,
  state             TEXT NOT NULL,
  district          TEXT NOT NULL,
  contact_phone     TEXT NOT NULL,
  contact_whatsapp  TEXT,
  images            TEXT[] DEFAULT '{}',
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'reserved')),
  views_count       INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. EQUIPMENT FAVORITES / WISHLIST TABLE
CREATE TABLE IF NOT EXISTS public.equipment_favorites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL,
  listing_id  UUID NOT NULL REFERENCES public.equipment_listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- 4. SELLER REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.equipment_reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID REFERENCES public.equipment_listings(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL,
  seller_id   UUID NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. LISTING REPORTS / FRAUD PROTECTION TABLE
CREATE TABLE IF NOT EXISTS public.equipment_reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL,
  listing_id  UUID NOT NULL REFERENCES public.equipment_listings(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_equipment_category_status
  ON public.equipment_listings (category, status);

CREATE INDEX IF NOT EXISTS idx_equipment_location
  ON public.equipment_listings (state, district);

CREATE INDEX IF NOT EXISTS idx_equipment_price
  ON public.equipment_listings (price);

CREATE INDEX IF NOT EXISTS idx_equipment_seller
  ON public.equipment_listings (seller_id);

CREATE INDEX IF NOT EXISTS idx_equipment_favorites_user
  ON public.equipment_favorites (user_id);
