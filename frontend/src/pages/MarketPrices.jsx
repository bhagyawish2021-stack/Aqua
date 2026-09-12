import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import {
  getMarketOverview,
  getPriceHistory,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getAlerts,
  createAlert,
  deleteAlert,
  updatePriceAdmin,
  getAquaSanghamLive,
  syncAquaSanghamLive,
  updateAquaSanghamRate,
  resetAquaSanghamRates,
} from '../services/marketService';
import { getErrorMsg } from '../helpers/errorMsg';

// ─── Bilingual Dictionary ───────────────────────────────────────────────────
const I18N = {
  en: {
    pageTitle: 'Live Seafood Market Prices',
    pageSubtitle: 'Real-time verified daily farmgate quotes from AquaSangham network',
    liveFeedTitle: 'AquaSangham Verified Farmgate Feed',
    liveFeedSubtitle: 'Direct daily prices from export processing plants and landing centers — 0% estimated',
    statTotal: 'Listed Counts',
    statGainers: 'Price Gainers',
    statLosers: 'Price Drops',
    statStable: 'Stable Counts',
    tabTable: '📊 Live Count Table (AquaSangham)',
    tabAll: '🗂️ All Commodities Grid',
    tabWatchlist: '⭐ My Watchlist',
    tabAlerts: '🔔 Price Alerts',
    searchPlaceholder: 'Search count, variety or market...',
    allStates: 'All States',
    allDistricts: 'All Districts',
    allSpecies: 'All Species',
    clearFilters: 'Clear',
    syncLiveBtn: 'Sync Live Rates',
    syncingBtn: 'Syncing...',
    editRatesBtn: '✏️ Customize / Edit Rates',
    editingActive: '✓ Rate Editing Active',
    resetRatesBtn: '↺ Reset to Live',
    calcLabel: '🌾 Harvest Revenue Estimator',
    calcWeightPlaceholder: 'Enter Pond Harvest Weight (kg)',
    calcHelper: 'Live total income calculated per count grade for entered biomass',
    colCount: 'Count / Size',
    colGrams: 'Avg. Grams',
    colLiveRate: 'Live Rate (₹/kg)',
    colPrevRate: 'Previous Day',
    colChange: 'Day Change',
    colTrend: 'Trend',
    colPiecePrice: '₹ / Prawn',
    colEstRevenue: 'Est. Revenue',
    colHistory: '7-Day Trend',
    colActions: 'Actions',
    currentPrice: 'Current',
    prevPrice: 'Prev',
    trendsBtn: 'Trend',
    alertBtn: 'Alert',
    adminEditBtn: 'Update',
    ago: 'ago',
    lastUpdated: 'Updated',
    noItems: 'No count rates found for the selected criteria.',
    trendTitle: 'Count Price Trend History',
    targetPriceLabel: 'Target Price (₹/kg)',
    conditionLabel: 'Alert Condition',
    conditionAbove: 'Reaches or exceeds (≥)',
    conditionBelow: 'Falls below or equal (≤)',
    saveAlert: 'Create Alert',
    cancel: 'Cancel',
    updateTitle: 'Update Market Price',
    newPriceLabel: 'New Farmgate Price (₹/kg)',
    savePrice: 'Publish Rate Update',
    activeAlerts: 'Active Farmer Alerts',
    triggeredTag: 'TARGET REACHED',
    deleteAlertConfirm: 'Delete Alert',
  },
  te: {
    pageTitle: 'ప్రత్యక్ష సీఫుడ్ మార్కెట్ ధరలు',
    pageSubtitle: 'AquaSangham నెట్‌వర్క్ నుండి వాస్తవ లైవ్ ఫామ్‌గేట్ రేట్లు (అంచనాలు కావు)',
    liveFeedTitle: 'AquaSangham ధృవీకరించిన లైవ్ ఫామ్‌గేట్ ఫీడ్',
    liveFeedSubtitle: 'ఎగుమతి ప్రాసెసింగ్ ప్లాంట్లు మరియు మండిల నుండి నిజమైన ధరలు — 0% ఊహాజనితం',
    statTotal: 'మొత్తం కౌంట్లు',
    statGainers: 'ధర పెరిగినవి',
    statLosers: 'ధర తగ్గినవి',
    statStable: 'స్థిరమైన కౌంట్లు',
    tabTable: '📊 లైవ్ కౌంట్ పట్టిక (AquaSangham)',
    tabAll: '🗂️ అన్ని రకాల గ్రిడ్',
    tabWatchlist: '⭐ నా వాచ్‌లిస్ట్',
    tabAlerts: '🔔 ధర అలర్ట్‌లు',
    searchPlaceholder: 'కౌంట్, జాతి లేదా ప్రాంతం వెతకండి...',
    allStates: 'అన్ని రాష్ట్రాలు',
    allDistricts: 'అన్ని జిల్లాలు',
    allSpecies: 'అన్ని జాతులు',
    clearFilters: 'క్లియర్',
    syncLiveBtn: 'లైవ్ సింక్ చేయి',
    syncingBtn: 'సింక్ అవుతోంది...',
    editRatesBtn: '✏️ రేట్లు మార్చు / అనుకూలీకరించు',
    editingActive: '✓ రేట్ల మార్పు మోడ్ ఆన్',
    resetRatesBtn: '↺ అసలు రేట్లకు రీసెట్',
    calcLabel: '🌾 పంట ఆదాయ గణన (Harvest Calculator)',
    calcWeightPlaceholder: 'చెరువు పంట బరువు నమోదు చేయండి (కిలోలు)',
    calcHelper: 'నమోదు చేసిన బరువుకు ప్రతి కౌంట్ వద్ద మొత్తం వచ్చే ఆదాయం గణించబడుతుంది',
    colCount: 'కౌంట్ / సైజు',
    colGrams: 'సగటు బరువు',
    colLiveRate: 'లైవ్ రేటు (₹/కిలో)',
    colPrevRate: 'నిన్నటి రేటు',
    colChange: 'మార్పు',
    colTrend: 'ట్రెండ్',
    colPiecePrice: 'పీస్ ధర',
    colEstRevenue: 'మొత్తం ఆదాయం',
    colHistory: '7-రోజుల ట్రెండ్',
    colActions: 'చర్యలు',
    currentPrice: 'ప్రస్తుత ధర',
    prevPrice: 'మునుపటి ధర',
    trendsBtn: 'ట్రెండ్',
    alertBtn: 'అలర్ట్',
    adminEditBtn: 'ధర మార్చు',
    ago: 'క్రితం',
    lastUpdated: 'నవీకరణ',
    noItems: 'ఎంచుకున్న ఫిల్టర్లకు మార్కెట్ కౌంట్లు కనుగొనబడలేదు.',
    trendTitle: 'ధరల చారిత్రక ట్రెండ్',
    targetPriceLabel: 'టార్గెట్ ధర (₹/కిలో)',
    conditionLabel: 'అలర్ట్ నిబంధన',
    conditionAbove: 'చేరినప్పుడు లేదా దాటినప్పుడు (≥)',
    conditionBelow: 'తగ్గినప్పుడు లేదా సమానమైనప్పుడు (≤)',
    saveAlert: 'అలర్ట్ సృష్టించు',
    cancel: 'రద్దు చేయి',
    updateTitle: 'మార్కెట్ ధర అప్‌డేట్ చేయండి',
    newPriceLabel: 'కొత్త ధర (₹/కిలో)',
    savePrice: 'ధరను ప్రచురించు',
    activeAlerts: 'రైతు క్రియాశీల అలర్ట్‌లు',
    triggeredTag: 'టార్గెట్ చేరింది!',
    deleteAlertConfirm: 'అలర్ట్ తొలగించు',
  },
};

export default function MarketPrices() {
  const [lang, setLang] = useState('en');
  const t = I18N[lang];

  // Active Main Tab: 'table' (default, table-wise AquaSangham), 'all' (cards grid), 'watchlist', 'alerts'
  const [activeTab, setActiveTab] = useState('table');

  // AquaSangham Live State
  const [aquaData, setAquaData] = useState(null);
  const [aquaLoading, setAquaLoading] = useState(true);
  const [aquaSyncing, setAquaSyncing] = useState(false);
  const [aquaState, setAquaState] = useState('AP');
  const [aquaRegion, setAquaRegion] = useState('(West Godavari, East Godavari, Krishna)');
  const [aquaSpecies, setAquaSpecies] = useState('Vannamei Shrimp');

  // Customizable / Changeable Rates Mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRates, setEditedRates] = useState({});
  const [harvestWeight, setHarvestWeight] = useState('2000'); // 2000 kg default biomass

  // General Market & Watchlist State (from Supabase/API)
  const [prices, setPrices] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, gainers: 0, losers: 0, stable: 0 });
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering for Cards Grid
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState('all');

  // Trend Modal
  const [trendModalItem, setTrendModalItem] = useState(null);
  const [trendRange, setTrendRange] = useState('daily');
  const [trendHistory, setTrendHistory] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  // Alert Modal
  const [alertModalItem, setAlertModalItem] = useState(null);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState('above');
  const [alertSaving, setAlertSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // Admin Update Modal
  const [adminModalItem, setAdminModalItem] = useState(null);
  const [adminNewPrice, setAdminNewPrice] = useState('');
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminMsg, setAdminMsg] = useState('');

  // ─── 1. Fetch AquaSangham Live Table ──────────────────────────────────────
  const loadAquaLive = useCallback(async (state, region, species) => {
    setAquaLoading(true);
    try {
      const params = {};
      if (state) params.state = state;
      if (region) params.region = region;
      if (species) params.species = species;

      const res = await getAquaSanghamLive(params);
      const data = res.data?.data;
      if (data) {
        setAquaData(data);
        if (data.selected_state?.id) setAquaState(data.selected_state.id);
        if (data.selected_region) setAquaRegion(data.selected_region);
        if (data.selected_species) setAquaSpecies(data.selected_species);
      }
    } catch (err) {
      console.warn('AquaSangham fetch error:', err.message);
    } finally {
      setAquaLoading(false);
    }
  }, []);

  // ─── 2. Fetch General Market Overview ────────────────────────────────────
  const loadMarket = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [ovRes, wlRes, alRes] = await Promise.all([
        getMarketOverview(),
        getWatchlist(),
        getAlerts(),
      ]);

      const data = ovRes.data.data;
      setPrices(data.prices || []);
      setSpeciesList(data.species || []);
      setLocationsList(data.locations || []);
      setStats(data.stats || { totalItems: 0, gainers: 0, losers: 0, stable: 0 });

      const wIds = new Set(wlRes.data.data?.watchlistIds || []);
      setWatchlistIds(wIds);

      setAlerts(alRes.data.data || []);
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAquaLive(aquaState, aquaRegion, aquaSpecies);
    loadMarket();
  }, []);

  // Sync Live Rates from AquaSangham
  async function handleSyncLive() {
    setAquaSyncing(true);
    try {
      const res = await syncAquaSanghamLive({
        state: aquaState,
        region: aquaRegion,
        species: aquaSpecies,
      });
      if (res.data?.data) {
        setAquaData(res.data.data);
      }
    } catch (err) {
      setError('Live sync failed: ' + getErrorMsg(err));
    } finally {
      setAquaSyncing(false);
    }
  }

  // Rate Adjustment ("it should be chnageble")
  async function handleRateChange(countRaw, newRate) {
    const rateVal = parseFloat(newRate);
    if (isNaN(rateVal) || rateVal <= 0) return;

    setEditedRates(prev => ({ ...prev, [countRaw]: rateVal }));

    try {
      await updateAquaSanghamRate({
        state: aquaState,
        region: aquaRegion,
        species: aquaSpecies,
        count: countRaw,
        new_price: rateVal,
      });
      // Refresh live table
      loadAquaLive(aquaState, aquaRegion, aquaSpecies);
    } catch (err) {
      console.warn('Rate update failed:', err.message);
    }
  }

  function handleRateStep(countRaw, currentVal, delta) {
    const nextVal = Math.max(1, (parseFloat(currentVal) || 0) + delta);
    handleRateChange(countRaw, nextVal);
  }

  // Reset Overrides
  async function handleResetRates() {
    try {
      await resetAquaSanghamRates({
        state: aquaState,
        region: aquaRegion,
        species: aquaSpecies,
      });
      setEditedRates({});
      loadAquaLive(aquaState, aquaRegion, aquaSpecies);
    } catch (err) {
      console.warn('Reset rates failed:', err.message);
    }
  }

  // Watchlist Toggle
  async function toggleWatchlist(priceId) {
    const next = new Set(watchlistIds);
    const has = next.has(priceId);
    if (has) {
      next.delete(priceId);
      setWatchlistIds(next);
      try { await removeFromWatchlist(priceId); } catch {}
    } else {
      next.add(priceId);
      setWatchlistIds(next);
      try { await addToWatchlist(priceId); } catch {}
    }
  }

  // Open Trend Modal for Table Row
  function openAquaTrend(row) {
    const historyData = (row.history || []).map((h, i) => ({
      label: h.day,
      price: h.price,
    }));

    setTrendModalItem({
      species: { name: aquaSpecies, telugu_name: aquaSpecies },
      variety: row.count_display,
      location: { market_name: aquaRegion, district: aquaState },
      current_price: row.current_price,
    });
    setTrendRange('daily');
    setTrendHistory(historyData);
  }

  // Open Alert Modal for Table Row
  function openAquaAlert(row) {
    setAlertModalItem({
      species_id: 'sp-van-01',
      location_id: 'loc-ap-01',
      variety: row.count_display,
      location: { market_name: aquaRegion, state: aquaState },
      current_price: row.current_price,
      species: { name: aquaSpecies, telugu_name: aquaSpecies },
    });
    setAlertTargetPrice(row.current_price);
    setAlertCondition('above');
  }

  // Save Price Alert
  async function handleSaveAlert(e) {
    e.preventDefault();
    if (!alertModalItem || !alertTargetPrice) return;
    setAlertSaving(true);
    setAlertMsg('');
    try {
      const payload = {
        species_id: alertModalItem.species_id || 'sp-van-01',
        location_id: alertModalItem.location_id || 'loc-ap-01',
        variety: alertModalItem.variety,
        target_price: parseFloat(alertTargetPrice),
        alert_condition: alertCondition,
      };
      const res = await createAlert(payload);
      setAlerts(res.data.data || []);
      setAlertMsg('Alert saved successfully!');
      setTimeout(() => {
        setAlertModalItem(null);
        setAlertMsg('');
      }, 900);
    } catch (err) {
      setAlertMsg(getErrorMsg(err));
    } finally {
      setAlertSaving(false);
    }
  }

  // Delete Alert
  async function handleDeleteAlert(alertId) {
    try {
      const res = await deleteAlert(alertId);
      setAlerts(res.data.data || []);
    } catch {}
  }

  // Filter Cards Grid
  const availableStates = Array.from(new Set(locationsList.map(l => l.state)));
  const availableDistricts = Array.from(
    new Set(
      locationsList
        .filter(l => selectedState === 'all' || l.state === selectedState)
        .map(l => l.district)
    )
  );

  const filteredPrices = prices.filter(item => {
    if (activeTab === 'watchlist') {
      if (!watchlistIds.has(item.id)) return false;
    } else if (activeTab === 'alerts' || activeTab === 'table') {
      return true;
    }

    if (selectedState !== 'all' && item.location.state !== selectedState) return false;
    if (selectedDistrict !== 'all' && item.location.district !== selectedDistrict) return false;
    if (selectedSpecies !== 'all' && item.species_id !== selectedSpecies) return false;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const match =
        item.species.name.toLowerCase().includes(q) ||
        (item.species.telugu_name && item.species.telugu_name.includes(q)) ||
        item.location.market_name.toLowerCase().includes(q) ||
        item.location.district.toLowerCase().includes(q) ||
        item.variety.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const triggeredAlertsCount = alerts.filter(a => a.triggered).length;
  const numWeightKg = parseFloat(harvestWeight) || 0;

  return (
    <Layout title={t.pageTitle}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h2>{t.pageTitle}</h2>
          <p>{t.pageSubtitle}</p>
        </div>
        <div className="market-header-actions">
          {/* Language Selector */}
          <div className="lang-toggle" aria-label="Toggle language">
            <button
              className={lang === 'en' ? 'active' : ''}
              onClick={() => setLang('en')}
            >
              English
            </button>
            <button
              className={lang === 'te' ? 'active' : ''}
              onClick={() => setLang('te')}
            >
              తెలుగు
            </button>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              loadAquaLive(aquaState, aquaRegion, aquaSpecies);
              loadMarket();
            }}
            title="Refresh market data"
          >
            🔄
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* ─── LIVE AQUASANGHAM BANNER ────────────────────────────────────────── */}
      <div className="aqua-live-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="aqua-pulse-beacon" title="Live Connection Active" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🟢 {t.liveFeedTitle}</span>
              <span style={{ fontSize: 11, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                100% Verified Farmgate
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {t.liveFeedSubtitle} • Last Synced: {aquaData?.last_synced ? new Date(aquaData.last_synced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleResetRates}
            title="Reset any custom edited rates back to pure AquaSangham live rates"
            style={{ fontSize: 12 }}
          >
            {t.resetRatesBtn}
          </button>
          <button
            className={`btn btn-sm ${isEditMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsEditMode(!isEditMode)}
            style={{ fontSize: 12 }}
          >
            {isEditMode ? t.editingActive : t.editRatesBtn}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSyncLive}
            disabled={aquaSyncing}
            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>{aquaSyncing ? '⏳' : '🔄'}</span>
            <span>{aquaSyncing ? t.syncingBtn : t.syncLiveBtn}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <StatCard
          label={t.statTotal}
          value={aquaData?.count_summary?.total_counts || stats.totalItems}
          icon="🦐"
        />
        <StatCard
          label={t.statGainers}
          value={`+${aquaData?.count_summary?.gainers ?? stats.gainers}`}
          icon="📈"
          color="var(--success)"
        />
        <StatCard
          label={t.statLosers}
          value={`-${aquaData?.count_summary?.losers ?? stats.losers}`}
          icon="📉"
          color="var(--danger)"
        />
        <StatCard
          label={t.statStable}
          value={aquaData?.count_summary?.stable ?? stats.stable}
          icon="⚖️"
          color="var(--text-secondary)"
        />
      </div>

      {/* ─── Main Tabs ──────────────────────────────────────────────────────── */}
      <div className="market-tabs">
        <button
          className={'market-tab' + (activeTab === 'table' ? ' active' : '')}
          onClick={() => setActiveTab('table')}
        >
          {t.tabTable}
        </button>
        <button
          className={'market-tab' + (activeTab === 'all' ? ' active' : '')}
          onClick={() => setActiveTab('all')}
        >
          {t.tabAll}
        </button>
        <button
          className={'market-tab' + (activeTab === 'watchlist' ? ' active' : '')}
          onClick={() => setActiveTab('watchlist')}
        >
          {t.tabWatchlist}
          <span className="tab-badge">{watchlistIds.size}</span>
        </button>
        <button
          className={'market-tab' + (activeTab === 'alerts' ? ' active' : '')}
          onClick={() => setActiveTab('alerts')}
        >
          {t.tabAlerts}
          {triggeredAlertsCount > 0 && (
            <span className="tab-badge" style={{ background: '#ef4444', color: '#fff' }}>
              {triggeredAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── TAB 1: LIVE COUNT TABLE (AQUASANGHAM) ────────────────────────── */}
      {activeTab === 'table' && (
        <>
          {/* Controls Bar ("it should be chnageble") */}
          <div className="market-filter-bar" style={{ background: '#ffffff', borderRadius: 14, padding: 14, border: '1px solid var(--border)', marginBottom: 16 }}>
            {/* State Selector */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                📍 State / రాష్ట్రం
              </label>
              <select
                value={aquaState}
                onChange={e => {
                  const nextState = e.target.value;
                  setAquaState(nextState);
                  loadAquaLive(nextState, null, aquaSpecies);
                }}
              >
                {(aquaData?.states || []).map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Region / District Selector */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                🏛️ Aquaculture Hub / ప్రాంతం
              </label>
              <select
                value={aquaRegion}
                onChange={e => {
                  const nextReg = e.target.value;
                  setAquaRegion(nextReg);
                  loadAquaLive(aquaState, nextReg, aquaSpecies);
                }}
              >
                {(aquaData?.available_regions || []).map(reg => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* Species Selector */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                🦐 Species / జాతి
              </label>
              <select
                value={aquaSpecies}
                onChange={e => {
                  const nextSp = e.target.value;
                  setAquaSpecies(nextSp);
                  loadAquaLive(aquaState, aquaRegion, nextSp);
                }}
              >
                {(aquaData?.available_species || []).map(sp => (
                  <option key={sp} value={sp}>
                    {sp === 'Vannamei Shrimp' && lang === 'te' ? 'వనామి రొయ్య (Vannamei)' : sp}
                  </option>
                ))}
              </select>
            </div>

            {/* Change Rate Prompt */}
            {isEditMode && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 12, color: '#d97706', fontWeight: 600, paddingBottom: 8 }}>
                  ⚡ Edit mode: Type rates or use ±5 steppers
                </span>
              </div>
            )}
          </div>

          {/* Harvest Revenue Estimator Box */}
          <div className="harvest-estimator-card">
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#065f46', marginBottom: 2 }}>
                {t.calcLabel}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {t.calcHelper}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{t.enterWeight}:</span>
              <input
                type="number"
                min="0"
                step="50"
                className="aqua-price-input"
                style={{ width: 120, fontSize: 14, textAlign: 'center' }}
                value={harvestWeight}
                onChange={e => setHarvestWeight(e.target.value)}
                placeholder="kg"
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>KG</span>
            </div>
          </div>

          {/* ─── LIVE TABLE WISE COMPONENT ────────────────────────────────────── */}
          {aquaLoading ? (
            <Loading />
          ) : !aquaData?.table_rows || aquaData.table_rows.length === 0 ? (
            <EmptyState
              icon="🏷️"
              title="No live count prices found"
              message={t.noItems}
            />
          ) : (
            <div className="aqua-table-wrap">
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: '#fafbfc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                    {aquaSpecies} — {aquaData.selected_region} ({aquaData.selected_state?.name})
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                    Live daily count rates • Source: {aquaData.source}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', background: '#f0f9ff', padding: '4px 12px', borderRadius: 20 }}>
                  {aquaData.table_rows.length} Counts Listed
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="aqua-price-table">
                  <thead>
                    <tr>
                      <th>{t.colCount}</th>
                      <th>{t.colGrams}</th>
                      <th>{t.colLiveRate}</th>
                      <th>{t.colPrevRate}</th>
                      <th>{t.colChange}</th>
                      <th>{t.colTrend}</th>
                      <th>{t.colPiecePrice}</th>
                      {numWeightKg > 0 && <th>{t.colEstRevenue}</th>}
                      <th>{t.colHistory}</th>
                      <th style={{ textAlign: 'right' }}>{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aquaData.table_rows.map(row => {
                      const isUp = row.trend === 'up';
                      const isDown = row.trend === 'down';
                      const trendClass = isUp ? 'trend-up' : isDown ? 'trend-down' : 'trend-stable';
                      const trendSymbol = isUp ? '▲' : isDown ? '▼' : '▬';
                      const changeSign = row.change_amount > 0 ? '+' : '';

                      // Revenue calculation for entered biomass
                      const estRevenue = numWeightKg > 0 ? Math.round(numWeightKg * row.current_price) : 0;
                      const estLakhs = (estRevenue / 100000).toFixed(2);

                      return (
                        <tr key={row.id}>
                          {/* Count */}
                          <td>
                            <div className="aqua-count-pill">
                              <span className="aqua-count-badge">{row.count_display}</span>
                            </div>
                          </td>

                          {/* Avg Grams */}
                          <td>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {row.avg_weight_grams ? `${row.avg_weight_grams} g` : '—'}
                            </span>
                          </td>

                          {/* Live Rate (Editable if in Edit Mode) */}
                          <td>
                            {isEditMode ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <button
                                  type="button"
                                  className="aqua-stepper-btn"
                                  onClick={() => handleRateStep(row.count_raw, row.current_price, -5)}
                                  title="Decrease rate by ₹5"
                                >
                                  -5
                                </button>
                                <input
                                  type="number"
                                  step="1"
                                  className="aqua-price-input"
                                  value={editedRates[row.count_raw] ?? row.current_price}
                                  onChange={e => handleRateChange(row.count_raw, e.target.value)}
                                />
                                <button
                                  type="button"
                                  className="aqua-stepper-btn"
                                  onClick={() => handleRateStep(row.count_raw, row.current_price, 5)}
                                  title="Increase rate by ₹5"
                                >
                                  +5
                                </button>
                              </div>
                            ) : (
                              <div className={`aqua-live-rate ${row.is_overridden ? 'overridden' : ''}`}>
                                <span>₹{row.current_price}</span>
                                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>/kg</span>
                                {row.is_overridden && (
                                  <span style={{ fontSize: 10, background: '#fef3c7', color: '#b45309', padding: '1px 5px', borderRadius: 4, marginLeft: 4 }}>
                                    Edited
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Previous Price */}
                          <td>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
                              ₹{row.previous_price}
                            </span>
                          </td>

                          {/* Day Change */}
                          <td>
                            <div className={`price-trend-badge ${trendClass}`} style={{ fontSize: 12, padding: '3px 8px' }}>
                              <span>{changeSign}₹{Math.abs(row.change_amount)}</span>
                              {row.change_pct !== 0 && (
                                <span style={{ fontSize: 10, opacity: 0.9 }}>
                                  ({changeSign}{row.change_pct}%)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Trend */}
                          <td>
                            <span style={{ fontWeight: 700, fontSize: 13, color: isUp ? '#16a34a' : isDown ? '#dc2626' : '#64748b' }}>
                              {trendSymbol} {isUp ? 'Rising' : isDown ? 'Dropping' : 'Stable'}
                            </span>
                          </td>

                          {/* Piece Price */}
                          <td>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0369a1' }}>
                              {row.piece_price ? `₹${row.piece_price}` : '—'}
                            </span>
                          </td>

                          {/* Estimated Harvest Revenue */}
                          {numWeightKg > 0 && (
                            <td>
                              <div style={{ fontWeight: 800, color: '#065f46', fontSize: 14 }}>
                                ₹{estRevenue.toLocaleString('en-IN')}
                                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>
                                  ({estLakhs} Lakhs)
                                </div>
                              </div>
                            </td>
                          )}

                          {/* Mini Sparkline / History count */}
                          <td>
                            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 24 }}>
                              {(row.history || []).slice(-6).map((h, hi) => {
                                const min = Math.min(...row.history.map(x => x.price));
                                const max = Math.max(...row.history.map(x => x.price));
                                const pct = max === min ? 50 : Math.max(15, Math.min(100, ((h.price - min) / (max - min)) * 100));
                                return (
                                  <div
                                    key={hi}
                                    style={{
                                      width: 6,
                                      height: `${pct}%`,
                                      background: hi === (row.history.length - 1) ? '#0284c7' : '#cbd5e1',
                                      borderRadius: 2,
                                    }}
                                    title={`${h.day}: ₹${h.price}`}
                                  />
                                );
                              })}
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 6 }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => openAquaTrend(row)}
                                title="View price trend chart"
                                style={{ padding: '4px 8px', fontSize: 12 }}
                              >
                                📊 {t.trendsBtn}
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => openAquaAlert(row)}
                                title="Set target price alert"
                                style={{ padding: '4px 8px', fontSize: 12 }}
                              >
                                🔔 {t.alertBtn}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── TAB 2: ALL COMMODITIES CARDS GRID ────────────────────────────── */}
      {activeTab === 'all' && (
        <>
          {/* Filter Bar */}
          <div className="market-filter-bar">
            <div>
              <input
                type="text"
                className="form-control"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div>
              <select
                value={selectedState}
                onChange={e => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict('all');
                }}
              >
                <option value="all">{t.allStates}</option>
                {availableStates.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
              >
                <option value="all">{t.allDistricts}</option>
                {availableDistricts.map(dt => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedSpecies}
                onChange={e => setSelectedSpecies(e.target.value)}
              >
                <option value="all">{t.allSpecies}</option>
                {speciesList.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.image_icon} {lang === 'te' && s.telugu_name ? s.telugu_name : s.name}
                  </option>
                ))}
              </select>
            </div>
            {(search || selectedState !== 'all' || selectedDistrict !== 'all' || selectedSpecies !== 'all') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  setSelectedState('all');
                  setSelectedDistrict('all');
                  setSelectedSpecies('all');
                }}
              >
                {t.clearFilters}
              </button>
            )}
          </div>

          {/* Cards Grid */}
          {loading ? (
            <Loading />
          ) : filteredPrices.length === 0 ? (
            <EmptyState
              icon="🏷️"
              title="No seafood prices found"
              message={t.noItems}
            />
          ) : (
            <div className="market-grid">
              {filteredPrices.map(item => {
                const isWatch = watchlistIds.has(item.id);
                const speciesTitle =
                  lang === 'te' && item.species.telugu_name
                    ? item.species.telugu_name
                    : item.species.name;
                const speciesSubtitle =
                  lang === 'te' ? item.species.name : item.species.scientific_name || '';

                const isUp = item.trend === 'up';
                const isDown = item.trend === 'down';
                const trendClass = isUp ? 'trend-up' : isDown ? 'trend-down' : 'trend-stable';
                const trendSymbol = isUp ? '▲' : isDown ? '▼' : '—';
                const sign = item.change_amount > 0 ? '+' : '';

                return (
                  <div key={item.id} className="market-card">
                    <div>
                      {/* Top Bar */}
                      <div className="market-card-top">
                        <div className="market-species-info">
                          <div className="market-icon-bubble">{item.species.image_icon}</div>
                          <div>
                            <div className="market-species-name">{speciesTitle}</div>
                            <div className="market-species-sub">
                              {speciesSubtitle} • <strong style={{ color: 'var(--primary)' }}>{item.variety}</strong>
                            </div>
                          </div>
                        </div>
                        <button
                          className="watchlist-btn"
                          onClick={() => toggleWatchlist(item.id)}
                          title="Star to watchlist"
                          aria-label="Add to watchlist"
                        >
                          {isWatch ? '⭐' : '☆'}
                        </button>
                      </div>

                      {/* Location Pill */}
                      <div className="market-loc-pill">
                        📍 {item.location.market_name} • {item.location.district} ({item.location.state})
                      </div>

                      {/* Price Row */}
                      <div className="market-price-row">
                        <div>
                          <div className="big-price">
                            ₹{item.current_price}
                            <span className="price-unit-tag">/kg</span>
                          </div>
                          {item.previous_price && (
                            <div className="prev-price-label">
                              {t.prevPrice}: ₹{item.previous_price}/kg
                            </div>
                          )}
                        </div>
                        <div className={`price-trend-badge ${trendClass}`}>
                          <span>{trendSymbol}</span>
                          <span>
                            {sign}₹{Math.abs(item.change_amount)} ({sign}
                            {item.change_pct}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          marginBottom: 8,
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>
                          {t.lastUpdated}: {new Date(item.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span
                          style={{ cursor: 'pointer', color: 'var(--primary)' }}
                          onClick={() => {
                            setAdminModalItem(item);
                            setAdminNewPrice(item.current_price);
                          }}
                        >
                          ✏️ {t.adminEditBtn}
                        </span>
                      </div>
                      <div className="market-card-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setTrendModalItem(item);
                            setTrendRange('daily');
                            fetchHistory(item.id, 'daily');
                          }}
                        >
                          📊 {t.trendsBtn}
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setAlertModalItem(item);
                            setAlertTargetPrice(item.current_price);
                            setAlertCondition('above');
                          }}
                        >
                          🔔 {t.alertBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── TAB 3: WATCHLIST ──────────────────────────────────────────────── */}
      {activeTab === 'watchlist' && (
        <>
          {watchlistIds.size === 0 ? (
            <EmptyState
              icon="⭐"
              title="Your Watchlist is empty"
              message="Star species or count rates to monitor them here."
            />
          ) : (
            <div className="market-grid">
              {prices.filter(p => watchlistIds.has(p.id)).map(item => (
                <div key={item.id} className="market-card">
                  <div className="market-card-top">
                    <div className="market-species-info">
                      <div className="market-icon-bubble">{item.species.image_icon}</div>
                      <div>
                        <div className="market-species-name">{item.species.name}</div>
                        <div className="market-species-sub">{item.variety}</div>
                      </div>
                    </div>
                    <button className="watchlist-btn" onClick={() => toggleWatchlist(item.id)}>
                      ⭐
                    </button>
                  </div>
                  <div className="market-price-row" style={{ marginTop: 12 }}>
                    <div className="big-price">₹{item.current_price}/kg</div>
                    <div className="price-trend-badge trend-up">
                      {item.change_amount >= 0 ? '+' : ''}₹{item.change_amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── TAB 4: ALERTS ─────────────────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">🔔 {t.activeAlerts}</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {alerts.length} registered
              </span>
            </div>
            {alerts.length === 0 ? (
              <EmptyState
                icon="🔔"
                title="No active price alerts"
                message="Click 'Alert' on any count row or market card to get notified when prices reach your target."
              />
            ) : (
              <div style={{ padding: '4px 0' }}>
                {alerts.map(a => (
                  <div
                    key={a.id}
                    className={'alert-item-card' + (a.triggered ? ' triggered' : '')}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 18 }}>{a.species?.image_icon || '🦐'}</span>
                        <strong style={{ fontSize: 15 }}>
                          {lang === 'te' && a.species?.telugu_name ? a.species.telugu_name : a.species?.name}
                        </strong>
                        <span style={{ fontSize: 12, padding: '2px 6px', background: '#e2e8f0', borderRadius: 4 }}>
                          {a.variety}
                        </span>
                        {a.triggered && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#16a34a',
                              color: '#fff',
                              padding: '2px 8px',
                              borderRadius: 12,
                            }}
                          >
                            ✓ {t.triggeredTag}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        📍 {a.location?.market_name} ({a.location?.state}) • Target:{' '}
                        <strong>
                          {a.alert_condition === 'above' ? '≥' : a.alert_condition === 'below' ? '≤' : '='}{' '}
                          ₹{a.target_price}/kg
                        </strong>
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDeleteAlert(a.id)}
                      title={t.deleteAlertConfirm}
                      style={{ color: 'var(--danger)' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Price Trend History Modal ────────────────────────────────────── */}
      {trendModalItem && (
        <Modal
          title={`📊 ${t.trendTitle}: ${trendModalItem.variety} (${trendModalItem.species.name})`}
          onClose={() => setTrendModalItem(null)}
        >
          <div>
            <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
              📍 {trendModalItem.location.market_name} • Current Rate:{' '}
              <strong style={{ color: 'var(--text)', fontSize: 16 }}>
                ₹{trendModalItem.current_price}/kg
              </strong>
            </div>

            {/* Range Toggle */}
            <div className="trend-range-toggle">
              <button className="active">
                AquaSangham Verified History
              </button>
            </div>

            {/* Chart */}
            {trendHistory.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                No history data available for this count.
              </p>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendHistory} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis
                      domain={['dataMin - 15', 'dataMax + 15']}
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      tickFormatter={v => `₹${v}`}
                    />
                    <Tooltip
                      formatter={value => [`₹${value}/kg`, 'Price']}
                      labelFormatter={label => `Date: ${label}`}
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#0284c7"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0284c7' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ─── Price Alert Modal ────────────────────────────────────────────── */}
      {alertModalItem && (
        <Modal
          title={`🔔 ${t.alertBtn}: ${alertModalItem.variety}`}
          onClose={() => setAlertModalItem(null)}
        >
          <form onSubmit={handleSaveAlert}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Market: <strong>{alertModalItem.location.market_name}</strong> • Current Price:{' '}
              <strong style={{ color: 'var(--text)' }}>₹{alertModalItem.current_price}/kg</strong>
            </div>

            {alertMsg && (
              <div className={`alert ${alertMsg.includes('success') ? 'alert-success' : 'alert-error'}`}>
                {alertMsg}
              </div>
            )}

            <div className="form-group">
              <label>{t.conditionLabel}</label>
              <select
                value={alertCondition}
                onChange={e => setAlertCondition(e.target.value)}
              >
                <option value="above">{t.conditionAbove}</option>
                <option value="below">{t.conditionBelow}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t.targetPriceLabel}</label>
              <input
                type="number"
                step="1"
                min="10"
                required
                value={alertTargetPrice}
                onChange={e => setAlertTargetPrice(e.target.value)}
                placeholder="e.g. 520"
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAlertModalItem(null)}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={alertSaving}
              >
                {alertSaving ? 'Saving...' : t.saveAlert}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── Admin Modal (For Grid Cards) ─────────────────────────────────── */}
      {adminModalItem && (
        <Modal
          title={t.updateTitle}
          onClose={() => setAdminModalItem(null)}
        >
          <form onSubmit={async e => {
            e.preventDefault();
            if (!adminModalItem || !adminNewPrice) return;
            setAdminSaving(true);
            setAdminMsg('');
            try {
              const res = await updatePriceAdmin({
                price_id: adminModalItem.id,
                new_price: parseFloat(adminNewPrice),
              });
              const updatedItem = res.data.data;
              setPrices(prev => prev.map(p => (p.id === updatedItem.id ? updatedItem : p)));
              setAdminMsg('Price updated!');
              setTimeout(() => {
                setAdminModalItem(null);
                setAdminMsg('');
              }, 700);
            } catch (err) {
              setAdminMsg(getErrorMsg(err));
            } finally {
              setAdminSaving(false);
            }
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Update farmgate rate for{' '}
              <strong>
                {adminModalItem.species.name} - {adminModalItem.variety}
              </strong>{' '}
              at <strong>{adminModalItem.location.market_name}</strong>.
            </div>

            {adminMsg && (
              <div className={`alert ${adminMsg.includes('updated') ? 'alert-success' : 'alert-error'}`}>
                {adminMsg}
              </div>
            )}

            <div className="form-group">
              <label>{t.newPriceLabel}</label>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={adminNewPrice}
                onChange={e => setAdminNewPrice(e.target.value)}
                placeholder="e.g. 525"
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAdminModalItem(null)}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={adminSaving}
              >
                {adminSaving ? 'Updating...' : t.savePrice}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
