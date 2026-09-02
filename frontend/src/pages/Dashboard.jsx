import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { getPonds } from '../services/pondService';
import { getGrowth } from '../services/growthService';
import { getBusinessSummary } from '../services/businessService';
import { getMLHealth } from '../services/mlService';
import { fmtCurrency } from '../helpers/format';

// ---------------------------------------------------------------------------
// Sample/demo market rate data
// These are INDICATIVE rates only. Replace with a real market-rate API endpoint
// once one is integrated into the backend.
// ---------------------------------------------------------------------------
const MARKET_RATES = [
  { count: 100, size: 'Small',       rate: 280 },
  { count: 80,  size: 'Medium',      rate: 320 },
  { count: 60,  size: 'Large',       rate: 380 },
  { count: 40,  size: 'Extra Large', rate: 450 },
  { count: 20,  size: 'Jumbo',       rate: 600 },
];

const SQM_PER_ACRE = 4047;

function estimateStocked(pond) {
  if (!pond.stocking_density || !pond.size_acres) return null;
  return Math.round(pond.stocking_density * pond.size_acres * SQM_PER_ACRE);
}

function fmt(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-IN');
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ponds,        setPonds]        = useState([]);
  const [pondData,     setPondData]     = useState({});
  const [mlStatus,     setMlStatus]     = useState('checking');
  const [loading,      setLoading]      = useState(true);
  const [selectedRate, setSelectedRate] = useState(MARKET_RATES[1]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const pondsRes = await getPonds();
      const pondsArr = pondsRes.data.data || [];
      setPonds(pondsArr);

      getMLHealth()
        .then(r => setMlStatus(r.data.data?.mlService || 'unknown'))
        .catch(() => setMlStatus('unavailable'));

      const entries = await Promise.all(
        pondsArr.map(async (pond) => {
          const [growthRes, bizRes] = await Promise.allSettled([
            getGrowth(pond.id),
            getBusinessSummary(pond.id),
          ]);
          const growthRecords = growthRes.status === 'fulfilled' ? (growthRes.value.data.data || []) : [];
          const latestGrowth  = growthRecords[0] || null;
          const bizSummary    = bizRes.status === 'fulfilled'
            ? (bizRes.value.data.data || bizRes.value.data || null)
            : null;
          return [pond.id, { latestGrowth, bizSummary }];
        })
      );
      setPondData(Object.fromEntries(entries));
    } catch (e) {
      // silently handled per-pond above
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Aggregate
  let totalStocked   = 0, totalEstAlive  = 0, totalBiomassKg = 0;
  let totalExpense   = 0, totalRevenue   = 0;
  let survivalSum    = 0, survivalCount  = 0, stockedCount   = 0;

  const pondRows = ponds.map(pond => {
    const { latestGrowth, bizSummary } = pondData[pond.id] || {};
    const stocked     = estimateStocked(pond);
    const survivalPct = latestGrowth?.survival_pct ?? null;
    const abwGrams    = latestGrowth?.abw_grams    ?? null;
    const biomassKg   = latestGrowth?.biomass_kg   ?? null;
    const estAlive    = (stocked != null && survivalPct != null)
      ? Math.round(stocked * survivalPct / 100) : null;
    const estBiomass  = (estAlive != null && abwGrams != null)
      ? (estAlive * abwGrams / 1000) : biomassKg;
    const estValue    = estBiomass != null ? estBiomass * selectedRate.rate : null;
    const estLoss     = (stocked != null && estAlive != null) ? stocked - estAlive : null;

    if (stocked != null)     { totalStocked += stocked; stockedCount++; }
    if (estAlive != null)    totalEstAlive += estAlive;
    if (estBiomass != null)  totalBiomassKg += estBiomass;
    if (survivalPct != null) { survivalSum += survivalPct; survivalCount++; }
    totalExpense += bizSummary?.total_expense ?? 0;
    totalRevenue += bizSummary?.total_revenue ?? 0;

    return { pond, stocked, survivalPct, abwGrams, estAlive, estBiomass, estValue, estLoss, bizSummary };
  });

  const avgSurvival   = survivalCount > 0 ? (survivalSum / survivalCount).toFixed(1) : null;
  const totalEstValue = totalBiomassKg * selectedRate.rate;
  const totalProfit   = (totalRevenue + totalEstValue) - totalExpense;
  const activePonds   = ponds.filter(p => p.status === 'active').length;

  return (
    <Layout title="Dashboard">
      <div className="page-header">
        <div>
          <h2>Welcome, {user?.name?.split(' ')[0] || 'Farmer'} 🦐</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>
            Business overview — shrimp stock, market value &amp; profitability
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/ponds')}>+ Manage Ponds</button>
      </div>

      {loading ? <Loading text="Loading farm data..." /> : (
        <>
          {/* ── KPI cards ─────────────────────────────────────────────────── */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(155px,1fr))', marginBottom: 24 }}>
            <StatCard label="Total Ponds"       value={ponds.length} icon="🏊" sub={activePonds + ' active'} />
            <StatCard label="Total Stocked"
              value={stockedCount > 0 ? totalStocked.toLocaleString('en-IN') : '—'}
              icon="🦐" color="var(--primary)" sub="post-larvae seeded" />
            <StatCard label="Est. Live Shrimp"
              value={totalEstAlive > 0 ? totalEstAlive.toLocaleString('en-IN') : '—'}
              icon="✅" color="var(--success)" sub="survival-adjusted" />
            <StatCard label="Avg Survival"
              value={avgSurvival ? avgSurvival + '%' : '—'}
              icon="📊"
              color={!avgSurvival ? 'var(--text)' : Number(avgSurvival) >= 70 ? 'var(--success)' : Number(avgSurvival) >= 50 ? 'var(--warning)' : 'var(--danger)'}
              sub="across ponds" />
            <StatCard label="Est. Biomass"
              value={totalBiomassKg > 0 ? totalBiomassKg.toFixed(1) + ' kg' : '—'}
              icon="⚖️" color="var(--primary-dark)" sub="harvestable weight" />
            <StatCard label="Est. Market Value"
              value={totalBiomassKg > 0 ? fmtCurrency(totalEstValue) : '—'}
              icon="💰" color="var(--success)"
              sub={'@ ' + selectedRate.count + 'ct ₹' + selectedRate.rate + '/kg'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 20, marginBottom: 24 }}>

            {/* ── Shrimp Market Rates ──────────────────────────────────────── */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Shrimp Market Rates</span>
                <span style={{ fontSize: 10, fontWeight: 600, background: '#fef3c7', color: '#92400e',
                  padding: '2px 8px', borderRadius: 99, border: '1px solid #fcd34d' }}>SAMPLE DATA</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Indicative rates only. Click a category to update value estimates.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MARKET_RATES.map(r => (
                  <button key={r.count} onClick={() => setSelectedRate(r)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 8, border: '1px solid',
                    borderColor: selectedRate.count === r.count ? 'var(--primary)' : 'var(--border)',
                    background: selectedRate.count === r.count ? '#e0f0ff' : '#f8fafc',
                    cursor: 'pointer', transition: 'all .12s', width: '100%',
                  }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.count} Count — {r.size}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{r.count} shrimp per kg</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16,
                      color: selectedRate.count === r.count ? 'var(--primary)' : 'var(--text)' }}>
                      ₹{r.rate}<span style={{ fontSize: 11, fontWeight: 400 }}>/kg</span>
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: '8px 12px', background: '#f0f9ff', borderRadius: 6,
                fontSize: 12, color: '#0369a1' }}>
                To get live rates, integrate a market API into the backend at
                <code style={{ marginLeft: 4 }}>/api/market/rates</code>
              </div>
            </div>

            {/* ── Business summary + quick actions ────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div className="card-header"><span className="card-title">Business Summary</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Total Expenses',    value: fmtCurrency(totalExpense),  color: 'var(--danger)',   icon: '📉' },
                    { label: 'Harvest Revenue',   value: fmtCurrency(totalRevenue),  color: 'var(--success)',  icon: '📈' },
                    { label: 'Est. Value on Hand',
                      value: totalBiomassKg > 0 ? fmtCurrency(totalEstValue) : '—',
                      color: 'var(--primary)', icon: '🦐' },
                    { label: 'Est. Profit / Loss',
                      value: totalExpense > 0 || totalRevenue > 0
                        ? (totalProfit >= 0 ? '+' : '') + fmtCurrency(Math.abs(totalProfit))
                        : '—',
                      color: totalProfit >= 0 ? 'var(--success)' : 'var(--danger)',
                      icon: totalProfit >= 0 ? '💰' : '⚠️' },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500,
                        textTransform: 'uppercase', letterSpacing: '.3px' }}>{item.icon} {item.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: item.color, marginTop: 4 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 10 }}>
                  * Expense &amp; revenue totals from Business Records. Est. Value on Hand uses selected rate.
                </p>
              </div>

              <div className="card">
                <div className="card-header"><span className="card-title">Quick Actions</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Run ML Risk Prediction', icon: '🤖', path: '/ml-prediction' },
                    { label: 'Ask AI Advisor',          icon: '💬', path: '/ai-assistant'  },
                    { label: 'Add Growth Record',       icon: '📈', path: '/ponds'         },
                    { label: 'Add Business Record',     icon: '📋', path: '/ponds'         },
                  ].map(a => (
                    <button key={a.label} className="btn btn-secondary btn-full"
                      style={{ justifyContent: 'flex-start', gap: 10 }}
                      onClick={() => navigate(a.path)}>
                      <span>{a.icon}</span> {a.label}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%',
                    background: mlStatus === 'available' ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    ML Engine: <strong>{mlStatus === 'available' ? 'Online' : 'Offline'}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Pond Stock Summary table ────────────────────────────────────── */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <span className="card-title">Pond Stock Summary</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Market value @ ₹{selectedRate.rate}/kg ({selectedRate.count} count — {selectedRate.size})
              </span>
            </div>

            {ponds.length === 0 ? (
              <EmptyState icon="🏊" title="No ponds yet"
                description="Add your first pond and record growth data to see stock estimates." />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Pond</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Total Stocked</th>
                      <th style={{ textAlign: 'right' }}>Survival %</th>
                      <th style={{ textAlign: 'right' }}>Est. Alive</th>
                      <th style={{ textAlign: 'right' }}>Est. Loss</th>
                      <th style={{ textAlign: 'right' }}>ABW</th>
                      <th style={{ textAlign: 'right' }}>Biomass</th>
                      <th style={{ textAlign: 'right' }}>Est. Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pondRows.map(({ pond, stocked, survivalPct, abwGrams, estAlive, estBiomass, estValue, estLoss }) => {
                      const sClass = survivalPct == null ? '' : Number(survivalPct) >= 70
                        ? 'badge-success' : Number(survivalPct) >= 50 ? 'badge-warning' : 'badge-danger';
                      return (
                        <tr key={pond.id} style={{ cursor: 'pointer' }}
                          onClick={() => navigate('/ponds/' + pond.id)}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{pond.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{pond.species}</div>
                          </td>
                          <td>
                            <span className={'badge badge-' + (pond.status === 'active' ? 'success' : pond.status === 'idle' ? 'neutral' : 'info')}>
                              {pond.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, fontSize: 13 }}>
                            {stocked != null ? fmt(stocked)
                              : <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>set density + size</span>}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {survivalPct != null
                              ? <span className={'badge ' + sClass}>{survivalPct}%</span>
                              : <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>add growth record</span>}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{estAlive != null ? fmt(estAlive) : '—'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>{estLoss != null ? fmt(estLoss) : '—'}</td>
                          <td style={{ textAlign: 'right' }}>{abwGrams != null ? abwGrams + ' g' : '—'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{estBiomass != null ? estBiomass.toFixed(1) + ' kg' : '—'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                            {estValue != null ? fmtCurrency(estValue) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {ponds.length > 1 && (
                    <tfoot>
                      <tr style={{ background: '#f0f9ff', fontWeight: 700 }}>
                        <td colSpan={2} style={{ padding: '11px 14px' }}>TOTAL</td>
                        <td style={{ textAlign: 'right', padding: '11px 14px' }}>{totalStocked > 0 ? fmt(totalStocked) : '—'}</td>
                        <td style={{ textAlign: 'right', padding: '11px 14px' }}>{avgSurvival ? avgSurvival + '%' : '—'}</td>
                        <td style={{ textAlign: 'right', padding: '11px 14px' }}>{totalEstAlive > 0 ? fmt(totalEstAlive) : '—'}</td>
                        <td style={{ textAlign: 'right', padding: '11px 14px', color: 'var(--danger)' }}>
                          {totalStocked > 0 && totalEstAlive > 0 ? fmt(totalStocked - totalEstAlive) : '—'}
                        </td>
                        <td style={{ textAlign: 'right', padding: '11px 14px' }}>—</td>
                        <td style={{ textAlign: 'right', padding: '11px 14px' }}>{totalBiomassKg > 0 ? totalBiomassKg.toFixed(1) + ' kg' : '—'}</td>
                        <td style={{ textAlign: 'right', padding: '11px 14px', color: 'var(--success)' }}>
                          {totalBiomassKg > 0 ? fmtCurrency(totalEstValue) : '—'}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}

            {ponds.length > 0 && stockedCount < ponds.length && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#fffbeb', borderRadius: 6,
                fontSize: 12, color: '#92400e', border: '1px solid #fcd34d' }}>
                Some ponds are missing <strong>stocking density</strong> or <strong>size (acres)</strong>.
                Edit those ponds to enable stock estimates. Growth records are also needed for ABW and survival data.
              </div>
            )}
          </div>

          {/* ── Transparency note ──────────────────────────────────────────── */}
          <div className="card" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: 8 }}>How estimates are calculated</div>
                <div style={{ color: '#0c4a6e', lineHeight: 1.8, fontSize: 12 }}>
                  <div><strong>Total Stocked</strong> = Stocking Density (/sqm) x Pond Size (acres) x 4,047</div>
                  <div><strong>Est. Live Shrimp</strong> = Total Stocked x Survival %</div>
                  <div><strong>Est. Biomass (kg)</strong> = Est. Alive x ABW (g) / 1,000</div>
                  <div><strong>Est. Market Value</strong> = Est. Biomass x Selected Rate (₹/kg)</div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: 8 }}>Data sources</div>
                <div style={{ color: '#0c4a6e', lineHeight: 1.9, fontSize: 12 }}>
                  <div>Live from backend: Pond size, stocking density, species, status</div>
                  <div>Live from backend: Survival %, ABW, Biomass (Growth Records)</div>
                  <div>Live from backend: Expenses and Revenue (Business Records)</div>
                  <div>Sample / demo data: Shrimp market rates (per-kg prices)</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
