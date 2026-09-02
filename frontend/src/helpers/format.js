export function fmt(n, decimals = 2) {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: decimals });
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

export function fmtCurrency(n) {
  if (n == null) return '—';
  return '₹' + fmt(n);
}
