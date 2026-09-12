'use strict';

const dashboardService = require('../services/dashboard.service');

/**
 * GET /api/dashboard/overview
 * Consolidates all 16 modules into a single unified personalized overview
 */
async function getOverview(req, res, next) {
  try {
    const { district, species, pond_id, lat, lng } = req.query;
    const overview = await dashboardService.getFarmerOverview({
      district,
      species,
      pond_id,
      lat,
      lng
    });

    res.status(200).json(overview);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard/role-view
 * Specialized dashboard for farmer, worker, hatchery, seller, buyer, expert, admin
 */
async function getRoleDashboard(req, res, next) {
  try {
    const { role = 'farmer', district = 'West Godavari' } = req.query;
    const roleData = await dashboardService.getRoleDashboard(role, district);
    res.status(200).json({ success: true, data: roleData });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/dashboard/notifications/:id/read
 */
async function markNotificationRead(req, res, next) {
  try {
    const notif = dashboardService.markNotificationRead(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverview,
  getRoleDashboard,
  markNotificationRead
};
