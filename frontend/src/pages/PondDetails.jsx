import { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet, NavLink } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { getPond } from '../services/pondService';
import { getErrorMsg } from '../helpers/errorMsg';
import { fmtDate } from '../helpers/format';

const TABS = [
  { label: 'Overview',      path: '' },
  { label: 'Water Quality', path: 'water-quality' },
  { label: 'Feed',          path: 'feed' },
  { label: 'Growth',        path: 'growth' },
  { label: 'Business',      path: 'business' },
  { label: 'ML Prediction', path: 'ml' },
];

export default function PondDetails() {
  const { pondId } = useParams();
  const navigate = useNavigate();
  const [pond, setPond] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    getPond(pondId).then(r => setPond(r.data.data)).catch(e => setError(getErrorMsg(e))).finally(() => setLoading(false));
  }, [pondId]);

  function goTab(path) {
    setActiveTab(path);
    navigate('/ponds/' + pondId + (path ? '/' + path : ''));
  }

  if (loading) return <Layout title="Pond Details"><Loading /></Layout>;
  if (error) return <Layout title="Pond Details"><div className="alert alert-error">{error}</div></Layout>;

  return (
    <Layout title={pond?.name || 'Pond Details'}>
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/ponds')} style={{ color:'var(--text-secondary)', fontSize:13, background:'none', border:'none', cursor:'pointer', marginBottom:4 }}>
            ← Back to Ponds
          </button>
          <h2>{pond?.name}</h2>
          <p>{pond?.species} · {pond?.size_acres ? pond.size_acres + ' acres' : ''} · Stocked {fmtDate(pond?.stocking_date)}</p>
        </div>
        <span className={'badge badge-' + (pond?.status==='active'?'success':pond?.status==='idle'?'neutral':'info')} style={{ fontSize:13, padding:'6px 14px' }}>
          {pond?.status}
        </span>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t.path} className={'tab-btn' + (activeTab === t.path ? ' active' : '')} onClick={() => goTab(t.path)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === '' && pond && <PondOverview pond={pond} pondId={pondId} goTab={goTab} />}
    </Layout>
  );
}

function PondOverview({ pond, pondId, goTab }) {
  const navigate = useNavigate();
  const cards = [
    { label:'Water Quality', icon:'💧', path:'water-quality', desc:'Monitor pH, DO, temperature and more' },
    { label:'Feed Management', icon:'🌾', path:'feed', desc:'Track feed usage and costs' },
    { label:'Growth Records', icon:'📈', path:'growth', desc:'ABW, survival rate and biomass' },
    { label:'Business', icon:'💰', path:'business', desc:'Expenses, revenue and profit' },
    { label:'ML Prediction', icon:'🤖', path:'ml', desc:'AI-powered pond health risk assessment' },
  ];
  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-card-label">Species</div><div className="stat-card-value" style={{ fontSize:20 }}>{pond.species}</div></div>
        <div className="stat-card"><div className="stat-card-label">Size</div><div className="stat-card-value" style={{ fontSize:20 }}>{pond.size_acres ? pond.size_acres + ' acres' : '—'}</div></div>
        <div className="stat-card"><div className="stat-card-label">Stocking Density</div><div className="stat-card-value" style={{ fontSize:20 }}>{pond.stocking_density ? pond.stocking_density + '/sqm' : '—'}</div></div>
        <div className="stat-card"><div className="stat-card-label">Status</div><div className="stat-card-value" style={{ fontSize:20 }}>{pond.status}</div></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
        {cards.map(c => (
          <div key={c.path} className="card" style={{ cursor:'pointer', transition:'box-shadow .15s' }}
            onClick={() => goTab(c.path)}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 20px rgba(0,119,182,.14)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow=''}>
            <div style={{ fontSize:28, marginBottom:10 }}>{c.icon}</div>
            <div style={{ fontWeight:600, fontSize:14 }}>{c.label}</div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:4 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
