import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { fmtRelative } from '../utils/helpers';

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="8" fill="#1d4ed8"/>
    <path d="M10 20L17 27L30 13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function NavItem({ to, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
    >
      {icon}
      <span>{label}</span>
      {badge ? <span className="sidebar-badge">{badge}</span> : null}
    </NavLink>
  );
}

function NotifPanel({ onClose }) {
  const [notifs, setNotifs] = useState([]);
  const ref = useRef();

  useEffect(() => {
    api.get('/notifications').then(r => setNotifs(r.data)).catch(() => {});
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const typeColor = { SUCCESS: 'var(--success)', ERROR: 'var(--error)', WARNING: 'var(--warning)', INFO: 'var(--primary)' };
  const typeIcon = { SUCCESS: '✓', ERROR: '✕', WARNING: '⚠', INFO: 'ℹ' };

  return (
    <div ref={ref} className="notif-panel">
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
        <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{notifs.filter(n => !n.isRead).length} unread</span>
      </div>
      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        {notifs.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px' }}>No notifications</div>
        ) : notifs.slice(0, 8).map(n => (
          <div
            key={n._id}
            onClick={() => markRead(n._id)}
            style={{
              display: 'flex', gap: '10px', padding: '12px 14px',
              borderBottom: '1px solid var(--gray-50)',
              background: n.isRead ? 'white' : 'var(--primary-muted)',
              cursor: 'pointer', transition: 'background 0.1s',
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: typeColor[n.type] || 'var(--gray-300)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {typeIcon[n.type] || 'ℹ'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '12px', color: 'var(--gray-900)', marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--gray-500)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
              <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: 4 }}>{fmtRelative(n.createdAt)}</div>
            </div>
            {!n.isRead && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Layout({ children, navItems }) {
  const { user, logout, initials } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
    const interval = setInterval(() => {
      api.get('/notifications/unread-count').then(r => setUnread(r.data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {sidebarOpen && <div className="sidebar-overlay visible" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar${sidebarOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <Logo />
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">EduLeave</div>
            <div className="sidebar-brand-sub">OD &amp; Leave Management</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems(unread)}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials(user?.name)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="topbar-btn mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="topbar-breadcrumb">EduLeave</div>
          <div className="topbar-actions">
            <div style={{ position: 'relative' }}>
              <button className="topbar-btn" onClick={() => setShowNotif(v => !v)} title="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                {unread > 0 && <div className="topbar-notif-dot" />}
              </button>
              {showNotif && <NotifPanel onClose={() => setShowNotif(false)} />}
            </div>
            <NavLink to="/profile" className="topbar-btn" style={{ fontSize: '11px', fontWeight: 700, background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }}>
              {initials(user?.name)}
            </NavLink>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
