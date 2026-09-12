'use strict';

/**
 * aquasangham.service.js
 *
 * Live Seafood Market Prices connector for AquaSangham (aquasangham.in).
 * Connects directly to AquaSangham's real-time Firestore database for
 * live daily farmgate quotes across Andhra Pradesh, Tamil Nadu, Gujarat,
 * West Bengal, and Odisha.
 *
 * Provides real-time data parsing, count-wise table formatting,
 * interactive rate modification ("it should be chnageble"), and
 * robust fallback caching.
 */

const https = require('https');

const FIREBASE_API_KEY = 'AIzaSyDY_EL4c6PcC2mosWwoV2cy2U7TTiJbxU0';
const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/aquasangam/databases/(default)/documents/app_content';

// ─── In-Memory Cache ─────────────────────────────────────────────────────────
let cachedLocations = null;
let cachedRawPrices = null;
let lastSyncTimestamp = null;
let isConnected = false;
let syncError = null;

// User / farmer customizable overrides: key -> { price, updatedAt }
// Key format: `${stateId}::${region}::${species}::${count}`
const priceOverrides = new Map();

// ─── Default Baseline Locations (Fallback if offline) ────────────────────────
const DEFAULT_STATES = [
  {
    id: 'AP',
    name: 'Andhra Pradesh',
    regions: [
      '(West Godavari, East Godavari, Krishna)',
      '(Nellore, Prakasam)',
      'Bhimavaram Mandi',
      'Kakinada Port',
    ],
  },
  {
    id: 'TN',
    name: 'Tamil Nadu',
    regions: ['all', 'Chennai', 'Cuddalore', 'Nagapattinam'],
  },
  {
    id: 'GJ',
    name: 'Gujarat',
    regions: ['Porbandar', 'Gir Somnath', 'Valsad', 'Surat'],
  },
  {
    id: 'WB',
    name: 'West Bengal',
    regions: ['all', 'Purba Medinipur', 'South 24 Parganas'],
  },
  {
    id: 'OR',
    name: 'Odisha',
    regions: ['all', 'Balasore', 'Bhadrak', 'Puri'],
  },
];

// ─── Firestore Document Fetcher ──────────────────────────────────────────────
function fetchFirestoreDoc(docName) {
  return new Promise((resolve, reject) => {
    const url = `${FIRESTORE_BASE}/${docName}?key=${FIREBASE_API_KEY}`;
    const req = https.get(url, { timeout: 12000 }, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(new Error(`Failed to parse Firestore response: ${e.message}`));
          }
        } else {
          reject(new Error(`Firestore returned status ${res.statusCode}: ${raw.slice(0, 150)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection to AquaSangham timed out'));
    });
  });
}

// Recursively unwrap Firestore types (stringValue, integerValue, etc.)
function unwrapFirestore(val) {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(unwrapFirestore);
  }
  if ('mapValue' in val) {
    const obj = {};
    const fields = val.mapValue.fields || {};
    for (const k in fields) {
      obj[k] = unwrapFirestore(fields[k]);
    }
    return obj;
  }
  return null;
}

// ─── Sync with AquaSangham ───────────────────────────────────────────────────
async function syncFromAquaSangham() {
  try {
    const [rawLocs, rawPrices] = await Promise.all([
      fetchFirestoreDoc('market_locations').catch(err => {
        console.warn('AquaSangham locations fetch failed, using fallback:', err.message);
        return null;
      }),
      fetchFirestoreDoc('market_prices_v2'),
    ]);

    if (rawLocs && rawLocs.fields) {
      const parsedLocs = unwrapFirestore({ mapValue: { fields: rawLocs.fields } });
      cachedLocations = parsedLocs.states || DEFAULT_STATES;
    } else if (!cachedLocations) {
      cachedLocations = DEFAULT_STATES;
    }

    if (rawPrices && rawPrices.fields) {
      cachedRawPrices = unwrapFirestore({ mapValue: { fields: rawPrices.fields } });
      lastSyncTimestamp = new Date().toISOString();
      isConnected = true;
      syncError = null;
      console.log(`[AquaSangham] Successfully synced live prices at ${lastSyncTimestamp}`);
    }

    return {
      success: true,
      last_synced: lastSyncTimestamp,
      is_live: true,
    };
  } catch (err) {
    syncError = err.message;
    console.error('[AquaSangham Sync Error]:', err.message);
    if (!cachedLocations) cachedLocations = DEFAULT_STATES;
    return {
      success: false,
      error: err.message,
      last_synced: lastSyncTimestamp,
      is_live: isConnected,
    };
  }
}

// Helper to extract integer count from string like "30 C", "40 Count", "100 c"
function parseCountNumber(countStr) {
  if (!countStr) return 999;
  const match = countStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 999;
}

// ─── Public API: Get Live Count Table ─────────────────────────────────────────
async function getLiveMarketData(options = {}) {
  // Ensure we have synced at least once
  if (!cachedRawPrices) {
    await syncFromAquaSangham();
  }

  const states = cachedLocations || DEFAULT_STATES;
  const rawPrices = cachedRawPrices || {};

  // Default state: AP (Andhra Pradesh) or requested
  let stateId = (options.state || 'AP').toUpperCase();
  let stateObj = states.find(s => s.id.toUpperCase() === stateId) || states[0];
  stateId = stateObj.id;

  const statePrices = rawPrices[stateId] || {};
  const availableRegions = Object.keys(statePrices).length > 0
    ? Object.keys(statePrices)
    : (stateObj.regions || ['all']);

  // Selected region
  let selectedRegion = options.region;
  if (!selectedRegion || !availableRegions.includes(selectedRegion)) {
    selectedRegion = availableRegions[0] || 'all';
  }

  const regionPrices = statePrices[selectedRegion] || {};
  const availableSpecies = Object.keys(regionPrices).length > 0
    ? Object.keys(regionPrices)
    : ['Vannamei Shrimp', 'Black Tiger', 'Rohu'];

  // Selected species
  let selectedSpecies = options.species;
  if (!selectedSpecies || !availableSpecies.includes(selectedSpecies)) {
    selectedSpecies = availableSpecies[0] || 'Vannamei Shrimp';
  }

  const speciesData = regionPrices[selectedSpecies] || { rows: [] };
  const rawRows = speciesData.rows || [];

  // Transform each count row into standardized, farmer-friendly table row
  const tableRows = rawRows.map((r, index) => {
    const countLabel = r.count || `Count ${index + 1}`;
    const countNum = parseCountNumber(countLabel);

    const overrideKey = `${stateId}::${selectedRegion}::${selectedSpecies}::${countLabel}`;
    const hasOverride = priceOverrides.has(overrideKey);
    const livePrice = hasOverride ? priceOverrides.get(overrideKey).price : (parseFloat(r.price) || 0);

    // History
    const history = Array.isArray(r.history) ? r.history.map(h => ({
      day: h.day,
      price: parseFloat(h.price) || 0,
    })) : [];

    // Previous price from history if available
    let prevPrice = parseFloat(r.previousPrice) || (history.length > 1 ? history[history.length - 2].price : livePrice);
    if (!prevPrice || isNaN(prevPrice)) prevPrice = livePrice;

    const changeAmount = hasOverride
      ? Math.round((livePrice - prevPrice) * 100) / 100
      : (typeof r.change === 'number' ? r.change : Math.round((livePrice - prevPrice) * 100) / 100);

    const changePct = prevPrice > 0
      ? Math.round(((changeAmount) / prevPrice * 100) * 100) / 100
      : 0;

    const trend = changeAmount > 0 ? 'up' : changeAmount < 0 ? 'down' : 'stable';

    // Avg grams per piece for shrimp: 1000g / count
    const avgWeightGrams = countNum > 0 && countNum < 500
      ? Math.round((1000 / countNum) * 10) / 10
      : null;

    // Price per piece in ₹: price / count
    const piecePrice = countNum > 0 && countNum < 500 && livePrice > 0
      ? Math.round((livePrice / countNum) * 100) / 100
      : null;

    return {
      id: `${stateId.toLowerCase()}-${index}-${countNum}`,
      count_raw: countLabel,
      count_number: countNum,
      count_display: countNum < 500 ? `${countNum} Count` : countLabel,
      avg_weight_grams: avgWeightGrams,
      current_price: livePrice,
      previous_price: prevPrice,
      change_amount: changeAmount,
      change_pct: changePct,
      trend,
      piece_price: piecePrice,
      history,
      is_overridden: hasOverride,
      last_updated: hasOverride ? priceOverrides.get(overrideKey).updatedAt : (speciesData.updatedAt || lastSyncTimestamp),
    };
  });

  // Sort rows count ascending (30 count down to 100 count)
  tableRows.sort((a, b) => a.count_number - b.count_number);

  return {
    source: 'AquaSangham Verified Farmgate Network',
    source_url: 'https://aquasangham.in/prices',
    is_live: isConnected,
    last_synced: lastSyncTimestamp || new Date().toISOString(),
    sync_status: isConnected ? 'Connected to AquaSangham Live Feed' : 'Using Cached Baseline Rates',
    states,
    selected_state: stateObj,
    available_regions: availableRegions,
    selected_region: selectedRegion,
    available_species: availableSpecies,
    selected_species: selectedSpecies,
    count_summary: {
      total_counts: tableRows.length,
      highest_price: tableRows.length > 0 ? Math.max(...tableRows.map(r => r.current_price)) : 0,
      lowest_price: tableRows.length > 0 ? Math.min(...tableRows.map(r => r.current_price)) : 0,
      gainers: tableRows.filter(r => r.trend === 'up').length,
      losers: tableRows.filter(r => r.trend === 'down').length,
      stable: tableRows.filter(r => r.trend === 'stable').length,
    },
    table_rows: tableRows,
  };
}

// ─── Update / Override a Specific Count Rate ("it should be chnageble") ───────
function updateCountRate({ state, region, species, count, new_price }) {
  const priceNum = parseFloat(new_price);
  if (isNaN(priceNum) || priceNum <= 0) {
    throw new Error('Valid price greater than 0 is required.');
  }

  const key = `${(state || 'AP').toUpperCase()}::${region}::${species}::${count}`;
  priceOverrides.set(key, {
    price: priceNum,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: `Rate updated for ${species} (${count}) in ${region}`,
    key,
    new_price: priceNum,
  };
}

// ─── Reset Custom Rates Back to AquaSangham Live ─────────────────────────────
function resetCountRates({ state, region, species }) {
  if (state && region && species) {
    const prefix = `${state.toUpperCase()}::${region}::${species}::`;
    for (const k of priceOverrides.keys()) {
      if (k.startsWith(prefix)) priceOverrides.delete(k);
    }
  } else {
    priceOverrides.clear();
  }

  return {
    success: true,
    message: 'Rates reset to live AquaSangham data.',
  };
}

// Initial sync in background on module load
syncFromAquaSangham().catch(e => console.warn('[AquaSangham Initial Sync]', e.message));

module.exports = {
  syncFromAquaSangham,
  getLiveMarketData,
  updateCountRate,
  resetCountRates,
};
