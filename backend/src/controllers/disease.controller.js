'use strict';

const diseaseAiService = require('../services/diseaseAi.service');

module.exports = {
  // POST /api/disease/analyze
  async analyzeSpecimen(req, res, next) {
    try {
      const farmerId = req.user?.id || req.body.farmer_id || 'farmer-demo';
      const analysis = diseaseAiService.analyzeDiseaseScreening(req.body, farmerId);

      res.status(201).json({
        success: true,
        message: 'AI disease screening assessment completed successfully.',
        data: analysis
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // GET /api/disease/history
  async getHistory(req, res, next) {
    try {
      const farmerId = req.user?.id || req.query.farmer_id;
      const history = diseaseAiService.getAllDiseaseHistory(farmerId);
      res.json({ success: true, count: history.length, data: history });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/disease/history/pond/:pondId
  async getPondHistory(req, res, next) {
    try {
      const { pondId } = req.params;
      const farmerId = req.user?.id || req.query.farmer_id;
      const history = diseaseAiService.getPondDiseaseHistory(pondId, farmerId);
      res.json({ success: true, count: history.length, data: history });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/disease/:id/expert-consultation
  async requestConsultation(req, res, next) {
    try {
      const { id } = req.params;
      const updated = diseaseAiService.requestExpertConsultation(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Screening log not found' });
      }

      res.json({
        success: true,
        message: 'Emergency consultation request dispatched to certified aquatic pathology specialists.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/disease/alerts
  async getAlerts(req, res, next) {
    try {
      const farmerId = req.user?.id || req.query.farmer_id;
      const alerts = diseaseAiService.getDiseaseAlerts(farmerId);
      res.json({ success: true, count: alerts.length, data: alerts });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/disease/alerts/:alertId/read
  async markAlertRead(req, res, next) {
    try {
      const { alertId } = req.params;
      const alert = diseaseAiService.markAlertAsRead(alertId);
      if (!alert) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }

      res.json({ success: true, message: 'Alert marked as read', data: alert });
    } catch (err) {
      next(err);
    }
  }
};
