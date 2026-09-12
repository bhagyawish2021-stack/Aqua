'use strict';

const hatcheryService = require('../services/hatchery.service');

module.exports = {
  // GET /api/hatcheries/species
  async getSpeciesCategories(req, res, next) {
    try {
      const categories = hatcheryService.getSpeciesCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/hatcheries/hubs
  async getFarmerHubs(req, res, next) {
    try {
      const hubs = hatcheryService.getFarmerHubs();
      res.json({ success: true, data: hubs });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/hatcheries
  async getHatcheries(req, res, next) {
    try {
      const {
        species_category,
        district,
        search,
        farmer_hub,
        farmer_lat,
        farmer_lng,
        max_distance_km,
        min_rating,
        verified_only,
        in_stock_only,
        sort_by
      } = req.query;

      const results = hatcheryService.getHatcheries({
        species_category,
        district,
        search,
        farmer_hub,
        farmer_lat,
        farmer_lng,
        max_distance_km,
        min_rating,
        verified_only,
        in_stock_only,
        sort_by
      });

      res.json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/hatcheries/:id
  async getHatcheryById(req, res, next) {
    try {
      const { id } = req.params;
      const { farmer_hub, farmer_lat, farmer_lng } = req.query;

      const farmerCoords = {
        hub: farmer_hub,
        lat: farmer_lat ? parseFloat(farmer_lat) : null,
        lng: farmer_lng ? parseFloat(farmer_lng) : null
      };

      const hatchery = hatcheryService.getHatcheryById(id, farmerCoords);
      if (!hatchery) {
        return res.status(404).json({ success: false, message: 'Hatchery not found' });
      }

      res.json({ success: true, data: hatchery });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/hatcheries (Register hatchery)
  async createHatchery(req, res, next) {
    try {
      const ownerId = req.user?.id || 'user-hat-demo';
      const hatchery = hatcheryService.createHatchery(req.body, ownerId);
      res.status(201).json({
        success: true,
        message: 'Hatchery profile registered successfully. Verification request submitted to CAA/Admin.',
        data: hatchery
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/hatcheries/:id/verify (Admin verification)
  async verifyHatchery(req, res, next) {
    try {
      const { id } = req.params;
      const { is_approved, admin_notes } = req.body;
      const adminId = req.user?.id || 'admin-officer-01';

      const updated = hatcheryService.verifyHatchery(id, is_approved !== false, adminId);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Hatchery not found' });
      }

      res.json({
        success: true,
        message: is_approved !== false ? 'Hatchery CAA verification approved.' : 'Hatchery verification rejected.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/hatcheries/:id/products
  async addProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = hatcheryService.addProduct(id, req.body);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Hatchery not found' });
      }

      res.status(201).json({
        success: true,
        message: 'Seed batch/product added to hatchery inventory.',
        data: product
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/hatcheries/products/:productId
  async updateProduct(req, res, next) {
    try {
      const { productId } = req.params;
      const updated = hatcheryService.updateProduct(productId, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.json({
        success: true,
        message: 'Seed inventory updated.',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/hatcheries/orders (Farmer requests/orders seed)
  async createSeedOrder(req, res, next) {
    try {
      const farmerId = req.user?.id || req.body.farmer_id || 'farmer-demo-01';
      const farmerName = req.user?.fullName || req.body.farmer_name || 'Farmer';
      const farmerPhone = req.body.farmer_phone || '+91 98480 12345';

      const order = hatcheryService.createSeedOrder(req.body, farmerId, farmerName, farmerPhone);
      res.status(201).json({
        success: true,
        message: 'Seed request submitted successfully to the hatchery.',
        data: order
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // GET /api/hatcheries/orders/farmer (Farmer's seed orders)
  async getFarmerOrders(req, res, next) {
    try {
      const farmerId = req.query.farmer_id || req.user?.id;
      const orders = hatcheryService.getFarmerOrders(farmerId);
      res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/hatcheries/:id/orders (Hatchery's incoming requests)
  async getHatcheryOrders(req, res, next) {
    try {
      const { id } = req.params;
      const orders = hatcheryService.getHatcheryOrders(id);
      res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/hatcheries/orders/:orderId/status (Hatchery accepts/rejects)
  async updateOrderStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      const { status, rejection_reason } = req.body;

      const order = hatcheryService.updateOrderStatus(orderId, status, rejection_reason);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Seed order not found' });
      }

      res.json({
        success: true,
        message: `Order status updated to ${status}.`,
        data: order
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // POST /api/hatcheries/:id/reviews
  async addReview(req, res, next) {
    try {
      const { id } = req.params;
      const farmerId = req.user?.id || 'farmer-demo';
      const farmerName = req.body.farmer_name || 'Farmer';

      const review = hatcheryService.addReview(id, req.body, farmerId, farmerName);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Hatchery not found' });
      }

      res.status(201).json({
        success: true,
        message: 'Review and survival rating submitted.',
        data: review
      });
    } catch (err) {
      next(err);
    }
  }
};
