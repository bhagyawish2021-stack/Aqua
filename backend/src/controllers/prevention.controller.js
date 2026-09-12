'use strict';

const preventionEngineService = require('../services/preventionEngine.service');

module.exports = {
  // POST /api/prevention/evaluate
  async evaluatePondHealth(req, res, next) {
    try {
      const farmerId = req.user?.id || req.body.farmer_id || 'farmer-demo';
      const assessment = preventionEngineService.evaluatePondHealth(req.body, farmerId);

      res.status(201).json({
        success: true,
        message: 'Pond health evaluation completed successfully.',
        data: assessment
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // GET /api/prevention/history
  async getHistory(req, res, next) {
    try {
      const farmerId = req.user?.id || req.query.farmer_id;
      const history = preventionEngineService.getAllHealthHistory(farmerId);
      res.json({ success: true, count: history.length, data: history });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/prevention/history/pond/:pondId
  async getPondHistory(req, res, next) {
    try {
      const { pondId } = req.params;
      const farmerId = req.user?.id || req.query.farmer_id;
      const history = preventionEngineService.getPondHealthHistory(pondId, farmerId);
      res.json({ success: true, count: history.length, data: history });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/prevention/tasks/:pondId
  async getPondTasks(req, res, next) {
    try {
      const { pondId } = req.params;
      const farmerId = req.user?.id || req.query.farmer_id;
      const tasksData = preventionEngineService.getPondTasks(pondId, farmerId);
      res.json({ success: true, data: tasksData });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/prevention/tasks/:taskId/toggle
  async toggleTask(req, res, next) {
    try {
      const { taskId } = req.params;
      const task = preventionEngineService.toggleTask(taskId);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      res.json({
        success: true,
        message: `Task marked as ${task.is_completed ? 'completed' : 'pending'}.`,
        data: task
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/prevention/notifications
  async getNotifications(req, res, next) {
    try {
      const farmerId = req.user?.id || req.query.farmer_id;
      const notifs = preventionEngineService.getNotifications(farmerId);
      res.json({ success: true, count: notifs.length, data: notifs });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/prevention/notifications/:id/read
  async markNotificationRead(req, res, next) {
    try {
      const { id } = req.params;
      const notif = preventionEngineService.markNotificationRead(id);
      if (!notif) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      res.json({ success: true, message: 'Notification marked as read', data: notif });
    } catch (err) {
      next(err);
    }
  }
};
