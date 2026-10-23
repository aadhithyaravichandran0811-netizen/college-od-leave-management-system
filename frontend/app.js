// ============================================================
// app.js — Application router and shell
// ============================================================

const App = {
  currentPage: 'dashboard',
  notifPanelOpen: false,

  async init() {
    // Seed database if needed
    await seedDatabase();

    // Hide loading screen
    const loading = document.getElementById('loading-screen');
    loading.classList.add('hidden');
    setTimeout(() => loading.remove(), 400);

    // Toast init
    Toast.init();

    // Check session
    if (Auth.isLoggedIn()) {
      this.navigate('dashboard');
    } else {
      this.navigate('login');
    }

    // Close notif panel on outside click
    document.addEventListener('click', (e) => {
      if (this.notifPanelOpen) {
        const panel = document.getElementById('notif-panel');
        const btn = document.getElementById('notif-btn');
        if (panel && !panel.contains(e.target) && !btn?.contains(e.target)) {
          panel.remove();
          this.notifPanelOpen = false;
        }
      }
    });
  },

  navigate(page) {
    if (page !== 'login' && !Auth.isLoggedIn()) {
      this.navigate('login');
      return;
    }
    if (page === 'login' && Auth.isLoggedIn()) {
      page = 'dashboard';
    }

    this.currentPage = page;
    const user = Auth.getCurrentUser();

    if (page === 'login') {
      document.getElementById('page-root').innerHTML = '';
      renderLoginPage();
      return;
    }

    // Role guard
    if (!this.canAccess(page, user.role)) {
      Toast.error('You do not have permission to access this page.');
      this.navigate('dashboard');
      return;
    }

    this.renderShell(user, page);
  },

  canAccess(page, role) {
    const studentPages = ['dashboard','attendance','apply-od','apply-leave','my-requests','notifications','profile'];
    const facultyPages = ['dashboard','pending-requests','pending-od','pending-leave','students','faculty-attendance','history','notifications','profile'];
    const adminPages = ['dashboard','all-requests','admin-students','admin-faculty','departments','admin-attendance','analytics','settings','audit-logs','notifications','profile'];

    if (role === 'STUDENT') return studentPages.includes(page);
    if (role === 'FACULTY') return [...facultyPages, ...adminPages.filter(p => !['admin-students','admin-faculty','departments','settings'].includes(p))].includes(page);
    if (role === 'HOD') return [...facultyPages, 'pending-requests', 'pending-od', 'pending-leave', ...adminPages].includes(page);
    if (role === 'ADMIN') return true;
    return false;
  },

  renderShell(user, activePage) {
    const root = document.getElementById('page-root');
    const nav = this.getNav(user.role, activePage);
    const unreadCount = API.getUnreadCount(user.id);
    const pageTitle = this.getPageTitle(activePage);

    root.innerHTML = `
    <div class="app-shell">
      <div class="sidebar-overlay" id="sidebar-overlay" onclick="App.closeSidebar()"></div>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#1d4ed8"/>
            <path d="M10 20L17 27L30 13" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="sidebar-brand-text">
            <div class="sidebar-brand-name">EduLeave</div>
            <div class="sidebar-brand-sub">OD &amp; Leave Management</div>
          </div>
        </div>
        <nav class="sidebar-nav">
          ${nav}
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-user">
            <div class="sidebar-avatar">${Auth.initials(user.name)}</div>
            <div class="sidebar-user-info">
              <div class="sidebar-user-name">${user.name}</div>
              <div class="sidebar-user-role">${user.role === 'HOD' ? 'HOD' : user.role.charAt(0) + user.role.slice(1).toLowerCase()}</div>
            </div>
          </div>
          <button class="sidebar-logout" onclick="App.logout()">
            ${Icon.logout} Sign out
          </button>
        </div>
      </aside>

      <div class="main-content">
        <header class="topbar">
          <button class="mobile-menu-btn" id="mobile-menu-btn" onclick="App.openSidebar()">
            ${Icon.menu}
          </button>
          <div class="topbar-breadcrumb">
            <strong>${pageTitle}</strong>
          </div>
          <div class="topbar-actions">
            <div style="position:relative">
              <button class="topbar-btn" id="notif-btn" onclick="App.toggleNotifPanel()" title="Notifications">
                ${Icon.bell}
                ${unreadCount > 0 ? '<div class="topbar-notif-dot"></div>' : ''}
              </button>
            </div>
            <button class="topbar-btn" onclick="App.navigate('profile')" title="Profile" style="font-size:11px;font-weight:700;background:var(--primary);color:white;border-color:var(--primary)">
              ${Auth.initials(user.name)}
            </button>
          </div>
        </header>
        <div class="page-content" id="page-content">
          <div style="display:flex;align-items:center;justify-content:center;height:200px">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>
    </div>`;

    // Render page content
    setTimeout(() => this.renderPage(activePage, user), 50);
  },

  renderPage(page, user) {
    const content = document.getElementById('page-content');
    if (!content) return;

    let html = '';
    try {
      switch(page) {
        // Student pages
        case 'dashboard':
          if (user.role === 'STUDENT') html = renderStudentDashboard(user);
          else if (['FACULTY','HOD'].includes(user.role)) html = renderFacultyDashboard(user);
          else html = renderAdminDashboard(user);
          break;
        case 'attendance': html = renderStudentAttendance(user); break;
        case 'apply-od':   html = renderApplyOD(user); break;
        case 'apply-leave':html = renderApplyLeave(user); break;
        case 'my-requests':html = renderMyRequests(user); break;
        case 'profile':    html = user.role === 'STUDENT' ? renderStudentProfile(user) : renderFacultyProfile(user); break;
        // Faculty/HOD pages
        case 'pending-requests': html = renderPendingRequests(user, 'all'); break;
        case 'pending-od':       html = renderPendingRequests(user, 'od'); break;
        case 'pending-leave':    html = renderPendingRequests(user, 'leave'); break;
        case 'students':         html = renderFacultyStudents(user); break;
        case 'faculty-attendance': html = renderFacultyAttendance(user); break;
        case 'history':          html = renderFacultyHistory(user); break;
        // Admin pages
        case 'all-requests':     html = renderAdminRequests(user); break;
        case 'admin-students':   html = renderAdminStudents(); break;
        case 'admin-faculty':    html = renderAdminFaculty(); break;
        case 'departments':      html = renderDepartments(); break;
        case 'admin-attendance': html = renderFacultyAttendance(user); break;
        case 'analytics':        html = renderAnalytics(); break;
        case 'audit-logs':       html = renderAuditLogs(); break;
        case 'settings':         html = renderSettings(user); break;
        case 'notifications':    html = renderNotificationsPage(user); break;
        default: html = `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">Page not found</div></div>`;
      }
    } catch(err) {
      console.error('Page render error:', err);
      html = `<div class="alert alert-error">Failed to load page: ${err.message}</div>`;
    }

    content.innerHTML = html;

    // Re-run inline scripts
    content.querySelectorAll('script').forEach(s => {
      const ns = document.createElement('script');
      ns.textContent = s.textContent;
      document.body.appendChild(ns);
      document.body.removeChild(ns);
    });
  },

  getPageTitle(page) {
    const titles = {
      dashboard: 'Dashboard', attendance: 'My Attendance', 'apply-od': 'Apply OD', 'apply-leave': 'Apply Leave',
      'my-requests': 'My Requests', profile: 'My Profile', 'pending-requests': 'Pending Requests',
      'pending-od': 'Pending OD', 'pending-leave': 'Pending Leave', students: 'Students',
      'faculty-attendance': 'Student Attendance', history: 'Request History',
      'all-requests': 'All Requests', 'admin-students': 'Students', 'admin-faculty': 'Faculty',
      departments: 'Departments', 'admin-attendance': 'Attendance', analytics: 'Analytics',
      'audit-logs': 'Audit Logs', settings: 'Settings', notifications: 'Notifications',
    };
    return titles[page] || 'EduLeave';
  },

  getNav(role, activePage) {
    const item = (page, icon, label, badge) => {
      const active = activePage === page ? 'active' : '';
      return `<button class="sidebar-item ${active}" onclick="App.navigate('${page}')">
        ${icon}
        <span>${label}</span>
        ${badge ? `<span class="sidebar-badge">${badge}</span>` : ''}
      </button>`;
    };

    const user = Auth.getCurrentUser();
    const unread = user ? API.getUnreadCount(user.id) : 0;

    if (role === 'STUDENT') {
      return `
        <div class="sidebar-section">
          ${item('dashboard', Icon.dashboard, 'Dashboard')}
          ${item('attendance', Icon.attendance, 'My Attendance')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Applications</div>
          ${item('apply-od', Icon.od, 'Apply OD')}
          ${item('apply-leave', Icon.leave, 'Apply Leave')}
          ${item('my-requests', Icon.requests, 'My Requests')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Account</div>
          ${item('notifications', Icon.bell, 'Notifications', unread || '')}
          ${item('profile', Icon.profile, 'My Profile')}
        </div>`;
    }

    if (role === 'FACULTY') {
      const pendingOD = API.getPendingODRequests(user.id).length;
      const pendingLeave = API.getPendingLeaveRequests(user.id).length;
      const pending = pendingOD + pendingLeave;
      return `
        <div class="sidebar-section">
          ${item('dashboard', Icon.dashboard, 'Dashboard')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Requests</div>
          ${item('pending-requests', Icon.requests, 'Pending Requests', pending || '')}
          ${item('pending-od', Icon.od, 'OD Requests', pendingOD || '')}
          ${item('pending-leave', Icon.leave, 'Leave Requests', pendingLeave || '')}
          ${item('history', Icon.history, 'History')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Students</div>
          ${item('students', Icon.students, 'Students')}
          ${item('faculty-attendance', Icon.attendance, 'Attendance')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Account</div>
          ${item('notifications', Icon.bell, 'Notifications', unread || '')}
          ${item('profile', Icon.profile, 'Profile')}
        </div>`;
    }

    if (role === 'HOD') {
      const { od, leave } = API.getHODPendingRequests(user.id);
      const pending = od.length + leave.length;
      return `
        <div class="sidebar-section">
          ${item('dashboard', Icon.dashboard, 'Dashboard')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Requests</div>
          ${item('pending-requests', Icon.requests, 'Pending Review', pending || '')}
          ${item('pending-od', Icon.od, 'OD Requests', od.length || '')}
          ${item('pending-leave', Icon.leave, 'Leave Requests', leave.length || '')}
          ${item('history', Icon.history, 'History')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Management</div>
          ${item('students', Icon.students, 'Students')}
          ${item('admin-attendance', Icon.attendance, 'Attendance')}
          ${item('all-requests', Icon.audit, 'All Requests')}
          ${item('analytics', Icon.analytics, 'Analytics')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Account</div>
          ${item('notifications', Icon.bell, 'Notifications', unread || '')}
          ${item('profile', Icon.profile, 'Profile')}
        </div>`;
    }

    if (role === 'ADMIN') {
      return `
        <div class="sidebar-section">
          ${item('dashboard', Icon.dashboard, 'Dashboard')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Requests</div>
          ${item('all-requests', Icon.requests, 'All Requests')}
          ${item('audit-logs', Icon.audit, 'Audit Logs')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">People</div>
          ${item('admin-students', Icon.students, 'Students')}
          ${item('admin-faculty', Icon.faculty, 'Faculty')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">Academic</div>
          ${item('admin-attendance', Icon.attendance, 'Attendance')}
          ${item('departments', Icon.departments, 'Departments')}
          ${item('analytics', Icon.analytics, 'Analytics')}
        </div>
        <div class="sidebar-section">
          <div class="sidebar-section-label">System</div>
          ${item('settings', Icon.settings, 'Settings')}
          ${item('notifications', Icon.bell, 'Notifications', unread || '')}
          ${item('profile', Icon.profile, 'Profile')}
        </div>`;
    }

    return '';
  },

  toggleNotifPanel() {
    const notifBtn = document.getElementById('notif-btn');
    const existing = document.getElementById('notif-panel');
    if (existing) {
      existing.remove();
      this.notifPanelOpen = false;
      return;
    }
    const user = Auth.getCurrentUser();
    notifBtn.insertAdjacentHTML('afterend', renderNotifPanel(user.id));
    this.notifPanelOpen = true;
  },

  openSidebar() {
    document.getElementById('sidebar')?.classList.add('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.add('visible');
  },
  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebar-overlay')?.classList.remove('visible');
  },

  logout() {
    Auth.logout();
    Toast.show('You have been signed out.', 'default');
    setTimeout(() => this.navigate('login'), 300);
  },
};

// ---- Faculty profile ----
function renderFacultyProfile(user) {
  const profile = user.profile;
  const dept = profile ? DB.findById('departments', profile.departmentId) : null;

  return `
  <div class="page-header">
    <h1 class="page-title">My Profile</h1>
  </div>

  <div class="profile-header">
    <div class="profile-avatar" style="background:var(--secondary)">${Auth.initials(user.name)}</div>
    <div>
      <div class="profile-name">${user.name}</div>
      <div class="profile-meta">${profile?.designation} · ${dept?.name || ''}</div>
      <div class="profile-badges">
        <span class="role-chip ${user.role.toLowerCase()}">${user.role}</span>
        <span class="badge" style="background:var(--success-light);color:var(--success)">Active</span>
      </div>
    </div>
  </div>

  <div class="grid-2" style="gap:20px">
    <div class="card">
      <div class="card-header"><span class="card-title">Personal Information</span></div>
      <div class="card-body">
        <table style="width:100%;border-collapse:collapse;font-size:var(--fs-sm)">
          <tr><td style="padding:10px 0;color:var(--gray-500);width:40%">Full Name</td><td style="padding:10px 0;font-weight:500">${user.name}</td></tr>
          <tr style="border-top:1px solid var(--gray-100)"><td style="padding:10px 0;color:var(--gray-500)">Email</td><td style="padding:10px 0;font-weight:500">${user.email}</td></tr>
          <tr style="border-top:1px solid var(--gray-100)"><td style="padding:10px 0;color:var(--gray-500)">Phone</td><td style="padding:10px 0;font-weight:500">${user.phone || '—'}</td></tr>
          <tr style="border-top:1px solid var(--gray-100)"><td style="padding:10px 0;color:var(--gray-500)">Role</td><td style="padding:10px 0"><span class="role-chip ${user.role.toLowerCase()}">${user.role}</span></td></tr>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Professional Information</span></div>
      <div class="card-body">
        <table style="width:100%;border-collapse:collapse;font-size:var(--fs-sm)">
          <tr><td style="padding:10px 0;color:var(--gray-500);width:40%">Employee ID</td><td style="padding:10px 0;font-weight:600;font-family:monospace">${profile?.employeeId || '—'}</td></tr>
          <tr style="border-top:1px solid var(--gray-100)"><td style="padding:10px 0;color:var(--gray-500)">Department</td><td style="padding:10px 0;font-weight:500">${dept?.name || '—'}</td></tr>
          <tr style="border-top:1px solid var(--gray-100)"><td style="padding:10px 0;color:var(--gray-500)">Designation</td><td style="padding:10px 0;font-weight:500">${profile?.designation || '—'}</td></tr>
        </table>
      </div>
    </div>
  </div>`;
}

// ---- Notifications page ----
function renderNotificationsPage(user) {
  const notifs = API.getNotifications(user.id);
  const typeIcon = { SUCCESS: '✓', ERROR: '✕', WARNING: '⚠', INFO: 'ℹ' };
  const typeColor = { SUCCESS: 'var(--success)', ERROR: 'var(--error)', WARNING: 'var(--warning)', INFO: 'var(--info)' };

  return `
  <div class="page-header flex-between">
    <div>
      <h1 class="page-title">Notifications</h1>
      <p class="page-subtitle">${notifs.filter(n => !n.isRead).length} unread notifications</p>
    </div>
    ${notifs.some(n => !n.isRead) ? `<button class="btn btn-secondary" onclick="API.markAllRead('${user.id}');App.navigate('notifications')">Mark all read</button>` : ''}
  </div>

  <div class="card" style="max-width:700px">
    ${notifs.length === 0
      ? `<div class="empty-state"><div class="empty-state-icon">🔔</div><div class="empty-state-title">No notifications</div><div class="empty-state-sub">You'll see status updates for your requests here</div></div>`
      : notifs.map(n => `
        <div style="display:flex;gap:14px;padding:16px 20px;border-bottom:1px solid var(--gray-100);background:${n.isRead ? 'white' : 'var(--primary-muted)'};cursor:pointer;transition:background 0.1s" onclick="API.markNotifRead('${n.id}');this.style.background='white'">
          <div style="width:36px;height:36px;border-radius:50%;background:${typeColor[n.type] || 'var(--gray-200)'};color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0">
            ${typeIcon[n.type] || 'ℹ'}
          </div>
          <div style="flex:1">
            <div style="font-weight:${n.isRead ? '500' : '600'};font-size:var(--fs-sm);color:var(--gray-900);margin-bottom:3px">${n.title}</div>
            <div style="font-size:var(--fs-xs);color:var(--gray-600);line-height:1.5">${n.message}</div>
            <div style="font-size:10px;color:var(--gray-400);margin-top:6px">${fmtRelative(n.createdAt)} · ${fmtDateTime(n.createdAt)}</div>
          </div>
          ${!n.isRead ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex-shrink:0;margin-top:8px"></div>' : ''}
        </div>`).join('')}
  </div>`;
}

// ---- Start the app ----
window.addEventListener('DOMContentLoaded', () => App.init());
