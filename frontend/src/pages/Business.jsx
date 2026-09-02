import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import { getBusiness, getBusinessSummary, createBusiness, deleteBusiness } from '../services/businessService';
import { getErrorMsg } from '../helpers/errorMsg';
import { fmtDate, fmtCurrency } from '../helpers/format';

const EMPTY = { feed_expense:'', labor_expense:'', medicine_expense:'', other_expense:'', harvest_revenue:'', recorded_at: new Date().toISOString().slice(0,10) };

export default function Business() {
  const { pondId } = useParams();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
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
    Promise.all([
      getBusiness(pondId).then(r => setRecords(r.data.data || [])).catch(() => {}),
      getBusinessSummary(pondId).then(r => setSummary(r.data.data || r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [pondId]);
  useEffect(() => { load(); }, [load]);

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSave() {
    setSaving(true); setFormError('');
    const payload = {};
    ['feed_expense','labor_expense','medicine_expense','other_expense','harvest_revenue'].forEach(k => { if (form[k]) payload[k] = parseFloat(form[k]); });
    if (form.recorded_at) payload.recorded_at = form.recorded_at;
    try { await createBusiness(pondId, payload); setShowModal(false); load(); }
    catch (err) { setFormError(getErrorMsg(err)); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try { await deleteBusiness(pondId, deleting.id); setDeleting(null); load(); }
    catch (err) { setError(getErrorMsg(err)); setDeleting(null); }
    finally { setDeleteLoading(false); }
  }

  const totalExpense = summary?.total_expense ?? records.reduce((s,r) => s + (r.feed_expense||0) + (r.labor_expense||0) + (r.medicine_expense||0) + (r.other_expense||0), 0);
  const totalRevenue = summary?.total_revenue ?? records.reduce((s,r) => s + (r.harvest_revenue||0), 0);
  const profit = totalRevenue - totalExpense;

  return (
    <Layout title="Business">
      <div className="page-header">
        <div><h2>Business Records</h2><p>Track expenses, revenue and profitability</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setFormError(''); setShowModal(true); }}>+ Add Record</button>
      </div>
      <ErrorMessage message={error} />
      <div className="stat-grid">
        <StatCard label="Total Expense" value={fmtCurrency(totalExpense)} icon="📉" color="var(--danger)" />
        <StatCard label="Total Revenue" value={fmtCurrency(totalRevenue)} icon="📈" color="var(--success)" />
        <StatCard label="Net Profit / Loss" value={fmtCurrency(Math.abs(profit))} icon={profit >= 0 ? '💰' : '⚠️'}
          color={profit >= 0 ? 'var(--success)' : 'var(--danger)'}
          sub={profit >= 0 ? 'Profit' : 'Loss'} />
        <StatCard label="Total Records" value={records.length} icon="📋" />
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Business Records</span></div>
        {loading ? <Loading /> : records.length === 0 ? <EmptyState icon="💰" title="No business records" description="Add your first record." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Feed Exp.</th><th>Labor Exp.</th><th>Medicine</th><th>Other</th><th>Revenue</th><th>Net</th><th></th></tr></thead>
              <tbody>
                {records.map(r => {
                  const exp = (r.feed_expense||0)+(r.labor_expense||0)+(r.medicine_expense||0)+(r.other_expense||0);
                  const net = (r.harvest_revenue||0) - exp;
                  return <tr key={r.id}>
                    <td>{fmtDate(r.recorded_at)}</td>
                    <td>{r.feed_expense ? fmtCurrency(r.feed_expense) : '—'}</td>
                    <td>{r.labor_expense ? fmtCurrency(r.labor_expense) : '—'}</td>
                    <td>{r.medicine_expense ? fmtCurrency(r.medicine_expense) : '—'}</td>
                    <td>{r.other_expense ? fmtCurrency(r.other_expense) : '—'}</td>
                    <td>{r.harvest_revenue ? fmtCurrency(r.harvest_revenue) : '—'}</td>
                    <td><span className={net >= 0 ? 'profit' : 'loss'}>{fmtCurrency(Math.abs(net))}{net >= 0 ? ' ▲' : ' ▼'}</span></td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => setDeleting(r)}>Delete</button></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <Modal title="Add Business Record" onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Add Record'}</button></>}>
          <ErrorMessage message={formError} />
          <div className="form-row">
            <div className="form-group"><label>Feed Expense (₹)</label><input name="feed_expense" type="number" step="0.01" value={form.feed_expense} onChange={handleChange} placeholder="0" /></div>
            <div className="form-group"><label>Labor Expense (₹)</label><input name="labor_expense" type="number" step="0.01" value={form.labor_expense} onChange={handleChange} placeholder="0" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Medicine Expense (₹)</label><input name="medicine_expense" type="number" step="0.01" value={form.medicine_expense} onChange={handleChange} placeholder="0" /></div>
            <div className="form-group"><label>Other Expense (₹)</label><input name="other_expense" type="number" step="0.01" value={form.other_expense} onChange={handleChange} placeholder="0" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Harvest Revenue (₹)</label><input name="harvest_revenue" type="number" step="0.01" value={form.harvest_revenue} onChange={handleChange} placeholder="0" /></div>
            <div className="form-group"><label>Date</label><input name="recorded_at" type="date" value={form.recorded_at} onChange={handleChange} /></div>
          </div>
        </Modal>
      )}
      {deleting && <ConfirmDialog message="Delete this business record?" onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />}
    </Layout>
  );
}
