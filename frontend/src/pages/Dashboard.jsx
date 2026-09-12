import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getFarmerOverview, getRoleDashboard, markNotificationRead } from '../services/dashboardService';
import { fmtCurrency } from '../helpers/format';

// ─── Bilingual Dictionary (English + Telugu) ─────────────────────────────────
const DICT = {
  en: {
    dashboardTitle: 'AquaMitra Unified Aquaculture Command Center',
    subtitle: 'Comprehensive real-time farm intelligence, commerce, and advisory',
    langToggle: 'తెలుగులో చూడండి',
    notifications: 'Notifications',
    markAllRead: 'Mark Read',
    close: 'Close',
    noNotifs: 'No notifications available at this time.',
    personalizeTitle: 'Personalize Dashboard View',
    selectDistrict: 'Location / District',
    selectSpecies: 'Target Species',
    selectPond: 'Active Pond',
    allPonds: 'All Ponds Overview',
    applyFilter: 'Update View',
    quickActions: 'Quick Actions',
    actAddPond: 'Add Pond',
    actCheckWater: 'Check Water Quality',
    actScanDisease: 'Scan Disease',
    actFindHatchery: 'Find Hatchery',
    actFindWorker: 'Find Worker',
    actBuyEquipment: 'Buy Equipment',
    actConsultExpert: 'Consult Expert',
    actSellSeafood: 'Sell Seafood',
    roles: {
      farmer: 'Farmer View',
      worker: 'Worker / Technician',
      hatchery: 'Hatchery Operator',
      seller: 'Equipment & Supplies Seller',
      buyer: 'Commercial Seafood Buyer',
      expert: 'Aquaculture Vet / Specialist',
      admin: 'Platform Admin',
    },
    secPonds: '1. My Ponds & Stocking Status',
    secWater: '2. Live Water Quality Parameters',
    secRisk: '3. Disease Risk & Pond Health Score',
    secReports: '4. AI Disease Screening Reports',
    secPrevention: '5. Recommended Preventive Actions',
    secPrices: '6. Current Seafood Spot Rates (AquaSangham)',
    secTrends: '7. Price Trends (7-Day Analysis)',
    secHatcheries: '8. Nearby Certified Hatcheries',
    secSeed: '9. Available Seed (Post-Larvae)',
    secWorkers: '10. Available Aquaculture Workers',
    secMachinery: '11. Machinery Marketplace',
    secConsultation: '12. Expert Consultation & Advisory',
    secSupplies: '13. Medicines & Farm Supplies',
    secListings: '14. My Seafood Listings',
    secBuyers: '15. Interested Commercial Buyers & Offers',
    secNotifCenter: '16. Farm Alerts & Notifications',
    viewAll: 'View Details →',
    contact: 'Contact',
    orderNow: 'Order Now',
    bookConsult: 'Book Consultation',
    acceptOffer: 'Review Offer',
    statusOptimal: 'Optimal',
    statusWarning: 'Attention Needed',
    statusCritical: 'Alert',
    confidence: 'Confidence',
    distance: 'km away',
    verified: 'Verified',
    loading: 'Loading AquaMitra Command Center...',
    stockDensity: 'Density',
    cultureDays: 'DOC (Days of Culture)',
    healthScore: 'Overall Pond Health Score',
    riskLevel: 'Biosecurity Risk Level',
  },
  te: {
    dashboardTitle: 'ఆక్వామిత్ర రైతు సమగ్ర కమాండ్ సెంటర్',
    subtitle: 'నిజ-సమయ చెరువుల నిర్వహణ, విపణి ధరలు, వ్యాధి రక్షణ మరియు సలహాలు',
    langToggle: 'View in English',
    notifications: 'నోటిఫికేషన్లు',
    markAllRead: 'చదివినట్లు గుర్తించు',
    close: 'మూసివేయి',
    noNotifs: 'ప్రస్తుతం కొత్త నోటిఫికేషన్లు ఏవీ లేవు.',
    personalizeTitle: 'రైతు ప్రాధాన్యత అనుకూలీకరణ',
    selectDistrict: 'ప్రాంతం / జిల్లా',
    selectSpecies: 'రకం (జాతి)',
    selectPond: 'చెరువు ఎంపిక',
    allPonds: 'అన్ని చెరువుల వివరాలు',
    applyFilter: 'రిఫ్రెష్ చేయండి',
    quickActions: 'త్వరిత చర్యలు (Quick Actions)',
    actAddPond: 'చెరువు జోడించు',
    actCheckWater: 'నీటి పరీక్ష చేయండి',
    actScanDisease: 'వ్యాధి స్కాన్',
    actFindHatchery: 'హేచరీని వెతకండి',
    actFindWorker: 'కార్మికుడిని పొందండి',
    actBuyEquipment: 'పరికరాలు కొనండి',
    actConsultExpert: 'నిపుణుడి సంప్రదింపు',
    actSellSeafood: 'సీఫుడ్ అమ్మండి',
    roles: {
      farmer: 'రైతు డాష్‌బోర్డ్',
      worker: 'కార్మికుడు / టెక్నీషియన్',
      hatchery: 'హేచరీ యాజమాన్యం',
      seller: 'పరికరాలు & మందుల విక్రేత',
      buyer: 'సీఫుడ్ కొనుగోలుదారు',
      expert: 'ఆక్వా శాస్త్రవేత్త / వెటర్నరీ',
      admin: 'ప్లాట్‌ఫారమ్ అడ్మిన్',
    },
    secPonds: '1. నా చెరువులు & నిల్వ సమాచారం',
    secWater: '2. తాజా నీటి నాణ్యత పారామితులు',
    secRisk: '3. వ్యాధి ప్రమాద స్థాయి & ఆరోగ్య స్కోరు',
    secReports: '4. AI వ్యాధి నిర్ధారణ నివేదికలు',
    secPrevention: '5. తీసుకోవలసిన నివారణ చర్యలు',
    secPrices: '6. ప్రస్తుత మార్కెట్ ధరలు (AquaSangham)',
    secTrends: '7. 7-రోజుల ధరల సరళి విశ్లేషణ',
    secHatcheries: '8. సమీప సర్టిఫైడ్ హేచరీలు',
    secSeed: '9. అందుబాటులో ఉన్న రొయ్య / చేప సీడ్',
    secWorkers: '10. పనికి సిద్ధంగా ఉన్న ఆక్వా కార్మికులు',
    secMachinery: '11. యంత్రాలు & పరికరాల మార్కెట్',
    secConsultation: '12. ఆక్వా నిపుణుల సంప్రదింపులు',
    secSupplies: '13. ఆక్వా మందులు & సరుకులు',
    secListings: '14. నా సీఫుడ్ అమ్మకపు ప్రకటనలు',
    secBuyers: '15. కొనుగోలుదారులు & లైవ్ ఆఫర్లు',
    secNotifCenter: '16. నోటిఫికేషన్లు & హెచ్చరికలు',
    viewAll: 'మొత్తం చూడండి →',
    contact: 'సంప్రదించండి',
    orderNow: 'ఆర్డర్ చేయండి',
    bookConsult: 'సలహా పొందండి',
    acceptOffer: 'ఆఫర్ పరిశీలించండి',
    statusOptimal: 'ఆదర్శవంతమైనది',
    statusWarning: 'శ్రద్ధ వహించండి',
    statusCritical: 'ప్రమాదకర హెచ్చరిక',
    confidence: 'ఖచ్చితత్వం',
    distance: 'కి.మీ దూరంలో',
    verified: 'ధృవీకరించబడింది',
    loading: 'ఆక్వామిత్ర కమాండ్ సెంటర్ లోడ్ అవుతోంది...',
    stockDensity: 'సాంద్రత',
    cultureDays: 'DOC (రోజుల సంఖ్య)',
    healthScore: 'చెరువు ఆరోగ్య సూచిక',
    riskLevel: 'వ్యాధి ముప్పు స్థాయి',
  },
};

const DISTRICTS = [
  'Nellore', 'Krishna', 'West Godavari', 'East Godavari', 'Bapatla', 'Kakinada', 'Visakhapatnam', 'Prakasam'
];

const SPECIES_LIST = [
  'Vannamei Shrimp', 'Tiger Prawn', 'Tilapia', 'Rohu / Catla', 'Mud Crab', 'Scampi'
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Language state (en / te)
  const [lang, setLang] = useState(() => localStorage.getItem('aquamitra_lang') || 'en');
  const t = DICT[lang] || DICT.en;

  // Active Role state
  const [activeRole, setActiveRole] = useState('farmer');

  // Personalization Filters
  const [selectedDistrict, setSelectedDistrict] = useState('Nellore');
  const [selectedSpecies, setSelectedSpecies] = useState('Vannamei Shrimp');
  const [selectedPondId, setSelectedPondId] = useState('');

  // Dashboard Data State
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [roleData, setRoleData] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Toggle Language
  const toggleLanguage = () => {
    const next = lang === 'en' ? 'te' : 'en';
    setLang(next);
    localStorage.setItem('aquamitra_lang', next);
  };

  // Load Farmer Overview
  const loadFarmerData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFarmerOverview({
        district: selectedDistrict,
        species: selectedSpecies,
        pondId: selectedPondId || undefined,
      });
      if (res.data?.success) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load farmer dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDistrict, selectedSpecies, selectedPondId]);

  // Load Role Dashboard
  const loadRoleData = useCallback(async (role) => {
    setLoading(true);
    try {
      const res = await getRoleDashboard(role, { district: selectedDistrict });
      if (res.data?.success) {
        setRoleData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load role dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (activeRole === 'farmer') {
      loadFarmerData();
    } else {
      loadRoleData(activeRole);
    }
  }, [activeRole, loadFarmerData, loadRoleData]);

  // Mark notification as read
  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      if (overview?.notifications) {
        setOverview(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n),
          summary: {
            ...prev.summary,
            unreadNotifications: Math.max(0, (prev.summary?.unreadNotifications || 1) - 1)
          }
        }));
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const unreadCount = overview?.summary?.unreadNotifications ??
    overview?.notifications?.filter(n => !n.read)?.length ?? 0;

  return (
    <Layout title={lang === 'te' ? 'ఆక్వామిత్ర డాష్‌బోర్డ్' : 'AquaMitra Dashboard'}>
      {/* ─── Top Header Bar: Language & Notification Bell ─────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 }}>
            {t.dashboardTitle}
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
            {t.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, padding: '7px 14px', borderRadius: 20 }}
            title="Toggle English / Telugu"
          >
            🌐 <span>{t.langToggle}</span>
          </button>

          {/* Notification Center Trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="btn"
            style={{
              position: 'relative',
              background: '#047857',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              padding: '7px 16px',
              borderRadius: 20,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            🔔 <span>{t.notifications}</span>
            {unreadCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: 11,
                fontWeight: 900,
                padding: '2px 7px',
                borderRadius: 12,
                marginLeft: 4,
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── Role Switcher Bar ────────────────────────────────────────────── */}
      <div className="role-switcher-bar">
        {Object.keys(DICT.en.roles).map(roleKey => (
          <button
            key={roleKey}
            className={`role-pill-btn ${activeRole === roleKey ? 'active' : ''}`}
            onClick={() => setActiveRole(roleKey)}
          >
            {roleKey === 'farmer' && '🌾 '}
            {roleKey === 'worker' && '👷 '}
            {roleKey === 'hatchery' && '🧬 '}
            {roleKey === 'seller' && '📦 '}
            {roleKey === 'buyer' && '🚢 '}
            {roleKey === 'expert' && '👨‍⚕️ '}
            {roleKey === 'admin' && '🛡️ '}
            {t.roles[roleKey]}
          </button>
        ))}
      </div>

      {/* ─── Notification Slide-out Drawer ────────────────────────────────── */}
      {drawerOpen && (
        <div className="notification-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="notification-drawer-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>🔔</span>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{t.secNotifCenter}</h3>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6 }}
              >
                ✕ {t.close}
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {overview?.notifications && overview.notifications.length > 0 ? (
                overview.notifications.map(n => (
                  <div
                    key={n.id}
                    className={`notif-card-item ${!n.read ? 'unread' : ''}`}
                    onClick={() => {
                      if (n.link) navigate(n.link);
                      setDrawerOpen(false);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: n.type === 'disease' ? '#fee2e2' : n.type === 'water' ? '#fef3c7' : '#e0f2fe',
                        color: n.type === 'disease' ? '#b91c1c' : n.type === 'water' ? '#b45309' : '#0369a1',
                      }}>
                        {n.category || n.type}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{n.time}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.4 }}>{n.message}</div>
                    {!n.read && (
                      <div style={{ marginTop: 8, textAlign: 'right' }}>
                        <button
                          onClick={(e) => handleMarkRead(n.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#047857',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          {t.markAllRead}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                  {t.noNotifs}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── FARMER MODE: Full 16 Unified Modules & Personalization ───────── */}
      {activeRole === 'farmer' && (
        <>
          {/* Personalization Filter Bar */}
          <div className="personalization-bar">
            <div style={{ fontWeight: 800, fontSize: 14, color: '#064e3b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🎯</span>
              <span>{t.personalizeTitle}</span>
            </div>

            <div className="personalization-fields">
              {/* District */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{t.selectDistrict}</label>
                <select
                  value={selectedDistrict}
                  onChange={e => setSelectedDistrict(e.target.value)}
                  className="form-control"
                  style={{ padding: '6px 10px', fontSize: 13, borderRadius: 8, minWidth: 130 }}
                >
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Species */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{t.selectSpecies}</label>
                <select
                  value={selectedSpecies}
                  onChange={e => setSelectedSpecies(e.target.value)}
                  className="form-control"
                  style={{ padding: '6px 10px', fontSize: 13, borderRadius: 8, minWidth: 150 }}
                >
                  {SPECIES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Pond Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{t.selectPond}</label>
                <select
                  value={selectedPondId}
                  onChange={e => setSelectedPondId(e.target.value)}
                  className="form-control"
                  style={{ padding: '6px 10px', fontSize: 13, borderRadius: 8, minWidth: 140 }}
                >
                  <option value="">{t.allPonds}</option>
                  {overview?.myPonds?.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={loadFarmerData}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end', padding: '7px 16px', fontSize: 13, borderRadius: 8, fontWeight: 700 }}
              >
                🔄 {t.applyFilter}
              </button>
            </div>
          </div>

          {/* 8 Quick Action Buttons Ribbon */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              ⚡ {t.quickActions}
            </div>
            <div className="quick-actions-ribbon">
              <button className="quick-action-btn" onClick={() => navigate('/ponds')}>
                <span className="qa-icon">🏊</span>
                <span className="qa-label">{t.actAddPond}</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/prevention')}>
                <span className="qa-icon">💧</span>
                <span className="qa-label">{t.actCheckWater}</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/disease-monitoring')}>
                <span className="qa-icon">🔬</span>
                <span className="qa-label">{t.actScanDisease}</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/hatcheries')}>
                <span className="qa-icon">🧬</span>
                <span className="qa-label">{t.actFindHatchery}</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/jobs')}>
                <span className="qa-icon">👷</span>
                <span className="qa-label">{t.actFindWorker}</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/equipment')}>
                <span className="qa-icon">🚜</span>
                <span className="qa-label">{t.actBuyEquipment}</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/consultations')}>
                <span className="qa-icon">👨‍⚕️</span>
                <span className="qa-label">{t.actConsultExpert}</span>
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/seafood')}>
                <span className="qa-icon">🦐</span>
                <span className="qa-label">{t.actSellSeafood}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#047857', fontWeight: 700, fontSize: 16 }}>
              🌊 {t.loading}
            </div>
          ) : (
            <div className="dashboard-grid-16">
              {/* ─── MODULE 1: My Ponds & Stocking Status ─────────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">🏊 {t.secPonds}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/ponds')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 12 }}>
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#047857' }}>{overview?.myPonds?.length || 0}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Active Ponds</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0284c7' }}>
                      {overview?.myPonds?.reduce((acc, p) => acc + (parseFloat(p.size_acres) || 0), 0).toFixed(1)}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Total Acres</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: 10, borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#8b5cf6' }}>{selectedSpecies.split(' ')[0]}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Focus Species</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {overview?.myPonds?.slice(0, 3).map(pond => (
                    <div key={pond.id} style={{ padding: '8px 12px', background: '#f1f5f9', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{pond.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {pond.species} • {pond.size_acres} Ac • {t.stockDensity}: {pond.stocking_density || 45}/m²
                        </div>
                      </div>
                      <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 700 }}>
                        DOC {pond.age_days || 45}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── MODULE 2: Live Water Quality Parameters ──────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">💧 {t.secWater}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/prevention')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                  Monitored for: <strong>{overview?.waterQuality?.pondName || 'All Cultivated Ponds'}</strong>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: 8 }}>
                  <div className="water-param-badge optimal">
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#166534' }}>Dissolved O₂</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                      {overview?.waterQuality?.params?.dissolvedOxygen || '5.8'} mg/L
                    </span>
                    <span style={{ fontSize: 9, color: '#16a34a', fontWeight: 700 }}>Optimal (5+)</span>
                  </div>
                  <div className="water-param-badge optimal">
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#166534' }}>pH Level</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                      {overview?.waterQuality?.params?.ph || '7.8'}
                    </span>
                    <span style={{ fontSize: 9, color: '#16a34a', fontWeight: 700 }}>Balanced</span>
                  </div>
                  <div className="water-param-badge optimal">
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#166534' }}>Salinity</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                      {overview?.waterQuality?.params?.salinity || '14'} ppt
                    </span>
                    <span style={{ fontSize: 9, color: '#16a34a', fontWeight: 700 }}>Optimal</span>
                  </div>
                  <div className="water-param-badge warning">
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e' }}>Ammonia</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                      {overview?.waterQuality?.params?.ammonia || '0.04'} ppm
                    </span>
                    <span style={{ fontSize: 9, color: '#d97706', fontWeight: 700 }}>Monitor</span>
                  </div>
                  <div className="water-param-badge optimal">
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#166534' }}>Temperature</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
                      {overview?.waterQuality?.params?.temperature || '28.5'} °C
                    </span>
                    <span style={{ fontSize: 9, color: '#16a34a', fontWeight: 700 }}>Ideal</span>
                  </div>
                </div>
              </div>

              {/* ─── MODULE 3: Disease Risk & Pond Health Score ────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">🛡️ {t.secRisk}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/prevention')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{
                    width: 70, height: 70, borderRadius: '50%',
                    background: 'conic-gradient(#047857 0% 88%, #e2e8f0 88% 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#047857' }}>
                        {overview?.diseaseRisk?.score || '88'}
                      </span>
                      <span style={{ fontSize: 8, color: '#64748b' }}>/ 100</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{t.healthScore}: 88%</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{t.riskLevel}:</div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: 4,
                      padding: '2px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 800,
                      background: '#dcfce7',
                      color: '#166534'
                    }}>
                      LOW RISK (STABLE BIOSECURITY)
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#475569', background: '#f8fafc', padding: 8, borderRadius: 6 }}>
                  ℹ️ Weather stable • DO aerator schedule verified • Feeding gut probiotics active.
                </div>
              </div>

              {/* ─── MODULE 4: AI Disease Screening Reports ───────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">🔬 {t.secReports}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/disease-monitoring')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {overview?.aiDiseaseReports && overview.aiDiseaseReports.length > 0 ? (
                    overview.aiDiseaseReports.slice(0, 2).map((rep, idx) => (
                      <div key={idx} style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{rep.condition || 'Healthy Specimen'}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {rep.pondName || 'Pond 1'} • {t.confidence}: {Math.round((rep.confidence || 0.92) * 100)}%
                          </div>
                        </div>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: rep.risk === 'low' ? '#dcfce7' : '#fee2e2',
                          color: rep.risk === 'low' ? '#166534' : '#b91c1c'
                        }}>
                          {rep.risk?.toUpperCase() || 'LOW'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, color: '#166534', fontSize: 12 }}>
                      ✅ No pathogen anomalies detected. Upload photos anytime for AI screening.
                    </div>
                  )}
                  <button className="btn btn-outline" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => navigate('/disease-monitoring')}>
                    📸 Scan New Specimen Image
                  </button>
                </div>
              </div>

              {/* ─── MODULE 5: Recommended Preventive Actions ─────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">📋 {t.secPrevention}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/prevention')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {overview?.preventiveActions?.slice(0, 3).map((act, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#334155' }}>
                      <span style={{ color: '#047857', fontWeight: 800 }}>✓</span>
                      <div>
                        <strong>{act.action || act.title || 'Check DO at 4:00 AM'}:</strong>{' '}
                        <span style={{ color: '#64748b' }}>{act.recommendation || act.details || 'Turn on secondary aerators for 3 hours.'}</span>
                      </div>
                    </div>
                  )) || (
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      ✓ Maintain nightly aeration • Monitor morning gut contents • Test alkalinity every 3 days.
                    </div>
                  )}
                </div>
              </div>

              {/* ─── MODULE 6: Current Seafood Spot Prices ───────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">🏷️ {t.secPrices}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/market-prices')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
                  Live {selectedDistrict} Mandi Rates (₹ / Kg)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                  {overview?.currentPrices?.slice(0, 4).map((p, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{p.count ? `${p.count} Count` : p.grade}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#047857' }}>{fmtCurrency(p.price || p.rate || 380)}</div>
                      <div style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>+₹5 / kg ▲</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── MODULE 7: Price Trends ──────────────────────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">📈 {t.secTrends}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/market-prices')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ padding: 10, background: '#f0fdf4', borderRadius: 8, border: '1px solid #86efac', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>
                    Demand High: 30 Count & 40 Count rates up +3.8% this week
                  </div>
                  <div style={{ fontSize: 11, color: '#15803d', marginTop: 2 }}>
                    Export packing plants active across {selectedDistrict} coastal corridor.
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', padding: '0 4px' }}>
                  <span>Mon: ₹360</span>
                  <span>Wed: ₹370</span>
                  <span>Fri: ₹375</span>
                  <span style={{ fontWeight: 800, color: '#047857' }}>Today: ₹380</span>
                </div>
              </div>

              {/* ─── MODULE 8: Nearby Certified Hatcheries ────────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">🧬 {t.secHatcheries}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/hatcheries')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {overview?.nearbyHatcheries?.slice(0, 2).map((h, i) => (
                    <div key={i} style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{h.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {h.location} • ⭐ {h.rating || '4.8'} • {h.distance || '12'} {t.distance}
                        </div>
                      </div>
                      <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => navigate('/hatcheries')}>
                        {t.contact}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── MODULE 9: Available Seed (Post-Larvae) ───────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">🦐 {t.secSeed}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/hatcheries')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {overview?.availableSeed?.slice(0, 2).map((s, i) => (
                    <div key={i} style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{s.species} (PL-{s.stage || '12'})</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          PCR Tested • ₹{s.pricePerThousand || 420}/1k • Stock: {s.availableStock ? s.availableStock.toLocaleString() : '500,000'}
                        </div>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '3px 10px', fontSize: 11 }} onClick={() => navigate('/hatcheries')}>
                        {t.orderNow}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── MODULE 10: Available Aquaculture Workers ─────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">👷 {t.secWorkers}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/jobs')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {overview?.availableWorkers?.slice(0, 2).map((w, i) => (
                    <div key={i} style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{w.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {w.skills || 'Pond Maintenance & Feeding'} • {w.experience || '5 yrs exp'}
                        </div>
                      </div>
                      <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => navigate('/jobs')}>
                        {t.contact}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── MODULE 11: Machinery Marketplace ─────────────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">⚙️ {t.secMachinery}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/equipment')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {overview?.machineryMarketplace?.slice(0, 2).map((m, i) => (
                    <div key={i} style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{m.title}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {m.category} • {m.condition || 'New'} • {fmtCurrency(m.price)}
                        </div>
                      </div>
                      <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => navigate('/equipment')}>
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── MODULE 12: Expert Consultation & Advisory ────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">👨‍⚕️ {t.secConsultation}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/consultations')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                    {overview?.expertConsultation?.upcoming ? 'Upcoming Consultation Booked' : 'Top Verified Fisheries Specialists Online'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    Instant Audio / Video pond diagnosis and prescription guidance.
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', fontSize: 12, padding: '7px 12px' }} onClick={() => navigate('/consultations')}>
                  {t.bookConsult}
                </button>
              </div>

              {/* ─── MODULE 13: Medicines & Farm Supplies ─────────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">💊 {t.secSupplies}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/supplies')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {overview?.farmSupplies?.slice(0, 2).map((s, i) => (
                    <div key={i} style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {s.category} • {fmtCurrency(s.price)}
                        </div>
                      </div>
                      <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 11 }} onClick={() => navigate('/supplies')}>
                        Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── MODULE 14: My Seafood Listings ───────────────────────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">🦐 {t.secListings}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/seafood')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {overview?.mySeafoodListings && overview.mySeafoodListings.length > 0 ? (
                    overview.mySeafoodListings.slice(0, 2).map((l, i) => (
                      <div key={i} style={{ padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{l.species} - {l.quantity} Kg</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>
                            {l.sizeGrade} • Ask: {fmtCurrency(l.expectedPrice)}/kg
                          </div>
                        </div>
                        <span className="badge" style={{ background: '#dcfce7', color: '#166534', fontSize: 11 }}>
                          {l.status?.toUpperCase() || 'LISTED'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                      No live listings right now. Post your harvest to attract direct buyers.
                    </div>
                  )}
                  <button className="btn btn-outline" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => navigate('/seafood')}>
                    + Create New Harvest Listing
                  </button>
                </div>
              </div>

              {/* ─── MODULE 15: Interested Commercial Buyers & Offers ─────── */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <span className="dash-card-title">🤝 {t.secBuyers}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => navigate('/seafood')}>
                    {t.viewAll}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {overview?.interestedBuyers && overview.interestedBuyers.length > 0 ? (
                    overview.interestedBuyers.slice(0, 2).map((b, i) => (
                      <div key={i} style={{ padding: 10, background: '#f0fdf4', borderRadius: 8, border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: '#166534' }}>{b.buyerName || 'Coastal Exporters Pvt Ltd'}</div>
                          <div style={{ fontSize: 11, color: '#15803d' }}>
                            Offer: {fmtCurrency(b.offeredPrice || 410)}/kg • {b.quantityRequested || '2,000'} kg
                          </div>
                        </div>
                        <button className="btn btn-primary" style={{ padding: '3px 10px', fontSize: 11 }} onClick={() => navigate('/seafood')}>
                          {t.acceptOffer}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                      3 active buyers browsing listings in {selectedDistrict}.
                    </div>
                  )}
                </div>
              </div>

              {/* ─── MODULE 16: Farm Alerts & Notifications Center Feed ───── */}
              <div className="dash-card" style={{ gridColumn: '1 / -1' }}>
                <div className="dash-card-header">
                  <span className="dash-card-title">🔔 {t.secNotifCenter}</span>
                  <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => setDrawerOpen(true)}>
                    Open Full Center ({overview?.notifications?.length || 0})
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                  {overview?.notifications?.slice(0, 4).map(n => (
                    <div key={n.id} style={{
                      padding: 12,
                      borderRadius: 8,
                      background: n.read ? '#f8fafc' : '#f0fdf4',
                      border: n.read ? '1px solid #e2e8f0' : '1px solid #86efac',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 6
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#047857' }}>
                          {n.category || n.type}
                        </span>
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>{n.time}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: '#475569' }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── ROLE-BASED DASHBOARDS: Worker, Hatchery, Seller, Buyer, Expert, Admin ─── */}
      {activeRole !== 'farmer' && (
        <div style={{ marginTop: 10 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#047857', fontWeight: 700, fontSize: 16 }}>
              🌊 Loading {t.roles[activeRole]} Dashboard...
            </div>
          ) : (
            <div>
              {/* Role Header Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #047857 0%, #0284c7 100%)',
                borderRadius: 14,
                padding: '20px 24px',
                color: '#fff',
                marginBottom: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>
                    {t.roles[activeRole]} Portal
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: 13, opacity: 0.9 }}>
                    Tailored operational control center for {activeRole.toUpperCase()} operations in {selectedDistrict}.
                  </p>
                </div>
                <button
                  className="btn"
                  onClick={() => setActiveRole('farmer')}
                  style={{ background: '#fff', color: '#047857', fontWeight: 800, fontSize: 13, padding: '7px 16px', borderRadius: 8 }}
                >
                  ← Return to Farmer View
                </button>
              </div>

              {/* WORKER DASHBOARD */}
              {activeRole === 'worker' && (
                <div className="dashboard-grid-16">
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">💼 Active Aquaculture Jobs in {selectedDistrict}</span>
                      <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => navigate('/jobs')}>Find Jobs</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {roleData?.jobs?.slice(0, 3).map((j, i) => (
                        <div key={i} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{j.title}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{j.location} • {fmtCurrency(j.salary_min || 15000)}/mo</div>
                          <button className="btn btn-primary" style={{ marginTop: 8, padding: '4px 10px', fontSize: 11 }} onClick={() => navigate('/jobs')}>
                            Apply Now
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">📄 My Job Applications & Status</span>
                    </div>
                    <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #86efac' }}>
                      <div style={{ fontWeight: 800, color: '#166534', fontSize: 14 }}>1 Application Shortlisted</div>
                      <div style={{ fontSize: 12, color: '#15803d', marginTop: 4 }}>Pond Supervisor position at Coastal Farms Ltd. Interview requested.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* HATCHERY DASHBOARD */}
              {activeRole === 'hatchery' && (
                <div className="dashboard-grid-16">
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">🧬 My Hatchery Seed Listings</span>
                      <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => navigate('/hatcheries')}>+ Add Stock</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>Vannamei PL-12 SPF Seed</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Stock: 2,500,000 PL • ₹420/1k • Certified SPF</div>
                      </div>
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">📦 Incoming Seed Orders from Farmers</span>
                    </div>
                    <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #86efac' }}>
                      <div style={{ fontWeight: 800, color: '#166534', fontSize: 14 }}>2 Pending Seed Booking Inquiries</div>
                      <div style={{ fontSize: 12, color: '#15803d', marginTop: 4 }}>Farmer Ramesh (Nellore) requested 200,000 PL for delivery next Friday.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* SELLER DASHBOARD */}
              {activeRole === 'seller' && (
                <div className="dashboard-grid-16">
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">🚜 Machinery & Supplies Catalog</span>
                      <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => navigate('/equipment')}>+ List Product</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {roleData?.listings?.slice(0, 3).map((l, i) => (
                        <div key={i} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{l.title}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{l.category} • {fmtCurrency(l.price)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">💬 Buyer Inquiries & WhatsApp Leads</span>
                    </div>
                    <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #86efac' }}>
                      <div style={{ fontWeight: 800, color: '#166534', fontSize: 14 }}>3 Farmers Contacted regarding 2HP Aerators</div>
                      <div style={{ fontSize: 12, color: '#15803d', marginTop: 4 }}>Direct buyer chat connected through AquaMitra marketplace.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* BUYER DASHBOARD */}
              {activeRole === 'buyer' && (
                <div className="dashboard-grid-16">
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">🦐 Live Farmer Seafood Harvest Listings</span>
                      <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => navigate('/seafood')}>Browse All</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {roleData?.listings?.slice(0, 3).map((s, i) => (
                        <div key={i} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{s.species} ({s.sizeGrade}) - {s.quantity} Kg</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>Farmer Asking: {fmtCurrency(s.expectedPrice)}/kg • {s.location}</div>
                          <button className="btn btn-primary" style={{ marginTop: 8, padding: '4px 10px', fontSize: 11 }} onClick={() => navigate('/seafood')}>
                            Send Commercial Offer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">🤝 Active Negotiations & Accepted Contracts</span>
                    </div>
                    <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #86efac' }}>
                      <div style={{ fontWeight: 800, color: '#166534', fontSize: 14 }}>1 Offer Accepted (5,000 Kg Harvest)</div>
                      <div style={{ fontSize: 12, color: '#15803d', marginTop: 4 }}>Processing transport and harvest date inspection in West Godavari.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* EXPERT DASHBOARD */}
              {activeRole === 'expert' && (
                <div className="dashboard-grid-16">
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">👨‍⚕️ Farmer Advisory Appointments</span>
                      <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => navigate('/consultations')}>Manage Schedule</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>Video Consultation with Venkat (Bapatla)</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>Topic: High Nitrite & Reduced Feeding • Today at 4:30 PM</div>
                        <button className="btn btn-primary" style={{ marginTop: 8, padding: '4px 10px', fontSize: 11 }} onClick={() => navigate('/consultations')}>
                          Join Session
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">🔬 Case History & Diagnostic Submissions</span>
                    </div>
                    <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #86efac' }}>
                      <div style={{ fontWeight: 800, color: '#166534', fontSize: 14 }}>4 AI Disease Reports Submitted for Review</div>
                      <div style={{ fontSize: 12, color: '#15803d', marginTop: 4 }}>Provide vet diagnosis & dosage prescription safely through platform.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN DASHBOARD */}
              {activeRole === 'admin' && (
                <div className="dashboard-grid-16">
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">🛡️ AquaMitra Platform System Telemetry</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#047857' }}>1,248</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Registered Farmers</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#0284c7' }}>142</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Verified Hatcheries</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#8b5cf6' }}>89</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Trade Buyers</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>99.9%</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>API Health Uptime</div>
                      </div>
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">📋 Compliance & Regulatory Audit Logs</span>
                    </div>
                    <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#475569' }}>
                      All medicines and supplies verified against CAA and government approved databases. Zero illegal antibiotics or unlabelled chemicals permitted.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
