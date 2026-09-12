'use strict';

const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/overview', dashboardController.getOverview);
router.get('/role-view', dashboardController.getRoleDashboard);
router.patch('/notifications/:id/read', dashboardController.markNotificationRead);

module.exports = router;
