export default function StatCard({ label, value, sub, icon, color = 'var(--primary)' }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="stat-card-label">{label}</span>
        {icon && <span style={{ fontSize: 22, opacity: .6 }}>{icon}</span>}
      </div>
      <div className="stat-card-value" style={{ color }}>{value ?? '—'}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  );
}
