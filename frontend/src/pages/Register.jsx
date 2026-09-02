import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../services/authService';
import { getErrorMsg } from '../helpers/errorMsg';
import ErrorMessage from '../components/ErrorMessage';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await apiRegister({ name: form.name, email: form.email, password: form.password });
      // Backend uses Supabase auth — no token is returned until email is confirmed.
      // Show success message and redirect to login.
      setSuccess(res.data.message || 'Account created! Please check your email to confirm, then sign in.');
      setTimeout(() => navigate('/login'), 3500);
    } catch (err) { setError(getErrorMsg(err)); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🦐 AquaMitra</h1>
          <p>Smart Aquaculture Management System</p>
        </div>
        <h2>Create Account</h2>
        {success ? (
          <div className="alert alert-success">{success}</div>
        ) : (
          <>
        <ErrorMessage message={error} />
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required autoFocus />
          </div>
          <div className="form-group"><label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-row">
            <div className="form-group"><label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 chars" required />
            </div>
            <div className="form-group"><label>Confirm Password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="Repeat password" required />
            </div>
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
          </>
        )}
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
