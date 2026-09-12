import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import * as diseaseService from '../services/diseaseService';

// Sample demonstration images for instant testing
const SAMPLE_IMAGES = [
  {
    label: '🦐 WSSV Sample (White spots on carapace)',
    species: 'vannamei_shrimp',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    symptoms: ['White spots on carapace', 'Lethargic surface swimming', 'Red/pink body discoloration'],
    water: { ph: 7.3, temperature: 31.5, dissolved_oxygen: 3.4, salinity: 18, ammonia: 0.09, nitrite: 0.14, turbidity: 22 },
    notes: 'Sample taken from Pond 1 intake gate. Moribund shrimp observed gathering at the water edge.'
  },
  {
    label: '🦐 AHPND / EMS Sample (Pale hepatopancreas)',
    species: 'vannamei_shrimp',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
    symptoms: ['Pale / atrophied hepatopancreas', 'Empty digestive tract / gut', 'Soft shell and lethargy'],
    water: { ph: 7.8, temperature: 32.2, dissolved_oxygen: 4.1, salinity: 22, ammonia: 0.08, nitrite: 0.06, turbidity: 28 },
    notes: 'DOC 28 shrimp showing pale digestive gland and empty gut.'
  },
  {
    label: '🐟 EUS Red Spot Sample (Dermal ulcers)',
    species: 'tilapia',
    url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80',
    symptoms: ['Deep bleeding dermal ulcers', 'Sluggish swimming / off-feed'],
    water: { ph: 6.9, temperature: 23.5, dissolved_oxygen: 3.8, salinity: 4, ammonia: 0.06, nitrite: 0.08, turbidity: 35 },
    notes: 'Fish sampled after 3 days of continuous heavy rainfall.'
  },
  {
    label: '🦐 Clean Healthy Specimen Sample',
    species: 'vannamei_shrimp',
    url: 'https://images.unsplash.com/photo-1509783236416-c9ad59bae472?auto=format&fit=crop&w=800&q=80',
    symptoms: [],
    water: { ph: 8.1, temperature: 28.5, dissolved_oxygen: 5.8, salinity: 20, ammonia: 0.02, nitrite: 0.03, turbidity: 32 },
    notes: 'Routine sampling at DOC 55. Vigorous swimming and full dark midgut.'
  }
];

const COMMON_SYMPTOMS = [
  'White spots on carapace',
  'Pale / atrophied hepatopancreas',
  'Empty digestive tract / gut',
  'Red/pink body discoloration',
  'Lethargic surface swimming',
  'Floating white fecal strings (WFD)',
  'Brown / black gill discoloration',
  'Frayed / eroded fins (Fin rot)',
  'Deep bleeding dermal ulcers (EUS)',
  'Cotton-wool mouth / body lesions',
  'Cloudy eyes / sunken eye cataracts',
  'Paralyzed walking legs (Crab)',
  'Soft shell and erratic swimming'
];

export default function DiseaseMonitoring() {
  const [lang, setLang] = useState('en'); // 'en' | 'te'
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedPondFilter, setSelectedPondFilter] = useState('all');

  // Form State
  const [species, setSpecies] = useState('vannamei_shrimp');
  const [pondId, setPondId] = useState('pond-01');
  const [pondName, setPondName] = useState('Pond 1 — Nursery & Grow-out');
  const [imageUrl, setImageUrl] = useState(SAMPLE_IMAGES[0].url);
  const [selectedSymptoms, setSelectedSymptoms] = useState(SAMPLE_IMAGES[0].symptoms);
  const [farmerNotes, setFarmerNotes] = useState(SAMPLE_IMAGES[0].notes);

  // 7 Water Parameters
  const [waterParams, setWaterParams] = useState(SAMPLE_IMAGES[0].water);

  // Modals & Active view
  const [currentResult, setCurrentResult] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [showExpertModal, setShowExpertModal] = useState(null); // analysisId
  const [expertForm, setExpertForm] = useState({
    farmer_name: 'V. Ramana Murthy',
    phone: '+91 98480 12345',
    pond_location: 'Bhimavaram, West Godavari',
    urgent_notes: 'Specimens preserved in 95% ethanol. Requesting lab RT-PCR confirmation.'
  });

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Initial load
  const loadData = async () => {
    try {
      const [alertsRes, historyRes] = await Promise.all([
        diseaseService.getDiseaseAlerts(),
        diseaseService.getDiseaseHistory()
      ]);
      if (alertsRes.data?.data) setAlerts(alertsRes.data.data);
      if (historyRes.data?.data) setHistory(historyRes.data.data);
    } catch (err) {
      console.error('Failed loading disease data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load sample preset
  const applySample = (sample) => {
    setSpecies(sample.species);
    setImageUrl(sample.url);
    setSelectedSymptoms(sample.symptoms);
    setWaterParams(sample.water);
    setFarmerNotes(sample.notes);
    showToast(`Loaded ${sample.label}`);
  };

  // Toggle symptom chip
  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  // Handle image upload from file input
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
        showToast('📸 Specimen photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit for AI screening
  const handleSubmitAnalysis = async (e) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please provide or upload a specimen image.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        species,
        pond_id: pondId,
        pond_name: pondName,
        image_url: imageUrl,
        symptoms: selectedSymptoms,
        water_parameters: waterParams,
        farmer_notes: farmerNotes
      };

      const res = await diseaseService.analyzeSpecimen(payload);
      if (res.data?.success) {
        setCurrentResult(res.data.data);
        showToast('🧬 AI Screening Completed! Results ready.');
        loadData(); // Refresh history and alerts
      }
    } catch (err) {
      alert(err.response?.data?.message || 'AI Screening failed');
    } finally {
      setLoading(false);
    }
  };

  // Dismiss / read alert
  const handleDismissAlert = async (alertId) => {
    try {
      await diseaseService.markAlertAsRead(alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
      showToast('Alert acknowledged');
    } catch (err) {
      console.error(err);
    }
  };

  // Submit expert consultation
  const handleSubmitExpertConsultation = async (e) => {
    e.preventDefault();
    if (!showExpertModal) return;
    try {
      const res = await diseaseService.requestExpertConsultation(showExpertModal, expertForm);
      if (res.data?.success) {
        showToast('👨‍⚕️ Emergency Pathologist Consultation Requested!');
        setShowExpertModal(null);
        if (currentResult && currentResult.id === showExpertModal) {
          setCurrentResult(res.data.data);
        }
        loadData();
      }
    } catch (err) {
      alert('Failed to request consultation.');
    }
  };

  const filteredHistory = selectedPondFilter === 'all'
    ? history
    : history.filter(h => h.pond_id === selectedPondFilter);

  return (
    <Layout>
      <div className="page-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Toast Alert */}
        {toast && (
          <div style={{
            position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
            background: '#0f172a', color: '#fff', padding: '14px 22px', borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: '10px',
            border: '1px solid #38bdf8', fontSize: '14px', fontWeight: '600'
          }}>
            <span>✨</span>
            <span>{toast}</span>
          </div>
        )}

        {/* Page Header */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', gap: '16px', marginBottom: '18px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '32px' }}>🔬</span>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: 'var(--text)' }}>
                {lang === 'en' ? 'AI Disease Detection & Pond Health Screening' : 'AI వ్యాధి గుర్తింపు & చెరువు ఆరోగ్య పర్యవేక్షణ'}
              </h1>
            </div>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
              {lang === 'en'
                ? 'Computer-vision assisted screening for shrimp, fish & crab abnormalities cross-correlated with 7 critical water quality parameters.'
                : 'రొయ్యలు, చేపలు మరియు పీతల వ్యాధి లక్షణాలను ఫోటో మరియు నీటి విశ్లేషణ ద్వారా గుర్తించండి.'}
            </p>
          </div>

          <button
            onClick={() => setLang(l => l === 'en' ? 'te' : 'en')}
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '13px', fontWeight: '700' }}
          >
            🌐 {lang === 'en' ? 'తెలుగు' : 'English'}
          </button>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* MANDATORY DISCLAIMER BANNER (Strict Compliance Requirement)         */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <div className="disease-disclaimer-banner">
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'en' ? 'Preliminary AI Screening Tool — Not a Definitive Medical Diagnosis' : 'ప్రాథమిక AI స్క్రీనింగ్ సాధనం — ఇది అంతిమ రోగ నిర్ధారణ కాదు'}
            </div>
            <div style={{ fontSize: '12px', color: '#78350f', marginTop: '3px', lineHeight: '1.45' }}>
              {lang === 'en'
                ? 'This feature is an AI-assisted preliminary screening aid designed to assist aquaculture farmers in recognizing early symptoms and environmental stress. It is NOT a substitute for professional laboratory RT-PCR testing or certified veterinary pathology. Never treat this output as a guaranteed diagnosis. Always consult certified aquatic health specialists (ICAR-CIBA / MPEDA) before applying antibiotics or therapeutic chemicals.'
                : 'ఈ AI సాధనం ప్రాథమిక హెచ్చరిక కోసం మాత్రమే. రసాయనాలు లేదా మందులు వాడే ముందు తప్పనిసరిగా ఆక్వాకల్చర్ నిపుణులు మరియు ల్యాబ్ పరీక్షల ద్వారా నిర్ధారించుకోండి.'}
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* ACTIVE ALERTS SECTION (High Risk, Repeated Anomalies, Water Stresses) */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {alerts.length > 0 && (
          <div className="disease-alert-bar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '800', color: '#991b1b' }}>
                <span style={{ animation: 'aquaPulse 1.5s infinite', display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span>
                <span>Active Disease & Water Quality Warnings ({alerts.length})</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Automated System Alerts</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className={`disease-alert-pill disease-alert-${alert.severity}`}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>
                      {alert.severity === 'critical' ? '🚨' : alert.severity === 'danger' ? '⚠️' : '💧'}
                    </span>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '13px' }}>{alert.title}</div>
                      <div style={{ fontSize: '12px', marginTop: '2px', opacity: 0.9 }}>{alert.message}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissAlert(alert.id)}
                    style={{
                      background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: '6px',
                      padding: '4px 8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Grid: Left = Screening Form, Right = Recent Result / History */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* SCREENING FORM: 6-Step Workflow                                   */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div style={{
            background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px',
            padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
              🩺 {lang === 'en' ? 'New Specimen Screening' : 'కొత్త విత్తన / జీవి స్క్రీనింగ్'}
            </h2>

            {/* Quick Demo Sample Picker */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Quick Test with Sample Cases:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {SAMPLE_IMAGES.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySample(s)}
                    style={{
                      background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px',
                      padding: '4px 9px', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitAnalysis}>

              {/* Step 1 & 2: Species & Pond */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    1. Target Species
                  </label>
                  <select
                    className="form-input"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px' }}
                  >
                    <option value="vannamei_shrimp">🦐 Vannamei Shrimp (P. vannamei)</option>
                    <option value="tiger_prawn">🐅 Black Tiger Prawn (P. monodon)</option>
                    <option value="tilapia">🐟 GIFT / Nile Tilapia</option>
                    <option value="seabass">🐟 Asian Seabass (Barramundi)</option>
                    <option value="carp">🐟 Indian Major Carp (Rohu / Catla)</option>
                    <option value="mud_crab">🦀 Green Mud Crab (Scylla serrata)</option>
                    <option value="other">🌿 Other Aquaculture Specimen</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    2. Select Pond
                  </label>
                  <select
                    className="form-input"
                    value={pondId}
                    onChange={(e) => {
                      setPondId(e.target.value);
                      setPondName(e.target.options[e.target.selectedIndex].text);
                    }}
                    style={{ width: '100%', padding: '9px 10px' }}
                  >
                    <option value="pond-01">Pond 1 — Nursery & Grow-out</option>
                    <option value="pond-02">Pond 2 — Tiger Prawn Semi-Intensive</option>
                    <option value="pond-03">Pond 3 — Freshwater Poly-Culture</option>
                    <option value="pond-custom">Custom Pond (Specify in Notes)</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Image Upload & Preview */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                  3. Specimen Image (Upload Photo or Paste Image URL)
                </label>

                {/* Dropzone & Preview Box */}
                <div style={{
                  border: '1.5px dashed #cbd5e1', borderRadius: '12px', padding: '14px',
                  background: '#f8fafc', textAlign: 'center', marginBottom: '8px'
                }}>
                  {imageUrl ? (
                    <div>
                      <img
                        src={imageUrl}
                        alt="Specimen preview"
                        style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '8px', background: '#0f172a' }}
                      />
                      <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <label className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 10px', cursor: 'pointer' }}>
                          📷 Upload Different Photo
                          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label style={{ cursor: 'pointer', display: 'block', padding: '20px 0' }}>
                      <div style={{ fontSize: '32px', marginBottom: '6px' }}>📸</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                        Click to upload specimen image
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Supports JPG, PNG, WebP (Shrimp cuticle, hepatopancreas, gills, or fish body)
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                <input
                  type="text"
                  className="form-input"
                  placeholder="Or enter direct image URL: https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ width: '100%', fontSize: '12px', padding: '6px 10px' }}
                />
              </div>

              {/* Step 4: Observable Symptoms Selection */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                  4. Observable Physical Symptoms (Select all observed)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {COMMON_SYMPTOMS.map((sym, i) => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <div
                        key={i}
                        onClick={() => toggleSymptom(sym)}
                        className={`symptom-chip ${isSelected ? 'selected' : ''}`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {sym}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 5: Water Quality Parameters (All 7 Parameters) */}
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                padding: '14px', marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    5. Water Quality Readings (7 Parameters)
                  </label>
                  <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '600' }}>
                    Correlated with Disease Pathogenicity
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px' }}>
                  {/* pH */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>pH (7.5-8.5)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={waterParams.ph}
                      onChange={(e) => setWaterParams({ ...waterParams, ph: parseFloat(e.target.value) || '' })}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                    />
                  </div>

                  {/* Temp */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={waterParams.temperature}
                      onChange={(e) => setWaterParams({ ...waterParams, temperature: parseFloat(e.target.value) || '' })}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                    />
                  </div>

                  {/* DO */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>DO (mg/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={waterParams.dissolved_oxygen}
                      onChange={(e) => setWaterParams({ ...waterParams, dissolved_oxygen: parseFloat(e.target.value) || '' })}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                    />
                  </div>

                  {/* Salinity */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>Salinity (ppt)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={waterParams.salinity}
                      onChange={(e) => setWaterParams({ ...waterParams, salinity: parseFloat(e.target.value) || '' })}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                    />
                  </div>

                  {/* Ammonia */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>TAN (mg/L)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={waterParams.ammonia}
                      onChange={(e) => setWaterParams({ ...waterParams, ammonia: parseFloat(e.target.value) || '' })}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                    />
                  </div>

                  {/* Nitrite */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>NO2 (mg/L)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={waterParams.nitrite}
                      onChange={(e) => setWaterParams({ ...waterParams, nitrite: parseFloat(e.target.value) || '' })}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                    />
                  </div>

                  {/* Turbidity */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>Secchi (cm)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={waterParams.turbidity}
                      onChange={(e) => setWaterParams({ ...waterParams, turbidity: parseFloat(e.target.value) || '' })}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Farmer Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                  6. Additional Observations & Pond Notes
                </label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={farmerNotes}
                  onChange={(e) => setFarmerNotes(e.target.value)}
                  placeholder="e.g. Feeding tray consumption dropped 40%; surface skimming at 6 AM..."
                  style={{ width: '100%', fontSize: '13px' }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '12px', fontSize: '15px', fontWeight: '800',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <span>🔄</span>
                    <span>Analyzing Specimen Image & Water Parameters...</span>
                  </>
                ) : (
                  <>
                    <span>🔬</span>
                    <span>Run AI Disease Screening Assessment</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: Screening Assessment Card & Results                */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div>
            {currentResult ? (
              <div style={{
                background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', position: 'sticky', top: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-secondary)' }}>
                      AI Screening Assessment Report
                    </span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>
                      {currentResult.ai_result?.possible_disease}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
                      {currentResult.ai_result?.scientific_name}
                    </div>
                  </div>

                  {/* Risk Level Pill */}
                  <div className={`risk-tag risk-${currentResult.risk_level.toLowerCase()}`}>
                    <span>{currentResult.risk_level === 'Critical' ? '🚨' : currentResult.risk_level === 'High' ? '⚠️' : '🛡️'}</span>
                    <span>{currentResult.risk_level} RISK</span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px',
                  padding: '12px', marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '12px', fontWeight: '700' }}>
                    <span>Confidence Score</span>
                    <span style={{ color: 'var(--primary)', fontSize: '15px', fontWeight: '800' }}>
                      {currentResult.confidence}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${currentResult.confidence}%`, height: '100%',
                      background: currentResult.risk_level === 'Critical' ? '#ef4444' : currentResult.risk_level === 'High' ? '#f97316' : '#10b981',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>

                {/* Detected Symptoms */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Detected Pathology Symptoms:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155' }}>
                    {currentResult.ai_result?.detected_symptoms?.map((ds, i) => (
                      <li key={i} style={{ marginBottom: '3px' }}>{ds}</li>
                    ))}
                  </ul>
                </div>

                {/* Water Quality Correlation Box */}
                <div style={{
                  background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px',
                  padding: '12px', marginBottom: '16px', fontSize: '12px', color: '#0369a1'
                }}>
                  <strong>💧 Water Parameter Cross-Correlation:</strong>
                  <div style={{ marginTop: '4px', color: '#075985' }}>
                    {currentResult.ai_result?.water_quality_correlation}
                  </div>
                </div>

                {/* Recommended Next Steps */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Recommended Mitigation Next Steps:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {currentResult.ai_result?.recommended_next_steps?.map((step, i) => (
                      <div key={i} style={{
                        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
                        padding: '8px 10px', fontSize: '12px', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '6px'
                      }}>
                        <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expert Consultation Section */}
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
                  padding: '14px', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b', marginBottom: '4px' }}>
                    {currentResult.expert_status === 'requested' ? '👨‍⚕️ Expert Consultation Requested' : 'Certified Pathologist Consultation Recommended'}
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#7f1d1d' }}>
                    Verify visual findings with certified CIBA / MPEDA aquaculture tele-pathologists before applying chemical treatments.
                  </p>

                  {currentResult.expert_status === 'requested' ? (
                    <div style={{
                      background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '8px',
                      fontSize: '12px', fontWeight: '700', display: 'inline-block'
                    }}>
                      ✓ Request Dispatched to Emergency Tele-Pathology Desk
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowExpertModal(currentResult.id)}
                      className="btn btn-primary"
                      style={{ background: '#dc2626', borderColor: '#b91c1c', fontSize: '12px', padding: '8px 16px', fontWeight: '800' }}
                    >
                      🚨 Request Emergency Expert Review
                    </button>
                  )}
                </div>

              </div>
            ) : (
              <div style={{
                background: '#fff', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '40px 20px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔬</div>
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>
                  Ready for Disease Screening
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '340px', margin: '0 auto 16px auto' }}>
                  Select your species, upload a specimen photo, and input water parameters to receive an AI pathology assessment.
                </p>
                <button
                  onClick={() => applySample(SAMPLE_IMAGES[0])}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', fontWeight: '700' }}
                >
                  Load Example WSSV Case
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* POND MONITORING & DISEASE SCREENING HISTORY                           */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text)' }}>
                📊 {lang === 'en' ? 'Pond Disease Monitoring History' : 'చెరువు వారీగా వ్యాధి చరిత్ర'}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Track chronological specimen assessments and health status per pond
              </div>
            </div>

            {/* Filter by pond */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>Filter Pond:</label>
              <select
                className="form-input"
                value={selectedPondFilter}
                onChange={(e) => setSelectedPondFilter(e.target.value)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <option value="all">All Ponds ({history.length})</option>
                <option value="pond-01">Pond 1 — Nursery & Grow-out</option>
                <option value="pond-02">Pond 2 — Tiger Prawn Semi-Intensive</option>
                <option value="pond-03">Pond 3 — Freshwater Poly-Culture</option>
              </select>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border)' }}>
              No disease screening records found for this pond.
            </div>
          ) : (
            <div className="disease-history-grid">
              {filteredHistory.map(item => (
                <div key={item.id} className="disease-history-card">
                  {/* Card Banner */}
                  <div style={{ position: 'relative', height: '140px', background: '#0f172a' }}>
                    <img
                      src={item.image_url}
                      alt="Specimen"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                      <span className={`risk-tag risk-${item.risk_level.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {item.risk_level} Risk
                      </span>
                    </div>
                    <div style={{
                      position: 'absolute', bottom: '8px', right: '10px', background: 'rgba(0,0,0,0.75)',
                      color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700'
                    }}>
                      {item.confidence}% Match
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {item.pond_name} • {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <h4 style={{ margin: '4px 0 6px 0', fontSize: '15px', fontWeight: '800', color: 'var(--text)' }}>
                      {item.ai_result?.possible_disease}
                    </h4>

                    {/* Water snapshot */}
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px', color: '#475569',
                      background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', margin: '8px 0'
                    }}>
                      <span>pH: <strong>{item.water_parameters?.ph || '-'}</strong></span>
                      <span>•</span>
                      <span>DO: <strong>{item.water_parameters?.dissolved_oxygen || '-'} mg/L</strong></span>
                      <span>•</span>
                      <span>TAN: <strong>{item.water_parameters?.ammonia || '-'} mg/L</strong></span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <span style={{ fontSize: '11px', color: item.expert_status === 'requested' ? '#15803d' : 'var(--text-secondary)' }}>
                        {item.expert_status === 'requested' ? '✓ Expert Requested' : 'No Consultation'}
                      </span>

                      <button
                        onClick={() => setCurrentResult(item)}
                        style={{
                          background: 'none', border: 'none', color: 'var(--primary)',
                          fontWeight: '700', fontSize: '12px', cursor: 'pointer'
                        }}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* MODAL: Request Certified Expert Consultation                         */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {showExpertModal && (
          <div className="modal-backdrop" onClick={() => setShowExpertModal(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '520px', width: '95%' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#991b1b' }}>
                  👨‍⚕️ Emergency Pathologist Consultation
                </h3>
                <button
                  onClick={() => setShowExpertModal(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
                padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#991b1b'
              }}>
                This request automatically shares your specimen photo, water readings, and AI screening logs with regional ICAR-CIBA / MPEDA certified aquatic health scientists for formal evaluation.
              </div>

              <form onSubmit={handleSubmitExpertConsultation}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Farmer / Farm Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={expertForm.farmer_name}
                    onChange={(e) => setExpertForm({ ...expertForm, farmer_name: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Emergency Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={expertForm.phone}
                    onChange={(e) => setExpertForm({ ...expertForm, phone: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Pond Farm Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={expertForm.pond_location}
                    onChange={(e) => setExpertForm({ ...expertForm, pond_location: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Notes on Mortalities or Treatment History</label>
                  <textarea
                    className="form-input"
                    rows="2"
                    value={expertForm.urgent_notes}
                    onChange={(e) => setExpertForm({ ...expertForm, urgent_notes: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowExpertModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2, background: '#dc2626', borderColor: '#b91c1c', fontWeight: '800' }}>
                    🚨 Dispatch Consultation Request
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
