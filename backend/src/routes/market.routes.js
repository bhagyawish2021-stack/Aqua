'use strict';

const express = require('express');
const { body, param, query } = require('express-validator');
const marketController = require('../controllers/market.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Apply auth to extract user or fallback to demo user
router.use(authenticate);

// ─── Public / Farmer Routes ──────────────────────────────────────────────────
router.get('/overview', marketController.getOverview);
router.get('/species', marketController.getSpecies);
router.get('/locations', marketController.getLocations);

router.get(
  '/history/:priceId',
  [
    param('priceId').notEmpty().withMessage('Price ID is required.'),
    query('range').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Range must be daily, weekly, or monthly.'),
  ],
  marketController.getHistory
);

// ─── Watchlist ───────────────────────────────────────────────────────────────
router.get('/watchlist', marketController.getWatchlist);
router.post('/watchlist/:priceId', marketController.addToWatchlist);
router.delete('/watchlist/:priceId', marketController.removeFromWatchlist);

// ─── Alerts ──────────────────────────────────────────────────────────────────
router.get('/alerts', marketController.getAlerts);

router.post(
  '/alerts',
  [
    body('species_id').notEmpty().withMessage('Species ID is required.'),
    body('location_id').notEmpty().withMessage('Location ID is required.'),
    body('variety').notEmpty().withMessage('Variety / grade is required.'),
    body('target_price').isFloat({ min: 1 }).withMessage('Valid target price is required.'),
    body('alert_condition').optional().isIn(['above', 'below', 'equal']).withMessage('Invalid alert condition.'),
  ],
  marketController.createAlert
);

router.delete('/alerts/:alertId', marketController.deleteAlert);

// ─── AquaSangham Live Table Endpoints ────────────────────────────────────────
router.get('/aquasangham/live', marketController.getAquaSanghamLive);
router.post('/aquasangham/sync', marketController.syncAquaSanghamLive);
router.post(
  '/aquasangham/update-rate',
  [
    body('count').notEmpty().withMessage('Count identifier is required.'),
    body('new_price').isFloat({ min: 1 }).withMessage('Valid positive rate is required.'),
  ],
  marketController.updateAquaSanghamRate
);
router.post('/aquasangham/reset-rates', marketController.resetAquaSanghamRates);

module.exports = router;
