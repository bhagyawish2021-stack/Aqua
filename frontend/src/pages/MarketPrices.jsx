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
} from '../services/marketService';
import { getErrorMsg } from '../helpers/errorMsg';

// ─── Bilingual Dictionary ───────────────────────────────────────────────────
const I18N = {
  en: {
    pageTitle: 'Live Seafood Market Prices',
    pageSubtitle: 'Daily farmgate & mandi rates across Indian coastal hubs',
    statTotal: 'Listed Commodities',
    statGainers: 'Price Gainers',
    statLosers: 'Price Drops',
    statStable: 'Stable Rates',
    tabAll: 'All Species',
    tabShrimp: 'Shrimp & Prawns',
    tabCrab: 'Crabs',
    tabFish: 'Fish',
    tabOther: 'Other Seafood',
    tabWatchlist: 'My Watchlist',
    tabAlerts: 'Price Alerts',
    searchPlaceholder: 'Search species, variety or market...',
    allStates: 'All States',
    allDistricts: 'All Districts',
    allSpecies: 'All Species',
    clearFilters: 'Clear',
    currentPrice: 'Current',
    prevPrice: 'Prev',
    trendsBtn: 'Trends',
    alertBtn: 'Set Alert',
    adminEditBtn: 'Update',
    ago: 'ago',
    lastUpdated: 'Updated',
    noItems: 'No market prices found for the selected criteria.',
    trendTitle: 'Price Trend History',
    targetPriceLabel: 'Target Price (₹/kg)',
    conditionLabel: 'Alert Condition',
    conditionAbove: 'Reaches or exceeds (≥)',
    conditionBelow: 'Falls below or equal (≤)',
    saveAlert: 'Create Alert',
    cancel: 'Cancel',
    updateTitle: 'Update Market Price (Admin)',
    newPriceLabel: 'New Farmgate Price (₹/kg)',
    savePrice: 'Publish Price Update',
    activeAlerts: 'Active Farmer Alerts',
    triggeredTag: 'TARGET REACHED',
    deleteAlertConfirm: 'Delete Alert',
  },
  te: {
    pageTitle: 'ప్రత్యక్ష సీఫుడ్ మార్కెట్ ధరలు',
    pageSubtitle: 'భారతీయ తీరప్రాంత మార్కెట్లలో రోజువారీ రొయ్యలు, చేపల లైవ్ రేట్లు',
    statTotal: 'మొత్తం రకాలు',
    statGainers: 'ధర పెరిగినవి',
    statLosers: 'ధర తగ్గినవి',
    statStable: 'స్థిరమైన ధరలు',
    tabAll: 'అన్ని రకాలు',
    tabShrimp: 'రొయ్యలు',
    tabCrab: 'పీతలు',
    tabFish: 'చేపలు',
    tabOther: 'ఇతర సీఫుడ్',
    tabWatchlist: 'నా వాచ్‌లిస్ట్',
    tabAlerts: 'ధర అలర్ట్‌లు',
    searchPlaceholder: 'జాతి, సైజు లేదా మార్కెట్ వెతకండి...',
    allStates: 'అన్ని రాష్ట్రాలు',
    allDistricts: 'అన్ని జిల్లాలు',
    allSpecies: 'అన్ని జాతులు',
    clearFilters: 'క్లియర్',
    currentPrice: 'ప్రస్తుత ధర',
    prevPrice: 'మునుపటి ధర',
    trendsBtn: 'ట్రెండ్స్',
    alertBtn: 'అలర్ట్ పెట్టు',
    adminEditBtn: 'ధర మార్చు',
    ago: 'క్రితం',
    lastUpdated: 'నవీకరణ',
    noItems: 'ఎంచుకున్న ఫిల్టర్లకు అనుగుణంగా మార్కెట్ ధరలు కనుగొనబడలేదు.',
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

  const [prices, setPrices] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, gainers: 0, losers: 0, stable: 0 });
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering
  const [activeTab, setActiveTab] = useState('all');
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

  // Initial load
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
    loadMarket();
  }, [loadMarket]);

  // Handle Watchlist Star
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

  // Open Trend Modal
  async function openTrendModal(item) {
    setTrendModalItem(item);
    setTrendRange('daily');
    fetchHistory(item.id, 'daily');
  }

  async function fetchHistory(priceId, range) {
    setTrendLoading(true);
    try {
      const res = await getPriceHistory(priceId, range);
      setTrendHistory(res.data.data?.history || []);
    } catch {
      setTrendHistory([]);
    } finally {
      setTrendLoading(false);
    }
  }

  function handleRangeChange(range) {
    setTrendRange(range);
    if (trendModalItem) {
      fetchHistory(trendModalItem.id, range);
    }
  }

  // Save Price Alert
  async function handleSaveAlert(e) {
    e.preventDefault();
    if (!alertModalItem || !alertTargetPrice) return;
    setAlertSaving(true);
    setAlertMsg('');
    try {
      const payload = {
        species_id: alertModalItem.species_id,
        location_id: alertModalItem.location_id,
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

  // Admin Update Price
  async function handleAdminPriceSave(e) {
    e.preventDefault();
    if (!adminModalItem || !adminNewPrice) return;
    setAdminSaving(true);
    setAdminMsg('');
    try {
      const res = await updatePriceAdmin({
        price_id: adminModalItem.id,
        new_price: parseFloat(adminNewPrice),
      });

      // Update in state
      const updatedItem = res.data.data;
      setPrices(prev => prev.map(p => (p.id === updatedItem.id ? updatedItem : p)));

      // Refresh alerts in background
      getAlerts().then(r => setAlerts(r.data.data || [])).catch(() => {});

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
  }

  // Filter Items
  const availableStates = Array.from(new Set(locationsList.map(l => l.state)));
  const availableDistricts = Array.from(
    new Set(
      locationsList
        .filter(l => selectedState === 'all' || l.state === selectedState)
        .map(l => l.district)
    )
  );

  let filteredPrices = prices.filter(item => {
    // Tab Filter
    if (activeTab === 'watchlist') {
      if (!watchlistIds.has(item.id)) return false;
    } else if (activeTab === 'alerts') {
      return false; // Handled separately in UI
    } else if (activeTab !== 'all') {
      if (item.species.category !== activeTab) return false;
    }

    // State
    if (selectedState !== 'all' && item.location.state !== selectedState) return false;

    // District
    if (selectedDistrict !== 'all' && item.location.district !== selectedDistrict) return false;

    // Species
    if (selectedSpecies !== 'all' && item.species_id !== selectedSpecies) return false;

    // Search
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

  // Calculate quick stats from current filtered items
  const triggeredAlertsCount = alerts.filter(a => a.triggered).length;

  return (
    <Layout title={t.pageTitle}>
      {/* Page Header with Bilingual Toggle */}
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
          <button className="btn btn-secondary btn-sm" onClick={loadMarket} title="Refresh market data">
            🔄
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* KPI Stats Row */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <StatCard label={t.statTotal} value={stats.totalItems} icon="🏷️" />
        <StatCard label={t.statGainers} value={`+${stats.gainers}`} icon="📈" color="var(--success)" />
        <StatCard label={t.statLosers} value={`-${stats.losers}`} icon="📉" color="var(--danger)" />
        <StatCard label={t.statStable} value={stats.stable} icon="⚖️" color="var(--text-secondary)" />
      </div>

      {/* Category Tabs */}
      <div className="market-tabs">
        <button
          className={'market-tab' + (activeTab === 'all' ? ' active' : '')}
          onClick={() => setActiveTab('all')}
        >
          🦐 {t.tabAll}
        </button>
        <button
          className={'market-tab' + (activeTab === 'shrimp' ? ' active' : '')}
          onClick={() => setActiveTab('shrimp')}
        >
          🍤 {t.tabShrimp}
        </button>
        <button
          className={'market-tab' + (activeTab === 'crab' ? ' active' : '')}
          onClick={() => setActiveTab('crab')}
        >
          🦀 {t.tabCrab}
        </button>
        <button
          className={'market-tab' + (activeTab === 'fish' ? ' active' : '')}
          onClick={() => setActiveTab('fish')}
        >
          🐟 {t.tabFish}
        </button>
        <button
          className={'market-tab' + (activeTab === 'other' ? ' active' : '')}
          onClick={() => setActiveTab('other')}
        >
          🦞 {t.tabOther}
        </button>
        <button
          className={'market-tab' + (activeTab === 'watchlist' ? ' active' : '')}
          onClick={() => setActiveTab('watchlist')}
        >
          ⭐ {t.tabWatchlist}
          <span className="tab-badge">{watchlistIds.size}</span>
        </button>
        <button
          className={'market-tab' + (activeTab === 'alerts' ? ' active' : '')}
          onClick={() => setActiveTab('alerts')}
        >
          🔔 {t.tabAlerts}
          {triggeredAlertsCount > 0 && (
            <span className="tab-badge" style={{ background: '#ef4444', color: '#fff' }}>
              {triggeredAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* When Alerts tab is active, show the Alerts management view */}
      {activeTab === 'alerts' ? (
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
                message="Click 'Set Alert' on any seafood market card to get notified when prices reach your target."
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
                        📍 {a.location?.market_name} ({a.location?.state}) • Condition:{' '}
                        <strong>
                          {a.alert_condition === 'above' ? '≥' : a.alert_condition === 'below' ? '≤' : '='}{' '}
                          ₹{a.target_price}/kg
                        </strong>
                        {a.current_price && (
                          <span style={{ marginLeft: 8 }}>
                            (Current: <strong>₹{a.current_price}/kg</strong>)
                          </span>
                        )}
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
      ) : (
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

          {/* Cards Grid or Loading/Empty */}
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
                        <span style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => {
                          setAdminModalItem(item);
                          setAdminNewPrice(item.current_price);
                        }}>
                          ✏️ {t.adminEditBtn}
                        </span>
                      </div>
                      <div className="market-card-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => openTrendModal(item)}
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

      {/* ─── Price Trend History Modal ────────────────────────────────────── */}
      {trendModalItem && (
        <Modal
          title={`📊 ${t.trendTitle}: ${
            lang === 'te' && trendModalItem.species.telugu_name
              ? trendModalItem.species.telugu_name
              : trendModalItem.species.name
          } (${trendModalItem.variety})`}
          onClose={() => setTrendModalItem(null)}
        >
          <div>
            <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
              📍 {trendModalItem.location.market_name} ({trendModalItem.location.district}) • Current:{' '}
              <strong style={{ color: 'var(--text)', fontSize: 15 }}>
                ₹{trendModalItem.current_price}/kg
              </strong>
            </div>

            {/* Range Toggle */}
            <div className="trend-range-toggle">
              <button
                className={trendRange === 'daily' ? 'active' : ''}
                onClick={() => handleRangeChange('daily')}
              >
                7 Days (Daily)
              </button>
              <button
                className={trendRange === 'weekly' ? 'active' : ''}
                onClick={() => handleRangeChange('weekly')}
              >
                4 Weeks (Weekly)
              </button>
              <button
                className={trendRange === 'monthly' ? 'active' : ''}
                onClick={() => handleRangeChange('monthly')}
              >
                6 Months (Monthly)
              </button>
            </div>

            {/* Chart */}
            {trendLoading ? (
              <Loading />
            ) : trendHistory.length === 0 ? (
              <p style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                No history data available.
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
                      labelFormatter={label => `Period: ${label}`}
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: 'var(--primary)' }}
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
          title={`🔔 ${t.alertBtn}: ${
            lang === 'te' && alertModalItem.species.telugu_name
              ? alertModalItem.species.telugu_name
              : alertModalItem.species.name
          } (${alertModalItem.variety})`}
          onClose={() => setAlertModalItem(null)}
        >
          <form onSubmit={handleSaveAlert}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Market: <strong>{alertModalItem.location.market_name}</strong> • Current Price:{' '}
              <strong style={{ color: 'var(--text)' }}>₹{alertModalItem.current_price}/kg</strong>
            </div>

            {alertMsg && (
              <div
                className={`alert ${
                  alertMsg.includes('success') ? 'alert-success' : 'alert-error'
                }`}
              >
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

      {/* ─── Admin Price Update Modal ─────────────────────────────────────── */}
      {adminModalItem && (
        <Modal
          title={t.updateTitle}
          onClose={() => setAdminModalItem(null)}
        >
          <form onSubmit={handleAdminPriceSave}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Update farmgate rate for{' '}
              <strong>
                {adminModalItem.species.name} - {adminModalItem.variety}
              </strong>{' '}
              at <strong>{adminModalItem.location.market_name}</strong>.
            </div>

            {adminMsg && (
              <div
                className={`alert ${
                  adminMsg.includes('updated') ? 'alert-success' : 'alert-error'
                }`}
              >
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
