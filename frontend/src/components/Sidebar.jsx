import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard',     icon: '🏠', label: 'Dashboard' },
  { to: '/ponds',         icon: '🏊', label: 'My Ponds' },
  { to: '/market-prices', icon: '🏷️', label: 'Live Market' },
  { to: '/jobs',          icon: '💼', label: 'Jobs & Workers' },
  { to: '/equipment',     icon: '⚙️', label: 'Machinery & Gear' },
  { to: '/hatcheries',         icon: '🧬', label: 'Hatchery & Seed' },
  { to: '/disease-monitoring', icon: '🔬', label: 'Disease Screening' },
  { to: '/prevention',         icon: '🛡️', label: 'Health & Prevention' },
  { to: '/ml-prediction',      icon: '🤖', label: 'ML Prediction' },
  { to: '/ai-assistant',  icon: '💬', label: 'AI Assistant' },
  { to: '/profile',       icon: '👤', label: 'Profile' },
];

export default function Sidebar({ isOpen, onClose }) {

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
        <div className="sidebar-footer" style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></span>
            <span>AquaMitra Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}
