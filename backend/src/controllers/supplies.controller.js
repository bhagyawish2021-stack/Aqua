'use strict';

const { validationResult } = require('express-validator');
const { ApiError } = require('../middleware/errorHandler');
const suppliesService = require('../services/supplies.service');

const DEFAULT_FARMER_ID = 'farmer-demo';
const DEFAULT_SELLER_ID = 'seller-godavari-01';

/**
 * GET /api/supplies/categories
 */
async function getCategories(req, res, next) {
  try {
    const categories = suppliesService.getCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/supplies/products
 */
async function getProducts(req, res, next) {
  try {
    const {
      category,
      species,
      guidance_required,
      search,
      min_price,
      max_price,
      in_stock_only,
      seller_id,
      sort_by
    } = req.query;

    const products = suppliesService.getProducts({
      category,
      species,
      guidance_required,
      search,
      min_price,
      max_price,
      in_stock_only,
      seller_id,
      sort_by
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/supplies/products/:id
 */
async function getProductById(req, res, next) {
  try {
    const product = suppliesService.getProductById(req.params.id);
    if (!product) {
      throw new ApiError(404, 'Aquaculture product not found');
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/supplies/products
 * Seller adds new approved farm supply or medicine
 */
async function createProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const sellerId = req.userId || req.headers['x-seller-id'] || DEFAULT_SELLER_ID;
    const sellerName = req.body.seller_name || 'Godavari Aqua Health Depot';

    const product = suppliesService.createProduct(req.body, sellerId, sellerName);
    res.status(201).json({
      success: true,
      message: 'Product listed successfully in aquaculture marketplace',
      data: product
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/supplies/products/:id/stock
 * Seller updates inventory count
 */
async function updateProductStock(req, res, next) {
  try {
    const { stock_quantity } = req.body;
    if (stock_quantity === undefined || stock_quantity < 0) {
      throw new ApiError(400, 'Valid non-negative stock_quantity is required');
    }

    const product = suppliesService.updateProductStock(req.params.id, stock_quantity);
    if (!product) {
      throw new ApiError(404, 'Aquaculture product not found');
    }

    res.status(200).json({
      success: true,
      message: 'Product stock updated',
      data: product
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/supplies/orders
 * Farmer checks out cart
 */
async function placeOrder(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const farmerId = req.userId || req.headers['x-farmer-id'] || DEFAULT_FARMER_ID;
    const farmerName = req.body.farmer_name || req.userName || 'Aqua Farmer';
    const farmerPhone = req.body.farmer_phone || '+91 98480 12345';

    const order = suppliesService.placeOrder(req.body, farmerId, farmerName, farmerPhone);

    res.status(201).json({
      success: true,
      message: 'Farm supplies order placed successfully',
      data: order
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/supplies/orders/farmer
 * Farmer views purchase history
 */
async function getFarmerOrders(req, res, next) {
  try {
    const farmerId = req.userId || req.headers['x-farmer-id'] || DEFAULT_FARMER_ID;
    const orders = suppliesService.getFarmerOrders(farmerId);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/supplies/orders/seller/:sellerId
 * Seller views incoming orders
 */
async function getSellerOrders(req, res, next) {
  try {
    const sellerId = req.params.sellerId || DEFAULT_SELLER_ID;
    const orders = suppliesService.getSellerOrders(sellerId);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/supplies/orders/:id/status
 * Update order status (confirmed, shipped, delivered, cancelled)
 */
async function updateOrderStatus(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { status, tracking_number, courier_partner, estimated_delivery_date, cancelled_reason } = req.body;
    const updated = suppliesService.updateOrderStatus(
      req.params.id,
      status,
      { tracking_number, courier_partner, estimated_delivery_date, cancelled_reason }
    );

    if (!updated) {
      throw new ApiError(404, 'Supplies order not found');
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/supplies/products/:id/reviews
 * Farmer submits product review
 */
async function submitProductReview(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const farmerId = req.userId || req.headers['x-farmer-id'] || DEFAULT_FARMER_ID;
    const farmerName = req.body.farmer_name || 'Verified Farmer';

    const review = suppliesService.submitProductReview(
      req.params.id,
      req.body,
      farmerId,
      farmerName
    );

    if (!review) {
      throw new ApiError(404, 'Aquaculture product not found');
    }

    res.status(201).json({
      success: true,
      message: 'Product review submitted successfully',
      data: review
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCategories,
  getProducts,
  getProductById,
  createProduct,
  updateProductStock,
  placeOrder,
  getFarmerOrders,
  getSellerOrders,
  updateOrderStatus,
  submitProductReview
};
