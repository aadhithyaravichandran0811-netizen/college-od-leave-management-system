// ============================================================
// components.js — Shared UI components
// ============================================================

// ---- Toast Notifications ----
const Toast = {
  container: null,
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  show(message, type = 'default', duration = 4000) {
    if (!this.container) this.init();
    const icons = { success: '✓', error: '✕', warning: '⚠', default: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span style="flex:1">${message}</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
    this.container.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, duration);
  },
  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
};

// ---- Spinner ----
function spinner(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="animation:spin 0.8s linear infinite;flex-shrink:0">
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="32" stroke-dashoffset="12"/>
  </svg>`;
}

// ---- Status Badge ----
function statusBadge(status) {
  const map = {
    PENDING:           { cls: 'badge-pending',          label: 'Pending' },
    FACULTY_APPROVED:  { cls: 'badge-faculty-approved', label: 'Faculty Approved' },
    FACULTY_REJECTED:  { cls: 'badge-faculty-rejected', label: 'Faculty Rejected' },
    HOD_APPROVED:      { cls: 'badge-hod-approved',     label: 'HOD Approved' },
    HOD_REJECTED:      { cls: 'badge-hod-rejected',     label: 'HOD Rejected' },
    COMPLETED:         { cls: 'badge-completed',         label: 'Completed' },
    WITHDRAWN:         { cls: 'badge-withdrawn',         label: 'Withdrawn' },
  };
  const m = map[status] || { cls: '', label: status };
  return `<span class="badge ${m.cls}"><span class="badge-dot"></span>${m.label}</span>`;
}

// ---- Format Helpers ----
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtRelative(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function fmtPercent(n) { return `${n}%`; }

// ---- SVG Icons ----
const Icon = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  attendance: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
  od: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  leave: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  requests: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  students: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  faculty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 101.1-4"/><polyline points="3 3 3 9 9 9"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  reports: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  departments: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  analytics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  audit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`,
  print: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
};

// ---- Attendance Ring Chart ----
function attendanceRing(pct) {
  const color = pct >= 75 ? '#16a34a' : '#d97706';
  const r = 32; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return `<div class="attendance-ring">
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="6"/>
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="${color}" stroke-width="6"
        stroke-dasharray="${dash} ${circ - dash}" stroke-linecap="round"/>
    </svg>
    <span class="attendance-ring-value" style="color:${color}">${pct}%</span>
  </div>`;
}

// ---- Attendance Bar ----
function attendanceBar(pct) {
  const cls = pct >= 75 ? '' : 'warning';
  return `<div class="attendance-bar-container" style="width:100%">
    <div class="attendance-bar ${cls}" style="width:${pct}%"></div>
  </div>`;
}

// ---- Simple Bar Chart ----
function barChart(labels, values, color = 'var(--primary-light)') {
  const max = Math.max(...values, 1);
  const bars = values.map((v, i) => `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
      <span style="font-size:10px;color:var(--gray-500)">${v}</span>
      <div style="width:100%;height:${Math.round((v/max)*100)}px;background:${color};border-radius:3px 3px 0 0;min-height:4px"></div>
      <span style="font-size:9px;color:var(--gray-400)">${labels[i]}</span>
    </div>`).join('');
  return `<div style="display:flex;align-items:flex-end;gap:4px;height:140px;padding:0 4px">${bars}</div>`;
}

// ---- Approval Timeline ----
function approvalTimeline(request, type) {
  const history = API.getApprovalHistory(request.id);
  const getUser = id => id ? DB.findById('users', id) : null;

  const items = [];

  // Step 1: Submitted
  items.push({
    dot: 'approved',
    icon: '✓',
    title: 'Request Submitted',
    meta: `by Student · ${fmtDateTime(request.createdAt)}`,
    remarks: null,
  });

  // Step 2: Faculty
  const facAct = history.find(h => h.action.startsWith('FACULTY'));
  if (facAct) {
    const fUser = getUser(facAct.approverId);
    items.push({
      dot: facAct.action.includes('APPROVED') ? 'approved' : 'rejected',
      icon: facAct.action.includes('APPROVED') ? '✓' : '✕',
      title: `Faculty ${facAct.action.includes('APPROVED') ? 'Approved' : 'Rejected'}`,
      meta: `by ${fUser?.name || 'Faculty'} · ${fmtDateTime(facAct.createdAt)}`,
      remarks: facAct.remarks,
    });
  } else if (request.status === 'PENDING') {
    items.push({ dot: 'pending', icon: '…', title: 'Awaiting Faculty Review', meta: 'Pending', remarks: null });
  }

  // Step 3: HOD
  const hodAct = history.find(h => h.action.startsWith('HOD'));
  if (hodAct) {
    const hUser = getUser(hodAct.approverId);
    items.push({
      dot: hodAct.action.includes('APPROVED') ? 'approved' : 'rejected',
      icon: hodAct.action.includes('APPROVED') ? '✓' : '✕',
      title: `HOD ${hodAct.action.includes('APPROVED') ? 'Approved' : 'Rejected'}`,
      meta: `by ${hUser?.name || 'HOD'} · ${fmtDateTime(hodAct.createdAt)}`,
      remarks: hodAct.remarks,
    });
  } else if (request.status === 'FACULTY_APPROVED') {
    items.push({ dot: 'pending', icon: '…', title: 'Awaiting HOD Review', meta: 'Pending', remarks: null });
  }

  // Step 4: Attendance update
  if (request.attendanceUpdated) {
    items.push({ dot: 'approved', icon: '✓', title: 'Attendance Updated', meta: 'Automatically updated', remarks: null });
  }

  // Step: Withdrawn
  if (request.status === 'WITHDRAWN') {
    items.push({ dot: 'rejected', icon: '✕', title: 'Request Withdrawn', meta: `by Student · ${fmtDateTime(request.updatedAt)}`, remarks: 'Cancelled by student before review' });
  }

  return `<div class="approval-timeline">${items.map(item => `
    <div class="timeline-item">
      <div class="timeline-dot ${item.dot}">${item.icon}</div>
      <div class="timeline-content">
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-meta">${item.meta}</div>
        ${item.remarks ? `<div class="timeline-remarks">"${item.remarks}"</div>` : ''}
      </div>
    </div>`).join('')}</div>`;
}

// ---- Notification Panel ----
function renderNotifPanel(userId, onClose) {
  const notifs = API.getNotifications(userId);
  const unread = notifs.filter(n => !n.isRead);

  return `<div class="notif-panel" id="notif-panel">
    <div class="notif-header">
      <span class="notif-title">Notifications ${unread.length ? `<span style="background:var(--error);color:white;border-radius:10px;padding:1px 7px;font-size:11px;margin-left:6px">${unread.length}</span>` : ''}</span>
      ${unread.length ? `<button class="btn btn-ghost btn-sm" onclick="API.markAllRead('${userId}');document.getElementById('notif-panel')?.remove();App.notifPanelOpen=false;App.toggleNotifPanel()">Mark all read</button>` : ''}
    </div>
    <div class="notif-list">
      ${notifs.length === 0
        ? `<div class="notif-empty">🔔 No notifications yet</div>`
        : notifs.slice(0, 10).map(n => `
          <div class="notif-item ${n.isRead ? '' : 'unread'}" onclick="API.markNotifRead('${n.id}');this.classList.remove('unread');this.querySelector('.notif-dot').classList.add('hidden')">
            <div class="notif-dot ${n.isRead ? 'hidden' : ''}"></div>
            <div class="notif-text">
              <div class="notif-msg"><strong>${n.title}</strong><br>${n.message}</div>
              <div class="notif-time">${fmtRelative(n.createdAt)}</div>
            </div>
          </div>`).join('')}
    </div>
    <div class="notif-footer">
      <span class="text-muted text-small">${notifs.length} notifications total</span>
    </div>
  </div>`;
}

// ---- PDF Export helper ----
window.exportRequestPDF = function(requestId, type) {
  const request = type === 'OD' ? DB.findById('od_requests', requestId) : DB.findById('leave_requests', requestId);
  if (!request) return;
  const { user, profile, dept } = API.getStudentInfo(request.studentId);
  const isOD = type === 'OD';
  const history = API.getApprovalHistory(requestId);
  const getUser = id => id ? DB.findById('users', id) : null;

  const detailRows = isOD ? [
    ['Event / Activity', request.eventName],
    ['Venue', request.venue],
    ['OD Date', fmtDate(request.odDate)],
    ['Time', `${request.startTime} – ${request.endTime} (${request.hours}h)`],
    ['Reason', request.reason],
    ['Description', request.description || '—'],
    ['Status', request.status.replace(/_/g,' ')],
    ['Submitted', fmtDateTime(request.createdAt)],
    ['Document', request.documentName || 'None'],
  ] : [
    ['Leave Type', request.leaveType],
    ['From Date', fmtDate(request.fromDate)],
    ['To Date', fmtDate(request.toDate)],
    ['Duration', `${request.days} day${request.days > 1 ? 's' : ''}`],
    ['Reason', request.reason],
    ['Description', request.description || '—'],
    ['Status', request.status.replace(/_/g,' ')],
    ['Submitted', fmtDateTime(request.createdAt)],
    ['Document', request.documentName || 'None'],
  ];

  const historyRows = history.map(h => {
    const approver = getUser(h.approverId);
    return `<tr><td>${h.action.replace(/_/g,' ')}</td><td>${approver?.name || '—'}</td><td>${h.remarks || '—'}</td><td>${fmtDateTime(h.createdAt)}</td></tr>`;
  }).join('');

  const win = window.open('', '_blank', 'width=800,height=700');
  win.document.write(`<!DOCTYPE html><html><head>
    <title>${isOD ? 'OD' : 'Leave'} Request — ${requestId}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 32px; }
      .header { display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 20px; }
      .logo { width: 36px; height: 36px; background: #1d4ed8; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; }
      .title { font-size: 20px; font-weight: 700; color: #1d4ed8; }
      .subtitle { font-size: 11px; color: #6b7280; margin-top: 2px; }
      h2 { font-size: 13px; font-weight: 700; color: #1d4ed8; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: 0.05em; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th { background: #eff6ff; color: #1e40af; font-size: 11px; text-align: left; padding: 6px 10px; border: 1px solid #bfdbfe; }
      td { padding: 6px 10px; border: 1px solid #e5e7eb; vertical-align: top; }
      td:first-child { color: #6b7280; width: 35%; font-weight: 500; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
      .badge-approved { background: #dcfce7; color: #166534; }
      .badge-pending  { background: #fef9c3; color: #713f12; }
      .badge-rejected { background: #fee2e2; color: #991b1b; }
      .badge-withdrawn{ background: #f3f4f6; color: #374151; }
      .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
      @media print { .no-print { display: none; } }
    </style>
  </head><body>
    <div class="header">
      <div class="logo">E</div>
      <div><div class="title">EduLeave — ${isOD ? 'On-Duty (OD)' : 'Leave'} Request</div>
        <div class="subtitle">OD &amp; Leave Management System</div></div>
      <div style="margin-left:auto;text-align:right">
        <div style="font-size:10px;color:#6b7280">Request ID</div>
        <div style="font-family:monospace;font-weight:700">${requestId}</div>
      </div>
    </div>

    <h2>Student Information</h2>
    <table>
      <tr><td>Full Name</td><td><strong>${user?.name || '—'}</strong></td></tr>
      <tr><td>Roll Number</td><td>${profile?.rollNo || '—'}</td></tr>
      <tr><td>Department</td><td>${dept?.name || '—'}</td></tr>
      <tr><td>Year / Section</td><td>Year ${profile?.year} · Section ${profile?.section}</td></tr>
      <tr><td>Email</td><td>${user?.email || '—'}</td></tr>
    </table>

    <h2>${isOD ? 'OD' : 'Leave'} Request Details</h2>
    <table>${detailRows.map(([k,v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>

    ${historyRows ? `<h2>Approval History</h2>
    <table><thead><tr><th>Action</th><th>By</th><th>Remarks</th><th>Date</th></tr></thead>
    <tbody>${historyRows}</tbody></table>` : ''}

    <div class="footer">
      <span>Generated by EduLeave</span>
      <span>Printed on ${new Date().toLocaleString('en-IN')}</span>
    </div>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
};

// ---- Request Detail Modal ----
function renderRequestDetailModal(request, type, currentUser, onClose) {
  const { user, profile, dept } = API.getStudentInfo(request.studentId);
  const isOD = type === 'OD';
  const isHOD = currentUser.role === 'HOD';
  const isFaculty = currentUser.role === 'FACULTY';
  const isAdmin = currentUser.role === 'ADMIN';
  const isStudent = currentUser.role === 'STUDENT';
  const canAct = (isFaculty && request.status === 'PENDING') || (isHOD && request.status === 'FACULTY_APPROVED');
  const canWithdraw = isStudent && request.status === 'PENDING' && request.studentId === currentUser.id;

  return `<div class="modal-overlay" id="req-modal-overlay" onclick="if(event.target.id==='req-modal-overlay'){${onClose}}">
    <div class="modal modal-lg">
      <div class="modal-header">
        <span class="modal-title">${isOD ? 'OD' : 'Leave'} Request — ${request.id}</span>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn btn-secondary btn-sm" onclick="exportRequestPDF('${request.id}','${type}')" title="Download PDF" style="gap:5px">
            ${Icon.download} PDF
          </button>
          <button class="modal-close" onclick="${onClose}">×</button>
        </div>
      </div>
      <div class="modal-body">
        <div class="grid-2" style="gap:24px">
          <div>
            <div class="card mb-3">
              <div class="card-header"><span class="card-title">Student Information</span></div>
              <div class="card-body" style="padding:16px">
                <div class="flex gap-2 mb-3">
                  <div style="width:40px;height:40px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">${Auth.initials(user?.name)}</div>
                  <div>
                    <div style="font-weight:600;color:var(--gray-900)">${user?.name}</div>
                    <div class="text-muted text-small">${profile?.rollNo} · ${dept?.code}</div>
                  </div>
                </div>
                <table style="width:100%;font-size:var(--fs-xs);border-collapse:collapse">
                  <tr><td style="padding:4px 0;color:var(--gray-500)">Department</td><td style="padding:4px 0;font-weight:500">${dept?.name || '—'}</td></tr>
                  <tr><td style="padding:4px 0;color:var(--gray-500)">Year</td><td style="padding:4px 0;font-weight:500">Year ${profile?.year}</td></tr>
                  <tr><td style="padding:4px 0;color:var(--gray-500)">Section</td><td style="padding:4px 0;font-weight:500">Section ${profile?.section}</td></tr>
                  <tr><td style="padding:4px 0;color:var(--gray-500)">Email</td><td style="padding:4px 0;font-weight:500">${user?.email}</td></tr>
                </table>
              </div>
            </div>

            <div class="card">
              <div class="card-header"><span class="card-title">Request Details</span><div>${statusBadge(request.status)}</div></div>
              <div class="card-body" style="padding:16px">
                ${isOD ? `
                  <table style="width:100%;font-size:var(--fs-xs);border-collapse:collapse">
                    <tr><td style="padding:4px 0;color:var(--gray-500)">Event / Activity</td><td style="padding:4px 0;font-weight:600">${request.eventName}</td></tr>
                    <tr><td style="padding:4px 0;color:var(--gray-500)">Venue</td><td style="padding:4px 0;font-weight:500">${request.venue}</td></tr>
                    <tr><td style="padding:4px 0;color:var(--gray-500)">OD Date</td><td style="padding:4px 0;font-weight:500">${fmtDate(request.odDate)}</td></tr>
                    <tr><td style="padding:4px 0;color:var(--gray-500)">Time</td><td style="padding:4px 0;font-weight:500">${request.startTime} – ${request.endTime} (${request.hours}h)</td></tr>
                    <tr><td style="padding:4px 0;color:var(--gray-500)">Reason</td><td style="padding:4px 0;font-weight:500">${request.reason}</td></tr>
                    <tr><td style="padding:4px 0;color:var(--gray-500)">Submitted</td><td style="padding:4px 0;font-weight:500">${fmtDateTime(request.createdAt)}</td></tr>
                  </table>
                  ${request.description ? `<div class="mt-2" style="font-size:var(--fs-xs);padding:10px;background:var(--gray-50);border-radius:4px;color:var(--gray-700)">${request.description}</div>` : ''}
                ` : `
                  <table style="width:100%;font-size:var(--fs-xs);border-collapse:collapse">
                    <tr><td style="padding:4px 0;color:var(--gray-500)">Leave Type</td><td style="padding:4px 0;font-weight:600">${request.leaveType}</td></tr>
                    <tr><td style="padding:4px 0;color:var(--gray-500)">From Date</td><td style="padding:4px 0;font-weight:500">${fmtDate(request.fromDate)}</td></tr>
                    <tr><td style="padding:4px 0;color:var(--gray-500)">To Date</td><td style="padding:4px 0;font-weight:500">${fmtDate(request.toDate)}</td></tr>
                    <tr><td style="padding:4px 0;color:var(--gray-500)">Duration</td><td style="padding:4px 0;font-weight:500">${request.days} day${request.days > 1 ? 's' : ''}</td></tr>
                    <tr><td style="padding:4px 0;color:var(--gray-500)">Reason</td><td style="padding:4px 0;font-weight:500">${request.reason}</td></tr>
                    <tr><td style="padding:4px 0;color:var(--gray-500)">Submitted</td><td style="padding:4px 0;font-weight:500">${fmtDateTime(request.createdAt)}</td></tr>
                  </table>
                  ${request.description ? `<div class="mt-2" style="font-size:var(--fs-xs);padding:10px;background:var(--gray-50);border-radius:4px;color:var(--gray-700)">${request.description}</div>` : ''}
                `}
                ${request.documentName ? `
                  <div class="mt-2 flex gap-2" style="align-items:center;padding:8px 12px;background:var(--info-light);border-radius:var(--r-md)">
                    <span>${Icon.file}</span>
                    <span style="font-size:var(--fs-xs);font-weight:500;color:var(--info)">${request.documentName}</span>
                  </div>` : ''}
              </div>
            </div>
          </div>

          <div>
            <div class="card mb-3">
              <div class="card-header"><span class="card-title">Approval Timeline</span></div>
              <div class="card-body" style="padding:16px">
                ${approvalTimeline(request, type)}
              </div>
            </div>

            ${canAct ? `
            <div class="card" id="action-card">
              <div class="card-header"><span class="card-title">${isHOD ? 'HOD' : 'Faculty'} Action</span></div>
              <div class="card-body" style="padding:16px">
                <div class="form-group mb-3">
                  <label class="form-label">Remarks <span class="required">*</span></label>
                  <textarea id="modal-remarks" class="form-control" placeholder="Add your remarks or reason for rejection..." rows="3"></textarea>
                </div>
                <div class="flex gap-2">
                  <button class="btn btn-success" style="flex:1" onclick="handleModalApprove('${request.id}','${type}',${isHOD})">
                    ${Icon.check} Approve
                  </button>
                  <button class="btn btn-danger" style="flex:1" onclick="handleModalReject('${request.id}','${type}',${isHOD})">
                    ${Icon.x} Reject
                  </button>
                </div>
              </div>
            </div>` : ''}

            ${canWithdraw ? `
            <div class="card" style="border-color:var(--error-light)">
              <div class="card-header" style="background:var(--error-light)"><span class="card-title" style="color:var(--error)">Withdraw Request</span></div>
              <div class="card-body" style="padding:16px">
                <p style="font-size:var(--fs-xs);color:var(--gray-600);margin-bottom:12px">This will cancel your request before it is reviewed. This action cannot be undone.</p>
                <button class="btn btn-danger" style="width:100%" onclick="handleWithdrawRequest('${request.id}','${type}')">
                  ${Icon.trash} Withdraw This Request
                </button>
              </div>
            </div>` : ''}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ---- File Upload Component ----
function fileUploadComponent(inputId, onFileSelect) {
  return `<div class="file-upload-area" id="${inputId}_area" onclick="document.getElementById('${inputId}').click()" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="this.classList.remove('dragover')" ondrop="handleFileDrop(event,'${inputId}')">
    <div class="file-upload-icon">📎</div>
    <div class="file-upload-text">
      <strong>Click to upload</strong> or drag and drop<br>
      <span style="font-size:11px;color:var(--gray-400)">PDF, JPG, PNG · Max 10MB</span>
    </div>
    <input type="file" id="${inputId}" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="handleFileInput(event,'${inputId}')">
  </div>
  <div id="${inputId}_preview" style="display:none"></div>`;
}

// ---- Global file handlers ----
window._uploadedFiles = {};

window.handleFileInput = function(event, inputId) {
  const file = event.target.files[0];
  if (!file) return;
  validateAndStoreFile(file, inputId);
};

window.handleFileDrop = function(event, inputId) {
  event.preventDefault();
  document.getElementById(inputId + '_area').classList.remove('dragover');
  const file = event.dataTransfer.files[0];
  if (!file) return;
  validateAndStoreFile(file, inputId);
};

function validateAndStoreFile(file, inputId) {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowed.includes(file.type)) { Toast.error('Invalid file type. Only PDF, JPG, PNG allowed.'); return; }
  if (file.size > 10 * 1024 * 1024) { Toast.error('File too large. Maximum size is 10MB.'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    window._uploadedFiles[inputId] = { name: file.name, data: e.target.result, type: file.type };
    const area = document.getElementById(inputId + '_area');
    const preview = document.getElementById(inputId + '_preview');
    if (area) area.style.display = 'none';
    if (preview) {
      preview.style.display = 'block';
      preview.innerHTML = `<div class="file-uploaded">
        <span>📄</span>
        <span>${file.name} <span style="color:var(--gray-400)">(${(file.size/1024).toFixed(1)}KB)</span></span>
        <button onclick="clearFile('${inputId}')">×</button>
      </div>`;
    }
  };
  reader.readAsDataURL(file);
}

window.clearFile = function(inputId) {
  delete window._uploadedFiles[inputId];
  const area = document.getElementById(inputId + '_area');
  const preview = document.getElementById(inputId + '_preview');
  if (area) area.style.display = 'block';
  if (preview) { preview.style.display = 'none'; preview.innerHTML = ''; }
  const input = document.getElementById(inputId);
  if (input) input.value = '';
};

// ---- Modal Approve/Reject handlers (global) ----
window.handleModalApprove = function(requestId, type, isHOD) {
  const remarks = document.getElementById('modal-remarks')?.value?.trim();
  if (!remarks) { Toast.error('Please add remarks before approving.'); return; }
  const user = Auth.getCurrentUser();
  try {
    if (type === 'OD') API.approveOD(requestId, user.id, remarks, isHOD);
    else API.approveLeave(requestId, user.id, remarks, isHOD);
    Toast.success('Request approved successfully.');
    document.getElementById('req-modal-overlay')?.remove();
    App.navigate(App.currentPage);
  } catch(e) { Toast.error(e.message); }
};

window.handleModalReject = function(requestId, type, isHOD) {
  const remarks = document.getElementById('modal-remarks')?.value?.trim();
  if (!remarks) { Toast.error('Please add a reason for rejection.'); return; }
  const user = Auth.getCurrentUser();
  try {
    if (type === 'OD') API.rejectOD(requestId, user.id, remarks, isHOD);
    else API.rejectLeave(requestId, user.id, remarks, isHOD);
    Toast.success('Request rejected.');
    document.getElementById('req-modal-overlay')?.remove();
    App.navigate(App.currentPage);
  } catch(e) { Toast.error(e.message); }
};

window.handleWithdrawRequest = function(requestId, type) {
  if (!confirm('Are you sure you want to withdraw this request? This action cannot be undone.')) return;
  const user = Auth.getCurrentUser();
  try {
    if (type === 'OD') API.withdrawOD(requestId, user.id);
    else API.withdrawLeave(requestId, user.id);
    Toast.success('Request withdrawn successfully.');
    document.getElementById('req-modal-overlay')?.remove();
    App.navigate(App.currentPage);
  } catch(e) { Toast.error(e.message); }
};
