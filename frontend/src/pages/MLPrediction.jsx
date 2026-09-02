import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { predict } from '../services/mlService';
import { getPonds } from '../services/pondService';
import { getErrorMsg } from '../helpers/errorMsg';

const EMPTY = { temperature:'', ph:'', dissolved_oxygen:'', salinity:'', ammonia:'', pond_id:'' };
const FLAG_COLOR = { ok:'param-ok', low:'param-warn', high:'param-warn', critical_low:'param-crit', critical_high:'param-crit' };
const FLAG_LABEL = { ok:'OK', low:'Low', high:'High', critical_low:'Critical Low', critical_high:'Critical High' };

export default function MLPrediction() {
  const [form, setForm] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ponds, setPonds] = useState([]);

  useEffect(() => { getPonds().then(r => setPonds(r.data.data || [])).catch(() => {}); }, []);

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handlePredict(e) {
    e.preventDefault(); setError(''); setResult(null);
    const payload = {};
    ['temperature','ph','dissolved_oxygen','salinity','ammonia'].forEach(k => { if (form[k]) payload[k] = parseFloat(form[k]); });
    if (form.pond_id) payload.pond_id = form.pond_id;
    if (!Object.keys(payload).some(k => k !== 'pond_id')) { setError('Please enter at least one water quality parameter.'); return; }
    setLoading(true);
    try { const res = await predict(payload); setResult(res.data.data?.prediction || res.data); }
    catch (err) { setError(getErrorMsg(err)); }
    finally { setLoading(false); }
  }

  const riskClass = result ? { LOW:'risk-low', MODERATE:'risk-moderate', HIGH:'risk-high' }[result.risk_level] || 'risk-low' : '';

  return (
    <Layout title="ML Prediction">
      <div className="page-header">
        <div><h2>ML Pond Health Prediction</h2><p>AI-powered pond risk assessment using water quality parameters</p></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Enter Parameters</span></div>
          <ErrorMessage message={error} />
          <form onSubmit={handlePredict}>
            {ponds.length > 0 && (
              <div className="form-group">
                <label>Pond (Optional — auto-loads latest readings)</label>
                <select name="pond_id" value={form.pond_id} onChange={handleChange}>
                  <option value="">Manual input</option>
                  {ponds.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="form-row">
              <div className="form-group"><label>Temperature (°C)</label><input name="temperature" type="number" step="0.1" value={form.temperature} onChange={handleChange} placeholder="26–30" /></div>
              <div className="form-group"><label>pH</label><input name="ph" type="number" step="0.01" value={form.ph} onChange={handleChange} placeholder="7.5–8.5" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Dissolved O₂ (mg/L)</label><input name="dissolved_oxygen" type="number" step="0.1" value={form.dissolved_oxygen} onChange={handleChange} placeholder="≥ 5" /></div>
              <div className="form-group"><label>Salinity (ppt)</label><input name="salinity" type="number" step="0.1" value={form.salinity} onChange={handleChange} placeholder="10–25" /></div>
            </div>
            <div className="form-group"><label>Ammonia (mg/L)</label><input name="ammonia" type="number" step="0.01" value={form.ammonia} onChange={handleChange} placeholder="&lt; 0.1" /></div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Analysing...' : '🤖 Run Prediction'}
            </button>
          </form>
        </div>

        <div>
          {loading && <Loading text="Running ML prediction..." />}
          {result && !loading && (
            <div>
              <div className={'risk-card ' + riskClass}>
                <div className="risk-label">{result.risk_level} RISK</div>
                <div style={{ fontSize:13 }}>Confidence: <strong>{Math.round((result.confidence || 0) * 100)}%</strong> · Score: <strong>{result.risk_score}/100</strong></div>
                <div style={{ marginTop:8, fontSize:14, lineHeight:1.6 }}>{result.message}</div>
              </div>

              {result.parameter_flags && (
                <div className="card" style={{ marginTop:16 }}>
                  <div className="card-header"><span className="card-title">Parameter Flags</span></div>
                  <div className="param-flags">
                    {Object.entries(result.parameter_flags).map(([k, v]) => (
                      <div key={k} className="param-flag">
                        <div className="param-flag-name">{k.replace('_',' ')}</div>
                        <div className={'param-flag-val ' + (FLAG_COLOR[v] || 'param-ok')}>{FLAG_LABEL[v] || v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.recommendations?.length > 0 && (
                <div className="card" style={{ marginTop:16 }}>
                  <div className="card-header"><span className="card-title">Recommendations</span></div>
                  <ul className="recommendation-list">
                    {result.recommendations.map((r,i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
          {!result && !loading && !error && (
            <EmptyState icon="🤖" title="Run a prediction" description="Enter water quality parameters on the left and click Run Prediction." />
          )}
        </div>
      </div>
    </Layout>
  );
}
