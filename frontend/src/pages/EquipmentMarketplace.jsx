import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import {
  getCategories,
  getListings,
  getListingById,
  createListing,
  updateListing,
  markListingStatus,
  deleteListing,
  toggleFavorite,
  submitReview,
  submitReport,
  recordInquiry,
} from '../services/equipmentService';
import { getErrorMsg } from '../helpers/errorMsg';

// ─── Bilingual Dictionary ───────────────────────────────────────────────────
const I18N = {
  en: {
    pageTitle: 'Aquaculture Machinery & Equipment Marketplace',
    pageSubtitle: 'Buy & sell new and used aerators, water pumps, generators, auto-feeders, motors & nets',
    tabAll: 'All Gear',
    tabTrending: '🔥 Trending & Hot Deals',
    tabDistress: '⚡ Distress / Urgent Sale',
    tabVerified: '🛡️ Verified Sellers',
    tabBudget: '💰 Budget Picks (< ₹25k)',
    tabWishlist: '💖 My Wishlist',
    tabMyListings: '📦 My Listings',
    sellBtn: '+ Sell Equipment',
    searchPlaceholder: 'Search aerators, pumps, motors, generators, nets...',
    allCategories: 'All Categories',
    allConditions: 'All Conditions',
    condNew: 'Brand New',
    condLikeNew: 'Like New',
    condGood: 'Good Condition',
    condFair: 'Fair Condition',
    allLocations: 'All States',
    sortNewest: 'Newest First',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    negotiable: 'Negotiable',
    fixedPrice: 'Fixed Price',
    sold: 'SOLD',
    active: 'AVAILABLE',
    reserved: 'RESERVED',
    viewDetails: 'View Details',
    callSeller: 'Call Seller',
    chatWhatsapp: 'WhatsApp',
    markSold: 'Mark as Sold',
    markActive: 'Mark as Available',
    markReserved: 'Mark as Reserved',
    deleteListing: 'Delete Listing',
    sellerVerified: 'Verified Seller',
    reportListing: 'Report Listing',
    rateSeller: 'Rate Seller',
    views: 'views',
    inquiries: 'inquiries',
    viewingNow: 'viewing now',
    postedOn: 'Posted',
    deliveryEst: '🚚 Delivery & Freight Estimator',
    deliveryDest: 'Deliver To District:',
    estFreight: 'Estimated Freight:',
    emiTitle: '💳 Easy Agri-Equipment Financing / EMI',
    emiMonthly: 'per month for 12 months (est.)',
    noListings: 'No machinery or equipment found matching your criteria.',
    noWishlist: 'Your wishlist is empty. Tap the heart on any equipment card to save it.',
    noMyListings: 'You have not posted any machinery for sale yet.',
  },
  te: {
    pageTitle: 'ఆక్వాకల్చర్ మెషినరీ & పరికరాల మార్కెట్',
    pageSubtitle: 'ఏరియేటర్లు, వాటర్ పంపులు, మోటార్లు, ఆటో ఫీడర్లు, జనరేటర్లు మరియు వలలు కొనండి & అమ్మండి',
    tabAll: 'అన్ని పరికరాలు',
    tabTrending: '🔥 ట్రెండింగ్ & హాట్ డీల్స్',
    tabDistress: '⚡ అత్యవసర అమ్మకం (Distress Sale)',
    tabVerified: '🛡️ ధృవీకరించబడిన విక్రేతలు',
    tabBudget: '💰 బడ్జెట్ పరికరాలు (< ₹25,000)',
    tabWishlist: '💖 నా విష్‌లిస్ట్',
    tabMyListings: '📦 నా ప్రకటనలు',
    sellBtn: '+ పరికరం అమ్మండి',
    searchPlaceholder: 'ఏరియేటర్లు, పంపులు, మోటార్లు, పైపులు వెతకండి...',
    allCategories: 'అన్ని విభాగాలు',
    allConditions: 'అన్ని రకాల స్థితి',
    condNew: 'కొత్తది (Brand New)',
    condLikeNew: 'కొత్తదాని వలే (Like New)',
    condGood: 'మంచి స్థితి (Good)',
    condFair: 'వాడదగినది (Fair)',
    allLocations: 'అన్ని రాష్ట్రాలు',
    sortNewest: 'సరికొత్తవి మొదట',
    sortPriceAsc: 'ధర: తక్కువ నుండి ఎక్కువ',
    sortPriceDesc: 'ధర: ఎక్కువ నుండి తక్కువ',
    negotiable: 'చర్చించదగినది',
    fixedPrice: 'స్థిర ధర',
    sold: 'అమ్ముడైంది',
    active: 'అందుబాటులో ఉంది',
    reserved: 'రిజర్వ్ చేయబడింది',
    viewDetails: 'వివరాలు చూడండి',
    callSeller: 'కాల్ చేయండి',
    chatWhatsapp: 'వాట్సాప్',
    markSold: 'అమ్ముడైనట్లు మార్చు',
    markActive: 'అందుబాటులోకి మార్చు',
    markReserved: 'రిజర్వ్ చేసినట్లు మార్చు',
    deleteListing: 'ప్రకటన తొలగించు',
    sellerVerified: 'ధృవీకరించబడిన విక్రేత',
    reportListing: 'రిపోర్ట్ చేయి',
    rateSeller: 'రేటింగ్ ఇవ్వండి',
    views: 'వీక్షణలు',
    inquiries: 'విచారణలు',
    viewingNow: 'ఇప్పుడు చూస్తున్నారు',
    postedOn: 'పోస్ట్ చేసిన తేదీ',
    deliveryEst: '🚚 రవాణా & డెలివరీ అంచనా',
    deliveryDest: 'చేర్చవలసిన జిల్లా:',
    estFreight: 'అంచనా రవాణా ఛార్జీ:',
    emiTitle: '💳 వ్యవసాయ పరికరాల సులభ వాయిదాల పద్ధతి (EMI)',
    emiMonthly: 'నెలకు 12 నెలల పాటు (అంచనా)',
    noListings: 'మీ ఫిల్టర్లకు సరిపోయే యంత్రాలు లేదా పరికరాలు లేవు.',
    noWishlist: 'మీ విష్‌లిస్ట్ ఖాళీగా ఉంది. ఏదైనా పరికరానికి గుండె గుర్తు నొక్కి సేవ్ చేయండి.',
    noMyListings: 'మీరు ఇంకా ఎటువంటి పరికరాల విక్రయ ప్రకటనలు పోస్ట్ చేయలేదు.',
  },
};

// Simulated Live Activities
const LIVE_ACTIVITIES = [
  '🔔 Farmer from Bhimavaram contacted seller for Tai Yih Sun Aerator 2m ago',
  '🔔 Coastal Agro Engineering updated Kirloskar 15 HP pump set rate',
  '🔔 New machinery: 10,000L Nursery Tank added in Kakinada Hub',
  '🔔 Verified Deal: Crompton 5 HP Motor listed at ₹14,500 in Vijayawada',
  '🔔 Farmer from Nellore saved GSM 8-Channel Timer Starter to Wishlist',
  '🔔 Fast Delivery: Sludge Cutter Pump available with same-day dispatch',
];

const DISTRICT_DISTANCES = {
  'West Godavari (Bhimavaram)': { km: 35, base: 600 },
  'East Godavari (Kakinada)': { km: 90, base: 1100 },
  'Krishna (Vijayawada / Machilipatnam)': { km: 75, base: 950 },
  'Guntur': { km: 110, base: 1300 },
  'Nellore': { km: 240, base: 2200 },
  'Bapatla': { km: 130, base: 1400 },
  'Surat (Gujarat)': { km: 950, base: 4500 },
  'Balasore (Odisha)': { km: 680, base: 3600 },
};

export default function EquipmentMarketplace() {
  const [lang, setLang] = useState('en');
  const t = I18N[lang];

  // Dynamic Tabs: 'all' | 'trending' | 'distress' | 'verified' | 'budget' | 'wishlist' | 'my_listings'
  const [activeTab, setActiveTab] = useState('all');

  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Live Activity Ticker Index
  const [tickerIndex, setTickerIndex] = useState(0);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modals
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [detailActiveImg, setDetailActiveImg] = useState(0);
  const [destDistrict, setDestDistrict] = useState('West Godavari (Bhimavaram)');

  const [showSellModal, setShowSellModal] = useState(false);
  const [sellForm, setSellForm] = useState({
    title: '',
    category: 'aerators',
    condition: 'like_new',
    price: '',
    is_negotiable: true,
    description: '',
    location: '',
    state: 'Andhra Pradesh',
    district: 'West Godavari',
    contact_phone: '',
    contact_whatsapp: '',
    imageUrl: '',
  });

  const [reviewModalTarget, setReviewModalTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [reportListingTarget, setReportListingTarget] = useState(null);
  const [reportReason, setReportReason] = useState('');

  // Rotate ticker every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Initial Load
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [catsRes, listRes] = await Promise.all([
        getCategories(),
        getListings({
          category: selectedCategory,
          condition: selectedCondition,
          sort: selectedSort,
          search,
          min_price: minPrice,
          max_price: maxPrice,
          my_listings: activeTab === 'my_listings' ? 'true' : undefined,
          favorites_only: activeTab === 'wishlist' ? 'true' : undefined,
        }),
      ]);

      setCategories(catsRes.data.data || []);
      setListings(listRes.data.data || []);
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedCondition, selectedSort, search, minPrice, maxPrice, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter listings according to activeTab
  const displayListings = listings.filter(item => {
    if (activeTab === 'trending') {
      return (item.inquiries_count || 0) >= 12 || (item.views_count || 0) >= 150;
    }
    if (activeTab === 'distress') {
      return item.badge === 'DISTRESS SALE' || (item.is_negotiable && item.condition !== 'new');
    }
    if (activeTab === 'verified') {
      return item.seller_is_verified;
    }
    if (activeTab === 'budget') {
      return item.price <= 25000;
    }
    return true;
  });

  // Wishlist Heart Toggle
  async function handleToggleFavorite(e, item) {
    e.stopPropagation();
    const action = item.isFavorited ? 'remove' : 'add';
    setListings(prev =>
      prev.map(l => (l.id === item.id ? { ...l, isFavorited: !item.isFavorited } : l))
    );
    try {
      await toggleFavorite(item.id, action);
    } catch {}
  }

  // Open Detail View
  async function openDetailModal(item) {
    setDetailActiveImg(0);
    setDetailModalItem(item);
    try {
      const res = await getListingById(item.id);
      setDetailModalItem(res.data.data);
    } catch {}
  }

  // Dynamic Contact Action Logging
  async function handleContactAction(item, type) {
    try {
      recordInquiry(item.id).catch(() => {});
      // Increment inquiries count locally
      setListings(prev => prev.map(l => l.id === item.id ? { ...l, inquiries_count: (l.inquiries_count || 0) + 1 } : l));
      if (detailModalItem && detailModalItem.id === item.id) {
        setDetailModalItem(prev => ({ ...prev, inquiries_count: (prev.inquiries_count || 0) + 1 }));
      }
    } catch {}

    if (type === 'call') {
      window.location.href = `tel:${item.contact_phone}`;
    } else if (type === 'whatsapp') {
      const msg = encodeURIComponent(`Hello, I saw your equipment listing for "${item.title}" on AquaMitra. Is it still available?`);
      const phoneClean = (item.contact_whatsapp || item.contact_phone || '').replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${phoneClean}?text=${msg}`, '_blank');
    }
  }

  // Handle Create Listing
  async function handleSellSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        ...sellForm,
        images: sellForm.imageUrl.trim() ? [sellForm.imageUrl.trim()] : undefined,
      };
      await createListing(payload);
      setShowSellModal(false);
      setSuccessMsg('Equipment listing published successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  // Handle Mark Status (Sold / Active / Reserved)
  async function handleStatusToggle(item, newStatus) {
    try {
      await markListingStatus(item.id, newStatus);
      setDetailModalItem(prev => (prev ? { ...prev, status: newStatus } : null));
      setListings(prev => prev.map(l => (l.id === item.id ? { ...l, status: newStatus } : l)));
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  // Handle Delete Listing
  async function handleDeleteListing(id) {
    if (!window.confirm('Delete this equipment listing?')) return;
    try {
      await deleteListing(id);
      setDetailModalItem(null);
      loadData();
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  // Handle Review Submit
  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewModalTarget) return;
    try {
      await submitReview({
        listing_id: reviewModalTarget.listingId,
        seller_id: reviewModalTarget.sellerId,
        rating: reviewRating,
        review_text: reviewText,
      });
      setReviewModalTarget(null);
      setReviewText('');
      setSuccessMsg('Seller review published successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  // Handle Report Submit
  async function handleReportSubmit(e) {
    e.preventDefault();
    if (!reportListingTarget) return;
    try {
      await submitReport({
        listing_id: reportListingTarget.id,
        reason: reportReason,
      });
      setReportListingTarget(null);
      setReportReason('');
      setSuccessMsg('Listing reported to marketplace administrators.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(getErrorMsg(err));
    }
  }

  const formatCondition = cond => {
    switch (cond) {
      case 'new': return t.condNew;
      case 'like_new': return t.condLikeNew;
      case 'good': return t.condGood;
      case 'fair': return t.condFair;
      default: return cond;
    }
  };

  const getBadgeClass = badge => {
    if (!badge) return 'new';
    const b = badge.toLowerCase();
    if (b.includes('hot')) return 'hot';
    if (b.includes('distress')) return 'distress';
    if (b.includes('verified')) return 'verified';
    if (b.includes('top')) return 'top';
    return 'new';
  };

  return (
    <Layout title={t.pageTitle}>
      {/* Header with Title and Language Toggle */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h2>{t.pageTitle}</h2>
          <p>{t.pageSubtitle}</p>
        </div>
        <div className="market-header-actions">
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
            className="btn btn-primary btn-sm"
            onClick={() => setShowSellModal(true)}
          >
            {t.sellBtn}
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* ─── LIVE ACTIVITY STREAM TICKER ───────────────────────────────────── */}
      <div className="live-activity-ticker">
        <span className="live-ticker-dot" />
        <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          LIVE FEED
        </span>
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {LIVE_ACTIVITIES[tickerIndex]}
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>
          🟢 {listings.filter(l => l.status === 'active').length} Machinery Listed
        </span>
      </div>

      {/* ─── DYNAMIC NAVIGATION TABS ───────────────────────────────────────── */}
      <div className="market-tabs" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        <button
          className={'market-tab' + (activeTab === 'all' && selectedCategory === 'all' ? ' active' : '')}
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory('all');
          }}
        >
          ⚙️ {t.tabAll} ({listings.length})
        </button>
        <button
          className={'market-tab' + (activeTab === 'trending' ? ' active' : '')}
          onClick={() => setActiveTab('trending')}
        >
          {t.tabTrending}
        </button>
        <button
          className={'market-tab' + (activeTab === 'distress' ? ' active' : '')}
          onClick={() => setActiveTab('distress')}
        >
          {t.tabDistress}
        </button>
        <button
          className={'market-tab' + (activeTab === 'verified' ? ' active' : '')}
          onClick={() => setActiveTab('verified')}
        >
          {t.tabVerified}
        </button>
        <button
          className={'market-tab' + (activeTab === 'budget' ? ' active' : '')}
          onClick={() => setActiveTab('budget')}
        >
          {t.tabBudget}
        </button>
        <button
          className={'market-tab' + (activeTab === 'wishlist' ? ' active' : '')}
          onClick={() => setActiveTab('wishlist')}
        >
          {t.tabWishlist}
        </button>
        <button
          className={'market-tab' + (activeTab === 'my_listings' ? ' active' : '')}
          onClick={() => setActiveTab('my_listings')}
        >
          {t.tabMyListings}
        </button>
      </div>

      {/* Category Pills Bar */}
      {activeTab === 'all' && (
        <div className="market-tabs" style={{ marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={'market-tab' + (selectedCategory === cat.id ? ' active' : '')}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{lang === 'te' ? cat.telugu_name : cat.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filter & Sort Bar */}
      <div className="market-filter-bar">
        <div>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select
            value={selectedCondition}
            onChange={e => setSelectedCondition(e.target.value)}
          >
            <option value="all">{t.allConditions}</option>
            <option value="new">{t.condNew}</option>
            <option value="like_new">{t.condLikeNew}</option>
            <option value="good">{t.condGood}</option>
            <option value="fair">{t.condFair}</option>
          </select>
        </div>
        <div>
          <select
            value={selectedSort}
            onChange={e => setSelectedSort(e.target.value)}
          >
            <option value="newest">{t.sortNewest}</option>
            <option value="price_asc">{t.sortPriceAsc}</option>
            <option value="price_desc">{t.sortPriceDesc}</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="number"
            placeholder="Min ₹"
            style={{ width: 85 }}
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max ₹"
            style={{ width: 85 }}
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
        {(search || selectedCategory !== 'all' || selectedCondition !== 'all' || minPrice || maxPrice) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
              setSelectedCondition('all');
              setMinPrice('');
              setMaxPrice('');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ─── LISTINGS GRID ─────────────────────────────────────────────────── */}
      {loading ? (
        <Loading />
      ) : displayListings.length === 0 ? (
        <EmptyState
          icon="⚙️"
          title="No equipment found"
          message={
            activeTab === 'wishlist'
              ? t.noWishlist
              : activeTab === 'my_listings'
              ? t.noMyListings
              : t.noListings
          }
        />
      ) : (
        <div className="eq-grid">
          {displayListings.map(item => {
            const isSold = item.status === 'sold';
            const isReserved = item.status === 'reserved';
            const images = item.images && item.images.length > 0
              ? item.images
              : ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'];

            return (
              <div
                key={item.id}
                className="eq-card"
                onClick={() => openDetailModal(item)}
              >
                {/* Image Container */}
                <div className="eq-card-img-wrap">
                  {/* Dynamic Badge Pill */}
                  {item.badge && (
                    <span className={`eq-badge-pill ${getBadgeClass(item.badge)}`}>
                      {item.badge}
                    </span>
                  )}

                  <img
                    src={images[0]}
                    alt={item.title}
                    className="eq-card-img"
                    loading="lazy"
                  />

                  {/* Status Overlay */}
                  {isSold && <div className="sold-overlay">{t.sold}</div>}
                  {isReserved && (
                    <div className="sold-overlay" style={{ background: 'rgba(217, 119, 6, 0.85)' }}>
                      {t.reserved}
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    className={`fav-heart-btn ${item.isFavorited ? 'favorited' : ''}`}
                    onClick={e => handleToggleFavorite(e, item)}
                    title="Save to Wishlist"
                  >
                    {item.isFavorited ? '❤️' : '🤍'}
                  </button>

                  {/* Condition Tag */}
                  <span className={`condition-pill ${item.condition}`}>
                    {formatCondition(item.condition)}
                  </span>
                </div>

                {/* Content */}
                <div className="eq-card-body">
                  <div className="eq-cat-row">
                    <span>
                      {item.categoryInfo?.icon} {lang === 'te' && item.categoryInfo?.telugu_name ? item.categoryInfo.telugu_name : item.categoryInfo?.name}
                    </span>
                    <span className="eq-date">
                      {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="eq-title" title={item.title}>
                    {item.title}
                  </h3>

                  <div className="eq-price-row">
                    <span className="eq-price">₹{item.price.toLocaleString('en-IN')}</span>
                    {item.is_negotiable ? (
                      <span className="negotiable-tag">{t.negotiable}</span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.fixedPrice}</span>
                    )}
                  </div>

                  <div className="eq-loc">
                    📍 {item.location} • {item.district}
                  </div>

                  {/* Dynamic Live Counters */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    <span className="inquiries-badge">
                      🔥 {item.inquiries_count || 5} {t.inquiries}
                    </span>
                    <span className="live-viewers-tag">
                      👀 {item.live_viewers || 3} {t.viewingNow}
                    </span>
                  </div>

                  {/* Card Footer */}
                  <div className="eq-card-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                        {item.seller_name}
                      </span>
                      {item.seller_is_verified && (
                        <span title="Verified Seller" style={{ color: '#0284c7', fontSize: 13 }}>
                          ✓
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>
                      ⭐ {item.seller_rating || 5.0}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL: EQUIPMENT DETAIL & GALLERY ───────────────────────────────── */}
      {detailModalItem && (
        <Modal
          title={detailModalItem.title}
          onClose={() => setDetailModalItem(null)}
        >
          <div>
            {/* Gallery Main */}
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 320, background: '#0f172a' }}>
              <img
                src={
                  detailModalItem.images && detailModalItem.images[detailActiveImg]
                    ? detailModalItem.images[detailActiveImg]
                    : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
                }
                alt={detailModalItem.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {detailModalItem.status === 'sold' && (
                <div className="sold-overlay" style={{ fontSize: 24 }}>{t.sold}</div>
              )}
              {detailModalItem.status === 'reserved' && (
                <div className="sold-overlay" style={{ background: 'rgba(217, 119, 6, 0.85)', fontSize: 22 }}>
                  {t.reserved}
                </div>
              )}
            </div>

            {/* Gallery Thumbs */}
            {detailModalItem.images && detailModalItem.images.length > 1 && (
              <div className="gallery-thumbs">
                {detailModalItem.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumb ${idx}`}
                    className={`gallery-thumb ${detailActiveImg === idx ? 'active' : ''}`}
                    onClick={() => setDetailActiveImg(idx)}
                  />
                ))}
              </div>
            )}

            {/* Price & Meta Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>
                  ₹{detailModalItem.price.toLocaleString('en-IN')}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <span className={`condition-pill ${detailModalItem.condition}`} style={{ position: 'static' }}>
                    {formatCondition(detailModalItem.condition)}
                  </span>
                  {detailModalItem.is_negotiable && (
                    <span className="negotiable-tag">{t.negotiable}</span>
                  )}
                  <span className="inquiries-badge">
                    🔥 {detailModalItem.inquiries_count || 12} {t.inquiries}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-secondary)' }}>
                <div>📍 {detailModalItem.location}</div>
                <div>{detailModalItem.district}, {detailModalItem.state}</div>
                <div style={{ marginTop: 4, fontSize: 12 }}>
                  👀 {detailModalItem.views_count} {t.views}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ margin: '16px 0', padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text)' }}>
                Description / యంత్రం వివరాలు:
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#334155' }}>
                {detailModalItem.description}
              </p>
            </div>

            {/* ─── DYNAMIC DELIVERY / FREIGHT CALCULATOR ───────────────────────── */}
            <div className="delivery-calc-card">
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span>{t.deliveryEst}</span>
                <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: 4 }}>
                  Direct Tempo / Lorry
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    {t.deliveryDest}
                  </label>
                  <select
                    value={destDistrict}
                    onChange={e => setDestDistrict(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border)' }}
                  >
                    {Object.keys(DISTRICT_DISTANCES).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t.estFreight}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0f766e' }}>
                    ₹{DISTRICT_DISTANCES[destDistrict]?.base ?? 950}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                    ~{DISTRICT_DISTANCES[destDistrict]?.km ?? 60} km distance
                  </div>
                </div>
              </div>
            </div>

            {/* EMI / Pay Later Box for High Value Items */}
            {detailModalItem.price >= 15000 && (
              <div className="emi-calc-box">
                <div>
                  <div style={{ fontWeight: 800 }}>{t.emiTitle}</div>
                  <div style={{ fontSize: 11, opacity: 0.9 }}>
                    ₹{Math.round((detailModalItem.price * 1.08) / 12).toLocaleString('en-IN')} {t.emiMonthly}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, background: '#dcfce7', padding: '4px 8px', borderRadius: 6 }}>
                  0% Downpayment Available
                </span>
              </div>
            )}

            {/* Seller Trust Profile */}
            <div className="seller-trust-box">
              <div className="seller-avatar">
                {detailModalItem.seller_name ? detailModalItem.seller_name[0] : 'S'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong style={{ fontSize: 15 }}>{detailModalItem.seller_name}</strong>
                  {detailModalItem.seller_is_verified && (
                    <span style={{ fontSize: 11, background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                      ✓ {t.sellerVerified}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  ⭐ {detailModalItem.seller_rating || 5.0} ({detailModalItem.seller_reviews_count || 0} reviews)
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setReviewModalTarget({
                  sellerId: detailModalItem.seller_id,
                  listingId: detailModalItem.id,
                  sellerName: detailModalItem.seller_name,
                })}
              >
                ⭐ {t.rateSeller}
              </button>
            </div>

            {/* Contact Actions (Logged dynamically on click) */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px 16px', fontSize: 15, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                onClick={() => handleContactAction(detailModalItem, 'call')}
              >
                <span>📞</span>
                <span>{t.callSeller} ({detailModalItem.contact_phone})</span>
              </button>
              <button
                className="btn"
                style={{ flex: 1, padding: '12px 16px', fontSize: 15, background: '#25D366', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                onClick={() => handleContactAction(detailModalItem, 'whatsapp')}
              >
                <span>💬</span>
                <span>{t.chatWhatsapp}</span>
              </button>
            </div>

            {/* Owner Management Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {detailModalItem.status === 'active' ? (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStatusToggle(detailModalItem, 'sold')}
                    >
                      ✓ {t.markSold}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStatusToggle(detailModalItem, 'reserved')}
                    >
                      🟡 {t.markReserved}
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleStatusToggle(detailModalItem, 'active')}
                  >
                    ↺ {t.markActive}
                  </button>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => handleDeleteListing(detailModalItem.id)}
                >
                  🗑️ {t.deleteListing}
                </button>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 12, color: 'var(--text-secondary)' }}
                onClick={() => setReportListingTarget(detailModalItem)}
              >
                🚩 {t.reportListing}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: SELL EQUIPMENT ─────────────────────────────────────────── */}
      {showSellModal && (
        <Modal
          title={t.sellBtn}
          onClose={() => setShowSellModal(false)}
        >
          <form onSubmit={handleSellSubmit}>
            <div className="form-group">
              <label>Machinery / Equipment Title *</label>
              <input
                type="text"
                required
                value={sellForm.title}
                onChange={e => setSellForm({ ...sellForm, title: e.target.value })}
                placeholder="e.g. Crompton 5 HP 3-Phase Aerator Motor"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={sellForm.category}
                  onChange={e => setSellForm({ ...sellForm, category: e.target.value })}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Condition *</label>
                <select
                  value={sellForm.condition}
                  onChange={e => setSellForm({ ...sellForm, condition: e.target.value })}
                >
                  <option value="new">Brand New</option>
                  <option value="like_new">Like New (Barely Used)</option>
                  <option value="good">Good Working Condition</option>
                  <option value="fair">Fair (Needs Minor Maintenance)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={sellForm.price}
                  onChange={e => setSellForm({ ...sellForm, price: e.target.value })}
                  placeholder="e.g. 24000"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sellForm.is_negotiable}
                    onChange={e => setSellForm({ ...sellForm, is_negotiable: e.target.checked })}
                  />
                  <span>Price is Negotiable</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Description & Technical Specifications *</label>
              <textarea
                rows={3}
                required
                value={sellForm.description}
                onChange={e => setSellForm({ ...sellForm, description: e.target.value })}
                placeholder="Specify horsepower, usage duration, brand, warranty, or reason for selling..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Location / Landmark *</label>
                <input
                  type="text"
                  required
                  value={sellForm.location}
                  onChange={e => setSellForm({ ...sellForm, location: e.target.value })}
                  placeholder="e.g. Palakollu Road, Bhimavaram"
                />
              </div>

              <div className="form-group">
                <label>District *</label>
                <input
                  type="text"
                  required
                  value={sellForm.district}
                  onChange={e => setSellForm({ ...sellForm, district: e.target.value })}
                  placeholder="e.g. West Godavari"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={sellForm.contact_phone}
                  onChange={e => setSellForm({ ...sellForm, contact_phone: e.target.value })}
                  placeholder="+91 98480 00000"
                />
              </div>

              <div className="form-group">
                <label>WhatsApp Number</label>
                <input
                  type="tel"
                  value={sellForm.contact_whatsapp}
                  onChange={e => setSellForm({ ...sellForm, contact_whatsapp: e.target.value })}
                  placeholder="+91 98480 00000"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Equipment Photo URL</label>
              <input
                type="url"
                value={sellForm.imageUrl}
                onChange={e => setSellForm({ ...sellForm, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowSellModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Publish Listing
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: RATE SELLER ────────────────────────────────────────────── */}
      {reviewModalTarget && (
        <Modal
          title={`⭐ Rate Seller: ${reviewModalTarget.sellerName}`}
          onClose={() => setReviewModalTarget(null)}
        >
          <form onSubmit={handleReviewSubmit}>
            <div className="form-group">
              <label>Rating (1 to 5 Stars)</label>
              <div style={{ display: 'flex', gap: 8, fontSize: 24, cursor: 'pointer', margin: '8px 0' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{ color: star <= reviewRating ? '#f59e0b' : '#cbd5e1' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Review & Feedback</label>
              <textarea
                rows={3}
                required
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Describe equipment condition, seller responsiveness, or delivery experience..."
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setReviewModalTarget(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: REPORT LISTING ─────────────────────────────────────────── */}
      {reportListingTarget && (
        <Modal
          title="Report Listing"
          onClose={() => setReportListingTarget(null)}
        >
          <form onSubmit={handleReportSubmit}>
            <div className="form-group">
              <label>Reason for reporting</label>
              <select
                required
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
              >
                <option value="">Select a reason...</option>
                <option value="spam">Spam or duplicate listing</option>
                <option value="fraud">Suspected fraud or wrong price</option>
                <option value="sold">Item is already sold</option>
                <option value="inappropriate">Inappropriate contact details</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setReportListingTarget(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Report
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
