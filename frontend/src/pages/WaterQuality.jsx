import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorMessage from '../components/ErrorMessage';
import { getWQ, createWQ, deleteWQ } from '../services/waterQualityService';
import { getErrorMsg } from '../helpers/errorMsg';
import { fmtDate } from '../helpers/format';

const RANGES = { temperature:{ok:[26,30],warn:[22,34]}, ph:{ok:[7.5,8.5],warn:[6.5,9]}, dissolved_oxygen:{ok:[5,12],warn:[3,14]}, salinity:{ok:[10,25],warn:[5,35]}, ammonia:{ok:[0,0.1],warn:[0,0.5]} };
function wqStatus(key, val) {
  if (val == null) return null;
  const r = RANGES[key]; if (!r) return 'ok';
  if (val >= r.ok[0] && val <= r.ok[1]) return 'ok';
  if (val >= r.warn[0] && val <= r.warn[1]) return 'warn';
  return 'crit';
}
const STATUS_CLASS = { ok:'badge-success', warn:'badge-warning', crit:'badge-danger' };
const STATUS_LABEL = { ok:'Normal', warn:'Warning', crit:'Critical' };

const EMPTY = { temperature:'', ph:'', dissolved_oxygen:'', salinity:'', ammonia:'', alkalinity:'', recorded_at: new Date().toISOString().slice(0,10) };

export default function WaterQuality() {
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
    getWQ(pondId).then(r => setRecords(r.data.data || [])).catch(e => setError(getErrorMsg(e))).finally(() => setLoading(false));
  }, [pondId]);
  useEffect(() => { load(); }, [load]);

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSave() {
    setSaving(true); setFormError('');
    const payload = {};
    ['temperature','ph','dissolved_oxygen','salinity','ammonia','alkalinity'].forEach(k => { if (form[k] !== '') payload[k] = parseFloat(form[k]); });
    if (form.recorded_at) payload.recorded_at = form.recorded_at;
    try { await createWQ(pondId, payload); setShowModal(false); load(); }
    catch (err) { setFormError(getErrorMsg(err)); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try { await deleteWQ(pondId, deleting.id); setDeleting(null); load(); }
    catch (err) { setError(getErrorMsg(err)); setDeleting(null); }
    finally { setDeleteLoading(false); }
  }

  const latest = records[0];
  const overallStatus = latest ? ['temperature','ph','dissolved_oxygen','ammonia'].map(k => wqStatus(k, latest[k])).includes('crit') ? 'crit' : ['temperature','ph','dissolved_oxygen','ammonia'].map(k => wqStatus(k, latest[k])).includes('warn') ? 'warn' : 'ok' : null;

  return (
    <Layout title="Water Quality">
      <div className="page-header">
        <div><h2>Water Quality</h2><p>Monitor and log water quality parameters</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setFormError(''); setShowModal(true); }}>+ Add Record</button>
      </div>
      <ErrorMessage message={error} />

      {latest && (
        <div className="stat-grid" style={{ marginBottom:20 }}>
          {[['temperature','Temperature','°C'],['ph','pH',''],['dissolved_oxygen','Dissolved O₂','mg/L'],['salinity','Salinity','ppt'],['ammonia','Ammonia','mg/L']].map(([k,label,unit]) => {
            const v = latest[k]; const st = wqStatus(k,v);
            return <div key={k} className="stat-card">
              <div className="stat-card-label">{label}</div>
              <div className="stat-card-value" style={{ fontSize:22, color: st==='ok'?'var(--success)':st==='warn'?'var(--warning)':'var(--danger)' }}>
                {v != null ? v + unit : '—'}
              </div>
              {st && <span className={'badge ' + STATUS_CLASS[st]}>{STATUS_LABEL[st]}</span>}
            </div>;
          })}
          {overallStatus && <div className="stat-card">
            <div className="stat-card-label">Overall Status</div>
            <div className="stat-card-value" style={{ fontSize:20, color: overallStatus==='ok'?'var(--success)':overallStatus==='warn'?'var(--warning)':'var(--danger)' }}>
              {overallStatus==='ok'?'Healthy':overallStatus==='warn'?'Warning':'Critical'}
            </div>
            <div className="stat-card-sub">from latest reading</div>
          </div>}
        </div>
      )}

      <div className="card">
        <div className="card-header"><span className="card-title">All Records</span></div>
        {loading ? <Loading /> : records.length === 0 ? <EmptyState icon="💧" title="No water quality records" description="Add your first reading." /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Temp °C</th><th>pH</th><th>DO mg/L</th><th>Salinity ppt</th><th>Ammonia mg/L</th><th>Alkalinity</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {records.map(r => {
                  const st = ['temperature','ph','dissolved_oxygen','ammonia'].map(k => wqStatus(k,r[k])).includes('crit') ? 'crit' : ['temperature','ph','dissolved_oxygen','ammonia'].map(k => wqStatus(k,r[k])).includes('warn') ? 'warn' : 'ok';
                  return <tr key={r.id}>
                    <td>{fmtDate(r.recorded_at)}</td>
                    <td>{r.temperature ?? '—'}</td><td>{r.ph ?? '—'}</td><td>{r.dissolved_oxygen ?? '—'}</td>
                    <td>{r.salinity ?? '—'}</td><td>{r.ammonia ?? '—'}</td><td>{r.alkalinity ?? '—'}</td>
                    <td><span className={'badge ' + STATUS_CLASS[st]}>{STATUS_LABEL[st]}</span></td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => setDeleting(r)}>Delete</button></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Add Water Quality Record" onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Add Record'}</button></>}>
          <ErrorMessage message={formError} />
          <div className="form-row">
            <div className="form-group"><label>Temperature (°C)</label><input name="temperature" type="number" step="0.1" value={form.temperature} onChange={handleChange} placeholder="26–30" /></div>
            <div className="form-group"><label>pH</label><input name="ph" type="number" step="0.01" value={form.ph} onChange={handleChange} placeholder="7.5–8.5" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Dissolved O₂ (mg/L)</label><input name="dissolved_oxygen" type="number" step="0.1" value={form.dissolved_oxygen} onChange={handleChange} placeholder="≥ 5" /></div>
            <div className="form-group"><label>Salinity (ppt)</label><input name="salinity" type="number" step="0.1" value={form.salinity} onChange={handleChange} placeholder="10–25" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Ammonia (mg/L)</label><input name="ammonia" type="number" step="0.01" value={form.ammonia} onChange={handleChange} placeholder="&lt; 0.1" /></div>
            <div className="form-group"><label>Alkalinity (mg/L)</label><input name="alkalinity" type="number" step="1" value={form.alkalinity} onChange={handleChange} placeholder="100–150" /></div>
          </div>
          <div className="form-group"><label>Recorded Date</label><input name="recorded_at" type="date" value={form.recorded_at} onChange={handleChange} /></div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog message="Delete this water quality record?" onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />
      )}
    </Layout>
  );
}
