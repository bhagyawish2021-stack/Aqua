import React, { useState, useEffect } from 'react';
import {
  getTaxonomy,
  getListings,
  getListingById,
  createListing,
  submitInquiryOrOffer,
  getFarmerOffers,
  getBuyerOffers,
  submitCounterOffer,
  acceptOffer,
  rejectOffer,
  updateTradeStatus,
  submitTradeReview
} from '../services/seafoodService';

const BUYER_HUBS = [
  { key: 'bhimavaram', name: 'Bhimavaram Processing Cluster', lat: 16.5449, lng: 81.5212 },
  { key: 'nellore', name: 'Nellore Coastal Hub', lat: 14.4426, lng: 79.9865 },
  { key: 'kakinada', name: 'Kakinada Deep Sea Port', lat: 16.9891, lng: 82.2475 },
  { key: 'machilipatnam', name: 'Machilipatnam Coastal Hub', lat: 16.1875, lng: 81.1389 },
  { key: 'visakhapatnam', name: 'Vizag Fishing Harbour / Export Zone', lat: 17.6868, lng: 83.2185 },
  { key: 'bapatla', name: 'Bapatla / Nizampatnam Aqua Zone', lat: 15.9042, lng: 80.4674 }
];

const SIZE_GRADES = [
  'All Grades',
  '30 Count',
  '40 Count',
  '50 Count',
  '20 Count (Jumbo)',
  '500g-1kg',
  '1kg-2kg'
];

export default function SeafoodMarketplace() {
  // Navigation tabs: 'buyer_hub' | 'negotiations' | 'farmer_listings'
  const [activeMainTab, setActiveMainTab] = useState('buyer_hub');

  // Selected buyer hub for distance calculation
  const [selectedHub, setSelectedHub] = useState(BUYER_HUBS[0]);

  // Taxonomy
  const [speciesList, setSpeciesList] = useState([]);
  const [buyerTypes, setBuyerTypes] = useState([]);

  // Filters
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [maxDistance, setMaxDistance] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'price_asc' | 'price_desc' | 'quantity_desc' | 'rating'

  // Listings state
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [listingError, setListingError] = useState(null);

  // Selected Listing Modal
  const [viewingListing, setViewingListing] = useState(null);

  // Offer / Inquiry Modal
  const [offeringListing, setOfferingListing] = useState(null);
  const [offerForm, setOfferForm] = useState({
    buyer_name: 'Naveen Chander (Procurement Head)',
    buyer_company: 'Bay of Bengal Frozen Foods & Exporters Ltd',
    buyer_type: 'exporter',
    buyer_phone: '+91 891 255 6789',
    offered_price_per_kg: '',
    requested_quantity_kg: '',
    proposed_harvest_date: '',
    pickup_terms: 'Buyer Reefer Truck (Pond-side collection with slush ice)',
    payment_terms: 'Direct RTGS Bank Transfer immediately upon gate weighing',
    message: ''
  });
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(null);

  // Negotiations / Active Trades State
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [negotiationRole, setNegotiationRole] = useState('buyer'); // 'buyer' | 'farmer'

  // Counter Offer Modal
  const [activeCounterOffer, setActiveCounterOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQty, setCounterQty] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  // Trade Status Update Modal (processing / completed)
  const [activeStatusOffer, setActiveStatusOffer] = useState(null);
  const [actualWeight, setActualWeight] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Review Modal
  const [reviewingTrade, setReviewingTrade] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Farmer New Listing Modal
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [newListingForm, setNewListingForm] = useState({
    species: 'vannamei_shrimp',
    pond_name: 'Pond 1 (North Vannamei)',
    quantity_kg: 3000,
    min_order_quantity_kg: 500,
    size_grade: '30 Count (33g/pc)',
    count_per_kg: 30,
    expected_price_per_kg: 420,
    harvest_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    is_immediate_harvest: false,
    location_name: 'Bhimavaram, West Godavari',
    district: 'West Godavari',
    description: 'Antibiotic-free high survival Vannamei shrimp ready for export processor lifting.'
  });

  // Load taxonomy on mount
  useEffect(() => {
    loadTaxonomyData();
  }, []);

  // Reload listings or offers when dependencies change
  useEffect(() => {
    if (activeMainTab === 'buyer_hub') {
      loadListingsData();
    } else if (activeMainTab === 'negotiations') {
      loadOffersData();
    }
  }, [activeMainTab, selectedHub, selectedSpecies, selectedGrade, maxDistance, searchQuery, verifiedOnly, sortBy, negotiationRole]);

  const loadTaxonomyData = async () => {
    try {
      const res = await getTaxonomy();
      if (res.data && res.data.data) {
        setSpeciesList(res.data.data.species || []);
        setBuyerTypes(res.data.data.buyer_types || []);
      }
    } catch (err) {
      console.error('Failed to load taxonomy', err);
    }
  };

  const loadListingsData = async () => {
    setLoadingListings(true);
    setListingError(null);
    try {
      const params = {
        species: selectedSpecies !== 'all' ? selectedSpecies : undefined,
        count_grade: selectedGrade !== 'All Grades' ? selectedGrade : undefined,
        max_distance_km: maxDistance || undefined,
        search: searchQuery.trim() || undefined,
        verified_only: verifiedOnly ? 'true' : undefined,
        sort_by: sortBy,
        lat: selectedHub.lat,
        lng: selectedHub.lng
      };
      const res = await getListings(params);
      setListings(res.data?.data || []);
    } catch (err) {
      setListingError('Failed to load seafood catch listings.');
    } finally {
      setLoadingListings(false);
    }
  };

  const loadOffersData = async () => {
    setLoadingOffers(true);
    try {
      const res = negotiationRole === 'buyer' ? await getBuyerOffers() : await getFarmerOffers();
      setOffers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load offers', err);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleOpenOfferModal = (listing) => {
    setOfferingListing(listing);
    setOfferSuccess(null);
    setOfferForm({
      ...offerForm,
      offered_price_per_kg: listing.expected_price_per_kg,
      requested_quantity_kg: listing.quantity_kg,
      proposed_harvest_date: listing.harvest_date
    });
  };

  const handleCreateOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offeringListing) return;

    setOfferSubmitting(true);
    try {
      const payload = {
        listing_id: offeringListing.id,
        buyer_name: offerForm.buyer_name,
        buyer_company: offerForm.buyer_company,
        buyer_type: offerForm.buyer_type,
        buyer_phone: offerForm.buyer_phone,
        offered_price_per_kg: parseFloat(offerForm.offered_price_per_kg),
        requested_quantity_kg: parseFloat(offerForm.requested_quantity_kg),
        proposed_harvest_date: offerForm.proposed_harvest_date,
        pickup_terms: offerForm.pickup_terms,
        payment_terms: offerForm.payment_terms,
        message: offerForm.message || `Submitted offer of ₹${offerForm.offered_price_per_kg}/kg for ${offerForm.requested_quantity_kg} kg.`
      };

      const res = await submitInquiryOrOffer(payload);
      setOfferSuccess(res.data?.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to submit offer');
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    if (!activeCounterOffer) return;

    try {
      await submitCounterOffer(activeCounterOffer.id, {
        sender_role: negotiationRole,
        price_per_kg: parseFloat(counterPrice),
        quantity_kg: parseFloat(counterQty),
        message: counterMessage
      });
      setActiveCounterOffer(null);
      loadOffersData();
      alert('Counter offer sent successfully!');
    } catch (err) {
      alert('Failed to send counter offer: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAcceptDeal = async (offerId) => {
    if (!window.confirm('Accept this price offer and lock direct farmgate trade agreement?')) return;
    try {
      await acceptOffer(offerId, { sender_role: negotiationRole });
      loadOffersData();
      alert('Deal accepted! Trade status moved to ACCEPTED.');
    } catch (err) {
      alert('Accept failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeclineDeal = async (offerId) => {
    const reason = prompt('Please enter reason for declining offer:', 'Price terms outside current processing budget');
    if (!reason) return;
    try {
      await rejectOffer(offerId, { sender_role: negotiationRole, rejection_reason: reason });
      loadOffersData();
    } catch (err) {
      alert('Decline failed');
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!activeStatusOffer) return;

    try {
      await updateTradeStatus(activeStatusOffer.id, {
        status: activeStatusOffer.targetStatus,
        actual_weighed_quantity_kg: actualWeight ? parseFloat(actualWeight) : undefined,
        dispatch_notes: dispatchNotes
      });
      setActiveStatusOffer(null);
      setActualWeight('');
      setDispatchNotes('');
      loadOffersData();
      alert(`Trade updated to '${activeStatusOffer.targetStatus.toUpperCase()}'!`);
    } catch (err) {
      alert('Status update failed');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingTrade) return;

    setReviewSubmitting(true);
    try {
      await submitTradeReview(reviewingTrade.id, {
        reviewer_role: negotiationRole,
        rating: reviewRating,
        review_text: reviewText
      });
      setReviewingTrade(null);
      setReviewText('');
      loadOffersData();
      alert('Trade review submitted! Trust rating updated.');
    } catch (err) {
      alert('Review submission failed');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCreateListingSubmit = async (e) => {
    e.preventDefault();
    try {
      await createListing(newListingForm);
      setShowAddListingModal(false);
      loadListingsData();
      alert('Seafood harvest listed successfully! Buyers in your district will see your catch.');
    } catch (err) {
      alert('Failed to list harvest: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Ocean Gradient Header */}
      <div className="seafood-header-gradient">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                PHASE 9 DIRECT COMMERCIAL SEAFOOD TRADE
              </span>
              <span style={{ background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                ✓ DIRECT FARMGATE PRICING • ZERO MIDDLEMEN
              </span>
            </div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800' }}>
              Direct Seafood Sales & Buyer Marketplace
            </h1>
            <p style={{ margin: 0, fontSize: '15px', opacity: 0.9, maxWidth: '820px', lineHeight: '1.5' }}>
              Empowering farmers to negotiate directly with verified exporters, processing plants, and wholesalers.
              Transparent size grades, slush-ice quality assurance, location proximity, and binding trade offers.
            </p>
          </div>

          {/* Primary Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
            <button
              onClick={() => setActiveMainTab('buyer_hub')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeMainTab === 'buyer_hub' ? '#ffffff' : 'transparent',
                color: activeMainTab === 'buyer_hub' ? '#0369a1' : '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              🔍 Seafood Catch Discovery
            </button>
            <button
              onClick={() => setActiveMainTab('negotiations')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeMainTab === 'negotiations' ? '#ffffff' : 'transparent',
                color: activeMainTab === 'negotiations' ? '#0369a1' : '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              🤝 Negotiations & Contracts ({offers.length})
            </button>
            <button
              onClick={() => setShowAddListingModal(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
              }}
            >
              + Sell My Catch
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: BUYER SEAFOOD DISCOVERY & PROXIMITY SEARCH
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'buyer_hub' && (
        <div>
          {/* Location Proximity Hub Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '12px 18px', borderRadius: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📍</span>
              <div>
                <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: '700', textTransform: 'uppercase' }}>Buyer Processing Location / Hub:</span>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0c4a6e' }}>{selectedHub.name}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>Change Hub:</span>
              <select
                value={selectedHub.key}
                onChange={(e) => {
                  const hub = BUYER_HUBS.find(h => h.key === e.target.value);
                  if (hub) setSelectedHub(hub);
                }}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #7dd3fc', background: '#fff', fontSize: '13px', fontWeight: '700', color: '#0c4a6e' }}
              >
                {BUYER_HUBS.map((h) => (
                  <option key={h.key} value={h.key}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Species Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            {speciesList.map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSelectedSpecies(sp.id)}
                className={`spec-category-chip ${selectedSpecies === sp.id ? 'active' : ''}`}
              >
                <span>{sp.icon}</span>
                <span>{sp.name}</span>
              </button>
            ))}
          </div>

          {/* Search, Count Grade, Distance, Verified Only & Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '24px' }}>
            <div style={{ flex: '1 1 240px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by farmer name, count, village, or description..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px' }}
              />
            </div>

            <div style={{ minWidth: '150px' }}>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: '#ffffff' }}
              >
                {SIZE_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div style={{ minWidth: '140px' }}>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: '#ffffff' }}
              >
                <option value="">Any Distance</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
                <option value="100">Within 100 km</option>
                <option value="200">Within 200 km</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                ✓ CAA Verified Farms Only
              </label>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: '#ffffff' }}
              >
                <option value="distance">📍 Closest to Hub</option>
                <option value="price_asc">💰 Price: Low to High</option>
                <option value="price_desc">💰 Price: High to Low</option>
                <option value="quantity_desc">⚖️ Largest Harvest (MT)</option>
                <option value="rating">⭐ Highest Farmer Rating</option>
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          {loadingListings ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔄</div>
              Scanning farmgate pond harvests...
            </div>
          ) : listingError ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#fef2f2', borderRadius: '12px', color: '#991b1b' }}>
              {listingError}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🦐</div>
              <h3 style={{ margin: '0 0 6px 0' }}>No seafood listings match your search</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Try widening distance radius or clearing grade filters.</p>
            </div>
          ) : (
            <div className="seafood-grid">
              {listings.map((item) => (
                <div key={item.id} className="seafood-card">
                  <div>
                    {/* Thumbnail Box */}
                    <div className="seafood-thumb-box">
                      <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80'} alt={item.species_label} />
                      <span className="count-grade-pill">{item.size_grade}</span>
                      {item.distance_km !== null && (
                        <span className="distance-pill">
                          📍 {item.distance_km} km away
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '16px 16px 0 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                          {item.species_label}
                        </h3>
                      </div>

                      <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '700', marginBottom: '4px' }}>
                        Farmer: {item.farmer_name} • {item.location_name}
                      </div>

                      {item.is_verified && (
                        <div style={{ marginBottom: '8px' }}>
                          <span className="verified-badge-pill">✓ {item.verification_badge}</span>
                        </div>
                      )}

                      {/* Quantity & Harvest Date */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', marginBottom: '10px' }}>
                        <div>
                          <span style={{ color: '#64748b' }}>Harvest Tonnage: </span>
                          <strong style={{ color: '#0f172a', display: 'block', fontSize: '13px' }}>
                            {item.quantity_kg >= 1000 ? `${(item.quantity_kg / 1000).toFixed(1)} MT (${item.quantity_kg} kg)` : `${item.quantity_kg} kg`}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Harvest Date: </span>
                          <strong style={{ color: item.is_immediate_harvest ? '#15803d' : '#0f172a', display: 'block', fontSize: '13px' }}>
                            {item.is_immediate_harvest ? '⚡ Immediate Harvest' : item.harvest_date}
                          </strong>
                        </div>
                      </div>

                      {/* Quality tags */}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {item.quality_info?.slice(0, 2).map((q, idx) => (
                          <span key={idx} style={{ background: '#ecfdf5', color: '#065f46', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                            ✓ {q}
                          </span>
                        ))}
                      </div>

                      <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Price & Action footer */}
                  <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Asking Price:</span>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#0369a1' }}>
                        ₹{item.expected_price_per_kg} <span style={{ fontSize: '12px', fontWeight: '400', color: '#64748b' }}>/ kg</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setViewingListing(item)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleOpenOfferModal(item)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#0284c7',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(2,132,199,0.3)'
                        }}
                      >
                        🤝 Make Offer
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
          TAB 2: LIVE NEGOTIATIONS & B2B TRADE CONTRACTS
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'negotiations' && (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800' }}>
                Active B2B Negotiations & Trade Contracts
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                Structured asking price, offers, counter-offers, and pond-side fulfillment contracts.
              </p>
            </div>

            {/* Role switch for demonstration */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>View As:</span>
              <button
                onClick={() => setNegotiationRole('buyer')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: negotiationRole === 'buyer' ? '#0369a1' : 'transparent',
                  color: negotiationRole === 'buyer' ? '#fff' : '#64748b',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🚢 Commercial Buyer
              </button>
              <button
                onClick={() => setNegotiationRole('farmer')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: negotiationRole === 'farmer' ? '#047857' : 'transparent',
                  color: negotiationRole === 'farmer' ? '#fff' : '#64748b',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🌾 Aquafarm Producer
              </button>
            </div>
          </div>

          {loadingOffers ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              Loading trade negotiations...
            </div>
          ) : offers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '42px', marginBottom: '12px' }}>🤝</div>
              <h3 style={{ margin: '0 0 6px 0' }}>No active negotiation contracts</h3>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>
                Make an offer on active shrimp or finfish pond catches to begin price negotiation.
              </p>
              <button
                onClick={() => setActiveMainTab('buyer_hub')}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
              >
                Browse Farm Catches
              </button>
            </div>
          ) : (
            <div>
              {offers.map((deal) => {
                const isAccepted = deal.status === 'accepted';
                const isProcessing = deal.status === 'processing';
                const isCompleted = deal.status === 'completed';
                const isTerminal = ['completed', 'rejected', 'cancelled'].includes(deal.status);

                return (
                  <div key={deal.id} className="negotiation-thread-card" style={{ borderLeft: `5px solid ${isCompleted ? '#16a34a' : isAccepted ? '#047857' : '#0284c7'}` }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                            Offer #{deal.id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`trade-status-pill trade-status-${deal.status}`}>
                            {deal.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#0369a1', fontWeight: '700', marginTop: '2px' }}>
                          Listing: {deal.listing?.species_label || 'Seafood Catch'} • Farmer: {deal.farmer_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Buyer: <strong>{deal.buyer_company}</strong> ({deal.buyer_name}) • Mode: {deal.buyer_type.toUpperCase()}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#0369a1' }}>
                          ₹{deal.final_agreed_price_per_kg || deal.offered_price_per_kg} / kg
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {deal.final_agreed_quantity_kg || deal.requested_quantity_kg} kg • Est: ₹{((deal.final_agreed_price_per_kg || deal.offered_price_per_kg) * (deal.final_agreed_quantity_kg || deal.requested_quantity_kg)).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Terms banner */}
                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px' }}>
                      <div><strong>Harvest Date:</strong> {deal.proposed_harvest_date}</div>
                      <div><strong>Pickup:</strong> {deal.pickup_terms}</div>
                      <div><strong>Settlement:</strong> {deal.payment_terms}</div>
                    </div>

                    {/* Negotiation History Thread */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
                        OFFER & COUNTER-OFFER TIMELINE ({deal.negotiation_history?.length || 0}):
                      </div>
                      {deal.negotiation_history?.map((msg, i) => (
                        <div
                          key={i}
                          className={msg.sender === 'farmer' ? 'negotiation-bubble-farmer' : 'negotiation-bubble-buyer'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: msg.sender === 'farmer' ? '#166534' : '#1e40af', marginBottom: '2px' }}>
                            <span>{msg.sender === 'farmer' ? '🌾 Aquafarm Producer' : '🚢 Commercial Buyer'}</span>
                            <span>Offer: ₹{msg.price_per_kg}/kg ({msg.quantity_kg} kg)</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>{msg.message}</p>
                        </div>
                      ))}
                    </div>

                    {/* Actual Weighed Gate Details if processing / completed */}
                    {deal.actual_weighed_quantity_kg && (
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 14px', borderRadius: '10px', marginBottom: '12px', fontSize: '12px', color: '#065f46' }}>
                        <strong>⚖️ Pond Gate Weighment Certified: </strong>
                        <span>{deal.actual_weighed_quantity_kg} kg @ ₹{deal.final_agreed_price_per_kg}/kg = <strong>₹{deal.final_total_value?.toLocaleString()}</strong></span>
                        {deal.dispatch_notes && <div style={{ marginTop: '4px' }}>Notes: {deal.dispatch_notes}</div>}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                      {!isTerminal && deal.status !== 'processing' && (
                        <>
                          <button
                            onClick={() => handleDeclineDeal(deal.id)}
                            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            Decline Offer
                          </button>

                          <button
                            onClick={() => {
                              setActiveCounterOffer(deal);
                              setCounterPrice(deal.offered_price_per_kg);
                              setCounterQty(deal.requested_quantity_kg);
                              setCounterMessage('');
                            }}
                            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #0284c7', background: '#f0f9ff', color: '#0369a1', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            💬 Send Counter Offer
                          </button>

                          <button
                            onClick={() => handleAcceptDeal(deal.id)}
                            style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#047857', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 6px rgba(4,120,87,0.3)' }}
                          >
                            ✓ Accept Offer & Lock Deal
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <button
                          onClick={() => {
                            setActiveStatusOffer({ id: deal.id, targetStatus: 'processing' });
                            setActualWeight(deal.final_agreed_quantity_kg);
                            setDispatchNotes('Slush-icing started. Reefer truck arrived at pond side.');
                          }}
                          style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          🚚 Initiate Harvest & Reefer Loading
                        </button>
                      )}

                      {isProcessing && (
                        <button
                          onClick={() => {
                            setActiveStatusOffer({ id: deal.id, targetStatus: 'completed' });
                            setActualWeight(deal.final_agreed_quantity_kg);
                            setDispatchNotes('Harvest completed, weighment certified, and truck dispatched.');
                          }}
                          style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          ✅ Complete Trade & Certify Weight
                        </button>
                      )}

                      {isCompleted && (
                        <button
                          onClick={() => setReviewingTrade(deal)}
                          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #eab308', background: '#fef9c3', color: '#854d0e', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                        >
                          ⭐ Rate Trade Partner
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: SUBMIT FORMAL BUYER OFFER
      ───────────────────────────────────────────────────────────── */}
      {offeringListing && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>
                  DIRECT FARMGATE OFFER
                </span>
                <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: '800' }}>
                  {offeringListing.species_label}
                </h2>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  Farmer: {offeringListing.farmer_name} • Asking Price: <strong style={{ color: '#0369a1' }}>₹{offeringListing.expected_price_per_kg}/kg</strong>
                </div>
              </div>
              <button
                onClick={() => setOfferingListing(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {offerSuccess ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#0369a1' }}>Offer Submitted Successfully!</h3>
                <p style={{ margin: '0 0 16px 0', color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
                  Your offer of <strong>₹{offerSuccess.offered_price_per_kg}/kg</strong> for <strong>{offerSuccess.requested_quantity_kg} kg</strong> has been forwarded to {offeringListing.farmer_name}.
                  Track replies in <em>Negotiations & Contracts</em>.
                </p>
                <button
                  onClick={() => {
                    setOfferingListing(null);
                    setActiveMainTab('negotiations');
                  }}
                  style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  View Active Negotiations
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateOfferSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Your Company / Firm:</label>
                    <input
                      type="text"
                      required
                      value={offerForm.buyer_company}
                      onChange={(e) => setOfferForm({ ...offerForm, buyer_company: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Buyer Category:</label>
                    <select
                      value={offerForm.buyer_type}
                      onChange={(e) => setOfferForm({ ...offerForm, buyer_type: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: '#fff' }}
                    >
                      {buyerTypes.map((bt) => (
                        <option key={bt.id} value={bt.id}>{bt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Offered Price (₹ / kg): <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={offerForm.offered_price_per_kg}
                      onChange={(e) => setOfferForm({ ...offerForm, offered_price_per_kg: e.target.value })}
                      placeholder="e.g. 415"
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      Requested Quantity (kg): <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={offeringListing.min_order_quantity_kg}
                      value={offerForm.requested_quantity_kg}
                      onChange={(e) => setOfferForm({ ...offerForm, requested_quantity_kg: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Proposed Harvest Date:</label>
                  <input
                    type="date"
                    required
                    value={offerForm.proposed_harvest_date}
                    onChange={(e) => setOfferForm({ ...offerForm, proposed_harvest_date: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Logistics / Pickup Terms:</label>
                  <input
                    type="text"
                    value={offerForm.pickup_terms}
                    onChange={(e) => setOfferForm({ ...offerForm, pickup_terms: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Message to Farmer:</label>
                  <textarea
                    rows={2}
                    value={offerForm.message}
                    onChange={(e) => setOfferForm({ ...offerForm, message: e.target.value })}
                    placeholder="e.g. Ready to lift full catch with our insulated reefer truck. Immediate RTGS payment."
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Estimated Contract Value:</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#0369a1' }}>
                      ₹{((parseFloat(offerForm.offered_price_per_kg) || 0) * (parseFloat(offerForm.requested_quantity_kg) || 0)).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setOfferingListing(null)}
                      style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={offerSubmitting}
                      style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                    >
                      {offerSubmitting ? 'Submitting...' : 'Submit Commercial Offer'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: COUNTER OFFER
      ───────────────────────────────────────────────────────────── */}
      {activeCounterOffer && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
              Submit Counter Offer
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px' }}>
              Negotiating as: <strong>{negotiationRole === 'farmer' ? 'Aquafarm Producer' : 'Commercial Buyer'}</strong>
            </p>

            <form onSubmit={handleCounterSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Counter Price (₹/kg):</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Quantity (kg):</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={counterQty}
                  onChange={(e) => setCounterQty(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Terms / Negotiation Note:</label>
                <textarea
                  rows={3}
                  required
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="Explain justification for counter terms..."
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveCounterOffer(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  Send Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: HARVEST STATUS UPDATE (PROCESSING / COMPLETED)
      ───────────────────────────────────────────────────────────── */}
      {activeStatusOffer && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
              Update Trade Status to '{activeStatusOffer.targetStatus.toUpperCase()}'
            </h3>

            <form onSubmit={handleUpdateStatusSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  Pond-side Actual Weight (kg):
                </label>
                <input
                  type="number"
                  required
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  Dispatch / Quality Notes:
                </label>
                <textarea
                  rows={3}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="e.g. Slush-ice temperature verified at 2°C, reefer truck sealed."
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStatusOffer(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#047857', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  Update Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: RATE TRADE PARTNER
      ───────────────────────────────────────────────────────────── */}
      {reviewingTrade && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content" style={{ maxWidth: '480px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
              Rate & Review Trade Partner
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px' }}>
              Partner: <strong>{negotiationRole === 'buyer' ? reviewingTrade.farmer_name : reviewingTrade.buyer_company}</strong>
            </p>

            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Rating (1 to 5 Stars):</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{ fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer', color: star <= reviewRating ? '#eab308' : '#cbd5e1' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>Feedback & Quality Notes:</label>
                <textarea
                  rows={3}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How accurate was the count, icing quality, and payment punctuality?"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setReviewingTrade(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: FARMER "SELL MY CATCH" LISTING CREATOR
      ───────────────────────────────────────────────────────────── */}
      {showAddListingModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content" style={{ maxWidth: '640px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
              List Your Seafood Pond Harvest for Direct Buyers
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px' }}>
              Directly reach verified export processing plants and wholesale distributors.
            </p>

            <form onSubmit={handleCreateListingSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Species:</label>
                  <select
                    value={newListingForm.species}
                    onChange={(e) => setNewListingForm({ ...newListingForm, species: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', background: '#fff' }}
                  >
                    {speciesList.filter(s => s.id !== 'all').map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Pond Name / ID:</label>
                  <input
                    type="text"
                    required
                    value={newListingForm.pond_name}
                    onChange={(e) => setNewListingForm({ ...newListingForm, pond_name: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Size / Count Grade:</label>
                  <input
                    type="text"
                    required
                    value={newListingForm.size_grade}
                    onChange={(e) => setNewListingForm({ ...newListingForm, size_grade: e.target.value })}
                    placeholder="e.g. 30 Count (33g/pc)"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Estimated Tonnage (kg):</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={newListingForm.quantity_kg}
                    onChange={(e) => setNewListingForm({ ...newListingForm, quantity_kg: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Expected Price (₹/kg):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newListingForm.expected_price_per_kg}
                    onChange={(e) => setNewListingForm({ ...newListingForm, expected_price_per_kg: e.target.value })}
                    placeholder="420"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Scheduled Harvest Date:</label>
                  <input
                    type="date"
                    required
                    value={newListingForm.harvest_date}
                    onChange={(e) => setNewListingForm({ ...newListingForm, harvest_date: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Location / Village Name:</label>
                <input
                  type="text"
                  required
                  value={newListingForm.location_name}
                  onChange={(e) => setNewListingForm({ ...newListingForm, location_name: e.target.value })}
                  placeholder="e.g. Undi Road, Bhimavaram"
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Description & Catch Highlights:</label>
                <textarea
                  rows={2}
                  value={newListingForm.description}
                  onChange={(e) => setNewListingForm({ ...newListingForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddListingModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 22px', borderRadius: '8px', border: 'none', background: '#047857', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  Publish Harvest Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
