import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/profileService';
import { getErrorMsg } from '../helpers/errorMsg';

export default function Profile() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name:'', phone:'', language:'en' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    getProfile().then(r => {
      const d = r.data.data;
      setEmail(d.email || '');
      setForm({ name: d.name || '', phone: d.phone || '', language: d.language || 'en' });
    }).catch(e => setError(getErrorMsg(e))).finally(() => setLoading(false));
  }, []);

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSave(e) {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true);
    const payload = {};
    if (form.name) payload.name = form.name;
    if (form.phone) payload.phone = form.phone;
    if (form.language) payload.language = form.language;
    try {
      const res = await updateProfile(payload);
      setUser(res.data.data);
      setSuccess('Profile updated successfully.');
    } catch (err) { setError(getErrorMsg(err)); }
    finally { setSaving(false); }
  }

  if (loading) return <Layout title="Profile"><Loading /></Layout>;

  const initials = form.name ? form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'U';

  return (
    <Layout title="Profile">
      <div className="page-header"><div><h2>My Profile</h2><p>Manage your account settings</p></div></div>
      <div style={{ maxWidth:540 }}>
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700 }}>{initials}</div>
            <div>
              <div style={{ fontSize:18, fontWeight:700 }}>{form.name || 'Farmer'}</div>
              <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{email}</div>
            </div>
          </div>
          {error && <ErrorMessage message={error} />}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group"><label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
            </div>
            <div className="form-group"><label>Email Address</label>
              <input value={email} disabled style={{ background:'#f8fafc', cursor:'not-allowed' }} />
            </div>
            <div className="form-group"><label>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
            </div>
            <div className="form-group"><label>Language</label>
              <select name="language" value={form.language} onChange={handleChange}>
                <option value="en">English</option>
                <option value="te">Telugu</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
