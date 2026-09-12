import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import * as hatcheryService from '../services/hatcheryService';

export default function HatcheryDiscovery() {
  // State
  const [lang, setLang] = useState('en'); // 'en' | 'te'
  const [loading, setLoading] = useState(true);
  const [hatcheries, setHatcheries] = useState([]);
  const [speciesCategories, setSpeciesCategories] = useState([]);
  const [farmerHubs, setFarmerHubs] = useState([]);

  // Filters
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedHub, setSelectedHub] = useState('bhimavaram');
  const [userCoords, setUserCoords] = useState(null);
  const [maxDistance, setMaxDistance] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'distance', 'experience', 'price_asc'

  // Modals
  const [selectedHatchery, setSelectedHatchery] = useState(null);
  const [orderModalData, setOrderModalData] = useState(null); // { hatchery, product }
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(null); // hatcheryId

  // Orders state
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Forms
  const [orderForm, setOrderForm] = useState({
    quantity: 100000,
    required_date: '',
    delivery_location: '',
    pond_salinity_ppt: 15,
    farmer_name: 'V. Ramana Murthy',
    farmer_phone: '+91 98480 12345',
    notes: 'Please pack in double-poly bags with 24-hr oxygenation.'
  });

  const [registerForm, setRegisterForm] = useState({
    name: '',
    registration_number: '',
    caa_license_number: '',
    contact_person: '',
    phone: '',
    whatsapp: '',
    address: '',
    district: 'East Godavari',
    state: 'Andhra Pradesh',
    latitude: 16.98,
    longitude: 82.24,
    experience_years: 5,
    bio: '',
    quality_standards: 'PCR Negative tested, SIS Hawaii broodstock'
  });

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    seed_survival_rate: 98,
    farmer_name: 'Progressive Farmer',
    farmer_location: 'Bhimavaram',
    review_text: ''
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Load: species & hubs
  useEffect(() => {
    async function loadMeta() {
      try {
        const [spRes, hubRes] = await Promise.all([
          hatcheryService.getSpeciesCategories(),
          hatcheryService.getFarmerHubs()
        ]);
        if (spRes.data?.data) setSpeciesCategories(spRes.data.data);
        if (hubRes.data?.data) setFarmerHubs(hubRes.data.data);
      } catch (err) {
        console.error('Failed loading metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // 2. Fetch Hatcheries on filter change
  const fetchHatcheries = async () => {
    setLoading(true);
    try {
      const params = {
        species_category: selectedSpecies,
        farmer_hub: userCoords ? undefined : selectedHub,
        farmer_lat: userCoords?.lat,
        farmer_lng: userCoords?.lng,
        search: searchQuery,
        verified_only: verifiedOnly ? 'true' : undefined,
        in_stock_only: inStockOnly ? 'true' : undefined,
        max_distance_km: maxDistance || undefined,
        sort_by: sortBy
      };
      const res = await hatcheryService.getHatcheries(params);
      if (res.data?.data) {
        setHatcheries(res.data.data);
      }
    } catch (err) {
      console.error('Failed fetching hatcheries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHatcheries();
  }, [selectedSpecies, selectedHub, userCoords, maxDistance, verifiedOnly, inStockOnly, sortBy]);

  // Handle Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    fetchHatcheries();
  };

  // GPS Locate
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        showToast('📍 Live GPS location acquired. Hatchery distances updated!');
      },
      (err) => {
        alert('Could not get your location. Defaulting to selected aquaculture hub.');
      }
    );
  };

  // Fetch Orders
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await hatcheryService.getFarmerOrders();
      if (res.data?.data) {
        setFarmerOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed loading orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Open Seed Order Modal
  const openOrderModal = (hatchery, product) => {
    setOrderModalData({ hatchery, product });
    const defaultQty = product.min_order_quantity || 50000;
    setOrderForm(prev => ({
      ...prev,
      quantity: defaultQty,
      required_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    }));
  };

  // Submit Seed Order
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (!orderModalData) return;
    try {
      const payload = {
        hatchery_id: orderModalData.hatchery.id,
        product_id: orderModalData.product.id,
        quantity: orderForm.quantity,
        required_date: orderForm.required_date,
        delivery_location: orderForm.delivery_location || `${orderModalData.hatchery.district} Coastal Farm Gate`,
        pond_salinity_ppt: orderForm.pond_salinity_ppt,
        farmer_name: orderForm.farmer_name,
        farmer_phone: orderForm.farmer_phone,
        notes: orderForm.notes
      };
      const res = await hatcheryService.createSeedOrder(payload);
      if (res.data?.success) {
        showToast(`🎉 Seed order requested! Order ID: ${res.data.data.order_number}`);
        setOrderModalData(null);
        loadOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place seed order.');
    }
  };

  // Update Order Status (Hatchery / Admin simulation)
  const handleStatusUpdate = async (orderId, status, rejectionReason = null) => {
    try {
      const res = await hatcheryService.updateOrderStatus(orderId, status, rejectionReason);
      if (res.data?.success) {
        showToast(`Order status updated to: ${status.toUpperCase()}`);
        loadOrders();
        fetchHatcheries(); // Refresh stock
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  // Admin Verification Toggle
  const handleVerifyHatchery = async (hatcheryId, approve) => {
    try {
      const res = await hatcheryService.verifyHatchery(hatcheryId, approve);
      if (res.data?.success) {
        showToast(approve ? '🛡️ Hatchery CAA Verified by Admin!' : 'Verification revoked.');
        fetchHatcheries();
        if (selectedHatchery && selectedHatchery.id === hatcheryId) {
          setSelectedHatchery(res.data.data);
        }
      }
    } catch (err) {
      alert('Verification update failed.');
    }
  };

  // Submit Hatchery Registration
  const handleRegisterHatchery = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...registerForm,
        quality_standards: registerForm.quality_standards.split(',').map(s => s.trim())
      };
      const res = await hatcheryService.createHatchery(payload);
      if (res.data?.success) {
        showToast('✅ Hatchery registered! Sent to CAA Admin for verification.');
        setShowRegisterModal(false);
        fetchHatcheries();
      }
    } catch (err) {
      alert('Failed to register hatchery.');
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!showReviewModal) return;
    try {
      const res = await hatcheryService.submitReview(showReviewModal, reviewForm);
      if (res.data?.success) {
        showToast('⭐ Review and survival testimonial published!');
        setShowReviewModal(null);
        fetchHatcheries();
        if (selectedHatchery && selectedHatchery.id === showReviewModal) {
          const updated = await hatcheryService.getHatcheryById(showReviewModal);
          setSelectedHatchery(updated.data?.data);
        }
      }
    } catch (err) {
      alert('Failed to submit review.');
    }
  };

  // Format currency
  const formatPrice = (p) => '₹' + Number(p).toLocaleString('en-IN');

  return (
    <Layout>
      <div className="page-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Toast Alert */}
        {toastMessage && (
          <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
            background: '#0f172a', color: '#fff', padding: '14px 22px', borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: '10px',
            border: '1px solid #38bdf8', fontSize: '14px', fontWeight: '600'
          }}>
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Section */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', gap: '16px', marginBottom: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '32px' }}>🧬</span>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: 'var(--text)' }}>
                {lang === 'en' ? 'Hatchery Discovery & Aquaculture Seed Marketplace' : 'హేచరీ గుర్తింపు & ఆక్వా విత్తనాల మార్కెట్'}
              </h1>
            </div>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
              {lang === 'en'
                ? 'Discover CAA-certified hatcheries, inspect real-time SPF seed stock, calculate distance, and order high-survival shrimp, prawn & fish seed.'
                : 'CAA ధృవీకరించిన హేచరీలను కనుగొనండి, లైవ్ విత్తన స్టాక్ తనిఖీ చేయండి మరియు నాణ్యమైన సీడ్ ఆర్డర్ చేయండి.'}
            </p>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setLang(l => l === 'en' ? 'te' : 'en')}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px', fontWeight: '700' }}
            >
              🌐 {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>

            <button
              onClick={() => { setShowOrdersModal(true); loadOrders(); }}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              📋 {lang === 'en' ? 'Seed Requests' : 'నా సీడ్ ఆర్డర్లు'}
              {farmerOrders.length > 0 && (
                <span style={{ background: '#0284c7', color: '#fff', padding: '1px 7px', borderRadius: '10px', fontSize: '11px' }}>
                  {farmerOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ➕ {lang === 'en' ? 'Register Hatchery' : 'హేచరీ నమోదు చేయండి'}
            </button>
          </div>
        </div>

        {/* Species Taxonomy Filter Tabs */}
        <div style={{
          display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px',
          marginBottom: '20px', borderBottom: '1px solid var(--border)'
        }}>
          {speciesCategories.map(sp => {
            const isActive = selectedSpecies === sp.id;
            return (
              <button
                key={sp.id}
                onClick={() => setSelectedSpecies(sp.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', borderRadius: '12px', fontSize: '14px',
                  fontWeight: isActive ? '800' : '600',
                  background: isActive ? 'var(--primary)' : '#fff',
                  color: isActive ? '#fff' : 'var(--text)',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
                }}
              >
                <span>{sp.icon}</span>
                <span>{lang === 'en' ? sp.name : sp.telugu}</span>
              </button>
            );
          })}
        </div>

        {/* Location & Discovery Controls Card */}
        <div style={{
          background: '#fff', border: '1px solid var(--border)', borderRadius: '16px',
          padding: '18px 20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            
            {/* Search Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                🔍 {lang === 'en' ? 'Search Hatchery or Variety' : 'హేచరీ లేదా విత్తన రకం వెతకండి'}
              </label>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={lang === 'en' ? 'e.g. Apex, SPF Vannamei, Bapatla...' : 'ఉదా. అపెక్స్, వెనామి, బాపట్ల...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
                />
              </form>
            </div>

            {/* Farmer Aquaculture Hub Dropdown */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  📍 {lang === 'en' ? 'Your Aquaculture Hub' : 'మీ తీర ప్రాంత కేంద్రం'}
                </label>
                <button
                  onClick={handleLocateMe}
                  style={{
                    background: 'none', border: 'none', color: '#0284c7', fontSize: '11px',
                    fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                  }}
                  title="Use Browser GPS"
                >
                  🎯 {userCoords ? 'GPS Active' : 'Locate Me'}
                </button>
              </div>
              <select
                className="form-input"
                value={selectedHub}
                onChange={(e) => { setSelectedHub(e.target.value); setUserCoords(null); }}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
              >
                {farmerHubs.map(h => (
                  <option key={h.key} value={h.key}>{h.name}</option>
                ))}
              </select>
            </div>

            {/* Distance Radius */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                📏 {lang === 'en' ? 'Maximum Distance' : 'గరిష్ట దూరం'}
              </label>
              <select
                className="form-input"
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
              >
                <option value="">{lang === 'en' ? 'All Distances (Pan-India)' : 'అన్ని దూరాలు'}</option>
                <option value="50">Within 50 km (Same District)</option>
                <option value="100">Within 100 km (Fast Delivery)</option>
                <option value="200">Within 200 km (Same State)</option>
                <option value="400">Within 400 km</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                ⚡ {lang === 'en' ? 'Sort By' : 'క్రమబద్ధీకరించు'}
              </label>
              <select
                className="form-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', fontSize: '13px' }}
              >
                <option value="rating">⭐ Highest Rated</option>
                <option value="distance">📍 Closest to Pond</option>
                <option value="experience">🏆 Most Experienced</option>
                <option value="price_asc">💰 Lowest Seed Price</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches Row */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center',
            marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#059669' }}
              />
              <span>🛡️ {lang === 'en' ? 'CAA Verified Hatcheries Only' : 'CAA ధృవీకరించిన హేచరీలు మాత్రమే'}</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
              />
              <span>🟢 {lang === 'en' ? 'Immediate Stock Ready' : 'వెంటనే అందుబాటులో ఉన్నవి'}</span>
            </label>

            <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {hatcheries.length} {lang === 'en' ? 'Hatcheries Found' : 'హేచరీలు దొరికాయి'}
            </span>
          </div>
        </div>

        {/* Hatchery Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🦐</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {lang === 'en' ? 'Discovering certified coastal hatcheries...' : 'హేచరీ వివరాలను లోడ్ చేస్తున్నాము...'}
            </div>
          </div>
        ) : hatcheries.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px', background: '#fff',
            borderRadius: '16px', border: '1px dashed var(--border)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>
              {lang === 'en' ? 'No Hatcheries Match Your Filters' : 'ఎలాంటి హేచరీలు కనుగొనబడలేదు'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 16px auto' }}>
              {lang === 'en'
                ? 'Try expanding your distance radius or unchecking filters to explore more coastal seed facilities.'
                : 'దయచేసి దూరం పరిధిని పెంచండి లేదా ఇతర ఫిల్టర్లను తొలగించి చూడండి.'}
            </p>
            <button
              onClick={() => { setSelectedSpecies('all'); setMaxDistance(''); setVerifiedOnly(false); setInStockOnly(false); setSearchQuery(''); }}
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="hatchery-grid">
            {hatcheries.map(h => {
              // Strictly verify: Only show CAA Verified badge if admin approved!
              const isVerified = h.is_verified === true && h.verification_status === 'verified';

              return (
                <div key={h.id} className="hatchery-card">
                  {/* Banner & Badges */}
                  <div className="hatchery-banner">
                    <img src={h.images?.[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80'} alt={h.name} />
                    <div className="hatchery-banner-overlay" />

                    {/* Strict Verification Badge */}
                    {isVerified ? (
                      <div className="caa-verified-badge">
                        <span>🛡️</span>
                        <span>CAA VERIFIED</span>
                      </div>
                    ) : (
                      <div className="caa-pending-badge">
                        <span>⏳</span>
                        <span>PENDING VERIFICATION</span>
                      </div>
                    )}

                    {/* Distance Pill */}
                    {h.distance_km !== null && (
                      <div className="hatchery-dist-pill">
                        <span>📍</span>
                        <span>{h.distance_km} km away</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="hatchery-content">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h3 className="hatchery-name">{h.name}</h3>
                      </div>

                      <div className="hatchery-meta-row">
                        <span>📍 {h.location_name || h.district}, {h.state}</span>
                        <span>•</span>
                        <span>🏆 {h.experience_years} yrs exp</span>
                        <span>•</span>
                        <span className="hatchery-rating-pill">★ {h.rating} ({h.reviews_count})</span>
                      </div>

                      <p style={{
                        fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px 0',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {h.bio}
                      </p>

                      {/* Quality standards pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                        {h.quality_standards?.slice(0, 2).map((qs, i) => (
                          <span key={i} style={{
                            fontSize: '11px', background: '#f0f9ff', color: '#0369a1',
                            border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '6px', fontWeight: '500'
                          }}>
                            ✓ {qs}
                          </span>
                        ))}
                      </div>

                      {/* Stock & Starting Price row */}
                      <div style={{
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px',
                        padding: '10px 14px', marginBottom: '16px', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
                            Seed Stock
                          </div>
                          {h.has_stock ? (
                            <div className="stock-pill-in" style={{ marginTop: '3px' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }}></span>
                              <span>In Stock ({h.products_count} varieties)</span>
                            </div>
                          ) : (
                            <div className="stock-pill-pre" style={{ marginTop: '3px' }}>
                              <span>🔵 Pre-Order Available</span>
                            </div>
                          )}
                        </div>

                        {h.min_price && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>
                              Starting at
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>
                              {formatPrice(h.min_price)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedHatchery(h)}
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '9px 12px', fontSize: '13px', fontWeight: '700' }}
                      >
                        🔍 View Seed & Profile
                      </button>

                      <a
                        href={`tel:${h.phone}`}
                        className="btn btn-secondary"
                        style={{ padding: '9px 12px', fontSize: '13px', textDecoration: 'none' }}
                        title="Call Hatchery"
                      >
                        📞
                      </a>

                      {h.whatsapp && (
                        <a
                          href={`https://wa.me/${h.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(h.name)},%20I%20saw%20your%20hatchery%20listing%20on%20AquaMitra.`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '9px 12px', fontSize: '13px', color: '#16a34a', textDecoration: 'none' }}
                          title="WhatsApp Hatchery"
                        >
                          💬
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* MODAL 1: Hatchery Detail Profile & Seed Stock Table */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {selectedHatchery && (
          <div className="modal-backdrop" onClick={() => setSelectedHatchery(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
            >
              {/* Header Image Gallery */}
              <div style={{ position: 'relative', height: '240px', background: '#0f172a' }}>
                <img
                  src={selectedHatchery.images?.[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'}
                  alt={selectedHatchery.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                />
                <button
                  onClick={() => setSelectedHatchery(null)}
                  style={{
                    position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)',
                    color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px',
                    fontSize: '18px', cursor: 'pointer'
                  }}
                >
                  ✕
                </button>

                {/* Verification badge */}
                {selectedHatchery.is_verified && selectedHatchery.verification_status === 'verified' ? (
                  <div className="caa-verified-badge" style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '12px' }}>
                    <span>🛡️</span>
                    <span>CAA APPROVED & VERIFIED</span>
                  </div>
                ) : (
                  <div className="caa-pending-badge" style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '12px' }}>
                    <span>⏳</span>
                    <span>VERIFICATION PENDING (CAA INSPECTION)</span>
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800', color: 'var(--text)' }}>
                      {selectedHatchery.name}
                    </h2>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                      <span>📍 {selectedHatchery.address}</span>
                      <span>•</span>
                      <span>District: {selectedHatchery.district}, {selectedHatchery.state}</span>
                      {selectedHatchery.distance_km !== null && (
                        <>
                          <span>•</span>
                          <span style={{ color: '#0284c7', fontWeight: '700' }}>📍 {selectedHatchery.distance_km} km from your pond</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rating & Contact Bar */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a
                      href={`tel:${selectedHatchery.phone}`}
                      className="btn btn-primary"
                      style={{ textDecoration: 'none', padding: '9px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      📞 Call Hatchery
                    </a>
                    {selectedHatchery.whatsapp && (
                      <a
                        href={`https://wa.me/${selectedHatchery.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ textDecoration: 'none', padding: '9px 16px', fontSize: '13px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* License & Map Coordinates Banner */}
                <div style={{
                  background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px',
                  padding: '14px 18px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap',
                  justifyContent: 'space-between', alignItems: 'center', gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '700' }}>
                      COASTAL AQUACULTURE AUTHORITY LICENSE
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0c4a6e', marginTop: '2px' }}>
                      {selectedHatchery.caa_license_number || 'Under Process (Application Filed)'}
                    </div>
                  </div>

                  {/* Google Maps link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedHatchery.latitude},${selectedHatchery.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#fff', border: '1px solid #0284c7', color: '#0284c7',
                      padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    🗺️ Open in Google Maps ({selectedHatchery.latitude.toFixed(3)}, {selectedHatchery.longitude.toFixed(3)})
                  </a>
                </div>

                {/* Certifications & Quality Standards */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Biosecurity & Quality Assurance
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                    {selectedHatchery.quality_standards?.map((q, idx) => (
                      <div key={idx} style={{
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
                        padding: '10px 12px', fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                        <span style={{ color: '#10b981', fontSize: '14px' }}>✓</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Seed Products / Live Stock */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text)' }}>
                      Available Seed Batches & Live Stock ({selectedHatchery.products?.length || 0})
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Updated Real-Time
                    </span>
                  </div>

                  {selectedHatchery.products?.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px' }}>
                      No seed products currently listed.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {selectedHatchery.products?.map(prod => (
                        <div key={prod.id} className="seed-product-card">
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)' }}>
                                {prod.species_name}
                              </span>
                              <span style={{
                                fontSize: '11px', background: '#f1f5f9', color: '#475569',
                                padding: '2px 7px', borderRadius: '6px', fontWeight: '700'
                              }}>
                                Stage: {prod.stage}
                              </span>
                              {prod.pcr_tested && (
                                <span style={{
                                  fontSize: '10px', background: '#dcfce7', color: '#166534',
                                  padding: '2px 6px', borderRadius: '6px', fontWeight: '700'
                                }}>
                                  100% PCR NEGATIVE
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                              <span>Line: <strong>{prod.variety}</strong></span>
                              <span>•</span>
                              <span>Survival Guarantee: <strong>{prod.survival_guarantee_rate}%</strong></span>
                              <span>•</span>
                              <span>Salinity: <strong>{prod.salinity_tolerance}</strong></span>
                            </div>

                            <div style={{ fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{
                                color: prod.stock_status === 'in_stock' ? '#16a34a' : '#d97706',
                                fontWeight: '700'
                              }}>
                                ● Stock: {prod.current_stock_quantity.toLocaleString()} seeds
                              </span>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                Min Order: {prod.min_order_quantity.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>
                                {formatPrice(prod.price_per_unit)}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {prod.unit_label}
                              </div>
                            </div>

                            <button
                              onClick={() => openOrderModal(selectedHatchery, prod)}
                              className="btn btn-primary"
                              style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}
                            >
                              🛒 Request Seed
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reviews & Survival Testimonials */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text)' }}>
                      Farmer Reviews & Stocking Survival Rate ({selectedHatchery.reviews?.length || 0})
                    </h4>
                    <button
                      onClick={() => setShowReviewModal(selectedHatchery.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px', fontWeight: '700' }}
                    >
                      + Rate Survival Rate
                    </button>
                  </div>

                  {selectedHatchery.reviews?.length === 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '10px 0' }}>
                      No farmer reviews yet. Be the first to submit a survival testimonial!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedHatchery.reviews?.map(rev => (
                        <div key={rev.id} style={{
                          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>
                              {rev.farmer_name} <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text-secondary)' }}>({rev.farmer_location})</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {rev.seed_survival_rate && (
                                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                                  {rev.seed_survival_rate}% Survival
                                </span>
                              )}
                              <span style={{ fontSize: '12px', color: '#b45309', fontWeight: '800' }}>
                                {'★'.repeat(rev.rating)}
                              </span>
                            </div>
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                            "{rev.review_text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Quick Action (For strict verification demonstration) */}
                <div style={{
                  background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px',
                  padding: '12px 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
                  alignItems: 'center', gap: '12px'
                }}>
                  <div style={{ fontSize: '12px', color: '#92400e' }}>
                    <strong>Admin Verification Controls:</strong> This demonstrates strict verification compliance.
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {selectedHatchery.is_verified ? (
                      <button
                        onClick={() => handleVerifyHatchery(selectedHatchery.id, false)}
                        style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Revoke CAA Verification
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerifyHatchery(selectedHatchery.id, true)}
                        style={{ background: '#059669', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        🛡️ Approve CAA Verification
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* MODAL 2: Request / Order Seed */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {orderModalData && (
          <div className="modal-backdrop" onClick={() => setOrderModalData(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '560px', width: '95%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                  🛒 {lang === 'en' ? 'Request Seed Order' : 'విత్తన ఆర్డర్ అభ్యర్థించండి'}
                </h3>
                <button
                  onClick={() => setOrderModalData(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Order Summary Box */}
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                padding: '14px', marginBottom: '18px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>
                  {orderModalData.product.species_name} ({orderModalData.product.stage})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Hatchery: {orderModalData.hatchery.name}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', marginTop: '6px' }}>
                  Rate: {formatPrice(orderModalData.product.price_per_unit)} {orderModalData.product.unit_label}
                </div>
              </div>

              <form onSubmit={handleOrderSubmit}>
                {/* Quantity input */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Order Quantity (Seeds / Count)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={orderForm.quantity}
                    min={orderModalData.product.min_order_quantity || 1000}
                    step={1000}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '100%' }}
                    required
                  />
                  {/* Quick Quantity presets */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    {[50000, 100000, 200000, 500000].map(q => (
                      <button
                        type="button"
                        key={q}
                        onClick={() => setOrderForm({ ...orderForm, quantity: q })}
                        style={{
                          background: orderForm.quantity === q ? '#0284c7' : '#f1f5f9',
                          color: orderForm.quantity === q ? '#fff' : '#475569',
                          border: 'none', padding: '3px 8px', borderRadius: '6px', fontSize: '11px',
                          fontWeight: '700', cursor: 'pointer'
                        }}
                      >
                        {(q / 100000).toFixed(1)} Lakhs
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Cost calculation */}
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px',
                  padding: '10px 14px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '13px', color: '#166534', fontWeight: '700' }}>
                    Estimated Total Cost:
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: '#166534' }}>
                    {formatPrice(
                      orderModalData.product.unit_label.includes('1,000')
                        ? Math.round((orderForm.quantity / 1000) * orderModalData.product.price_per_unit)
                        : Math.round(orderForm.quantity * orderModalData.product.price_per_unit)
                    )}
                  </span>
                </div>

                {/* Required Date & Salinity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Required Stocking Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={orderForm.required_date}
                      onChange={(e) => setOrderForm({ ...orderForm, required_date: e.target.value })}
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      Pond Salinity (ppt)
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      value={orderForm.pond_salinity_ppt}
                      onChange={(e) => setOrderForm({ ...orderForm, pond_salinity_ppt: e.target.value })}
                      style={{ width: '100%' }}
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>

                {/* Delivery location */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Pond / Farm Delivery Address
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Survey 42, Gollavanitippa, Bhimavaram"
                    value={orderForm.delivery_location}
                    onChange={(e) => setOrderForm({ ...orderForm, delivery_location: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                {/* Special packing notes */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Special Packaging & Acclimatization Instructions
                  </label>
                  <textarea
                    className="form-input"
                    rows="2"
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setOrderModalData(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, fontWeight: '700' }}>
                    🚀 Confirm Seed Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* MODAL 3: Orders / Requests Management Drawer */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {showOrdersModal && (
          <div className="modal-backdrop" onClick={() => setShowOrdersModal(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '780px', width: '95%', maxHeight: '85vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>
                    📋 Seed Orders & Request Tracking
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Track hatchery confirmations, dispatch schedules and delivery status
                  </div>
                </div>
                <button
                  onClick={() => setShowOrdersModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>Loading orders...</div>
              ) : farmerOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  No seed orders placed yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {farmerOrders.map(ord => (
                    <div key={ord.id} style={{
                      background: '#fff', border: '1px solid var(--border)', borderRadius: '12px',
                      padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>
                              {ord.species_name} ({ord.stage})
                            </span>
                            <span className={`seed-order-badge order-status-${ord.status}`}>
                              {ord.status.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Order #: <strong>{ord.order_number}</strong> • Hatchery: {ord.hatchery_name}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>
                            {formatPrice(ord.total_amount)}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {ord.quantity.toLocaleString()} seeds
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '14px', margin: '10px 0' }}>
                        <span>📅 Delivery: <strong>{ord.required_date}</strong></span>
                        <span>📍 {ord.delivery_location}</span>
                        <span>💧 Salinity: {ord.pond_salinity_ppt} ppt</span>
                      </div>

                      {ord.notes && (
                        <div style={{ fontSize: '12px', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', color: '#64748b' }}>
                          Note: "{ord.notes}"
                        </div>
                      )}

                      {/* Hatchery Manager Simulation Controls */}
                      <div style={{
                        marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9',
                        display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'flex-end'
                      }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginRight: 'auto' }}>
                          Manage Status (Hatchery/Admin):
                        </span>
                        {ord.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(ord.id, 'accepted')}
                              style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              ✓ Accept Request
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(ord.id, 'rejected', 'Stock allocated for another batch')}
                              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                        {ord.status === 'accepted' && (
                          <button
                            onClick={() => handleStatusUpdate(ord.id, 'dispatched')}
                            style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            🚚 Mark Dispatched
                          </button>
                        )}
                        {ord.status === 'dispatched' && (
                          <button
                            onClick={() => handleStatusUpdate(ord.id, 'completed')}
                            style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            🏁 Mark Stocked & Completed
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* MODAL 4: Register Hatchery Form */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {showRegisterModal && (
          <div className="modal-backdrop" onClick={() => setShowRegisterModal(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '620px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                  🏢 {lang === 'en' ? 'Register New Aquaculture Hatchery' : 'కొత్త హేచరీ నమోదు'}
                </h3>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{
                background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px',
                padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#92400e'
              }}>
                ℹ️ <strong>Note:</strong> All newly registered hatcheries are set to <strong>Pending Verification</strong> until validated by the Coastal Aquaculture Authority / Admin.
              </div>

              <form onSubmit={handleRegisterHatchery}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Hatchery Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="e.g. Godavari Marine Bio-Hatchery"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>CAA License #</label>
                    <input
                      type="text"
                      className="form-input"
                      value={registerForm.caa_license_number}
                      onChange={(e) => setRegisterForm({ ...registerForm, caa_license_number: e.target.value })}
                      placeholder="e.g. CAA/REG/2026/00912"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Years Experience</label>
                    <input
                      type="number"
                      className="form-input"
                      value={registerForm.experience_years}
                      onChange={(e) => setRegisterForm({ ...registerForm, experience_years: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Contact Person</label>
                    <input
                      type="text"
                      className="form-input"
                      value={registerForm.contact_person}
                      onChange={(e) => setRegisterForm({ ...registerForm, contact_person: e.target.value })}
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>District</label>
                    <input
                      type="text"
                      className="form-input"
                      value={registerForm.district}
                      onChange={(e) => setRegisterForm({ ...registerForm, district: e.target.value })}
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>State</label>
                    <input
                      type="text"
                      className="form-input"
                      value={registerForm.state}
                      onChange={(e) => setRegisterForm({ ...registerForm, state: e.target.value })}
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={registerForm.address}
                    onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                    placeholder="Coast Road, Beach Village, Landmark"
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Quality Standards (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={registerForm.quality_standards}
                    onChange={(e) => setRegisterForm({ ...registerForm, quality_standards: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>About Hatchery / Facility Bio</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    value={registerForm.bio}
                    onChange={(e) => setRegisterForm({ ...registerForm, bio: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowRegisterModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, fontWeight: '700' }}>
                    🏢 Submit Hatchery for Verification
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {/* MODAL 5: Rate Seed Survival & Testimonial */}
        {/* ═══════════════════════════════════════════════════════════════════════ */}
        {showReviewModal && (
          <div className="modal-backdrop" onClick={() => setShowReviewModal(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '480px', width: '95%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                  ⭐ Rate Hatchery Seed Quality
                </h3>
                <button
                  onClick={() => setShowReviewModal(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Star Rating (1-5)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '24px', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        style={{ color: star <= reviewForm.rating ? '#f59e0b' : '#cbd5e1' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Reported Seed Survival Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="100"
                    className="form-input"
                    value={reviewForm.seed_survival_rate}
                    onChange={(e) => setReviewForm({ ...reviewForm, seed_survival_rate: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Your Name & Location
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={reviewForm.farmer_name}
                      onChange={(e) => setReviewForm({ ...reviewForm, farmer_name: e.target.value })}
                      placeholder="Farmer Name"
                      required
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={reviewForm.farmer_location}
                      onChange={(e) => setReviewForm({ ...reviewForm, farmer_location: e.target.value })}
                      placeholder="e.g. Nellore"
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    Stocking Experience & Feedback
                  </label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={reviewForm.review_text}
                    onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                    placeholder="Describe seed gut fullness, acclimatization and harvest DOC results..."
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowReviewModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, fontWeight: '700' }}>
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
