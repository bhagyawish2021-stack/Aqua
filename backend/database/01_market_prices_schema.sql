-- ============================================================
-- AquaMitra — Phase 1: Live Seafood Market Prices Schema
-- ============================================================

-- 1. SEAFOOD SPECIES TAXONOMY
CREATE TABLE IF NOT EXISTS public.seafood_species (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category        TEXT NOT NULL CHECK (category IN ('shrimp', 'fish', 'crab', 'other')),
  name            TEXT NOT NULL,
  scientific_name TEXT,
  telugu_name     TEXT,
  image_icon      TEXT NOT NULL DEFAULT '🦐',
  default_unit    TEXT NOT NULL DEFAULT '₹/kg',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. MARKET LOCATIONS (MANDIS & HUBS)
CREATE TABLE IF NOT EXISTS public.market_locations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state           TEXT NOT NULL,
  district        TEXT NOT NULL,
  market_name     TEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (state, district, market_name)
);

-- 3. LIVE MARKET PRICES
CREATE TABLE IF NOT EXISTS public.market_prices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species_id      UUID NOT NULL REFERENCES public.seafood_species(id) ON DELETE CASCADE,
  location_id     UUID NOT NULL REFERENCES public.market_locations(id) ON DELETE CASCADE,
  variety         TEXT NOT NULL, -- e.g. 'Count 30', 'Count 40', 'Grade A (>500g)'
  current_price   NUMERIC(10, 2) NOT NULL,
  previous_price  NUMERIC(10, 2),
  change_amount   NUMERIC(10, 2) GENERATED ALWAYS AS (current_price - COALESCE(previous_price, current_price)) STORED,
  change_pct      NUMERIC(6, 2) GENERATED ALWAYS AS (
    CASE WHEN previous_price IS NOT NULL AND previous_price > 0
         THEN ROUND(((current_price - previous_price) / previous_price * 100.0), 2)
         ELSE 0.0 END
  ) STORED,
  trend           TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  updated_by      TEXT DEFAULT 'admin',
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (species_id, location_id, variety)
);

-- 4. HISTORICAL PRICE TIME-SERIES
CREATE TABLE IF NOT EXISTS public.price_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_price_id UUID REFERENCES public.market_prices(id) ON DELETE CASCADE,
  species_id      UUID NOT NULL REFERENCES public.seafood_species(id) ON DELETE CASCADE,
  location_id     UUID NOT NULL REFERENCES public.market_locations(id) ON DELETE CASCADE,
  variety         TEXT NOT NULL,
  price           NUMERIC(10, 2) NOT NULL,
  recorded_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FARMER PRICE ALERTS
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL,
  species_id      UUID NOT NULL REFERENCES public.seafood_species(id) ON DELETE CASCADE,
  location_id     UUID NOT NULL REFERENCES public.market_locations(id) ON DELETE CASCADE,
  variety         TEXT NOT NULL,
  target_price    NUMERIC(10, 2) NOT NULL,
  alert_condition TEXT NOT NULL DEFAULT 'above' CHECK (alert_condition IN ('above', 'below', 'equal')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  triggered       BOOLEAN NOT NULL DEFAULT false,
  triggered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. FARMER WATCHLIST
CREATE TABLE IF NOT EXISTS public.market_watchlist (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL,
  market_price_id UUID NOT NULL REFERENCES public.market_prices(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, market_price_id)
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_market_prices_species_loc
  ON public.market_prices (species_id, location_id);

CREATE INDEX IF NOT EXISTS idx_price_history_market_date
  ON public.price_history (market_price_id, recorded_date DESC);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user
  ON public.price_alerts (user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_market_watchlist_user
  ON public.market_watchlist (user_id);
