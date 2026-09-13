import { useAuth } from '../context/AuthContext';

export default function Header({ title, onMenuClick }) {
  const { user } = useAuth();
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'U';

  return (
    <header className="header">
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button className="btn-icon mobile-menu-btn" onClick={onMenuClick} id="menu-btn"
          aria-label="Open menu">☰</button>
        <span className="header-title">{title}</span>
      </div>
      <div className="header-user">
        <div className="header-avatar">{initials}</div>
        <span style={{ fontSize:13, display:'none', color:'var(--text-secondary)' }}>{user?.name}</span>
      </div>
    </header>
  );
}
