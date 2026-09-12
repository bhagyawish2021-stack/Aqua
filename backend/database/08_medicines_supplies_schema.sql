-- ============================================================
-- AquaMitra — Phase 8: Aquaculture Medicines & Farm Supplies Marketplace Schema
-- ============================================================

-- 1. CATEGORIES TAXONOMY
CREATE TABLE IF NOT EXISTS public.medicine_categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  telugu_name TEXT NOT NULL,
  description TEXT,
  icon        TEXT NOT NULL DEFAULT '💊',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. AQUACULTURE PRODUCTS & FARM SUPPLIES TABLE
CREATE TABLE IF NOT EXISTS public.aquaculture_products (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id                       UUID NOT NULL, -- references profiles(id)
  seller_name                     TEXT NOT NULL,
  seller_location                 TEXT NOT NULL,
  seller_rating                   NUMERIC(3, 2) NOT NULL DEFAULT 4.90,
  seller_contact                  TEXT NOT NULL,
  name                            TEXT NOT NULL,
  category                        TEXT NOT NULL REFERENCES public.medicine_categories(id),
  category_label                  TEXT NOT NULL,
  manufacturer                    TEXT NOT NULL,
  brand_name                      TEXT NOT NULL,
  purpose                         TEXT NOT NULL,
  target_species                  TEXT[] DEFAULT '{}',
  composition_active_ingredients  TEXT NOT NULL,
  dosage_guidelines               TEXT NOT NULL, -- verified manufacturer recommended dosage
  application_method              TEXT NOT NULL,
  safety_precautions              TEXT NOT NULL,
  withdrawal_period_days          INTEGER DEFAULT 0,
  caa_or_govt_approval_no         TEXT NOT NULL, -- Coastal Aquaculture Authority / MPEDA license or registration
  requires_professional_guidance  BOOLEAN NOT NULL DEFAULT false,
  guidance_warning_note           TEXT,
  price                           NUMERIC(10, 2) NOT NULL,
  unit                            TEXT NOT NULL DEFAULT '1 kg pack',
  stock_quantity                  INTEGER NOT NULL DEFAULT 50,
  is_in_stock                     BOOLEAN NOT NULL DEFAULT true,
  batch_number                    TEXT NOT NULL,
  manufacture_date                DATE,
  expiry_date                     DATE NOT NULL,
  image_url                       TEXT NOT NULL,
  rating                          NUMERIC(3, 2) NOT NULL DEFAULT 4.85,
  reviews_count                   INTEGER NOT NULL DEFAULT 0,
  status                          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'out_of_stock', 'discontinued')),
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aqua_products_category ON public.aquaculture_products(category);
CREATE INDEX IF NOT EXISTS idx_aqua_products_seller ON public.aquaculture_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_aqua_products_guidance ON public.aquaculture_products(requires_professional_guidance);

-- 3. FARM SUPPLIES ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.supplies_orders (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number            TEXT NOT NULL UNIQUE,
  farmer_id               UUID NOT NULL, -- references profiles(id)
  farmer_name             TEXT NOT NULL,
  farmer_phone            TEXT NOT NULL,
  delivery_address        TEXT NOT NULL,
  district                TEXT NOT NULL,
  state                   TEXT NOT NULL DEFAULT 'Andhra Pradesh',
  items                   JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of { product_id, product_name, category, unit_price, quantity, subtotal, seller_id }
  subtotal_amount         NUMERIC(10, 2) NOT NULL,
  shipping_fee            NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount            NUMERIC(10, 2) NOT NULL,
  payment_method          TEXT NOT NULL DEFAULT 'cash_on_delivery' CHECK (payment_method IN ('cash_on_delivery', 'upi_qr', 'net_banking')),
  status                  TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  tracking_number         TEXT,
  courier_partner         TEXT,
  estimated_delivery_date DATE,
  order_notes             TEXT,
  cancelled_reason        TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplies_orders_farmer ON public.supplies_orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_supplies_orders_status ON public.supplies_orders(status);

-- 4. PRODUCT REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES public.aquaculture_products(id) ON DELETE CASCADE,
  order_id          UUID REFERENCES public.supplies_orders(id) ON DELETE SET NULL,
  farmer_id         UUID NOT NULL,
  farmer_name       TEXT NOT NULL,
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text       TEXT NOT NULL,
  verified_purchase BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON public.product_reviews(product_id);
