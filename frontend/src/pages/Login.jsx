import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { getErrorMsg } from '../helpers/errorMsg';
import ErrorMessage from '../components/ErrorMessage';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await apiLogin(form);
      // Backend response shape: { success, message, data: { token, refreshToken, expiresAt, user } }
      const { token, user } = res.data.data;
      if (!token) throw new Error('Login failed: no token received.');
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMsg(err));
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🦐 AquaMitra</h1>
          <p>Smart Aquaculture Management System</p>
        </div>
        <h2>Sign In</h2>
        <ErrorMessage message={error} />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ margin: '16px 0 12px', textAlign: 'center', position: 'relative' }}>
          <span style={{ background: '#fff', padding: '0 10px', color: '#94a3b8', fontSize: 12 }}>OR</span>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-full"
          onClick={() => {
            login('demo-token', {
              id: '00000000-0000-0000-0000-000000000001',
              name: 'Aqua Farmer',
              email: 'farmer@aquamitra.com',
              role: 'farmer'
            });
            navigate('/dashboard');
          }}
          style={{ fontWeight: 700 }}
        >
          ⚡ Instant Demo Access as Aqua Farmer
        </button>

        <div className="auth-footer" style={{ marginTop: 16 }}>
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
