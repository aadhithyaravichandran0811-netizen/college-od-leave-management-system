// Shared utility functions
export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fmtRelative(d) {
  if (!d) return '';
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getStatusBadge(status) {
  const map = {
    PENDING: { label: 'Pending', cls: 'badge-pending' },
    FACULTY_APPROVED: { label: 'Faculty Approved', cls: 'badge-approved' },
    FACULTY_REJECTED: { label: 'Faculty Rejected', cls: 'badge-rejected' },
    HOD_APPROVED: { label: 'HOD Approved', cls: 'badge-approved' },
    HOD_REJECTED: { label: 'HOD Rejected', cls: 'badge-rejected' },
    WITHDRAWN: { label: 'Withdrawn', cls: 'badge-default' },
  };
  const s = map[status] || { label: status, cls: 'badge-default' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function getAttBarClass(pct) {
  if (pct >= 75) return 'good';
  if (pct >= 60) return 'warning';
  return 'bad';
}

export function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
