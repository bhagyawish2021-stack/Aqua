import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import { getFeed, createFeed, deleteFeed } from '../services/feedService';
import { getErrorMsg } from '../helpers/errorMsg';
import { fmtDate, fmtCurrency } from '../helpers/format';

const EMPTY = { feed_type: '', quantity_kg: '', cost: '', recorded_at: new Date().toISOString().slice(0,10) };

export default function Feed() {
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
    getFeed(pondId).then(r => setRecords(r.data.data || [])).catch(e => setError(getErrorMsg(e))).finally(() => setLoading(false));
  }, [pondId]);
  useEffect(() => { load(); }, [load]);

  const totalQty = records.reduce((s,r) => s + (r.quantity_kg || 0), 0);
  const totalCost = records.reduce((s,r) => s + (r.cost || 0), 0);

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSave() {
    if (!form.feed_type.trim()) { setFormError('Feed type is required.'); return; }
    if (!form.quantity_kg) { setFormError('Quantity is required.'); return; }
    setSaving(true); setFormError('');
    const payload = { feed_type: form.feed_type.trim(), quantity_kg: parseFloat(form.quantity_kg),
      ...(form.cost ? { cost: parseFloat(form.cost) } : {}),
      ...(form.recorded_at ? { recorded_at: form.recorded_at } : {}),
    };
    try { await createFeed(pondId, payload); setShowModal(false); load(); }
    catch (err) { setFormError(getErrorMsg(err)); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try { await deleteFeed(pondId, deleting.id); setDeleting(null); load(); }
    catch (err) { setError(getErrorMsg(err)); setDeleting(null); }
    finally { setDeleteLoading(false); }
  }

  return (
    <Layout title="Feed Management">
      <div className="page-header">
        <div><h2>Feed Management</h2><p>Track feed usage and costs</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setFormError(''); setShowModal(true); }}>+ Add Record</button>
      </div>
      <ErrorMessage message={error} />
      <div className="stat-grid">
        <StatCard label="Total Feed Used" value={totalQty.toFixed(1) + ' kg'} icon="🌾" sub={records.length + ' records'} />
        <StatCard label="Total Feed Cost" value={fmtCurrency(totalCost)} icon="💰" color="var(--warning)" />
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Feed Records</span></div>
        {loading ? <Loading /> : records.length === 0 ? <EmptyState icon="🌾" title="No feed records" description="Add your first feed record." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Feed Type</th><th>Quantity (kg)</th><th>Cost</th><th></th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>{fmtDate(r.recorded_at)}</td>
                    <td><strong>{r.feed_type}</strong></td>
                    <td>{r.quantity_kg} kg</td>
                    <td>{r.cost ? fmtCurrency(r.cost) : '—'}</td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => setDeleting(r)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <Modal title="Add Feed Record" onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Add Record'}</button></>}>
          <ErrorMessage message={formError} />
          <div className="form-group"><label>Feed Type *</label><input name="feed_type" value={form.feed_type} onChange={handleChange} placeholder="e.g. Pellet 2mm" autoFocus /></div>
          <div className="form-row">
            <div className="form-group"><label>Quantity (kg) *</label><input name="quantity_kg" type="number" step="0.1" value={form.quantity_kg} onChange={handleChange} placeholder="0.0" /></div>
            <div className="form-group"><label>Cost (₹)</label><input name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} placeholder="Optional" /></div>
          </div>
          <div className="form-group"><label>Date</label><input name="recorded_at" type="date" value={form.recorded_at} onChange={handleChange} /></div>
        </Modal>
      )}
      {deleting && <ConfirmDialog message="Delete this feed record?" onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />}
    </Layout>
  );
}
