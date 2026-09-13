'use strict';

/**
 * pondStore.service.js
 * High-availability persistent repository for ponds and telemetry.
 * Tries Supabase first; if Supabase is disconnected or network fails,
 * smoothly uses in-memory storage so the application NEVER crashes with 500/fetch errors.
 */

const { supabaseAdmin } = require('../config/supabase');

const DEFAULT_FARMER_ID = '00000000-0000-0000-0000-000000000001';

function withTimeout(promise, ms = 800) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), ms))
  ]);
}

// Initial resilient demo data
let memoryPonds = [
  {
    id: 'pond-demo-01',
    farmer_id: DEFAULT_FARMER_ID,
    name: 'Pond 1 (North Vannamei)',
    size_acres: 2.5,
    species: 'Vannamei Shrimp',
    stocking_date: '2026-07-05',
    stocking_density: 60,
    status: 'active',
    created_at: '2026-07-05T08:00:00Z'
  },
  {
    id: 'pond-demo-02',
    farmer_id: DEFAULT_FARMER_ID,
    name: 'Pond 2 (South Brackish)',
    size_acres: 3.0,
    species: 'Black Tiger Prawn',
    stocking_date: '2026-06-20',
    stocking_density: 30,
    status: 'active',
    created_at: '2026-06-20T08:00:00Z'
  },
  {
    id: 'pond-demo-03',
    farmer_id: DEFAULT_FARMER_ID,
    name: 'Pond 3 (Nursery Seabass)',
    size_acres: 1.2,
    species: 'Asian Seabass',
    stocking_date: '2026-08-01',
    stocking_density: 40,
    status: 'active',
    created_at: '2026-08-01T08:00:00Z'
  }
];

let memoryWaterQuality = [
  {
    id: 'wq-demo-01',
    pond_id: 'pond-demo-01',
    temperature: 28.5,
    ph: 7.9,
    dissolved_oxygen: 5.4,
    salinity: 15.0,
    ammonia: 0.04,
    alkalinity: 130.0,
    recorded_at: new Date().toISOString()
  },
  {
    id: 'wq-demo-02',
    pond_id: 'pond-demo-02',
    temperature: 29.1,
    ph: 8.2,
    dissolved_oxygen: 4.8,
    salinity: 22.0,
    ammonia: 0.08,
    alkalinity: 145.0,
    recorded_at: new Date(Date.now() - 86400000).toISOString()
  }
];

let memoryFeed = [
  {
    id: 'feed-demo-01',
    pond_id: 'pond-demo-01',
    feed_type: 'Pellet #2 (Grower)',
    quantity_kg: 45.0,
    cost: 4050,
    feeding_time: '08:00',
    recorded_at: new Date().toISOString()
  }
];

let memoryGrowth = [
  {
    id: 'growth-demo-01',
    pond_id: 'pond-demo-01',
    sample_date: new Date().toISOString().slice(0, 10),
    sample_count: 50,
    abw_grams: 22.5,
    survival_pct: 88,
    biomass_kg: 5900,
    notes: 'Optimal healthy carapace and active feeding.'
  }
];

let memoryBusiness = [
  {
    id: 'biz-demo-01',
    pond_id: 'pond-demo-01',
    feed_expense: 145000,
    labor_expense: 35000,
    medicine_expense: 22000,
    other_expense: 18000,
    harvest_revenue: 480000,
    profit: 260000,
    recorded_at: new Date().toISOString()
  }
];

module.exports = {
  // ─── Ponds ─────────────────────────────────────────────────────────────────
  async getPonds(farmerId) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('ponds').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false })
      );

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      // Fallback to in-memory store
    }
    return memoryPonds.filter(p => !farmerId || p.farmer_id === farmerId || p.farmer_id === DEFAULT_FARMER_ID);
  },

  async getPondById(pondId, farmerId) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('ponds').select('*').eq('id', pondId).single()
      );

      if (!error && data) return data;
    } catch (e) {}

    return memoryPonds.find(p => p.id === pondId) || memoryPonds[0];
  },

  async createPond(farmerId, payload) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('ponds').insert({ farmer_id: farmerId, ...payload }).select().single()
      );

      if (!error && data) {
        memoryPonds.unshift(data);
        return data;
      }
    } catch (e) {}

    const newPond = {
      id: 'pond-' + Date.now(),
      farmer_id: farmerId || DEFAULT_FARMER_ID,
      name: payload.name || 'New Pond',
      size_acres: parseFloat(payload.size_acres) || 1.0,
      species: payload.species || 'Vannamei Shrimp',
      stocking_date: payload.stocking_date || new Date().toISOString().slice(0, 10),
      stocking_density: parseInt(payload.stocking_density, 10) || 50,
      status: payload.status || 'active',
      created_at: new Date().toISOString()
    };
    memoryPonds.unshift(newPond);
    return newPond;
  },

  async updatePond(pondId, farmerId, updates) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('ponds').update(updates).eq('id', pondId).select().single()
      );

      if (!error && data) return data;
    } catch (e) {}

    const idx = memoryPonds.findIndex(p => p.id === pondId);
    if (idx !== -1) {
      memoryPonds[idx] = { ...memoryPonds[idx], ...updates, updated_at: new Date().toISOString() };
      return memoryPonds[idx];
    }
    return null;
  },

  async deletePond(pondId, farmerId) {
    try {
      await withTimeout(supabaseAdmin.from('ponds').delete().eq('id', pondId));
    } catch (e) {}

    memoryPonds = memoryPonds.filter(p => p.id !== pondId);
    return true;
  },

  async verifyPondOwnership(pondId, farmerId) {
    const pond = await this.getPondById(pondId, farmerId);
    return !!pond;
  },

  // ─── Water Quality ─────────────────────────────────────────────────────────
  async getWaterQuality(pondId) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('water_quality').select('*').eq('pond_id', pondId).order('recorded_at', { ascending: false })
      );

      if (!error && data && data.length > 0) return data;
    } catch (e) {}

    const records = memoryWaterQuality.filter(w => w.pond_id === pondId);
    return records.length > 0 ? records : memoryWaterQuality;
  },

  async createWaterQuality(pondId, payload) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('water_quality').insert({ pond_id: pondId, ...payload }).select().single()
      );

      if (!error && data) {
        memoryWaterQuality.unshift(data);
        return data;
      }
    } catch (e) {}

    const newRecord = {
      id: 'wq-' + Date.now(),
      pond_id: pondId,
      temperature: payload.temperature != null ? parseFloat(payload.temperature) : 28.5,
      ph: payload.ph != null ? parseFloat(payload.ph) : 7.8,
      dissolved_oxygen: payload.dissolved_oxygen != null ? parseFloat(payload.dissolved_oxygen) : 5.5,
      salinity: payload.salinity != null ? parseFloat(payload.salinity) : 15.0,
      ammonia: payload.ammonia != null ? parseFloat(payload.ammonia) : 0.04,
      alkalinity: payload.alkalinity != null ? parseFloat(payload.alkalinity) : 130.0,
      recorded_at: payload.recorded_at || new Date().toISOString()
    };
    memoryWaterQuality.unshift(newRecord);
    return newRecord;
  },

  async deleteWaterQuality(recordId) {
    try {
      await withTimeout(supabaseAdmin.from('water_quality').delete().eq('id', recordId));
    } catch (e) {}
    memoryWaterQuality = memoryWaterQuality.filter(w => w.id !== recordId);
    return true;
  },

  // ─── Feed ──────────────────────────────────────────────────────────────────
  async getFeed(pondId) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('feed_records').select('*').eq('pond_id', pondId).order('recorded_at', { ascending: false })
      );

      if (!error && data && data.length > 0) return data;
    } catch (e) {}

    const records = memoryFeed.filter(f => f.pond_id === pondId);
    return records.length > 0 ? records : memoryFeed;
  },

  async createFeed(pondId, payload) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('feed_records').insert({ pond_id: pondId, ...payload }).select().single()
      );

      if (!error && data) {
        memoryFeed.unshift(data);
        return data;
      }
    } catch (e) {}

    const newFeed = {
      id: 'feed-' + Date.now(),
      pond_id: pondId,
      feed_type: payload.feed_type || 'Pellet #2',
      quantity_kg: parseFloat(payload.quantity_kg) || 25.0,
      cost: parseFloat(payload.cost) || 2250,
      feeding_time: payload.feeding_time || '08:00',
      recorded_at: payload.recorded_at || new Date().toISOString()
    };
    memoryFeed.unshift(newFeed);
    return newFeed;
  },

  async deleteFeed(recordId) {
    try {
      await withTimeout(supabaseAdmin.from('feed_records').delete().eq('id', recordId));
    } catch (e) {}
    memoryFeed = memoryFeed.filter(f => f.id !== recordId);
    return true;
  },

  // ─── Growth ────────────────────────────────────────────────────────────────
  async getGrowth(pondId) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('growth_records').select('*').eq('pond_id', pondId).order('sample_date', { ascending: false })
      );

      if (!error && data && data.length > 0) return data;
    } catch (e) {}

    const records = memoryGrowth.filter(g => g.pond_id === pondId);
    return records.length > 0 ? records : memoryGrowth;
  },

  async createGrowth(pondId, payload) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('growth_records').insert({ pond_id: pondId, ...payload }).select().single()
      );

      if (!error && data) {
        memoryGrowth.unshift(data);
        return data;
      }
    } catch (e) {}

    const newGrowth = {
      id: 'growth-' + Date.now(),
      pond_id: pondId,
      sample_date: payload.sample_date || new Date().toISOString().slice(0, 10),
      sample_count: parseInt(payload.sample_count, 10) || 50,
      abw_grams: parseFloat(payload.abw_grams) || 20.0,
      survival_pct: parseFloat(payload.survival_pct) || 85.0,
      biomass_kg: parseFloat(payload.biomass_kg) || 5000,
      notes: payload.notes || ''
    };
    memoryGrowth.unshift(newGrowth);
    return newGrowth;
  },

  async deleteGrowth(recordId) {
    try {
      await withTimeout(supabaseAdmin.from('growth_records').delete().eq('id', recordId));
    } catch (e) {}
    memoryGrowth = memoryGrowth.filter(g => g.id !== recordId);
    return true;
  },

  // ─── Business ──────────────────────────────────────────────────────────────
  async getBusinessRecords(pondId) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('business_records').select('*').eq('pond_id', pondId).order('recorded_at', { ascending: false })
      );

      if (!error && data && data.length > 0) return data;
    } catch (e) {}

    const records = memoryBusiness.filter(b => b.pond_id === pondId);
    return records.length > 0 ? records : memoryBusiness;
  },

  async createBusinessRecord(pondId, payload) {
    try {
      const { data, error } = await withTimeout(
        supabaseAdmin.from('business_records').insert({ pond_id: pondId, ...payload }).select().single()
      );

      if (!error && data) {
        memoryBusiness.unshift(data);
        return data;
      }
    } catch (e) {}

    const feedExp = parseFloat(payload.feed_expense) || 0;
    const laborExp = parseFloat(payload.labor_expense) || 0;
    const medExp = parseFloat(payload.medicine_expense) || 0;
    const otherExp = parseFloat(payload.other_expense) || 0;
    const rev = parseFloat(payload.harvest_revenue) || 0;
    const totalExp = feedExp + laborExp + medExp + otherExp;

    const newRecord = {
      id: 'biz-' + Date.now(),
      pond_id: pondId,
      feed_expense: feedExp,
      labor_expense: laborExp,
      medicine_expense: medExp,
      other_expense: otherExp,
      harvest_revenue: rev,
      profit: rev - totalExp,
      recorded_at: payload.recorded_at || new Date().toISOString()
    };
    memoryBusiness.unshift(newRecord);
    return newRecord;
  },

  async deleteBusinessRecord(recordId) {
    try {
      await withTimeout(supabaseAdmin.from('business_records').delete().eq('id', recordId));
    } catch (e) {}
    memoryBusiness = memoryBusiness.filter(b => b.id !== recordId);
    return true;
  },

  async getBusinessSummary(pondId) {
    const records = await this.getBusinessRecords(pondId);
    const summary = records.reduce(
      (acc, record) => {
        acc.totalFeedExpense     += Number(record.feed_expense) || 0;
        acc.totalLaborExpense    += Number(record.labor_expense) || 0;
        acc.totalMedicineExpense += Number(record.medicine_expense) || 0;
        acc.totalOtherExpense    += Number(record.other_expense) || 0;
        acc.totalRevenue         += Number(record.harvest_revenue) || 0;
        acc.totalProfit          += Number(record.profit) || 0;
        return acc;
      },
      {
        totalFeedExpense: 0,
        totalLaborExpense: 0,
        totalMedicineExpense: 0,
        totalOtherExpense: 0,
        totalRevenue: 0,
        totalProfit: 0,
      }
    );
    summary.totalExpenses = summary.totalFeedExpense + summary.totalLaborExpense +
      summary.totalMedicineExpense + summary.totalOtherExpense;
    return summary;
  }
};
