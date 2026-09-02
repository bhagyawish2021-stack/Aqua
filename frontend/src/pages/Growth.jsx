import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import { getGrowth, createGrowth, deleteGrowth } from '../services/growthService';
import { getErrorMsg } from '../helpers/errorMsg';
import { fmtDate } from '../helpers/format';

const EMPTY = { abw_grams: '', survival_pct: '', biomass_kg: '', recorded_at: new Date().toISOString().slice(0,10) };

export default function Growth() {
  const { pondId } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getGrowth(pondId).then(r => setRecords(r.data.data || [])).catch(e => setError(getErrorMsg(e))).finally(() => setLoading(false));
  }, [pondId]);
  useEffect(() => { load(); }, [load]);

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSave() {
    setSaving(true); setFormError('');
    const payload = {};
    if (form.abw_grams) payload.abw_grams = parseFloat(form.abw_grams);
    if (form.survival_pct) payload.survival_pct = parseFloat(form.survival_pct);
    if (form.biomass_kg) payload.biomass_kg = parseFloat(form.biomass_kg);
    if (form.recorded_at) payload.recorded_at = form.recorded_at;
    try { await createGrowth(pondId, payload); setShowModal(false); load(); }
    catch (err) { setFormError(getErrorMsg(err)); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try { await deleteGrowth(pondId, deleting.id); setDeleting(null); load(); }
    catch (err) { setError(getErrorMsg(err)); setDeleting(null); }
    finally { setDeleteLoading(false); }
  }

  const latest = records[0];
  const chartData = [...records].reverse().map(r => ({ date: fmtDate(r.recorded_at), abw: r.abw_grams, survival: r.survival_pct, biomass: r.biomass_kg }));

  return (
    <Layout title="Growth Records">
      <div className="page-header">
        <div><h2>Growth Records</h2><p>Track ABW, survival rate and biomass</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setFormError(''); setShowModal(true); }}>+ Add Record</button>
      </div>
      <ErrorMessage message={error} />
      <div className="stat-grid">
        <StatCard label="Latest ABW" value={latest?.abw_grams ? latest.abw_grams + ' g' : '—'} icon="📏" />
        <StatCard label="Survival Rate" value={latest?.survival_pct ? latest.survival_pct + '%' : '—'} icon="✅" color="var(--success)" />
        <StatCard label="Latest Biomass" value={latest?.biomass_kg ? latest.biomass_kg + ' kg' : '—'} icon="⚖️" color="var(--primary)" />
        <StatCard label="Total Records" value={records.length} icon="📊" />
      </div>

      {chartData.length >= 2 && (
        <div className="card" style={{ marginBottom:20 }}>
          <div className="card-header"><span className="card-title">Growth Trend</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top:5,right:20,left:0,bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="abw" stroke="#0077b6" name="ABW (g)" strokeWidth={2} dot={{ r:3 }} />
              <Line type="monotone" dataKey="biomass" stroke="#00b4d8" name="Biomass (kg)" strokeWidth={2} dot={{ r:3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <div className="card-header"><span className="card-title">All Records</span></div>
        {loading ? <Loading /> : records.length === 0 ? <EmptyState icon="📈" title="No growth records" description="Add your first record." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>ABW (g)</th><th>Survival %</th><th>Biomass (kg)</th><th></th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{fmtDate(r.recorded_at)}</td>
                    <td>{r.abw_grams ?? '—'}</td>
                    <td>{r.survival_pct != null ? r.survival_pct + '%' : '—'}</td>
                    <td>{r.biomass_kg ?? '—'}</td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => setDeleting(r)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <Modal title="Add Growth Record" onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Add Record'}</button></>}>
          <ErrorMessage message={formError} />
          <div className="form-row">
            <div className="form-group"><label>ABW (grams)</label><input name="abw_grams" type="number" step="0.1" value={form.abw_grams} onChange={handleChange} placeholder="e.g. 12.5" /></div>
            <div className="form-group"><label>Survival Rate (%)</label><input name="survival_pct" type="number" step="0.1" min="0" max="100" value={form.survival_pct} onChange={handleChange} placeholder="e.g. 85" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Biomass (kg)</label><input name="biomass_kg" type="number" step="0.1" value={form.biomass_kg} onChange={handleChange} placeholder="e.g. 320" /></div>
            <div className="form-group"><label>Date</label><input name="recorded_at" type="date" value={form.recorded_at} onChange={handleChange} /></div>
          </div>
        </Modal>
      )}
      {deleting && <ConfirmDialog message="Delete this growth record?" onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />}
    </Layout>
  );
}
