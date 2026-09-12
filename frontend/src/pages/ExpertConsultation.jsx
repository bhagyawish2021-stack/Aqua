import React, { useState, useEffect } from 'react';
import {
  getSpecializations,
  getExperts,
  getExpertById,
  bookAppointment,
  getFarmerAppointments,
  getExpertAppointments,
  updateAppointmentStatus,
  submitReview
} from '../services/expertService';

const DISTRICTS = [
  'All Locations',
  'West Godavari',
  'East Godavari',
  'Nellore',
  'Krishna',
  'Bapatla',
  'Guntur',
  'Visakhapatnam'
];

const CONSULTATION_TYPES = [
  { id: 'all', label: 'All Channels', icon: '🌐' },
  { id: 'chat', label: 'Chat Advisory', icon: '💬' },
  { id: 'voice', label: 'Phone Call', icon: '📞' },
  { id: 'video', label: 'HD Video Call', icon: '📹' },
  { id: 'appointment', label: 'On-Farm Visit', icon: '🚗' }
];

export default function ExpertConsultation() {
  const [activeMainTab, setActiveMainTab] = useState('find_experts'); // 'find_experts' | 'my_appointments' | 'expert_portal'
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('All Locations');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // 'rating' | 'experience' | 'fee_asc'

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Expert Profile Modal
  const [viewingExpert, setViewingExpert] = useState(null);

  // Booking Modal
  const [bookingExpert, setBookingExpert] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    consultation_type: 'video',
    scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduled_time_slot: '',
    pond_name: 'Pond 1 (North Vannamei)',
    problem_description: '',
    specimen_image_url: '',
    disease_report_summary: '',
    ph: '7.8',
    do_level: '4.5',
    salinity: '12',
    ammonia: '0.05'
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Farmer Appointments
  const [farmerAppointments, setFarmerAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Expert Workspace
  const [currentExpertId, setCurrentExpertId] = useState('exp-001');
  const [expertAppointments, setExpertAppointments] = useState([]);
  const [loadingExpertAppointments, setLoadingExpertAppointments] = useState(false);
  const [activePrescriptionApt, setActivePrescriptionApt] = useState(null);
  const [rxText, setRxText] = useState('');
  const [rxActions, setRxActions] = useState('1. Immediate 20% water exchange\n2. Dose chelated calcium & magnesium carbonate\n3. Reduce feed intake by 30% for 48 hours');

  // Review Modal
  const [reviewingAppointment, setReviewingAppointment] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Load specializations on mount
  useEffect(() => {
    loadSpecializations();
  }, []);

  // Reload experts when filters change
  useEffect(() => {
    if (activeMainTab === 'find_experts') {
      loadExperts();
    } else if (activeMainTab === 'my_appointments') {
      loadFarmerHistory();
    } else if (activeMainTab === 'expert_portal') {
      loadExpertHistory();
    }
  }, [activeMainTab, selectedSpec, selectedDistrict, selectedType, searchQuery, verifiedOnly, sortBy, currentExpertId]);

  const loadSpecializations = async () => {
    try {
      const res = await getSpecializations();
      if (res.data && res.data.data) {
        setSpecializations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load specializations', err);
    }
  };

  const loadExperts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        specialization: selectedSpec !== 'all' ? selectedSpec : undefined,
        district: selectedDistrict !== 'All Locations' ? selectedDistrict : undefined,
        consultation_type: selectedType !== 'all' ? selectedType : undefined,
        search: searchQuery.trim() || undefined,
        verified_only: verifiedOnly ? 'true' : undefined,
        sort_by: sortBy
      };
      const res = await getExperts(params);
      setExperts(res.data?.data || []);
    } catch (err) {
      setError('Failed to fetch aquaculture experts. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadFarmerHistory = async () => {
    setLoadingAppointments(true);
    try {
      const res = await getFarmerAppointments();
      setFarmerAppointments(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load farmer appointments', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadExpertHistory = async () => {
    setLoadingExpertAppointments(true);
    try {
      const res = await getExpertAppointments(currentExpertId);
      setExpertAppointments(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load expert appointments', err);
    } finally {
      setLoadingExpertAppointments(false);
    }
  };

  const handleOpenBooking = (expert) => {
    setBookingExpert(expert);
    setBookingSuccess(null);
    setBookingForm((prev) => ({
      ...prev,
      scheduled_time_slot: expert.available_slots?.[0] || '10:00 AM - 12:30 PM',
      consultation_type: expert.supported_types?.[0] || 'video'
    }));
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingExpert) return;

    if (!bookingForm.problem_description.trim()) {
      alert('Please describe your aquaculture issue or symptoms.');
      return;
    }

    setBookingSubmitting(true);
    try {
      const payload = {
        expert_id: bookingExpert.id,
        farmer_name: 'Aqua Farmer (Bhimavaram)',
        farmer_phone: '+91 98480 12345',
        farmer_location: `${selectedDistrict !== 'All Locations' ? selectedDistrict : 'West Godavari'}, Andhra Pradesh`,
        consultation_type: bookingForm.consultation_type,
        scheduled_date: bookingForm.scheduled_date,
        scheduled_time_slot: bookingForm.scheduled_time_slot,
        pond_name: bookingForm.pond_name,
        problem_description: bookingForm.problem_description,
        specimen_images: bookingForm.specimen_image_url ? [bookingForm.specimen_image_url] : [],
        disease_report_summary: bookingForm.disease_report_summary || 'Phase 5 AI Screening attached: Hepatopancreas discoloration with elevated risk.',
        water_parameters: {
          pH: parseFloat(bookingForm.ph) || 7.8,
          dissolved_oxygen_ppm: parseFloat(bookingForm.do_level) || 4.5,
          salinity_ppt: parseFloat(bookingForm.salinity) || 12,
          ammonia_ppm: parseFloat(bookingForm.ammonia) || 0.05
        }
      };

      const res = await bookAppointment(payload);
      setBookingSuccess(res.data?.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to book appointment');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus, extra = {}) => {
    try {
      await updateAppointmentStatus(appointmentId, {
        status: newStatus,
        ...extra
      });
      loadExpertHistory();
      loadFarmerHistory();
      if (activePrescriptionApt) {
        setActivePrescriptionApt(null);
      }
    } catch (err) {
      alert('Failed to update consultation status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingAppointment) return;

    setReviewSubmitting(true);
    try {
      await submitReview(reviewingAppointment.expert_id, {
        appointment_id: reviewingAppointment.id,
        rating: reviewRating,
        review_text: reviewText,
        farmer_name: reviewingAppointment.farmer_name || 'Aqua Farmer'
      });
      alert('Thank you! Your feedback helps verified aquaculture specialists maintain exceptional care quality.');
      setReviewingAppointment(null);
      setReviewText('');
      loadFarmerHistory();
      loadExperts();
    } catch (err) {
      alert('Failed to submit review: ' + (err.response?.data?.message || err.message));
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="consultation-header-gradient">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>
                PHASE 7 VERIFIED TELE-AQUACULTURE
              </span>
              <span style={{ background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                ✓ CIBA & VET BOARD RECOGNIZED
              </span>
            </div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800' }}>
              Aquaculture Expert Consultation
            </h1>
            <p style={{ margin: 0, fontSize: '15px', opacity: 0.9, maxWidth: '780px', lineHeight: '1.5' }}>
              Connect directly with verified aquatic veterinarians, shrimp pathologists, and water chemistry scientists.
              Schedule chat, voice, HD video calls, or on-farm diagnostic visits with end-to-end medical privacy.
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
            <button
              onClick={() => setActiveMainTab('find_experts')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeMainTab === 'find_experts' ? '#ffffff' : 'transparent',
                color: activeMainTab === 'find_experts' ? '#047857' : '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              👨‍⚕️ Find Experts
            </button>
            <button
              onClick={() => setActiveMainTab('my_appointments')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeMainTab === 'my_appointments' ? '#ffffff' : 'transparent',
                color: activeMainTab === 'my_appointments' ? '#047857' : '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              📋 My Appointments ({farmerAppointments.length})
            </button>
            <button
              onClick={() => setActiveMainTab('expert_portal')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeMainTab === 'expert_portal' ? '#ffffff' : 'transparent',
                color: activeMainTab === 'expert_portal' ? '#047857' : '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              🩺 Expert Portal
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: FIND EXPERTS & DIRECTORY
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'find_experts' && (
        <div>
          {/* Specialization Filter Pills */}
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            {specializations.map((spec) => (
              <button
                key={spec.id}
                onClick={() => setSelectedSpec(spec.id)}
                className={`spec-category-chip ${selectedSpec === spec.id ? 'active' : ''}`}
              >
                <span>{spec.icon}</span>
                <span>{spec.name}</span>
              </button>
            ))}
          </div>

          {/* Secondary Controls: Search, District, Type, Verified Only & Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', background: '#ffffff', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '24px' }}>
            <div style={{ flex: '1 1 240px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name, pathology, disease, or institution..."
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
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '14px',
                  background: '#ffffff'
                }}
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ minWidth: '150px' }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  fontSize: '14px',
                  background: '#ffffff'
                }}
              >
                {CONSULTATION_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                ✓ CAA / Vet Verified Only
              </label>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Sort by:</span>
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
                <option value="rating">⭐ Highest Rated</option>
                <option value="experience">🎓 Most Experienced</option>
                <option value="fee_asc">💰 Lowest Fee</option>
              </select>
            </div>
          </div>

          {/* Expert Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔄</div>
              Finding certified aquaculture specialists...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#fef2f2', borderRadius: '12px', color: '#991b1b' }}>
              {error}
            </div>
          ) : experts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔍</div>
              <h3 style={{ margin: '0 0 6px 0' }}>No specialists match your filter</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Try switching locations or clearing verified filters.</p>
            </div>
          ) : (
            <div className="expert-grid">
              {experts.map((exp) => (
                <div key={exp.id} className="expert-card">
                  <div>
                    {/* Header: Photo, Name & Verified Badge */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div className="expert-avatar-wrap">
                        <img src={exp.profile_photo} alt={exp.name} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{exp.name}</h3>
                        </div>
                        <div style={{ fontSize: '12px', color: '#047857', fontWeight: '700', marginTop: '2px' }}>
                          {exp.specialization_label}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {exp.qualification}
                        </div>
                        <div style={{ marginTop: '4px' }}>
                          {exp.is_verified ? (
                            <span className="verified-badge-pill">✓ Verified Specialist</span>
                          ) : (
                            <span className="pending-badge-pill">⏳ Credentials Review</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio excerpt */}
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4', margin: '0 0 14px 0' }}>
                      {exp.bio}
                    </p>

                    {/* Meta stats: Experience, Location, Fee, Rating */}
                    <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px', marginBottom: '14px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Experience: </span>
                        <strong style={{ color: '#0f172a' }}>{exp.experience_years} Years</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Location: </span>
                        <strong style={{ color: '#0f172a' }}>{exp.location}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Fee: </span>
                        <strong style={{ color: '#047857', fontSize: '13px' }}>₹{exp.consultation_fee}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#eab308' }}>★</span>
                        <strong>{exp.rating}</strong>
                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>({exp.reviews_count})</span>
                      </div>
                    </div>

                    {/* Languages & Supported Channels */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                        Languages: <strong style={{ color: '#334155' }}>{exp.languages?.join(', ')}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {exp.supported_types?.map((type) => (
                          <span key={type} className="channel-tag active">
                            {type === 'chat' && '💬 Chat'}
                            {type === 'voice' && '📞 Voice'}
                            {type === 'video' && '📹 Video'}
                            {type === 'appointment' && '🚗 Farm Visit'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => setViewingExpert(exp)}
                      style={{
                        flex: '1',
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        background: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleOpenBooking(exp)}
                      style={{
                        flex: '1.2',
                        padding: '10px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#047857',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(4, 120, 87, 0.2)'
                      }}
                    >
                      Book Consultation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: FARMER APPOINTMENTS & CONSULTATION HISTORY
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'my_appointments' && (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800' }}>Your Consultation History</h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                Track appointment confirmations, specialist recommendations, and treatment plans.
              </p>
            </div>
            <button
              onClick={loadFarmerHistory}
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

          {loadingAppointments ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              Loading consultation records...
            </div>
          ) : farmerAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '42px', marginBottom: '12px' }}>📋</div>
              <h3 style={{ margin: '0 0 6px 0' }}>No consultation appointments yet</h3>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>
                Book your first session with verified aquaculture scientists for rapid disease diagnosis.
              </p>
              <button
                onClick={() => setActiveMainTab('find_experts')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#047857',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Browse Experts Now
              </button>
            </div>
          ) : (
            <div>
              {farmerAppointments.map((apt) => (
                <div key={apt.id} className="appointment-record-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{apt.appointment_number}</span>
                        <span className={`status-pill status-pill-${apt.status}`}>
                          {apt.status === 'requested' && '⏳ Requested'}
                          {apt.status === 'confirmed' && '✓ Confirmed'}
                          {apt.status === 'in_progress' && '📞 In Progress'}
                          {apt.status === 'completed' && '✅ Completed'}
                          {apt.status === 'cancelled' && '❌ Cancelled'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#047857', fontWeight: '700', marginTop: '4px' }}>
                        Specialist: {apt.expert_name}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                        {apt.scheduled_date} | {apt.scheduled_time_slot}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>
                        Channel: {apt.consultation_type} • Fee: ₹{apt.consultation_fee}
                      </div>
                    </div>
                  </div>

                  {/* Problem & Pond Details */}
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', marginBottom: '12px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: '#64748b', fontWeight: '600' }}>Pond: </span>
                      <strong>{apt.pond_name || 'Main Culture Pond'}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: '600' }}>Reported Problem: </span>
                      <span style={{ color: '#334155' }}>{apt.problem_description}</span>
                    </div>

                    {/* Attached Water Parameters if available */}
                    {apt.water_parameters && Object.keys(apt.water_parameters).length > 0 && (
                      <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px' }}>
                        {apt.water_parameters.pH && <span style={{ background: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>pH: <strong>{apt.water_parameters.pH}</strong></span>}
                        {apt.water_parameters.dissolved_oxygen_ppm && <span style={{ background: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>DO: <strong>{apt.water_parameters.dissolved_oxygen_ppm} ppm</strong></span>}
                        {apt.water_parameters.salinity_ppt && <span style={{ background: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>Salinity: <strong>{apt.water_parameters.salinity_ppt} ppt</strong></span>}
                        {apt.water_parameters.ammonia_ppm && <span style={{ background: '#ffffff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>Ammonia: <strong>{apt.water_parameters.ammonia_ppm} ppm</strong></span>}
                      </div>
                    )}
                  </div>

                  {/* Expert Recommendations / Clinical Notes if completed or in_progress */}
                  {apt.expert_recommendations && (
                    <div className="rx-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: '800', fontSize: '13px', marginBottom: '6px' }}>
                        <span>🩺</span> Specialist Prescription & Corrective Plan:
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#14532d', lineHeight: '1.5' }}>
                        {apt.expert_recommendations}
                      </p>
                      {apt.prescribed_actions?.length > 0 && (
                        <div style={{ fontSize: '12px', color: '#166534' }}>
                          <strong>Prescribed Checklist:</strong>
                          <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                            {apt.prescribed_actions.map((act, idx) => (
                              <li key={idx}>{act}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {apt.follow_up_date && (
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#15803d', fontWeight: '700' }}>
                          📅 Follow-up scheduled on: {apt.follow_up_date}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rejection notice if cancelled */}
                  {apt.rejection_reason && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', color: '#991b1b', fontSize: '13px', marginTop: '10px' }}>
                      <strong>Declined by specialist:</strong> {apt.rejection_reason}
                    </div>
                  )}

                  {/* Footer Actions: Cancel if requested, Review if completed */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                    {apt.status === 'requested' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'cancelled', { rejection_reason: 'Cancelled by farmer' })}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #fca5a5',
                          background: '#fff',
                          color: '#dc2626',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel Request
                      </button>
                    )}
                    {apt.status === 'completed' && (
                      <button
                        onClick={() => setReviewingAppointment(apt)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: '1px solid #eab308',
                          background: '#fef9c3',
                          color: '#854d0e',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        ⭐ Rate & Review Specialist
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: EXPERT WORKSPACE & CLINICAL ADVISORY PORTAL
      ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'expert_portal' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Active Doctor Selector (Simulated role login for demonstration) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>
                Active Specialist Session (Role-Based Access)
              </div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#14532d', marginTop: '2px' }}>
                Consultant Clinical Dashboard
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#166534', fontWeight: '600' }}>Logged in as:</span>
              <select
                value={currentExpertId}
                onChange={(e) => setCurrentExpertId(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #86efac',
                  background: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#14532d'
                }}
              >
                <option value="exp-001">Dr. K. S. Murthy (Shrimp Pathology)</option>
                <option value="exp-002">Dr. Ananya Ray (Water Chemistry)</option>
                <option value="exp-003">Prof. V. Ramanathan (Finfish Breeding)</option>
                <option value="exp-004">Dr. Rajeshwari Patel (Biosecurity)</option>
                <option value="exp-005">Dr. G. Sivaramakrishna (Bio-floc)</option>
              </select>
            </div>
          </div>

          {/* Pending Appointments / Triage List */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Assigned Patient Queue & Appointments</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Private Farmer Records Protected</span>
          </div>

          {loadingExpertAppointments ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              Loading assigned farmer appointments...
            </div>
          ) : expertAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ fontSize: '38px', marginBottom: '8px' }}>🩺</div>
              <h4 style={{ margin: '0 0 6px 0' }}>No appointment requests in your queue</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                New consultation requests from farmers will appear here for clinical assessment.
              </p>
            </div>
          ) : (
            <div>
              {expertAppointments.map((apt) => (
                <div key={apt.id} className="appointment-record-card" style={{ borderLeft: '4px solid #047857' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '800' }}>{apt.appointment_number}</span>
                        <span className={`status-pill status-pill-${apt.status}`}>
                          {apt.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '4px' }}>
                        Farmer: {apt.farmer_name} ({apt.farmer_location})
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Contact: {apt.farmer_phone} • Scheduled: <strong>{apt.scheduled_date} at {apt.scheduled_time_slot}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="channel-tag active">
                        {apt.consultation_type.toUpperCase()} CONSULTATION
                      </span>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#047857', marginTop: '4px' }}>
                        Fee: ₹{apt.consultation_fee}
                      </div>
                    </div>
                  </div>

                  {/* Clinical Presentation Details */}
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', marginBottom: '12px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <strong style={{ color: '#0f172a' }}>Reported Symptoms: </strong>
                      <span>{apt.problem_description}</span>
                    </div>

                    {apt.disease_report_summary && (
                      <div style={{ background: '#fef3c7', padding: '8px 10px', borderRadius: '6px', color: '#92400e', marginBottom: '8px', fontSize: '12px' }}>
                        <strong>AI Disease Screening Diagnostic:</strong> {apt.disease_report_summary}
                      </div>
                    )}

                    {/* Water parameters */}
                    {apt.water_parameters && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12px', color: '#334155' }}>
                        <span>pH: <strong>{apt.water_parameters.pH || 'N/A'}</strong></span>
                        <span>DO: <strong>{apt.water_parameters.dissolved_oxygen_ppm || 'N/A'} ppm</strong></span>
                        <span>Salinity: <strong>{apt.water_parameters.salinity_ppt || 'N/A'} ppt</strong></span>
                        <span>Ammonia: <strong>{apt.water_parameters.ammonia_ppm || 'N/A'} ppm</strong></span>
                      </div>
                    )}

                    {/* Specimen image preview if any */}
                    {apt.specimen_images?.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>
                          ATTACHED SPECIMEN PHOTOS ({apt.specimen_images.length}):
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {apt.specimen_images.map((imgUrl, i) => (
                            <img
                              key={i}
                              src={imgUrl}
                              alt="Specimen"
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendations section if written */}
                  {apt.expert_recommendations && (
                    <div className="rx-box" style={{ marginBottom: '12px' }}>
                      <strong style={{ color: '#166534', fontSize: '13px' }}>Prescribed Clinical Protocol:</strong>
                      <p style={{ margin: '4px 0', fontSize: '13px', color: '#14532d' }}>{apt.expert_recommendations}</p>
                    </div>
                  )}

                  {/* Decision & Clinical Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                    {apt.status === 'requested' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'cancelled', { rejection_reason: 'Time slot conflict with lab duties' })}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: '1px solid #fca5a5',
                            background: '#fff',
                            color: '#dc2626',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Reject Request
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
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
                          ✓ Accept Appointment
                        </button>
                      </>
                    )}

                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'in_progress')}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#d97706',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        📞 Start Consultation Session
                      </button>
                    )}

                    {(apt.status === 'in_progress' || apt.status === 'confirmed') && (
                      <button
                        onClick={() => {
                          setActivePrescriptionApt(apt);
                          setRxText(apt.expert_recommendations || 'Recommend immediate 25% water renewal followed by bio-augmentation.');
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#0f766e',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        🩺 Issue Prescription & Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: BOOK CONSULTATION APPOINTMENT
      ───────────────────────────────────────────────────────────── */}
      {bookingExpert && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  BOOK CONSULTATION SESSION
                </span>
                <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: '800' }}>
                  {bookingExpert.name}
                </h2>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {bookingExpert.specialization_label} • Fee: <strong style={{ color: '#047857' }}>₹{bookingExpert.consultation_fee}</strong>
                </div>
              </div>
              <button
                onClick={() => setBookingExpert(null)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#047857', fontSize: '22px' }}>
                  Appointment Successfully Scheduled!
                </h3>
                <p style={{ margin: '0 0 16px 0', color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
                  Your appointment ID is <strong>{bookingSuccess.appointment_number}</strong>.
                  The specialist has been notified. You can track this in your <em>My Appointments</em> tab.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      setBookingExpert(null);
                      setActiveMainTab('my_appointments');
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#047857',
                      color: '#fff',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    View My Appointments
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateBooking}>
                {/* 1. Consultation Channel Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                    Select Consultation Mode:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {bookingExpert.supported_types?.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, consultation_type: type })}
                        className={`slot-chip ${bookingForm.consultation_type === type ? 'selected' : ''}`}
                        style={{ textAlign: 'center' }}
                      >
                        {type === 'chat' && '💬 Chat'}
                        {type === 'voice' && '📞 Voice'}
                        {type === 'video' && '📹 Video'}
                        {type === 'appointment' && '🚗 Farm Visit'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Date & Time Slot */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                      Date:
                    </label>
                    <input
                      type="date"
                      value={bookingForm.scheduled_date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingForm({ ...bookingForm, scheduled_date: e.target.value })}
                      required
                      style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                      Pond Identification:
                    </label>
                    <input
                      type="text"
                      value={bookingForm.pond_name}
                      onChange={(e) => setBookingForm({ ...bookingForm, pond_name: e.target.value })}
                      placeholder="e.g. Pond 3 (Shrimp Nursery)"
                      style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                    />
                  </div>
                </div>

                {/* 3. Available Time Slots */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                    Select Preferred Time Slot:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {bookingExpert.available_slots?.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setBookingForm({ ...bookingForm, scheduled_time_slot: slot })}
                        className={`slot-chip ${bookingForm.scheduled_time_slot === slot ? 'selected' : ''}`}
                      >
                        🕒 {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Problem Description & Clinical Signs */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                    Describe Symptoms / Clinical Signs: <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={bookingForm.problem_description}
                    onChange={(e) => setBookingForm({ ...bookingForm, problem_description: e.target.value })}
                    placeholder="Describe lethargy, white gut, loose shell, mortality rate, feed consumption decline..."
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', resize: 'vertical' }}
                  />
                </div>

                {/* 5. Water Parameters Snapshot */}
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                    Attach Current Water Parameters (Optional):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>pH:</span>
                      <input
                        type="text"
                        value={bookingForm.ph}
                        onChange={(e) => setBookingForm({ ...bookingForm, ph: e.target.value })}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>DO (ppm):</span>
                      <input
                        type="text"
                        value={bookingForm.do_level}
                        onChange={(e) => setBookingForm({ ...bookingForm, do_level: e.target.value })}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Salinity (ppt):</span>
                      <input
                        type="text"
                        value={bookingForm.salinity}
                        onChange={(e) => setBookingForm({ ...bookingForm, salinity: e.target.value })}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>NH3 (ppm):</span>
                      <input
                        type="text"
                        value={bookingForm.ammonia}
                        onChange={(e) => setBookingForm({ ...bookingForm, ammonia: e.target.value })}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Specimen Photo URL or Disease Report */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    Specimen / Lab Report URL:
                  </label>
                  <input
                    type="url"
                    value={bookingForm.specimen_image_url}
                    onChange={(e) => setBookingForm({ ...bookingForm, specimen_image_url: e.target.value })}
                    placeholder="https://example.com/specimen-gill-necrosis.jpg"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                  />
                </div>

                {/* Bottom Submit */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Total Consultation Fee:</span>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#047857' }}>
                      ₹{bookingExpert.consultation_fee}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setBookingExpert(null)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        background: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingSubmitting}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#047857',
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)'
                      }}
                    >
                      {bookingSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: VIEW FULL EXPERT PROFILE & REVIEWS
      ───────────────────────────────────────────────────────────── */}
      {viewingExpert && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="expert-avatar-wrap" style={{ width: '80px', height: '80px' }}>
                  <img src={viewingExpert.profile_photo} alt={viewingExpert.name} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{viewingExpert.name}</h2>
                  <div style={{ color: '#047857', fontWeight: '700', fontSize: '13px' }}>{viewingExpert.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{viewingExpert.qualification}</div>
                  <div style={{ marginTop: '4px' }}>
                    {viewingExpert.is_verified && (
                      <span className="verified-badge-pill">✓ Verified by {viewingExpert.verified_by || 'Veterinary Council'}</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingExpert(null)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#334155', background: '#f8fafc', padding: '14px', borderRadius: '12px' }}>
              {viewingExpert.bio}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '16px 0', textAlign: 'center' }}>
              <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '10px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#047857' }}>{viewingExpert.experience_years}+ Yrs</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>AQUACULTURE EXP</div>
              </div>
              <div style={{ padding: '12px', background: '#fef9c3', borderRadius: '10px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#854d0e' }}>★ {viewingExpert.rating}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>RATING ({viewingExpert.reviews_count})</div>
              </div>
              <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '10px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e40af' }}>₹{viewingExpert.consultation_fee}</div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>PER CONSULTATION</div>
              </div>
            </div>

            {/* Farmer Reviews */}
            <h4 style={{ margin: '18px 0 10px 0', fontSize: '15px', fontWeight: '800' }}>Farmer Reviews & Feedback</h4>
            {viewingExpert.reviews && viewingExpert.reviews.length > 0 ? (
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {viewingExpert.reviews.map((rev) => (
                  <div key={rev.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '10px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: '#0f172a' }}>{rev.farmer_name}</strong>
                      <span style={{ color: '#eab308' }}>{'★'.repeat(rev.rating)}</span>
                    </div>
                    <p style={{ margin: 0, color: '#475569' }}>{rev.review_text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '13px' }}>No written reviews yet.</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={() => setViewingExpert(null)}
                style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = viewingExpert;
                  setViewingExpert(null);
                  handleOpenBooking(target);
                }}
                style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#047857', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: WRITE CLINICAL PRESCRIPTION (EXPERT)
      ───────────────────────────────────────────────────────────── */}
      {activePrescriptionApt && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content">
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
              Issue Clinical Prescription & Protocol
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px' }}>
              Appointment: <strong>{activePrescriptionApt.appointment_number}</strong> for {activePrescriptionApt.farmer_name}
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                Clinical Diagnostic Findings & Recommendations:
              </label>
              <textarea
                rows={4}
                value={rxText}
                onChange={(e) => setRxText(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                Prescribed Farmer Action Steps (One per line):
              </label>
              <textarea
                rows={3}
                value={rxActions}
                onChange={(e) => setRxActions(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setActivePrescriptionApt(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const actionsArray = rxActions.split('\n').map(s => s.trim()).filter(Boolean);
                  handleUpdateStatus(activePrescriptionApt.id, 'completed', {
                    expert_recommendations: rxText,
                    prescribed_actions: actionsArray,
                    follow_up_date: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0]
                  });
                }}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#047857', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
              >
                Save & Complete Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: FARMER REVIEW EXPERT
      ───────────────────────────────────────────────────────────── */}
      {reviewingAppointment && (
        <div className="booking-modal-overlay">
          <div className="booking-modal-content" style={{ maxWidth: '500px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
              Rate & Review Consultation
            </h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px' }}>
              Specialist: <strong>{reviewingAppointment.expert_name}</strong>
            </p>

            <form onSubmit={handleSubmitReview}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                  Rating (1 to 5 Stars):
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
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

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Your Feedback:
                </label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How clear was the doctor's advice? Did it resolve your pond issue?"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setReviewingAppointment(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#047857', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
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
