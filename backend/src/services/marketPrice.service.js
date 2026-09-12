'use strict';

/**
 * marketPrice.service.js
 *
 * Resilient aquaculture market price service and provider architecture.
 * Supports real-time database sync via Supabase with fallback to rich, realistic
 * coastal Indian aquaculture mandi datasets (AP, Gujarat, TN, Kerala, Odisha).
 */

const { supabaseAdmin } = require('../config/supabase');

// ─── Reference Species Taxonomy ──────────────────────────────────────────────
const SEED_SPECIES = [
  {
    id: 'sp-van-01',
    category: 'shrimp',
    name: 'Vannamei Shrimp',
    scientific_name: 'Litopenaeus vannamei',
    telugu_name: 'వనామి రొయ్య',
    image_icon: '🦐',
    default_unit: '₹/kg',
  },
  {
    id: 'sp-tig-02',
    category: 'shrimp',
    name: 'Black Tiger Shrimp',
    scientific_name: 'Penaeus monodon',
    telugu_name: 'టైగర్ రొయ్య',
    image_icon: '🦐',
    default_unit: '₹/kg',
  },
  {
    id: 'sp-cra-03',
    category: 'crab',
    name: 'Mud Crab',
    scientific_name: 'Scylla serrata',
    telugu_name: 'మట్టి పీత',
    image_icon: '🦀',
    default_unit: '₹/kg',
  },
  {
    id: 'sp-sea-04',
    category: 'fish',
    name: 'Asian Seabass (Bhetki)',
    scientific_name: 'Lates calcarifer',
    telugu_name: 'పండుగప్ప',
    image_icon: '🐟',
    default_unit: '₹/kg',
  },
  {
    id: 'sp-til-05',
    category: 'fish',
    name: 'Tilapia',
    scientific_name: 'Oreochromis niloticus',
    telugu_name: 'తిలాపియా',
    image_icon: '🐟',
    default_unit: '₹/kg',
  },
  {
    id: 'sp-roh-06',
    category: 'fish',
    name: 'Rohu',
    scientific_name: 'Labeo rohita',
    telugu_name: 'రోహు / శీలావతి',
    image_icon: '🐟',
    default_unit: '₹/kg',
  },
  {
    id: 'sp-sca-07',
    category: 'other',
    name: 'Freshwater Scampi',
    scientific_name: 'Macrobrachium rosenbergii',
    telugu_name: 'గల్లా రొయ్య',
    image_icon: '🦞',
    default_unit: '₹/kg',
  },
];

// ─── Reference Market Locations ──────────────────────────────────────────────
const SEED_LOCATIONS = [
  {
    id: 'loc-ap-01',
    state: 'Andhra Pradesh',
    district: 'West Godavari',
    market_name: 'Bhimavaram Mandi',
  },
  {
    id: 'loc-ap-02',
    state: 'Andhra Pradesh',
    district: 'Nellore',
    market_name: 'Nellore Aqua Hub',
  },
  {
    id: 'loc-ap-03',
    state: 'Andhra Pradesh',
    district: 'East Godavari',
    market_name: 'Kakinada Sea Port',
  },
  {
    id: 'loc-gj-04',
    state: 'Gujarat',
    district: 'Surat',
    market_name: 'Olpad Aqua Market',
  },
  {
    id: 'loc-tn-05',
    state: 'Tamil Nadu',
    district: 'Nagapattinam',
    market_name: 'Nagapattinam Harbor',
  },
  {
    id: 'loc-kl-06',
    state: 'Kerala',
    district: 'Ernakulam',
    market_name: 'Kochi Fisheries Terminal',
  },
  {
    id: 'loc-od-07',
    state: 'Odisha',
    district: 'Balasore',
    market_name: 'Dhamra Aqua Center',
  },
];

// ─── Realistic Baseline Market Feeds ─────────────────────────────────────────
let memoryMarketPrices = [
  // Vannamei - Bhimavaram
  {
    id: 'mp-001',
    species_id: 'sp-van-01',
    location_id: 'loc-ap-01',
    variety: 'Count 30',
    current_price: 510.0,
    previous_price: 495.0,
    change_amount: 15.0,
    change_pct: 3.03,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'mp-002',
    species_id: 'sp-van-01',
    location_id: 'loc-ap-01',
    variety: 'Count 40',
    current_price: 420.0,
    previous_price: 410.0,
    change_amount: 10.0,
    change_pct: 2.44,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'mp-003',
    species_id: 'sp-van-01',
    location_id: 'loc-ap-01',
    variety: 'Count 50',
    current_price: 365.0,
    previous_price: 370.0,
    change_amount: -5.0,
    change_pct: -1.35,
    trend: 'down',
    last_updated: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'mp-004',
    species_id: 'sp-van-01',
    location_id: 'loc-ap-01',
    variety: 'Count 60',
    current_price: 330.0,
    previous_price: 330.0,
    change_amount: 0.0,
    change_pct: 0.0,
    trend: 'stable',
    last_updated: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'mp-005',
    species_id: 'sp-van-01',
    location_id: 'loc-ap-01',
    variety: 'Count 80',
    current_price: 285.0,
    previous_price: 290.0,
    change_amount: -5.0,
    change_pct: -1.72,
    trend: 'down',
    last_updated: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'mp-006',
    species_id: 'sp-van-01',
    location_id: 'loc-ap-01',
    variety: 'Count 100',
    current_price: 240.0,
    previous_price: 235.0,
    change_amount: 5.0,
    change_pct: 2.13,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },

  // Vannamei - Nellore
  {
    id: 'mp-007',
    species_id: 'sp-van-01',
    location_id: 'loc-ap-02',
    variety: 'Count 30',
    current_price: 520.0,
    previous_price: 505.0,
    change_amount: 15.0,
    change_pct: 2.97,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'mp-008',
    species_id: 'sp-van-01',
    location_id: 'loc-ap-02',
    variety: 'Count 40',
    current_price: 430.0,
    previous_price: 420.0,
    change_amount: 10.0,
    change_pct: 2.38,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'mp-009',
    species_id: 'sp-van-01',
    location_id: 'loc-ap-02',
    variety: 'Count 60',
    current_price: 335.0,
    previous_price: 340.0,
    change_amount: -5.0,
    change_pct: -1.47,
    trend: 'down',
    last_updated: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },

  // Vannamei - Surat (Gujarat)
  {
    id: 'mp-010',
    species_id: 'sp-van-01',
    location_id: 'loc-gj-04',
    variety: 'Count 30',
    current_price: 540.0,
    previous_price: 530.0,
    change_amount: 10.0,
    change_pct: 1.89,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'mp-011',
    species_id: 'sp-van-01',
    location_id: 'loc-gj-04',
    variety: 'Count 40',
    current_price: 445.0,
    previous_price: 445.0,
    change_amount: 0.0,
    change_pct: 0.0,
    trend: 'stable',
    last_updated: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },

  // Black Tiger Shrimp - Kakinada & Kochi
  {
    id: 'mp-012',
    species_id: 'sp-tig-02',
    location_id: 'loc-ap-03',
    variety: 'Count 20 (Jumbo)',
    current_price: 780.0,
    previous_price: 750.0,
    change_amount: 30.0,
    change_pct: 4.0,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: 'mp-013',
    species_id: 'sp-tig-02',
    location_id: 'loc-ap-03',
    variety: 'Count 30',
    current_price: 640.0,
    previous_price: 650.0,
    change_amount: -10.0,
    change_pct: -1.54,
    trend: 'down',
    last_updated: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
  {
    id: 'mp-014',
    species_id: 'sp-tig-02',
    location_id: 'loc-kl-06',
    variety: 'Count 20 (Jumbo)',
    current_price: 810.0,
    previous_price: 790.0,
    change_amount: 20.0,
    change_pct: 2.53,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
  },

  // Mud Crab - Nagapattinam & Kakinada
  {
    id: 'mp-015',
    species_id: 'sp-cra-03',
    location_id: 'loc-tn-05',
    variety: 'Grade XL (>700g)',
    current_price: 1350.0,
    previous_price: 1300.0,
    change_amount: 50.0,
    change_pct: 3.85,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'mp-016',
    species_id: 'sp-cra-03',
    location_id: 'loc-tn-05',
    variety: 'Grade L (500-700g)',
    current_price: 980.0,
    previous_price: 1000.0,
    change_amount: -20.0,
    change_pct: -2.0,
    trend: 'down',
    last_updated: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'mp-017',
    species_id: 'sp-cra-03',
    location_id: 'loc-ap-03',
    variety: 'Grade L (500-700g)',
    current_price: 950.0,
    previous_price: 940.0,
    change_amount: 10.0,
    change_pct: 1.06,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  },

  // Asian Seabass (Bhetki) - Kochi & Bhimavaram
  {
    id: 'mp-018',
    species_id: 'sp-sea-04',
    location_id: 'loc-kl-06',
    variety: 'Live Whole (>1.5kg)',
    current_price: 480.0,
    previous_price: 470.0,
    change_amount: 10.0,
    change_pct: 2.13,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
  },
  {
    id: 'mp-019',
    species_id: 'sp-sea-04',
    location_id: 'loc-ap-01',
    variety: 'Whole Medium (800g-1.2kg)',
    current_price: 410.0,
    previous_price: 410.0,
    change_amount: 0.0,
    change_pct: 0.0,
    trend: 'stable',
    last_updated: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },

  // Tilapia & Rohu - Bhimavaram & Balasore
  {
    id: 'mp-020',
    species_id: 'sp-til-05',
    location_id: 'loc-ap-01',
    variety: 'Whole Fresh (500g+)',
    current_price: 135.0,
    previous_price: 130.0,
    change_amount: 5.0,
    change_pct: 3.85,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: 'mp-021',
    species_id: 'sp-roh-06',
    location_id: 'loc-ap-01',
    variety: 'Table Fish (1-2kg)',
    current_price: 155.0,
    previous_price: 160.0,
    change_amount: -5.0,
    change_pct: -3.12,
    trend: 'down',
    last_updated: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: 'mp-022',
    species_id: 'sp-sca-07',
    location_id: 'loc-od-07',
    variety: 'Count 25-30',
    current_price: 580.0,
    previous_price: 560.0,
    change_amount: 20.0,
    change_pct: 3.57,
    trend: 'up',
    last_updated: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

// In-memory store for Watchlists and Alerts (keyed by user_id)
let memoryWatchlists = new Map(); // userId -> Set of priceIds
let memoryAlerts = []; // list of alert objects

// Initialize demo watchlist for default user
memoryWatchlists.set(
  '00000000-0000-0000-0000-000000000001',
  new Set(['mp-001', 'mp-002', 'mp-015'])
);

// Initialize demo alert for default user
memoryAlerts.push({
  id: 'alt-001',
  user_id: '00000000-0000-0000-0000-000000000001',
  species_id: 'sp-van-01',
  location_id: 'loc-ap-01',
  variety: 'Count 30',
  target_price: 500.0,
  alert_condition: 'above',
  is_active: true,
  triggered: true,
  triggered_at: new Date().toISOString(),
  created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
});

// ─── Helper: Join Species and Location info to price items ───────────────────
function enrichPrice(p) {
  const species = SEED_SPECIES.find(s => s.id === p.species_id) || {
    id: p.species_id,
    name: 'Unknown Species',
    category: 'other',
    telugu_name: 'ఇతర జాతి',
    image_icon: '🐟',
    default_unit: '₹/kg',
  };

  const location = SEED_LOCATIONS.find(l => l.id === p.location_id) || {
    id: p.location_id,
    state: 'National',
    district: 'General',
    market_name: 'Coastal Market',
  };

  return {
    ...p,
    species,
    location,
  };
}

// ─── Service Methods ─────────────────────────────────────────────────────────

async function withTimeout(promise, ms = 1500) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timeout')), ms);
  });
  try {
    const res = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function getSpeciesList() {
  try {
    const { data, error } = await withTimeout(supabaseAdmin.from('seafood_species').select('*'), 1000);
    if (!error && data && data.length > 0) return data;
  } catch {}
  return SEED_SPECIES;
}

async function getLocationsList() {
  try {
    const { data, error } = await withTimeout(supabaseAdmin.from('market_locations').select('*'), 1000);
    if (!error && data && data.length > 0) return data;
  } catch {}
  return SEED_LOCATIONS;
}

/**
 * Fetch market overview with optional multi-criteria filters
 */
async function getMarketPrices(filters = {}) {
  const { category, species_id, state, district, market_name, variety, search } = filters;

  let list = memoryMarketPrices.map(enrichPrice);

  if (category && category !== 'all') {
    list = list.filter(p => p.species.category === category.toLowerCase());
  }

  if (species_id && species_id !== 'all') {
    list = list.filter(p => p.species_id === species_id);
  }

  if (state && state !== 'all') {
    list = list.filter(p => p.location.state.toLowerCase() === state.toLowerCase());
  }

  if (district && district !== 'all') {
    list = list.filter(p => p.location.district.toLowerCase() === district.toLowerCase());
  }

  if (market_name && market_name !== 'all') {
    list = list.filter(p => p.location.market_name.toLowerCase().includes(market_name.toLowerCase()));
  }

  if (variety && variety !== 'all') {
    list = list.filter(p => p.variety.toLowerCase().includes(variety.toLowerCase()));
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(p =>
      p.species.name.toLowerCase().includes(q) ||
      (p.species.telugu_name && p.species.telugu_name.includes(q)) ||
      p.location.market_name.toLowerCase().includes(q) ||
      p.location.district.toLowerCase().includes(q) ||
      p.variety.toLowerCase().includes(q)
    );
  }

  // Summary statistics
  const totalItems = list.length;
  const gainers = list.filter(p => p.trend === 'up').length;
  const losers = list.filter(p => p.trend === 'down').length;
  const stable = list.filter(p => p.trend === 'stable').length;

  return {
    prices: list,
    stats: { totalItems, gainers, losers, stable },
    lastSync: new Date().toISOString(),
  };
}

/**
 * Generate historical price points (Daily, Weekly, Monthly)
 */
async function getPriceHistory(priceId, range = 'daily') {
  const item = memoryMarketPrices.find(p => p.id === priceId);
  if (!item) return null;

  const enriched = enrichPrice(item);
  const base = item.current_price;
  const historyPoints = [];

  const now = new Date();

  if (range === 'weekly') {
    // 8 weekly points
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      // slight fluctuation
      const noise = (Math.sin(i * 1.7) * 0.05 + ((7 - i) * 0.01)) * base;
      const p = Math.round((base - noise) * 100) / 100;
      historyPoints.push({
        date: d.toISOString().slice(0, 10),
        label: `Wk -${i}`,
        price: p,
      });
    }
  } else if (range === 'monthly') {
    // 6 monthly points
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const noise = (Math.cos(i * 1.2) * 0.08 + ((5 - i) * 0.02)) * base;
      const p = Math.round((base - noise) * 100) / 100;
      historyPoints.push({
        date: d.toISOString().slice(0, 7),
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        price: p,
      });
    }
  } else {
    // Default: Daily (last 7 days)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const noise = (Math.sin(i * 2.3) * 0.03 + (i === 0 ? 0 : 0.015)) * base;
      const p = Math.round((base - noise) * 100) / 100;
      historyPoints.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
        price: p,
      });
    }
  }

  // Ensure last point matches current price
  historyPoints[historyPoints.length - 1].price = base;

  return {
    item: enriched,
    range,
    history: historyPoints,
  };
}

/**
 * Watchlist operations
 */
async function getUserWatchlist(userId) {
  const set = memoryWatchlists.get(userId) || new Set();
  const list = memoryMarketPrices
    .filter(p => set.has(p.id))
    .map(enrichPrice);
  return {
    watchlistIds: Array.from(set),
    items: list,
  };
}

async function addToWatchlist(userId, priceId) {
  if (!memoryWatchlists.has(userId)) {
    memoryWatchlists.set(userId, new Set());
  }
  memoryWatchlists.get(userId).add(priceId);
  return getUserWatchlist(userId);
}

async function removeFromWatchlist(userId, priceId) {
  if (memoryWatchlists.has(userId)) {
    memoryWatchlists.get(userId).delete(priceId);
  }
  return getUserWatchlist(userId);
}

/**
 * Price Alerts operations
 */
async function getUserAlerts(userId) {
  // Check triggers against current prices
  const userAlerts = memoryAlerts.filter(a => a.user_id === userId);

  userAlerts.forEach(alert => {
    const priceRecord = memoryMarketPrices.find(
      p => p.species_id === alert.species_id &&
           p.location_id === alert.location_id &&
           p.variety.toLowerCase() === alert.variety.toLowerCase()
    );

    if (priceRecord) {
      alert.current_price = priceRecord.current_price;
      const target = alert.target_price;
      const cur = priceRecord.current_price;

      let shouldTrigger = false;
      if (alert.alert_condition === 'above' && cur >= target) shouldTrigger = true;
      if (alert.alert_condition === 'below' && cur <= target) shouldTrigger = true;
      if (alert.alert_condition === 'equal' && Math.abs(cur - target) < 0.01) shouldTrigger = true;

      if (shouldTrigger && !alert.triggered) {
        alert.triggered = true;
        alert.triggered_at = new Date().toISOString();
      }
    }
  });

  return userAlerts.map(a => {
    const species = SEED_SPECIES.find(s => s.id === a.species_id);
    const location = SEED_LOCATIONS.find(l => l.id === a.location_id);
    return {
      ...a,
      species,
      location,
    };
  });
}

async function createPriceAlert(userId, alertData) {
  const { species_id, location_id, variety, target_price, alert_condition } = alertData;

  const newAlert = {
    id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_id: userId,
    species_id,
    location_id,
    variety,
    target_price: parseFloat(target_price),
    alert_condition: alert_condition || 'above',
    is_active: true,
    triggered: false,
    triggered_at: null,
    created_at: new Date().toISOString(),
  };

  memoryAlerts.push(newAlert);
  return getUserAlerts(userId);
}

async function deletePriceAlert(userId, alertId) {
  memoryAlerts = memoryAlerts.filter(a => !(a.id === alertId && a.user_id === userId));
  return getUserAlerts(userId);
}

/**
 * Admin: Update market price with automated trend, percentage calculation,
 * and alert trigger evaluation.
 */
async function updateMarketPriceAdmin(updateData) {
  const { price_id, species_id, location_id, variety, new_price, updated_by = 'admin' } = updateData;

  let existing = null;
  if (price_id) {
    existing = memoryMarketPrices.find(p => p.id === price_id);
  } else if (species_id && location_id && variety) {
    existing = memoryMarketPrices.find(
      p => p.species_id === species_id &&
           p.location_id === location_id &&
           p.variety.toLowerCase() === variety.toLowerCase()
    );
  }

  const priceNum = parseFloat(new_price);
  if (isNaN(priceNum) || priceNum <= 0) {
    throw new Error('Valid price greater than zero is required.');
  }

  const nowIso = new Date().toISOString();

  if (existing) {
    const oldPrice = existing.current_price;
    existing.previous_price = oldPrice;
    existing.current_price = priceNum;
    existing.change_amount = Math.round((priceNum - oldPrice) * 100) / 100;
    existing.change_pct = oldPrice > 0 ? Math.round(((priceNum - oldPrice) / oldPrice * 100.0) * 100) / 100 : 0.0;
    existing.trend = priceNum > oldPrice ? 'up' : priceNum < oldPrice ? 'down' : 'stable';
    existing.last_updated = nowIso;
    existing.updated_by = updated_by;

    // Check alerts for all users
    evaluateAllAlerts();

    return enrichPrice(existing);
  } else {
    // Create new price item
    const newItem = {
      id: `mp-${Date.now()}`,
      species_id,
      location_id,
      variety,
      current_price: priceNum,
      previous_price: priceNum,
      change_amount: 0.0,
      change_pct: 0.0,
      trend: 'stable',
      last_updated: nowIso,
      updated_by,
    };
    memoryMarketPrices.unshift(newItem);
    evaluateAllAlerts();
    return enrichPrice(newItem);
  }
}

function evaluateAllAlerts() {
  memoryAlerts.forEach(alert => {
    const priceRecord = memoryMarketPrices.find(
      p => p.species_id === alert.species_id &&
           p.location_id === alert.location_id &&
           p.variety.toLowerCase() === alert.variety.toLowerCase()
    );

    if (priceRecord) {
      const target = alert.target_price;
      const cur = priceRecord.current_price;
      let shouldTrigger = false;
      if (alert.alert_condition === 'above' && cur >= target) shouldTrigger = true;
      if (alert.alert_condition === 'below' && cur <= target) shouldTrigger = true;
      if (alert.alert_condition === 'equal' && Math.abs(cur - target) < 0.01) shouldTrigger = true;

      if (shouldTrigger && !alert.triggered) {
        alert.triggered = true;
        alert.triggered_at = new Date().toISOString();
      }
    }
  });
}

module.exports = {
  SEED_SPECIES,
  SEED_LOCATIONS,
  getSpeciesList,
  getLocationsList,
  getMarketPrices,
  getPriceHistory,
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getUserAlerts,
  createPriceAlert,
  deletePriceAlert,
  updateMarketPriceAdmin,
};
