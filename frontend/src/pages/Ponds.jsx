import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorMessage from '../components/ErrorMessage';
import { getPonds, createPond, updatePond, deletePond } from '../services/pondService';
import { getErrorMsg } from '../helpers/errorMsg';
import { fmtDate } from '../helpers/format';

const EMPTY = { name:'', species:'Vannamei', size_acres:'', stocking_density:'', location:'', status:'active', stocking_date:'' };

export default function Ponds() {
  const navigate = useNavigate();
  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getPonds().then(r => setPonds(r.data.data || [])).catch(e => setError(getErrorMsg(e))).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() { setEditing(null); setForm(EMPTY); setFormError(''); setShowModal(true); }
  function openEdit(p, e) { e.stopPropagation(); setEditing(p); setForm({ name:p.name, species:p.species||'', size_acres:p.size_acres||'', stocking_density:p.stocking_density||'', location:p.location||'', status:p.status||'active', stocking_date:p.stocking_date||'' }); setFormError(''); setShowModal(true); }

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSave() {
    if (!form.name.trim()) { setFormError('Pond name is required.'); return; }
    if (!form.species.trim()) { setFormError('Species is required.'); return; }
    setSaving(true); setFormError('');
    const payload = { name: form.name.trim(), species: form.species.trim(),
      ...(form.size_acres ? { size_acres: parseFloat(form.size_acres) } : {}),
      ...(form.stocking_density ? { stocking_density: parseInt(form.stocking_density) } : {}),
      ...(form.location ? { location: form.location } : {}),
      status: form.status,
      ...(form.stocking_date ? { stocking_date: form.stocking_date } : {}),
    };
    try {
      if (editing) await updatePond(editing.id, payload);
      else await createPond(payload);
      setShowModal(false); load();
    } catch (err) { setFormError(getErrorMsg(err)); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try { await deletePond(deleting.id); setDeleting(null); load(); }
    catch (err) { setError(getErrorMsg(err)); setDeleting(null); }
    finally { setDeleteLoading(false); }
  }

  return (
    <Layout title="My Ponds">
      <div className="page-header">
        <div><h2>My Ponds</h2><p>Manage all your aquaculture ponds</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Pond</button>
      </div>

      <ErrorMessage message={error} />

      {loading ? <Loading /> : ponds.length === 0 ? (
        <EmptyState icon="🏊" title="No ponds yet" description="Add your first pond to get started." />
      ) : (
        <div className="pond-grid">
          {ponds.map(p => (
            <div key={p.id} className="pond-card" onClick={() => navigate('/ponds/' + p.id)}>
              <div className="pond-card-header">
                <div>
                  <div className="pond-card-name">{p.name}</div>
                  <div className="pond-card-species">{p.species}</div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn-icon" title="Edit" onClick={e => openEdit(p,e)}>✏️</button>
                  <button className="btn-icon" title="Delete" onClick={e => { e.stopPropagation(); setDeleting(p); }}>🗑️</button>
                </div>
              </div>
              <span className={'badge badge-' + (p.status==='active'?'success':p.status==='idle'?'neutral':'info')}>{p.status}</span>
              <div className="pond-card-meta">
                <div className="pond-card-meta-item"><label>Size</label><span>{p.size_acres ? p.size_acres + ' acres' : '—'}</span></div>
                <div className="pond-card-meta-item"><label>Density</label><span>{p.stocking_density ? p.stocking_density + '/sqm' : '—'}</span></div>
                <div className="pond-card-meta-item"><label>Stocked</label><span>{fmtDate(p.stocking_date)}</span></div>
                <div className="pond-card-meta-item"><label>Location</label><span>{p.location || '—'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Pond' : 'Add New Pond'} onClose={() => setShowModal(false)}
          footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Pond'}</button></>}>
          <ErrorMessage message={formError} />
          <div className="form-group"><label>Pond Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Pond A1" autoFocus /></div>
          <div className="form-row">
            <div className="form-group"><label>Species *</label>
              <select name="species" value={form.species} onChange={handleChange}>
                <option>Vannamei</option><option>Tiger Shrimp</option><option>Rohu</option><option>Catla</option><option>Tilapia</option><option>Other</option>
              </select>
            </div>
            <div className="form-group"><label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option><option value="idle">Idle</option><option value="harvested">Harvested</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Size (acres)</label><input name="size_acres" type="number" step="0.01" value={form.size_acres} onChange={handleChange} placeholder="e.g. 1.5" /></div>
            <div className="form-group"><label>Stocking Density (/sqm)</label><input name="stocking_density" type="number" value={form.stocking_density} onChange={handleChange} placeholder="e.g. 60" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Location</label><input name="location" value={form.location} onChange={handleChange} placeholder="Village / District" /></div>
            <div className="form-group"><label>Stocking Date</label><input name="stocking_date" type="date" value={form.stocking_date} onChange={handleChange} /></div>
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog message={'Delete pond "' + deleting.name + '"? All related records will also be removed.'}
          onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={deleteLoading} />
      )}
    </Layout>
  );
}
