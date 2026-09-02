import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout as apiLogout } from '../services/authService';

const links = [
  { to: '/dashboard',    icon: '🏠', label: 'Dashboard' },
  { to: '/ponds',        icon: '🏊', label: 'My Ponds' },
  { to: '/ml-prediction',icon: '🤖', label: 'ML Prediction' },
  { to: '/ai-assistant', icon: '💬', label: 'AI Assistant' },
  { to: '/profile',      icon: '👤', label: 'Profile' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await apiLogout(); } catch {}
    logout();
    navigate('/login');
  }

  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.3)',zIndex:99 }} />}
      <aside className={'sidebar' + (isOpen ? ' open' : '')}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">🦐 AquaMitra</div>
          <div className="sidebar-brand-tag">Smart Aquaculture Management</div>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-title">Navigation</div>
          {links.map(l => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')} onClick={onClose}>
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
        </div>
        <div className="sidebar-footer">
          <button className="btn btn-secondary btn-sm btn-full" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>
    </>
  );
}
