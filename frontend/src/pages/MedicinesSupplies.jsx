import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
} from '../services/suppliesService';

const SPECIES_LIST = [
  'All Species',
  'Vannamei Shrimp',
  'Black Tiger Shrimp',
  'Tilapia',
  'Catla & Rohu',
  'Seabass',
  'Mud Crab'
];

const DISTRICTS = [
  'West Godavari',
  'East Godavari',
  'Nellore',
  'Krishna',
  'Bapatla',
  'Guntur',
  'Visakhapatnam'
];

export default function MedicinesSupplies() {
  const navigate = useNavigate();

  // Navigation tabs: 'marketplace' | 'my_orders' | 'seller_portal'
  const [activeMainTab, setActiveMainTab] = useState('marketplace');

  // Categories & Filters
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState('All Species');
  const [searchQuery, setSearchQuery] = useState('');
  const [guidanceFilter, setGuidanceFilter] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'price_asc' | 'price_desc' | 'reviews'

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  // Selected Product Detail Modal
  const [viewingProduct, setViewingProduct] = useState(null);

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    delivery_address: 'Pond No. 4, Canal Road, Undi Mandal',
    district: 'West Godavari',
    state: 'Andhra Pradesh',
    farmer_name: 'Aqua Farmer',
    farmer_phone: '+91 98480 12345',
    payment_method: 'cash_on_delivery',
    order_notes: ''
  });

  // Orders State (Farmer tracking)
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Review Modal
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Seller Portal State
  const [sellerId, setSellerId] = useState('seller-godavari-01');
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loadingSellerOrders, setLoadingSellerOrders] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'probiotics',
    manufacturer: '',
    purpose: '',
    composition_active_ingredients: '',
    dosage_guidelines: '',
    application_method: '',
    safety_precautions: '',
    price: '',
    unit: '1 kg container',
    stock_quantity: 30,
    requires_professional_guidance: false,
    caa_or_govt_approval_no: 'CAA/REG/MED/2026/0890'
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Reload products/orders when tabs or filters change
  useEffect(() => {
    if (activeMainTab === 'marketplace') {
      loadProducts();
    } else if (activeMainTab === 'my_orders') {
      loadFarmerOrdersList();
    } else if (activeMainTab === 'seller_portal') {
      loadSellerOrdersList();
    }
  }, [activeMainTab, selectedCategory, selectedSpecies, searchQuery, guidanceFilter, sortBy, sellerId]);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      if (res.data && res.data.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    setProductError(null);
    try {
      const params = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        species: selectedSpecies !== 'All Species' ? selectedSpecies : undefined,
        guidance_required: guidanceFilter ? 'true' : undefined,
        search: searchQuery.trim() || undefined,
        sort_by: sortBy
      };
      const res = await getProducts(params);
      setProducts(res.data?.data || []);
    } catch (err) {
      setProductError('Failed to load farm supplies catalog.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadFarmerOrdersList = async () => {
    setLoadingOrders(true);
    try {
      const res = await getFarmerOrders();
      setFarmerOrders(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load farmer orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadSellerOrdersList = async () => {
    setLoadingSellerOrders(true);
    try {
      const res = await getSellerOrders(sellerId);
      setSellerOrders(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load seller orders', err);
    } finally {
      setLoadingSellerOrders(false);
    }
  };

  // Cart Management
  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          unit: product.unit,
          image_url: product.image_url,
          requires_guidance: product.requires_professional_guidance,
          quantity: 1
        }
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartShipping = cartSubtotal >= 2000 || cartSubtotal === 0 ? 0 : 150;
  const cartTotal = cartSubtotal + cartShipping;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setCheckoutSubmitting(true);
    try {
      const orderPayload = {
        delivery_address: checkoutForm.delivery_address,
        district: checkoutForm.district,
        state: checkoutForm.state,
        farmer_name: checkoutForm.farmer_name,
        farmer_phone: checkoutForm.farmer_phone,
        payment_method: checkoutForm.payment_method,
        order_notes: checkoutForm.order_notes,
        items: cart.map((c) => ({
          product_id: c.product_id,
          quantity: c.quantity
        }))
      };

      const res = await placeOrder(orderPayload);
      setCheckoutSuccess(res.data?.data);
      setCart([]);
      loadProducts(); // Refresh stock counts
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleSellerStatusChange = async (orderId, newStatus) => {
    try {
      const extra = {};
      if (newStatus === 'shipped') {
        extra.tracking_number = `AQLOG-EXP-${Date.now().toString().slice(-4)}`;
        extra.courier_partner = 'AquaFast Rural Logistics';
      }
      await updateOrderStatus(orderId, { status: newStatus, ...extra });
      loadSellerOrdersList();
      loadFarmerOrdersList();
    } catch (err) {
      alert('Status update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStockUpdate = async (productId, newQty) => {
    try {
      await updateProductStock(productId, newQty);
      loadProducts();
      alert('Inventory stock updated successfully');
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(newProductForm);
      setShowAddProductModal(false);
      setNewProductForm({
        name: '',
        category: 'probiotics',
        manufacturer: '',
        purpose: '',
        composition_active_ingredients: '',
        dosage_guidelines: '',
        application_method: '',
        safety_precautions: '',
        price: '',
        unit: '1 kg container',
        stock_quantity: 30,
        requires_professional_guidance: false,
        caa_or_govt_approval_no: 'CAA/REG/MED/2026/0890'
      });
      loadProducts();
      alert('New approved product listed successfully!');
    } catch (err) {
      alert('Failed to list product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingItem) return;

    setReviewSubmitting(true);
    try {
      await submitProductReview(reviewingItem.product_id, {
        order_id: reviewingItem.order_id,
        rating: reviewRating,
        review_text: reviewText
      });
      alert('Thank you for rating! Your review is now published.');
      setReviewingItem(null);
      setReviewText('');
      loadProducts();
    } catch (err) {
      alert('Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Gradient Banner */}
      <div className="supplies-header-gradient">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                PHASE 8 APPROVED MARKETPLACE
              </span>
              <span style={{ background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                ✓ CAA & GOVERNMENT COMPLIANT
              </span>
            </div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800' }}>
              Aquaculture Medicines & Farm Supplies
            </h1>
            <p style={{ margin: 0, fontSize: '15px', opacity: 0.9, maxWidth: '780px', lineHeight: '1.5' }}>
              Procure certified probiotics, oxygen enhancers, ionic minerals, feed additives, and biosecurity sanitizers.
              Strictly non-banned, lab-tested formulations with official manufacturer dosage guidelines.
            </p>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
            <button
              onClick={() => setActiveMainTab('marketplace')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeMainTab === 'marketplace' ? '#ffffff' : 'transparent',
                color: activeMainTab === 'marketplace' ? '#0f766e' : '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              🛒 Marketplace
            </button>
            <button
              onClick={() => setActiveMainTab('my_orders')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeMainTab === 'my_orders' ? '#ffffff' : 'transparent',
                color: activeMainTab === 'my_orders' ? '#0f766e' : '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              📦 My Orders ({farmerOrders.length})
            </button>
            <button
              onClick={() => setActiveMainTab('seller_portal')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeMainTab === 'seller_portal' ? '#ffffff' : 'transparent',
                color: activeMainTab === 'seller_portal' ? '#0f766e' : '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              🏪 Seller Management
            </button>
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          className="cart-float-btn"
          onClick={() => {
            setCheckoutSuccess(null);
            setIsCartOpen(true);
          }}
        >
          <span>🛍️ View Cart</span>
          <span className="cart-count-badge">{totalCartCount}</span>
          <span>• ₹{cartTotal}</span>
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: MARKETPLACE CATALOG
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'marketplace' && (
        <div>
          {/* Category Chips Carousel */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`spec-category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              <span>🌐</span>
              <span>All Farm Supplies</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`spec-category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Search, Filter by Species, Guidance & Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '24px' }}>
            <div style={{ flex: '1 1 260px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand, purpose, active ingredient (e.g. Bacillus, Iodine)..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ minWidth: '160px' }}>
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '14px',
                  background: '#ffffff'
                }}
              >
                {SPECIES_LIST.map((sp) => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={guidanceFilter}
                  onChange={(e) => setGuidanceFilter(e.target.checked)}
                />
                ⚠️ Specialist Guidance Required Only
              </label>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  background: '#ffffff'
                }}
              >
                <option value="rating">⭐ Top Rated</option>
                <option value="price_asc">💰 Price: Low to High</option>
                <option value="price_desc">💰 Price: High to Low</option>
                <option value="reviews">💬 Most Reviewed</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loadingProducts ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔄</div>
              Loading certified farm formulations...
            </div>
          ) : productError ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#fef2f2', borderRadius: '12px', color: '#991b1b' }}>
              {productError}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📦</div>
              <h3 style={{ margin: '0 0 6px 0' }}>No products match your criteria</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Try selecting 'All Farm Supplies' or adjusting search terms.</p>
            </div>
          ) : (
            <div className="supplies-grid">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="product-card"
                  onClick={() => setViewingProduct(prod)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    {/* Thumbnail box */}
                    <div className="product-thumb-box">
                      <img src={prod.image_url} alt={prod.name} />
                      <span className="badge-approval">✓ Approved: {prod.caa_or_govt_approval_no}</span>
                      <span className="badge-category">{prod.category_label}</span>
                    </div>

                    <div style={{ padding: '16px 16px 0 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                          {prod.name}
                        </h3>
                      </div>
                      <div style={{ fontSize: '12px', color: '#0f766e', fontWeight: '700', marginBottom: '6px' }}>
                        By {prod.manufacturer}
                      </div>

                      {/* Purpose */}
                      <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {prod.purpose}
                      </p>

                      {/* Guidance Warning if required */}
                      {prod.requires_professional_guidance && (
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '6px 8px', fontSize: '11px', color: '#92400e', marginBottom: '10px' }}>
                          ⚠️ Specialist Consultation Advised
                        </div>
                      )}

                      {/* Target species tags */}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {prod.target_species?.slice(0, 3).map((sp) => (
                          <span key={sp} style={{ background: '#f1f5f9', color: '#475569', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                            {sp}
                          </span>
                        ))}
                      </div>

                      {/* Stock & Expiry */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>
                        <span>Exp: {prod.expiry_date}</span>
                        <span style={{ color: prod.stock_quantity > 10 ? '#166534' : '#b45309', fontWeight: '700' }}>
                          {prod.stock_quantity > 0 ? `In Stock (${prod.stock_quantity})` : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action footer */}
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f766e' }}>
                        ₹{prod.price}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {prod.unit}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => handleAddToCart(prod, e)}
                        disabled={!prod.is_in_stock || prod.stock_quantity === 0}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          background: prod.is_in_stock ? '#0f766e' : '#cbd5e1',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: prod.is_in_stock ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        🛒 Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: FARMER PURCHASE HISTORY & ORDER TRACKING
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'my_orders' && (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800' }}>Farm Supplies Purchase History</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                Track courier dispatch, delivery status, and submit verified product feedback.
              </p>
            </div>
            <button
              onClick={loadFarmerOrdersList}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              Loading purchase records...
            </div>
          ) : farmerOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '42px', marginBottom: '12px' }}>📦</div>
              <h3 style={{ margin: '0 0 6px 0' }}>No supply orders placed yet</h3>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>
                Explore government-approved probiotics, emergency oxygen, and bio-minerals for your pond.
              </p>
              <button
                onClick={() => setActiveMainTab('marketplace')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#0f766e',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            <div>
              {farmerOrders.map((ord) => {
                const stepIndex = ['placed', 'confirmed', 'shipped', 'delivered'].indexOf(ord.status);
                const percent = stepIndex >= 0 ? (stepIndex / 3) * 100 : 0;

                return (
                  <div key={ord.id} className="appointment-record-card">
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{ord.order_number}</span>
                          <span className={`status-pill status-pill-${ord.status}`}>
                            {ord.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                          Placed on: {new Date(ord.created_at).toLocaleDateString()} • Payment: {ord.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'UPI'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f766e' }}>
                          ₹{ord.total_amount}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {ord.items.length} item(s) • Ship: {ord.shipping_fee === 0 ? 'FREE' : `₹${ord.shipping_fee}`}
                        </div>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    {ord.status !== 'cancelled' && (
                      <div className="tracking-step-container">
                        <div className="tracking-step-line">
                          <div className="tracking-step-line-fill" style={{ width: `${percent}%` }} />
                        </div>
                        {[
                          { id: 'placed', label: 'Placed' },
                          { id: 'confirmed', label: 'Confirmed' },
                          { id: 'shipped', label: 'Shipped' },
                          { id: 'delivered', label: 'Delivered' }
                        ].map((step, idx) => {
                          const isPassed = stepIndex > idx;
                          const isActive = stepIndex === idx;
                          return (
                            <div key={step.id} className="tracking-step-node">
                              <div className={`tracking-node-circle ${isActive ? 'active' : isPassed ? 'passed' : ''}`}>
                                {isPassed ? '✓' : idx + 1}
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: isActive ? '700' : '600', color: isActive ? '#0f766e' : '#64748b' }}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Delivery & Tracking Details */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px', color: '#334155' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                        <div>
                          <strong style={{ color: '#0f172a' }}>Delivery Address: </strong>
                          <span>{ord.delivery_address}, {ord.district}, {ord.state}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#0f172a' }}>Courier Partner: </strong>
                          <span>{ord.courier_partner || 'AquaLogistics Fleet'}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#0f172a' }}>Tracking ID: </strong>
                          <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>{ord.tracking_number}</span>
                        </div>
                        <div>
                          <strong style={{ color: '#0f172a' }}>Est. Delivery: </strong>
                          <span>{ord.estimated_delivery_date || 'In 2-3 Days'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Table */}
                    <div style={{ border: '1px solid #f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                      {ord.items.map((it, i) => (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            borderBottom: i < ord.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                            fontSize: '13px'
                          }}
                        >
                          <div>
                            <strong style={{ color: '#0f172a' }}>{it.product_name}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              ₹{it.unit_price} x {it.quantity} ({it.unit || 'unit'})
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: '700', color: '#0f766e' }}>₹{it.subtotal}</span>
                            {ord.status === 'delivered' && (
                              <button
                                onClick={() => setReviewingItem({ product_id: it.product_id, order_id: ord.id, product_name: it.product_name })}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #eab308',
                                  background: '#fef9c3',
                                  color: '#854d0e',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                ⭐ Rate
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: SELLER INVENTORY & ORDER MANAGEMENT PORTAL
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'seller_portal' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Seller Session Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>
                Authorized Vendor Fulfillment Console
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#14532d', marginTop: '2px' }}>
                Godavari Aqua Health Depot (CAA Licensed)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowAddProductModal(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#047857',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(4,120,87,0.3)'
                }}
              >
                + Add Approved Product
              </button>
            </div>
          </div>

          {/* Incoming Orders Table */}
          <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '800' }}>Incoming Farm Orders to Dispatch</h3>

          {loadingSellerOrders ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              Loading vendor orders...
            </div>
          ) : sellerOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ fontSize: '38px', marginBottom: '8px' }}>📬</div>
              <h4 style={{ margin: '0 0 6px 0' }}>No pending orders</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                Orders placed by nearby aquaculture farmers will appear here for packing & shipping.
              </p>
            </div>
          ) : (
            <div>
              {sellerOrders.map((ord) => (
                <div key={ord.id} className="appointment-record-card" style={{ borderLeft: '4px solid #0f766e' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800' }}>{ord.order_number}</span>
                        <span className={`status-pill status-pill-${ord.status}`}>
                          {ord.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
                        Customer: {ord.farmer_name} ({ord.farmer_phone})
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Delivery Destination: {ord.delivery_address}, {ord.district}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f766e' }}>
                        Total: ₹{ord.total_amount}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Payment Mode: {ord.payment_method.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px' }}>
                    <strong style={{ color: '#0f172a' }}>Ordered Items: </strong>
                    {ord.items.map((it, idx) => (
                      <span key={idx} style={{ marginRight: '12px' }}>
                        • {it.product_name} x <strong>{it.quantity}</strong> (₹{it.subtotal})
                      </span>
                    ))}
                  </div>

                  {/* Status Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                    {ord.status === 'placed' && (
                      <button
                        onClick={() => handleSellerStatusChange(ord.id, 'confirmed')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#047857',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Confirm Order & Pack
                      </button>
                    )}

                    {ord.status === 'confirmed' && (
                      <button
                        onClick={() => handleSellerStatusChange(ord.id, 'shipped')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#0284c7',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        🚚 Dispatch / Mark Shipped
                      </button>
                    )}

                    {ord.status === 'shipped' && (
                      <button
                        onClick={() => handleSellerStatusChange(ord.id, 'delivered')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#16a34a',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        ✅ Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Inventory Stock Editor */}
          <h3 style={{ margin: '28px 0 12px 0', fontSize: '18px', fontWeight: '800' }}>Live Inventory Stock Levels</h3>
          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>Product</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Price</th>
                  <th style={{ padding: '12px 16px' }}>Available Stock</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700' }}>{p.name}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{p.category_label}</td>
                    <td style={{ padding: '12px 16px', color: '#0f766e', fontWeight: '700' }}>₹{p.price}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: p.stock_quantity > 5 ? '#166534' : '#b91c1c', fontWeight: '700' }}>
                        {p.stock_quantity} {p.unit}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          const newQ = prompt(`Update stock quantity for ${p.name}:`, p.stock_quantity);
                          if (newQ !== null) handleStockUpdate(p.id, newQ);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PRODUCT DETAILS & VERIFIED USAGE
      ───────────────────────────────────────────────────────────── */}
      {viewingProduct && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content" style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge-approval" style={{ position: 'static', display: 'inline-block', marginBottom: '6px' }}>
                  ✓ CAA License: {viewingProduct.caa_or_govt_approval_no}
                </span>
                <h2 style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: '800' }}>{viewingProduct.name}</h2>
                <div style={{ fontSize: '13px', color: '#0f766e', fontWeight: '700' }}>
                  Brand: {viewingProduct.brand_name} • Manufacturer: {viewingProduct.manufacturer}
                </div>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* If product requires consultation, display prominent advisory */}
            {viewingProduct.requires_professional_guidance && (
              <div className="consultation-warning-banner">
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <strong>Specialist Consultation Advised:</strong>
                  <div>{viewingProduct.guidance_warning_note}</div>
                  <button
                    onClick={() => {
                      setViewingProduct(null);
                      navigate('/consultations');
                    }}
                    style={{
                      marginTop: '8px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#047857',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    👨‍⚕️ Consult Verified Aquaculture Veterinarian
                  </button>
                </div>
              </div>
            )}

            {/* Purpose & Species */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', marginBottom: '14px' }}>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                <strong style={{ color: '#0f172a' }}>Purpose: </strong>
                <span style={{ color: '#334155' }}>{viewingProduct.purpose}</span>
              </div>
              <div style={{ marginBottom: '8px', fontSize: '13px' }}>
                <strong style={{ color: '#0f172a' }}>Target Species: </strong>
                <span>{viewingProduct.target_species?.join(', ')}</span>
              </div>
              <div style={{ fontSize: '13px' }}>
                <strong style={{ color: '#0f172a' }}>Active Composition: </strong>
                <span>{viewingProduct.composition_active_ingredients}</span>
              </div>
            </div>

            {/* Verified Manufacturer Usage Guidelines */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                📋 Official Manufacturer Usage Guidelines
              </h4>
              <div style={{ fontSize: '13px', marginBottom: '8px', lineHeight: '1.5' }}>
                <strong>Recommended Dosage: </strong>
                <span>{viewingProduct.dosage_guidelines}</span>
              </div>
              <div style={{ fontSize: '13px', marginBottom: '8px', lineHeight: '1.5' }}>
                <strong>Application Method: </strong>
                <span>{viewingProduct.application_method}</span>
              </div>
              <div style={{ fontSize: '13px', marginBottom: '8px', color: '#b91c1c' }}>
                <strong>Safety Precautions: </strong>
                <span>{viewingProduct.safety_precautions}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Withdrawal Period: <strong>{viewingProduct.withdrawal_period_days === 0 ? '0 Days (No Residues)' : `${viewingProduct.withdrawal_period_days} Days`}</strong>
              </div>
            </div>

            {/* Technical Specs: Batch, Expiry, Seller */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px', background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Batch No:</span>
                <div style={{ fontWeight: '700' }}>{viewingProduct.batch_number}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Expiry Date:</span>
                <div style={{ fontWeight: '700' }}>{viewingProduct.expiry_date}</div>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Seller:</span>
                <div style={{ fontWeight: '700' }}>{viewingProduct.seller_name}</div>
              </div>
            </div>

            {/* Reviews list if available */}
            {viewingProduct.reviews?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '800' }}>Farmer Reviews</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                  {viewingProduct.reviews.map((rev) => (
                    <div key={rev.id} style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <strong>{rev.farmer_name}</strong>
                        <span style={{ color: '#eab308' }}>{'★'.repeat(rev.rating)}</span>
                      </div>
                      <span style={{ color: '#475569' }}>{rev.review_text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Add to Cart Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Unit Price:</span>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f766e' }}>
                  ₹{viewingProduct.price} <span style={{ fontSize: '12px', fontWeight: '400', color: '#64748b' }}>/ {viewingProduct.unit}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setViewingProduct(null)}
                  style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(viewingProduct);
                    setViewingProduct(null);
                  }}
                  disabled={!viewingProduct.is_in_stock || viewingProduct.stock_quantity === 0}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: viewingProduct.is_in_stock ? '#0f766e' : '#cbd5e1',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: viewingProduct.is_in_stock ? 'pointer' : 'not-allowed',
                    boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)'
                  }}
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          DRAWER: CART & CHECKOUT
      ───────────────────────────────────────────────────────────── */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                Your Farm Supplies Cart ({totalCartCount})
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {checkoutSuccess ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#0f766e', fontSize: '20px' }}>
                  Order Placed Successfully!
                </h3>
                <p style={{ margin: '0 0 16px 0', color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
                  Order Reference: <strong>{checkoutSuccess.order_number}</strong>.
                  The supplier has been notified to dispatch. Track status anytime under <em>My Orders</em>.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActiveMainTab('my_orders');
                  }}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0f766e',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Track Order
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '42px', marginBottom: '10px' }}>🛒</div>
                <h4 style={{ margin: '0 0 6px 0' }}>Your cart is empty</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Add probiotics, minerals or test kits to proceed.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                {/* Cart Items List */}
                <div style={{ padding: '16px', flex: '1 0 auto' }}>
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '12px',
                        border: '1px solid #f1f5f9',
                        borderRadius: '10px',
                        marginBottom: '10px'
                      }}
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#0f766e', fontWeight: '700' }}>₹{item.price}</div>
                        {item.requires_guidance && (
                          <span style={{ fontSize: '10px', color: '#b45309', fontWeight: '700' }}>⚠️ Guidance Advised</span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, -1)}
                          style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product_id, 1)}
                          style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.product_id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '14px', cursor: 'pointer', marginLeft: '4px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Address & Payment Form */}
                <form onSubmit={handleCheckout} style={{ padding: '16px', background: '#f8fafc', borderTop: '1px solid var(--border)' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800' }}>Delivery & Farm Address</h4>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Delivery Address:</label>
                    <input
                      type="text"
                      value={checkoutForm.delivery_address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, delivery_address: e.target.value })}
                      required
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>District:</label>
                      <select
                        value={checkoutForm.district}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, district: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', background: '#fff' }}
                      >
                        {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Contact Phone:</label>
                      <input
                        type="tel"
                        value={checkoutForm.farmer_phone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, farmer_phone: e.target.value })}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Payment Mode:</label>
                    <select
                      value={checkoutForm.payment_method}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, payment_method: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', background: '#fff' }}
                    >
                      <option value="cash_on_delivery">💵 Cash on Delivery (COD)</option>
                      <option value="upi_qr">📱 UPI / QR Code on Delivery</option>
                    </select>
                  </div>

                  {/* Summary Totals */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginBottom: '14px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#64748b' }}>
                      <span>Subtotal:</span>
                      <span>₹{cartSubtotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#64748b' }}>
                      <span>Delivery Shipping:</span>
                      <span>{cartShipping === 0 ? 'FREE (Orders > ₹2,000)' : `₹${cartShipping}`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#0f766e', marginTop: '6px' }}>
                      <span>Total Amount:</span>
                      <span>₹{cartTotal}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={checkoutSubmitting}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#0f766e',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)'
                    }}
                  >
                    {checkoutSubmitting ? 'Placing Order...' : `Place Order (₹${cartTotal})`}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADD APPROVED PRODUCT (SELLER)
      ───────────────────────────────────────────────────────────── */}
      {showAddProductModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content" style={{ maxWidth: '640px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
              List Government / CAA Approved Aquaculture Product
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px' }}>
              Please provide certified manufacturer specifications and label details.
            </p>

            <form onSubmit={handleCreateProductSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Product Name:</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    placeholder="e.g. BioClean Aqua Probiotic"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Category:</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', background: '#fff' }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Manufacturer:</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.manufacturer}
                    onChange={(e) => setNewProductForm({ ...newProductForm, manufacturer: e.target.value })}
                    placeholder="e.g. Coastal BioAg Pvt Ltd"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>CAA/Govt License No:</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.caa_or_govt_approval_no}
                    onChange={(e) => setNewProductForm({ ...newProductForm, caa_or_govt_approval_no: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Product Purpose:</label>
                <textarea
                  rows={2}
                  required
                  value={newProductForm.purpose}
                  onChange={(e) => setNewProductForm({ ...newProductForm, purpose: e.target.value })}
                  placeholder="e.g. Digestion of black soil sludge and hydrogen sulfide reduction"
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Manufacturer Dosage Guidelines:</label>
                <textarea
                  rows={2}
                  required
                  value={newProductForm.dosage_guidelines}
                  onChange={(e) => setNewProductForm({ ...newProductForm, dosage_guidelines: e.target.value })}
                  placeholder="e.g. 500g per hectare weekly with morning aeration"
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Price (₹):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    placeholder="1200"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Unit Label:</label>
                  <input
                    type="text"
                    value={newProductForm.unit}
                    onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Initial Stock:</label>
                  <input
                    type="number"
                    min="1"
                    value={newProductForm.stock_quantity}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stock_quantity: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newProductForm.requires_professional_guidance}
                    onChange={(e) => setNewProductForm({ ...newProductForm, requires_professional_guidance: e.target.checked })}
                  />
                  ⚠️ Requires Professional Supervision / Clinical Guidance before application
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#047857', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  List Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: RATE DELIVERED PRODUCT (FARMER)
      ───────────────────────────────────────────────────────────── */}
      {reviewingItem && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content" style={{ maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
              Rate & Review Product
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px' }}>
              Product: <strong>{reviewingItem.product_name}</strong>
            </p>

            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                  Rating (1 to 5 Stars):
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        fontSize: '24px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: star <= reviewRating ? '#eab308' : '#cbd5e1'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Your Experience:
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How effective was this formulation in your pond?"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0f766e', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
