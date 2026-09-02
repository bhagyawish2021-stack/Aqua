'use strict';

/**
 * business.controller.js — Business / financial records CRUD
 * Profit is a GENERATED ALWAYS column in the DB (revenue - expenses).
 */

const { supabaseAdmin } = require('../config/supabase');
const { ApiError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

async function verifyPondOwnership(pondId, userId) {
  const { data } = await supabaseAdmin
    .from('ponds').select('id').eq('id', pondId).eq('farmer_id', userId).single();
  return !!data;
}

/**
 * GET /api/ponds/:pondId/business
 */
async function getBusinessRecords(req, res, next) {
  try {
    const owned = await verifyPondOwnership(req.params.pondId, req.userId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { data, error } = await supabaseAdmin
      .from('business_records')
      .select('*')
      .eq('pond_id', req.params.pondId)
      .order('recorded_at', { ascending: false });

    if (error) return next(new ApiError(400, error.message));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ponds/:pondId/business
 */
async function createBusinessRecord(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new ApiError(400, 'Validation failed', errors.array()));

    const owned = await verifyPondOwnership(req.params.pondId, req.userId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { feed_expense, labor_expense, medicine_expense, other_expense, harvest_revenue, recorded_at } = req.body;

    const { data, error } = await supabaseAdmin
      .from('business_records')
      .insert({
        pond_id: req.params.pondId,
        feed_expense: feed_expense || 0,
        labor_expense: labor_expense || 0,
        medicine_expense: medicine_expense || 0,
        other_expense: other_expense || 0,
        harvest_revenue: harvest_revenue || 0,
        recorded_at,
      })
      .select()
      .single();

    if (error) return next(new ApiError(400, error.message));

    res.status(201).json({ success: true, message: 'Business record added.', data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ponds/:pondId/business/summary
 * Aggregates total expenses, revenue, and profit across all business records for a pond.
 */
async function getBusinessSummary(req, res, next) {
  try {
    const owned = await verifyPondOwnership(req.params.pondId, req.userId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { data, error } = await supabaseAdmin
      .from('business_records')
      .select('feed_expense, labor_expense, medicine_expense, other_expense, harvest_revenue, profit')
      .eq('pond_id', req.params.pondId);

    if (error) return next(new ApiError(400, error.message));

    const summary = data.reduce(
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

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/ponds/:pondId/business/:id
 */
async function deleteBusinessRecord(req, res, next) {
  try {
    const owned = await verifyPondOwnership(req.params.pondId, req.userId);
    if (!owned) return next(new ApiError(403, 'Pond not found or access denied.'));

    const { error } = await supabaseAdmin
      .from('business_records')
      .delete()
      .eq('id', req.params.id)
      .eq('pond_id', req.params.pondId);

    if (error) return next(new ApiError(400, error.message));

    res.status(200).json({ success: true, message: 'Business record deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBusinessRecords, createBusinessRecord, getBusinessSummary, deleteBusinessRecord };
