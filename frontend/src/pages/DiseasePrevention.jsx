import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import * as preventionService from '../services/preventionService';

// Preset test scenarios for rapid evaluation
const PRESET_SCENARIOS = [
  {
    name: '🟢 Normal Water (Optimal)',
    species: 'vannamei_shrimp',
    doc_days: 55,
    stocking_density: 50,
    water: { ph: 7.9, temperature: 28.5, dissolved_oxygen: 6.2, salinity: 20, ammonia: 0.01, nitrite: 0.02 },
    feeding_pattern: 'normal',
    weather_condition: 'sunny_clear',
    previous_disease_history: 'none'
  },
  {
    name: '🚨 Abnormal Water (Hypoxia + Toxic Ammonia)',
    species: 'vannamei_shrimp',
    doc_days: 65,
    stocking_density: 65,
    water: { ph: 7.1, temperature: 32.5, dissolved_oxygen: 3.2, salinity: 17, ammonia: 0.12, nitrite: 0.22 },
    feeding_pattern: 'overfeeding',
    weather_condition: 'cloudy_overcast',
    previous_disease_history: 'past_wssv'
  },
  {
    name: '🌧️ Heavy Rain & Salinity Crash',
    species: 'vannamei_shrimp',
    doc_days: 40,
    stocking_density: 50,
    water: { ph: 6.9, temperature: 24.0, dissolved_oxygen: 4.2, salinity: 10, ammonia: 0.05, nitrite: 0.08 },
    feeding_pattern: 'feed_left_in_check_tray',
    weather_condition: 'heavy_rain',
    previous_disease_history: 'none'
  },
  {
    name: '🐟 Fish Pond Normal (Tilapia)',
    species: 'tilapia',
    doc_days: 80,
    stocking_density: 15,
    water: { ph: 7.7, temperature: 29.0, dissolved_oxygen: 5.5, salinity: 3, ammonia: 0.02, nitrite: 0.03 },
    feeding_pattern: 'normal',
    weather_condition: 'sunny_clear',
    previous_disease_history: 'none'
  }
];

export default function DiseasePrevention() {
  const [lang, setLang] = useState('en'); // 'en' | 'te'
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [tasksData, setTasksData] = useState({ tasks: [], completion_rate: 0 });
  const [activeTaskTab, setActiveTaskTab] = useState('daily'); // 'daily' | 'weekly'
  const [activeRecTab, setActiveRecTab] = useState('warnings'); // 'warnings' | 'feeding' | 'biosecurity' | 'pond_prep' | 'early_signs' | 'tips'

  // Selected Pond
  const [pondId, setPondId] = useState('pond-01');
  const [pondName, setPondName] = useState('Pond 1 — Nursery & Grow-out');

  // Form Inputs (12 Factors)
  const [species, setSpecies] = useState(PRESET_SCENARIOS[0].species);
  const [docDays, setDocDays] = useState(PRESET_SCENARIOS[0].doc_days);
  const [stockingDensity, setStockingDensity] = useState(PRESET_SCENARIOS[0].stocking_density);
  const [waterParams, setWaterParams] = useState(PRESET_SCENARIOS[0].water);
  const [feedingPattern, setFeedingPattern] = useState(PRESET_SCENARIOS[0].feeding_pattern);
  const [weatherCondition, setWeatherCondition] = useState(PRESET_SCENARIOS[0].weather_condition);
  const [diseaseHistory, setDiseaseHistory] = useState(PRESET_SCENARIOS[0].previous_disease_history);

  // Latest Assessment Result
  const [assessment, setAssessment] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Load Initial Data
  const loadInitialData = async () => {
    try {
      const [notifsRes, tasksRes, historyRes] = await Promise.all([
        preventionService.getNotifications(),
        preventionService.getPondTasks(pondId),
        preventionService.getPondHealthHistory(pondId)
      ]);
      if (notifsRes.data?.data) setNotifications(notifsRes.data.data);
      if (tasksRes.data?.data) setTasksData(tasksRes.data.data);
      if (historyRes.data?.data) {
        setHistory(historyRes.data.data);
        if (historyRes.data.data.length > 0 && !assessment) {
          setAssessment(historyRes.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed loading initial prevention data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [pondId]);

  // Apply Preset Scenario
  const applyPreset = (preset) => {
    setSpecies(preset.species);
    setDocDays(preset.doc_days);
    setStockingDensity(preset.stocking_density);
    setWaterParams(preset.water);
    setFeedingPattern(preset.feeding_pattern);
    setWeatherCondition(preset.weather_condition);
    setDiseaseHistory(preset.previous_disease_history);
    showToast(`Loaded ${preset.name}`);
  };

  // Submit Evaluation
  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        pond_id: pondId,
        pond_name: pondName,
        species,
        doc_days: docDays,
        stocking_density: stockingDensity,
        water_parameters: waterParams,
        feeding_pattern: feedingPattern,
        weather_condition: weatherCondition,
        previous_disease_history: diseaseHistory
      };

      const res = await preventionService.evaluatePondHealth(payload);
      if (res.data?.success) {
        setAssessment(res.data.data);
        showToast('🎯 Pond health & disease risk evaluation updated!');
        loadInitialData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (taskId) => {
    try {
      const res = await preventionService.toggleTask(taskId);
      if (res.data?.success) {
        // Refresh tasks
        const tasksRes = await preventionService.getPondTasks(pondId);
        if (tasksRes.data?.data) setTasksData(tasksRes.data.data);
      }
    } catch (err) {
      console.error('Failed toggling task:', err);
    }
  };

  // Dismiss notification
  const handleDismissNotification = async (notifId) => {
    try {
      await preventionService.markNotificationRead(notifId);
      setNotifications(notifications.filter(n => n.id !== notifId));
      showToast('Notification acknowledged');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasksData.tasks.filter(t => t.task_type === activeTaskTab);

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
          alignItems: 'center', gap: '16px', marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '32px' }}>🛡️</span>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: 'var(--text)' }}>
                {lang === 'en' ? 'Disease Prevention & Pond Health Monitoring' : 'వ్యాధి నివారణ & చెరువు ఆరోగ్య పర్యవేక్షణ'}
              </h1>
            </div>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
              {lang === 'en'
                ? 'Rule-based preventive husbandry system calculating real-time Health Scores, Disease Risks, and Daily/Weekly checklists.'
                : 'చెరువు ఆరోగ్య స్కోరు, ప్రమాద అంచనా మరియు రోజువారీ నిర్వహణ పనుల ట్రాకింగ్.'}
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

        {/* Safety & Educational Guidance Notice */}
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px',
          padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#166534'
        }}>
          <span style={{ fontSize: '18px' }}>ℹ️</span>
          <span>
            {lang === 'en'
              ? 'Educational & Safe Husbandry Notice: This system provides preventive bio-security, aeration, and water management guidance. It does not invent unauthorized medical or antibiotic dosages. Consult certified specialists for acute pathology.'
              : 'గమనిక: ఈ వ్యవస్థ కేవలం నివారణ మరియు చెరువు నిర్వహణ సూచనలను మాత్రమే అందిస్తుంది. మందుల మోతాదుల కోసం నిపుణులను సంప్రదించండి.'}
          </span>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* ACTIVE NOTIFICATIONS RIBBON                                       */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {notifications.length > 0 && (
          <div style={{
            background: '#fff', border: '1px solid var(--border)', borderRadius: '14px',
            padding: '14px 18px', marginBottom: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '800', color: '#b91c1c' }}>
                <span>🔔</span>
                <span>Pond Health Warnings ({notifications.length})</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Automated System Alerts</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  style={{
                    background: notif.severity === 'critical' ? '#fef2f2' : '#fffbeb',
                    border: notif.severity === 'critical' ? '1px solid #f87171' : '1px solid #fde68a',
                    borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: notif.severity === 'critical' ? '#991b1b' : '#92400e' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '12px', color: notif.severity === 'critical' ? '#7f1d1d' : '#78350f', marginTop: '2px' }}>
                      {notif.message}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissNotification(notif.id)}
                    style={{
                      background: 'none', border: 'none', color: '#64748b', fontSize: '11px',
                      fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TOP SCORES BAR: Pond Health Score & Disease Risk Gauge            */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {assessment && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px', marginBottom: '24px'
          }}>
            {/* 1. Pond Health Score */}
            <div className="score-card-gauge">
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                POND HEALTH SCORE
              </div>
              <div className={`score-circle-outer ${
                assessment.health_score >= 80 ? 'score-circle-optimal' : assessment.health_score >= 60 ? 'score-circle-warning' : 'score-circle-critical'
              }`}>
                {assessment.health_score}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: assessment.health_score >= 80 ? '#15803d' : assessment.health_score >= 60 ? '#b45309' : '#b91c1c' }}>
                {assessment.health_score >= 80 ? '🟢 OPTIMAL ECOSYSTEM' : assessment.health_score >= 60 ? '🟡 SUB-OPTIMAL / WARNING' : '🔴 CRITICAL HAZARD'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Assessed on 12 ecological inputs
              </div>
            </div>

            {/* 2. Disease Risk Score */}
            <div className="score-card-gauge">
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                DISEASE RISK SCORE
              </div>
              <div className={`score-circle-outer ${
                assessment.risk_score >= 70 ? 'score-circle-critical' : assessment.risk_score >= 45 ? 'score-circle-warning' : 'score-circle-optimal'
              }`}>
                {assessment.risk_score}%
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: assessment.risk_score >= 70 ? '#b91c1c' : assessment.risk_score >= 45 ? '#b45309' : '#15803d' }}>
                {assessment.risk_level.toUpperCase()} PATHOGEN RISK
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {assessment.water_warnings.length} Active Stress Triggers
              </div>
            </div>

            {/* 3. Daily Checklist Progress */}
            <div className="score-card-gauge">
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                PREVENTIVE TASKS TODAY
              </div>
              <div className="score-circle-outer score-circle-optimal">
                {tasksData.completion_rate}%
              </div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#15803d' }}>
                {tasksData.completed_count} OF {tasksData.total_count} TASKS COMPLETED
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Daily & Weekly routine adherence
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* 12-FACTOR EVALUATION FORM & QUICK PRESETS                         */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <div style={{
          background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px',
          padding: '24px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
              📋 12-Factor Pond Health Evaluator
            </h2>

            {/* Quick Test Presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>Test Scenarios:</span>
              {PRESET_SCENARIOS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  style={{
                    background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px',
                    padding: '3px 8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleEvaluate}>
            {/* Row 1: Pond, Species, DOC, Stocking Density */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                  Pond Selection
                </label>
                <select
                  className="form-input"
                  value={pondId}
                  onChange={(e) => {
                    setPondId(e.target.value);
                    setPondName(e.target.options[e.target.selectedIndex].text);
                  }}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="pond-01">Pond 1 — Nursery & Grow-out</option>
                  <option value="pond-02">Pond 2 — Tiger Prawn Semi-Intensive</option>
                  <option value="pond-03">Pond 3 — Freshwater Poly-Culture</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                  Species
                </label>
                <select
                  className="form-input"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="vannamei_shrimp">🦐 Vannamei Shrimp (P. vannamei)</option>
                  <option value="tiger_prawn">🐅 Black Tiger Prawn (P. monodon)</option>
                  <option value="tilapia">🐟 GIFT / Nile Tilapia</option>
                  <option value="seabass">🐟 Asian Seabass (Barramundi)</option>
                  <option value="carp">🐟 Indian Major Carp (Rohu / Catla)</option>
                  <option value="mud_crab">🦀 Green Mud Crab</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                  Days of Culture (DOC)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={docDays}
                  onChange={(e) => setDocDays(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                  Stocking Density (pcs/m²)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={stockingDensity}
                  onChange={(e) => setStockingDensity(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                  required
                />
              </div>
            </div>

            {/* Row 2: 6 Water Quality Parameters */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
              padding: '14px', marginBottom: '16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Water Quality Parameters:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>pH (7.5–8.5)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={waterParams.ph}
                    onChange={(e) => setWaterParams({ ...waterParams, ph: parseFloat(e.target.value) || '' })}
                    style={{ width: '100%', padding: '6px 8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={waterParams.temperature}
                    onChange={(e) => setWaterParams({ ...waterParams, temperature: parseFloat(e.target.value) || '' })}
                    style={{ width: '100%', padding: '6px 8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>DO (mg/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={waterParams.dissolved_oxygen}
                    onChange={(e) => setWaterParams({ ...waterParams, dissolved_oxygen: parseFloat(e.target.value) || '' })}
                    style={{ width: '100%', padding: '6px 8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>Salinity (ppt)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={waterParams.salinity}
                    onChange={(e) => setWaterParams({ ...waterParams, salinity: parseFloat(e.target.value) || '' })}
                    style={{ width: '100%', padding: '6px 8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>Ammonia (TAN)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={waterParams.ammonia}
                    onChange={(e) => setWaterParams({ ...waterParams, ammonia: parseFloat(e.target.value) || '' })}
                    style={{ width: '100%', padding: '6px 8px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700' }}>Nitrite (NO2)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={waterParams.nitrite}
                    onChange={(e) => setWaterParams({ ...waterParams, nitrite: parseFloat(e.target.value) || '' })}
                    style={{ width: '100%', padding: '6px 8px' }}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Feeding, Weather, Disease History */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                  Feeding Pattern
                </label>
                <select
                  className="form-input"
                  value={feedingPattern}
                  onChange={(e) => setFeedingPattern(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="normal">Normal (Cleared in 2 hrs)</option>
                  <option value="overfeeding">Overfeeding (Uneaten Pellets)</option>
                  <option value="feed_left_in_check_tray">Feed Left in Check-Tray (Over 30%)</option>
                  <option value="underfeeding">Underfeeding (Empty in Under 40 mins)</option>
                  <option value="irregular">Irregular Feeding Intervals</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                  Weather Conditions
                </label>
                <select
                  className="form-input"
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="sunny_clear">☀️ Sunny & Clear (Good Photosynthesis)</option>
                  <option value="cloudy_overcast">☁️ Cloudy / Overcast (Oxygen Crash Risk)</option>
                  <option value="heavy_rain">🌧️ Heavy Rain (Salinity & pH Drop)</option>
                  <option value="extreme_heatwave">🔥 Extreme Heatwave (Above 32°C Water)</option>
                  <option value="cold_snap">❄️ Cold Snap (Below 24°C Water)</option>
                  <option value="cyclonic_low_pressure">🌀 Cyclonic Low Barometric Pressure</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', marginBottom: '4px' }}>
                  Previous Disease History
                </label>
                <select
                  className="form-input"
                  value={diseaseHistory}
                  onChange={(e) => setDiseaseHistory(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="none">None (Clean History)</option>
                  <option value="past_wssv">Past WSSV in previous crop</option>
                  <option value="past_ehp">Past EHP Microsporidia history</option>
                  <option value="past_vibrio_running_mortality">Past Vibrio running mortality</option>
                  <option value="white_feces_last_crop">Past White Feces Disease</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ padding: '10px 24px', fontSize: '14px', fontWeight: '800' }}
            >
              {loading ? 'Evaluating Health Models...' : '🛡️ Calculate Pond Health & Risk Index'}
            </button>
          </form>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* INTERACTIVE DAILY & WEEKLY TASK CHECKLISTS (TASK COMPLETION TRACKER)*/}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <div style={{
          background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px',
          padding: '24px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
                ✅ Preventive Task Completion Tracker ({pondName})
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Click items to log daily and weekly biosecurity routines
              </div>
            </div>

            {/* Checklist Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveTaskTab('daily')}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  background: activeTaskTab === 'daily' ? 'var(--primary)' : '#f1f5f9',
                  color: activeTaskTab === 'daily' ? '#fff' : '#475569',
                  border: 'none'
                }}
              >
                Daily Health Checklist
              </button>
              <button
                type="button"
                onClick={() => setActiveTaskTab('weekly')}
                style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                  background: activeTaskTab === 'weekly' ? 'var(--primary)' : '#f1f5f9',
                  color: activeTaskTab === 'weekly' ? '#fff' : '#475569',
                  border: 'none'
                }}
              >
                Weekly Checklist
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
              <span>Completion Progress</span>
              <span style={{ color: 'var(--primary)' }}>{tasksData.completion_rate}% Completed</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${tasksData.completion_rate}%`, height: '100%', background: '#16a34a', borderRadius: '4px', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          {/* Task list */}
          <div>
            {filteredTasks.map(task => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`task-item-card ${task.is_completed ? 'completed' : ''}`}
              >
                <div className="task-check-bubble">
                  {task.is_completed ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="task-title" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                    {lang === 'en' ? task.title : task.telugu_title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {task.description}
                  </div>
                  {task.is_completed && task.completed_at && (
                    <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: '600', marginTop: '4px' }}>
                      ✓ Completed on {new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* PREVENTIVE ADVISORY DASHBOARD (6 Core Guidance Areas)              */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {assessment && (
          <div style={{
            background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px',
            padding: '24px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
              💡 Rule-Based Preventive Recommendations ({pondName})
            </h2>

            {/* Recommendation Category Tabs */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => setActiveRecTab('warnings')}
                className={`recommendation-tab-btn ${activeRecTab === 'warnings' ? 'active' : ''}`}
              >
                🚨 Water Warnings ({assessment.water_warnings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveRecTab('feeding')}
                className={`recommendation-tab-btn ${activeRecTab === 'feeding' ? 'active' : ''}`}
              >
                🍽️ Feeding Advisory
              </button>
              <button
                type="button"
                onClick={() => setActiveRecTab('biosecurity')}
                className={`recommendation-tab-btn ${activeRecTab === 'biosecurity' ? 'active' : ''}`}
              >
                🛡️ Biosecurity Protocol
              </button>
              <button
                type="button"
                onClick={() => setActiveRecTab('pond_prep')}
                className={`recommendation-tab-btn ${activeRecTab === 'pond_prep' ? 'active' : ''}`}
              >
                🏊 Pond Preparation
              </button>
              <button
                type="button"
                onClick={() => setActiveRecTab('early_signs')}
                className={`recommendation-tab-btn ${activeRecTab === 'early_signs' ? 'active' : ''}`}
              >
                ⚠️ Early Warning Signs
              </button>
              <button
                type="button"
                onClick={() => setActiveRecTab('tips')}
                className={`recommendation-tab-btn ${activeRecTab === 'tips' ? 'active' : ''}`}
              >
                💡 Disease Prevention Tips
              </button>
            </div>

            {/* Content for active tab */}
            {activeRecTab === 'warnings' && (
              <div>
                {assessment.water_warnings.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', background: '#f0fdf4', borderRadius: '10px', color: '#166534', fontWeight: '700' }}>
                    🟢 All water parameters are within optimal ranges! No immediate corrective action required.
                  </div>
                ) : (
                  <div>
                    {assessment.water_warnings.map((w, idx) => (
                      <div key={idx} className={`water-warning-badge-card warning-sev-${w.severity}`}>
                        <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>
                          {w.warning}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '6px' }}>
                          Measured: <strong>{w.value}</strong> | Safe Target: <strong>{w.safe_range}</strong>
                        </div>
                        <div style={{ fontSize: '12px', background: 'rgba(255,255,255,0.6)', padding: '6px 10px', borderRadius: '6px', fontWeight: '600' }}>
                          ⚡ <strong>Immediate Physical Action:</strong> {w.immediate_action}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeRecTab === 'feeding' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assessment.feeding_recommendations.map((rec, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', fontSize: '13px' }}>
                    🍴 {rec}
                  </div>
                ))}
              </div>
            )}

            {activeRecTab === 'biosecurity' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assessment.biosecurity_recommendations.map((bio, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', fontSize: '13px' }}>
                    🛡️ {bio}
                  </div>
                ))}
              </div>
            )}

            {activeRecTab === 'pond_prep' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assessment.pond_prep_guidance.map((pp, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', fontSize: '13px' }}>
                    🏊 {pp}
                  </div>
                ))}
              </div>
            )}

            {activeRecTab === 'early_signs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assessment.early_warning_signs.map((ew, i) => (
                  <div key={i} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#92400e' }}>
                    👀 {ew}
                  </div>
                ))}
              </div>
            )}

            {activeRecTab === 'tips' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {assessment.prevention_tips.map((tip, i) => (
                  <div key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#166534' }}>
                    ✨ {tip}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* POND HEALTH HISTORY LOGS & TRENDS                                 */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <div>
          <h2 style={{ margin: '0 0 14px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
            📊 Historical Health Evaluations ({pondName})
          </h2>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', background: '#fff', borderRadius: '12px', border: '1px solid var(--border)' }}>
              No evaluations recorded yet for this pond.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
              {history.map(item => (
                <div key={item.id} style={{
                  background: '#fff', border: '1px solid var(--border)', borderRadius: '12px',
                  padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      DOC {item.doc_days} • {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span className={`risk-tag risk-${item.risk_level.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                      {item.risk_level} Risk
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: item.health_score >= 80 ? '#15803d' : '#b45309' }}>
                      {item.health_score}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>/ 100 Health Score</span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                    DO: <strong>{item.water_parameters?.dissolved_oxygen || '-'}</strong> mg/L • pH: <strong>{item.water_parameters?.ph || '-'}</strong> • TAN: <strong>{item.water_parameters?.ammonia || '-'}</strong> mg/L
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
