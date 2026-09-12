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
} from '../services/equipmentService';
import { getErrorMsg } from '../helpers/errorMsg';

// ─── Bilingual Dictionary ───────────────────────────────────────────────────
const I18N = {
  en: {
    pageTitle: 'Aquaculture Machinery & Equipment Marketplace',
    pageSubtitle: 'Buy & sell new and used aerators, water pumps, generators, auto-feeders & nets',
    tabAll: 'All Gear',
    tabWishlist: 'My Wishlist',
    tabMyListings: 'My Listings',
    sellBtn: '+ Sell Equipment',
    searchPlaceholder: 'Search aerators, pumps, generators, nets...',
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
    active: 'ACTIVE',
    viewDetails: 'View Details',
    callSeller: 'Call Seller',
    chatWhatsapp: 'WhatsApp',
    markSold: 'Mark as Sold',
    markActive: 'Mark as Active',
    deleteListing: 'Delete Listing',
    sellerVerified: 'Verified Seller',
    reportListing: 'Report Listing',
    rateSeller: 'Rate Seller',
    views: 'views',
    postedOn: 'Posted',
    noListings: 'No machinery or equipment found matching your criteria.',
    noWishlist: 'Your wishlist is empty. Tap the heart on any equipment card to save it.',
    noMyListings: 'You have not posted any machinery for sale yet.',
  },
  te: {
    pageTitle: 'ఆక్వాకల్చర్ మెషినరీ & పరికరాల మార్కెట్',
    pageSubtitle: 'ఏరియేటర్లు, వాటర్ పంపులు, మోటార్లు, ఆటో ఫీడర్లు మరియు వలలు కొనండి & అమ్మండి',
    tabAll: 'అన్ని పరికరాలు',
    tabWishlist: 'నా విష్‌లిస్ట్',
    tabMyListings: 'నా ప్రకటనలు',
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
    viewDetails: 'వివరాలు చూడండి',
    callSeller: 'కాల్ చేయండి',
    chatWhatsapp: 'వాట్సాప్',
    markSold: 'అమ్ముడైనట్లు మార్చు',
    markActive: 'యాక్టివ్‌గా మార్చు',
    deleteListing: 'ప్రకటన తొలగించు',
    sellerVerified: 'ధృవీకరించబడిన విక్రేత',
    reportListing: 'రిపోర్ట్ చేయి',
    rateSeller: 'రేటింగ్ ఇవ్వండి',
    views: 'వీక్షణలు',
    postedOn: 'పోస్ట్ చేసిన తేదీ',
    noListings: 'మీ ఫిల్టర్లకు సరిపోయే యంత్రాలు లేదా పరికరాలు లేవు.',
    noWishlist: 'మీ విష్‌లిస్ట్ ఖాళీగా ఉంది. ఏదైనా పరికరానికి గుండె గుర్తు నొక్కి సేవ్ చేయండి.',
    noMyListings: 'మీరు ఇంకా ఎటువంటి పరికరాల విక్రయ ప్రకటనలు పోస్ట్ చేయలేదు.',
  },
};

export default function EquipmentMarketplace() {
  const [lang, setLang] = useState('en');
  const t = I18N[lang];

  // Primary view tabs: 'all' | 'wishlist' | 'my_listings'
  const [activeTab, setActiveTab] = useState('all');

  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  // Handle Mark Status (Sold / Active)
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

      {/* Main Navigation Tabs */}
      <div className="market-tabs">
        <button
          className={'market-tab' + (activeTab === 'all' && selectedCategory === 'all' ? ' active' : '')}
          onClick={() => {
            setActiveTab('all');
            setSelectedCategory('all');
          }}
        >
          ⚙️ {t.tabAll}
        </button>
        <button
          className={'market-tab' + (activeTab === 'wishlist' ? ' active' : '')}
          onClick={() => setActiveTab('wishlist')}
        >
          💖 {t.tabWishlist}
        </button>
        <button
          className={'market-tab' + (activeTab === 'my_listings' ? ' active' : '')}
          onClick={() => setActiveTab('my_listings')}
        >
          📦 {t.tabMyListings}
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
            style={{ width: '50%' }}
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max ₹"
            style={{ width: '50%' }}
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
        {(search || selectedCondition !== 'all' || minPrice || maxPrice || selectedCategory !== 'all') && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch('');
              setSelectedCondition('all');
              setSelectedCategory('all');
              setMinPrice('');
              setMaxPrice('');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Classifieds Grid */}
      {loading ? (
        <Loading />
      ) : listings.length === 0 ? (
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
          {listings.map(item => {
            const firstImg =
              item.images && item.images.length > 0
                ? item.images[0]
                : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
            const catTitle = lang === 'te' ? item.categoryInfo?.telugu_name : item.categoryInfo?.name;

            return (
              <div
                key={item.id}
                className="eq-card"
                onClick={() => openDetailModal(item)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="eq-img-box">
                    <img src={firstImg} alt={item.title} loading="lazy" />
                    <span className={`condition-pill cond-${item.condition}`}>
                      {formatCondition(item.condition)}
                    </span>
                    <span className="negotiable-tag">
                      {item.is_negotiable ? t.negotiable : t.fixedPrice}
                    </span>
                    <button
                      className="fav-heart-btn"
                      onClick={e => handleToggleFavorite(e, item)}
                      title="Save to Wishlist"
                      aria-label="Wishlist"
                    >
                      {item.isFavorited ? '❤️' : '🤍'}
                    </button>
                    {item.status === 'sold' && (
                      <div className="sold-overlay">{t.sold}</div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="eq-body">
                    <div>
                      <span className="eq-category-tag">
                        <span>{item.categoryInfo?.icon || '⚙️'}</span>
                        <span>{catTitle}</span>
                      </span>
                      <h3 className="eq-title">{item.title}</h3>
                    </div>

                    <div className="eq-price-row">
                      <div className="eq-price">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                      <div className="eq-loc-row">
                        📍 {item.district}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div
                  style={{
                    padding: '10px 16px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    gap: 8,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => openDetailModal(item)}
                  >
                    {t.viewDetails}
                  </button>
                  <a
                    href={`tel:${item.contact_phone}`}
                    className="btn btn-primary btn-sm"
                    title={item.contact_phone}
                  >
                    📞 {t.callSeller}
                  </a>
                  {item.contact_whatsapp && (
                    <a
                      href={`https://wa.me/${item.contact_whatsapp.replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20interested%20in%20your%20listing:%20${encodeURIComponent(item.title)}%20on%20AquaMitra.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#16a34a' }}
                      title="Chat on WhatsApp"
                    >
                      💬
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL: LISTING DETAILS ────────────────────────────────────────── */}
      {detailModalItem && (
        <Modal
          title={detailModalItem.title}
          onClose={() => setDetailModalItem(null)}
        >
          <div>
            {/* Gallery Viewer */}
            <div style={{ position: 'relative', width: '100%', height: 260, borderRadius: 10, overflow: 'hidden', background: '#000' }}>
              <img
                src={
                  detailModalItem.images && detailModalItem.images[detailActiveImg]
                    ? detailModalItem.images[detailActiveImg]
                    : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
                }
                alt={detailModalItem.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              <span
                className={`condition-pill cond-${detailModalItem.condition}`}
                style={{ top: 12, left: 12 }}
              >
                {formatCondition(detailModalItem.condition)}
              </span>
              {detailModalItem.status === 'sold' && (
                <div className="sold-overlay">{t.sold}</div>
              )}
            </div>

            {/* Thumbnails */}
            {detailModalItem.images && detailModalItem.images.length > 1 && (
              <div className="gallery-thumbs">
                {detailModalItem.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    className={`gallery-thumb ${idx === detailActiveImg ? 'active' : ''}`}
                    onClick={() => setDetailActiveImg(idx)}
                  />
                ))}
              </div>
            )}

            {/* Price & Location Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '18px 0 12px 0' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                  ₹{detailModalItem.price.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {detailModalItem.is_negotiable ? `✓ ${t.negotiable}` : t.fixedPrice} •{' '}
                  {detailModalItem.categoryInfo?.name}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>📍 {detailModalItem.location}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {detailModalItem.district}, {detailModalItem.state}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Description & Specifications:</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text)' }}>
                {detailModalItem.description}
              </p>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
                {t.postedOn}: {new Date(detailModalItem.created_at).toLocaleDateString()} • {detailModalItem.views_count} {t.views}
              </div>
            </div>

            {/* Seller Trust Profile */}
            <div className="seller-trust-box">
              <div className="seller-avatar">
                {detailModalItem.seller_name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong style={{ fontSize: 15 }}>{detailModalItem.seller_name}</strong>
                  {detailModalItem.seller_is_verified && (
                    <span className="verified-badge">✓ {t.sellerVerified}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginTop: 4 }}>
                  <span className="rating-stars">
                    ⭐ {detailModalItem.seller_rating || 5.0} ({detailModalItem.seller_reviews_count || 0})
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    📞 {detailModalItem.contact_phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a
                href={`tel:${detailModalItem.contact_phone}`}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                📞 {t.callSeller}
              </a>
              {detailModalItem.contact_whatsapp && (
                <a
                  href={`https://wa.me/${detailModalItem.contact_whatsapp.replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20interested%20in%20your%20listing:%20${encodeURIComponent(detailModalItem.title)}%20on%20AquaMitra.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ color: '#16a34a', flex: 1 }}
                >
                  💬 {t.chatWhatsapp}
                </a>
              )}
            </div>

            {/* Seller Management Controls (If Owner) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {detailModalItem.status === 'active' ? (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleStatusToggle(detailModalItem, 'sold')}
                  >
                    🏷️ {t.markSold}
                  </button>
                ) : (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleStatusToggle(detailModalItem, 'active')}
                  >
                    🔄 {t.markActive}
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

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    setReviewModalTarget({
                      sellerId: detailModalItem.seller_id,
                      sellerName: detailModalItem.seller_name,
                      listingId: detailModalItem.id,
                    })
                  }
                >
                  ⭐ {t.rateSeller}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => setReportListingTarget(detailModalItem)}
                >
                  🚩 {t.reportListing}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: SELL EQUIPMENT ─────────────────────────────────────────── */}
      {showSellModal && (
        <Modal title={t.sellBtn} onClose={() => setShowSellModal(false)}>
          <form onSubmit={handleSellSubmit}>
            <div className="form-group">
              <label>Equipment Title</label>
              <input
                type="text"
                required
                placeholder="e.g. 4-Paddlewheel Aerator (2 HP Crompton Motor)"
                value={sellForm.title}
                onChange={e => setSellForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={sellForm.category}
                  onChange={e => setSellForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Condition</label>
                <select
                  value={sellForm.condition}
                  onChange={e => setSellForm(prev => ({ ...prev, condition: e.target.value }))}
                >
                  <option value="new">{t.condNew}</option>
                  <option value="like_new">{t.condLikeNew}</option>
                  <option value="good">{t.condGood}</option>
                  <option value="fair">{t.condFair}</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 28000"
                  value={sellForm.price}
                  onChange={e => setSellForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sellForm.is_negotiable}
                    onChange={e => setSellForm(prev => ({ ...prev, is_negotiable: e.target.checked }))}
                  />
                  <span>Price is Negotiable</span>
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  required
                  value={sellForm.state}
                  onChange={e => setSellForm(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>District</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. West Godavari"
                  value={sellForm.district}
                  onChange={e => setSellForm(prev => ({ ...prev, district: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location / Mandi Address</label>
              <input
                type="text"
                required
                placeholder="e.g. Palakollu Road, Bhimavaram"
                value={sellForm.location}
                onChange={e => setSellForm(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98480 12345"
                  value={sellForm.contact_phone}
                  onChange={e => setSellForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>WhatsApp Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98480 12345"
                  value={sellForm.contact_whatsapp}
                  onChange={e => setSellForm(prev => ({ ...prev, contact_whatsapp: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Product Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... (or equipment image link)"
                value={sellForm.imageUrl}
                onChange={e => setSellForm(prev => ({ ...prev, imageUrl: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Description & Technical Specifications</label>
              <textarea
                rows="3"
                required
                placeholder="Detail the brand, HP, usage months, warranty, and current running condition..."
                value={sellForm.description}
                onChange={e => setSellForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowSellModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Post Equipment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── MODAL: RATE SELLER ────────────────────────────────────────────── */}
      {reviewModalTarget && (
        <Modal
          title={`Rate Seller: ${reviewModalTarget.sellerName}`}
          onClose={() => setReviewModalTarget(null)}
        >
          <form onSubmit={handleReviewSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                Star Rating
              </label>
              <div className="star-rating-input">
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
              <label>Buyer Feedback</label>
              <textarea
                rows="3"
                required
                placeholder="Describe equipment condition accuracy, test run experience, and transaction honesty..."
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setReviewModalTarget(null)}>
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
        <Modal title="Report Listing" onClose={() => setReportListingTarget(null)}>
          <form onSubmit={handleReportSubmit}>
            <div className="form-group">
              <label>Reason for reporting</label>
              <textarea
                rows="3"
                required
                placeholder="Explain why this listing violates guidelines (e.g. misleading condition, fraud attempt, wrong pricing)..."
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setReportListingTarget(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ background: 'var(--danger)' }}>
                Submit Report
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
