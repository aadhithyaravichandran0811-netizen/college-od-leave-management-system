// ============================================================
// pages/student.js — All student pages
// ============================================================

// ---- Student Dashboard ----
function renderStudentDashboard(user) {
  const odRequests = API.getMyODRequests(user.id);
  const leaveRequests = API.getMyLeaveRequests(user.id);
  const allRequests = [...odRequests, ...leaveRequests];
  const attendance = API.getStudentAttendance(user.id);
  const summary = API.computeAttendanceSummary(attendance);
  const pending = allRequests.filter(r => r.status === 'PENDING').length;
  const approved = allRequests.filter(r => ['HOD_APPROVED','FACULTY_APPROVED'].includes(r.status)).length;
  const rejected = allRequests.filter(r => ['HOD_REJECTED','FACULTY_REJECTED'].includes(r.status)).length;
  const recent = allRequests.slice(0, 5);

  return `
  <div class="page-header flex-between">
    <div>
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Good ${greeting()}, ${user.name.split(' ')[0]}! Here's your overview.</p>
    </div>
    <div class="flex gap-2">
      <button class="btn btn-secondary" onclick="App.navigate('apply-od')">${Icon.od} Apply OD</button>
      <button class="btn btn-primary" onclick="App.navigate('apply-leave')">${Icon.leave} Apply Leave</button>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat-card primary">
      <div class="stat-icon">${Icon.attendance}</div>
      <div class="stat-label">Attendance</div>
      <div class="stat-value">${summary.percentage}%</div>
      <div class="stat-sublabel">${summary.present} present / ${summary.total} total</div>
    </div>
    <div class="stat-card warning">
      <div class="stat-icon">${Icon.od}</div>
      <div class="stat-label">Pending</div>
      <div class="stat-value">${pending}</div>
      <div class="stat-sublabel">Awaiting review</div>
    </div>
    <div class="stat-card success">
      <div class="stat-icon">${Icon.check}</div>
      <div class="stat-label">Approved</div>
      <div class="stat-value">${approved}</div>
      <div class="stat-sublabel">Total approved</div>
    </div>
    <div class="stat-card error">
      <div class="stat-icon">${Icon.x}</div>
      <div class="stat-label">Rejected</div>
      <div class="stat-value">${rejected}</div>
      <div class="stat-sublabel">Total rejected</div>
    </div>
  </div>

  <div class="grid-2" style="gap:20px;margin-bottom:20px">
    <div class="card">
      <div class="card-header">
        <span class="card-title">Attendance Summary</span>
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('attendance')">View details →</button>
      </div>
      <div class="card-body">
        <div class="flex-center" style="gap:24px;flex-wrap:wrap">
          ${attendanceRing(summary.percentage)}
          <div style="flex:1;min-width:120px">
            <div class="flex-between mb-2" style="font-size:var(--fs-xs)">
              <span style="color:var(--gray-500)">Present</span>
              <span style="font-weight:600;color:var(--success)">${summary.present}</span>
            </div>
            <div class="flex-between mb-2" style="font-size:var(--fs-xs)">
              <span style="color:var(--gray-500)">Absent</span>
              <span style="font-weight:600;color:var(--error)">${summary.absent}</span>
            </div>
            <div class="flex-between mb-2" style="font-size:var(--fs-xs)">
              <span style="color:var(--gray-500)">On Duty</span>
              <span style="font-weight:600;color:var(--info)">${summary.od}</span>
            </div>
            <div class="flex-between" style="font-size:var(--fs-xs)">
              <span style="color:var(--gray-500)">Leave</span>
              <span style="font-weight:600;color:var(--accent)">${summary.leave}</span>
            </div>
          </div>
        </div>
        ${summary.total > 0 && summary.percentage < 75 ? `<div class="alert alert-warning mt-2" style="margin-bottom:0">
          ⚠ Your attendance is below 75%. Apply OD or leave carefully.
        </div>` : ''}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Quick Actions</span>
      </div>
      <div class="card-body" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button class="btn btn-primary btn-lg" style="flex-direction:column;height:72px;gap:6px" onclick="App.navigate('apply-od')">
          ${Icon.od}<span style="font-size:var(--fs-xs)">Apply OD</span>
        </button>
        <button class="btn btn-secondary btn-lg" style="flex-direction:column;height:72px;gap:6px" onclick="App.navigate('apply-leave')">
          ${Icon.leave}<span style="font-size:var(--fs-xs)">Apply Leave</span>
        </button>
        <button class="btn btn-ghost btn-lg" style="flex-direction:column;height:72px;gap:6px;border:1px solid var(--gray-200)" onclick="App.navigate('my-requests')">
          ${Icon.requests}<span style="font-size:var(--fs-xs)">My Requests</span>
        </button>
        <button class="btn btn-ghost btn-lg" style="flex-direction:column;height:72px;gap:6px;border:1px solid var(--gray-200)" onclick="App.navigate('attendance')">
          ${Icon.attendance}<span style="font-size:var(--fs-xs)">Attendance</span>
        </button>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <span class="card-title">Recent Requests</span>
      <button class="btn btn-ghost btn-sm" onclick="App.navigate('my-requests')">View all →</button>
    </div>
    <div class="table-wrap">
      ${recent.length === 0
        ? `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No requests yet</div><div class="empty-state-sub">Submit your first OD or Leave request</div></div>`
        : `<table class="table">
          <thead><tr><th>Type</th><th>Event / Leave Type</th><th>Date</th><th>Status</th><th>Submitted</th></tr></thead>
          <tbody>${recent.map(r => {
            const isOD = !!r.eventName;
            return `<tr>
              <td><span class="badge ${isOD ? 'badge-od' : 'badge-leave'}">${isOD ? 'OD' : 'Leave'}</span></td>
              <td style="font-weight:500">${isOD ? r.eventName : r.leaveType}</td>
              <td>${isOD ? fmtDate(r.odDate) : fmtDate(r.fromDate) + ' – ' + fmtDate(r.toDate)}</td>
              <td>${statusBadge(r.status)}</td>
              <td class="text-muted">${fmtRelative(r.createdAt)}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>`}
    </div>
  </div>`;
}

// ---- Student Attendance ----
function renderStudentAttendance(user) {
  const records = API.getStudentAttendance(user.id);
  const summary = API.computeAttendanceSummary(records);
  const pctColor = summary.percentage >= 75 ? 'var(--success)' : 'var(--warning)';

  return `
  <div class="page-header">
    <h1 class="page-title">My Attendance</h1>
    <p class="page-subtitle">Academic Year 2024–25 · Semester 3</p>
  </div>

  <div class="stat-grid" style="margin-bottom:24px">
    <div class="stat-card">
      <div class="stat-label">Overall</div>
      <div class="stat-value" style="color:${pctColor}">${summary.percentage}%</div>
      <div class="stat-sublabel">${summary.percentage >= 75 ? '✓ Eligible' : '✗ Below requirement'}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Classes Conducted</div>
      <div class="stat-value">${summary.total}</div>
      <div class="stat-sublabel">This semester</div>
    </div>
    <div class="stat-card success">
      <div class="stat-label">Present</div>
      <div class="stat-value">${summary.present}</div>
      <div class="stat-sublabel">Including OD</div>
    </div>
    <div class="stat-card error">
      <div class="stat-label">Absent</div>
      <div class="stat-value">${summary.absent}</div>
      <div class="stat-sublabel">Unexcused</div>
    </div>
    <div class="stat-card info">
      <div class="stat-label">On Duty (OD)</div>
      <div class="stat-value">${summary.od}</div>
      <div class="stat-sublabel">Approved ODs</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Leave</div>
      <div class="stat-value">${summary.leave}</div>
      <div class="stat-sublabel">Approved leaves</div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <span class="card-title">Subject-wise Attendance</span>
      <span style="font-size:var(--fs-xs);color:var(--gray-500)">Minimum required: 75%</span>
    </div>
    <div class="table-wrap">
      ${records.length === 0
        ? `<div class="empty-state"><div class="empty-state-icon">📚</div><div class="empty-state-title">No attendance records</div></div>`
        : `<table class="table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Code</th>
              <th>Conducted</th>
              <th>Present</th>
              <th>Absent</th>
              <th>OD</th>
              <th>Leave</th>
              <th>Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(r => {
              const pct = r.conducted ? Math.round(((r.present + r.od) / r.conducted) * 100) : 0;
              const cls = pct >= 75 ? 'text-success' : 'text-warning';
              return `<tr>
                <td style="font-weight:500;max-width:220px">${r.subjectName || '—'}</td>
                <td><span class="badge" style="background:var(--gray-100);color:var(--gray-600)">${r.subjectCode || '—'}</span></td>
                <td>${r.conducted}</td>
                <td style="color:var(--success);font-weight:500">${r.present}</td>
                <td style="color:var(--error);font-weight:500">${r.absent}</td>
                <td style="color:var(--info);font-weight:500">${r.od}</td>
                <td style="color:var(--accent);font-weight:500">${r.leave}</td>
                <td>
                  <div class="flex gap-2" style="align-items:center;min-width:100px">
                    <div style="flex:1">${attendanceBar(pct)}</div>
                    <span class="${cls}" style="font-size:var(--fs-xs);font-weight:700;width:36px;text-align:right">${pct}%</span>
                  </div>
                </td>
                <td><span class="badge ${pct >= 75 ? 'badge-hod-approved' : 'badge-pending'}">${pct >= 75 ? 'Good' : 'Low'}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`}
    </div>
    <div class="card-footer">
      <div style="font-size:var(--fs-xs);color:var(--gray-500)">
        Note: OD and approved leave count towards attendance. Percentage = (Present + OD) / Conducted × 100
      </div>
    </div>
  </div>`;
}

// ---- Apply OD ----
function renderApplyOD(user) {
  const profile = user.profile;
  const today = new Date().toISOString().split('T')[0];

  return `
  <div class="page-header">
    <h1 class="page-title">Apply for On-Duty (OD)</h1>
    <p class="page-subtitle">Submit your OD request for college events, competitions, or authorized activities</p>
  </div>

  <div class="card" style="max-width:800px">
    <div class="card-header">
      <span class="card-title">OD Application Form</span>
      <span class="text-muted text-small">All fields marked * are required</span>
    </div>
    <div class="card-body">
      <div id="od-form-alert"></div>
      <form id="od-form" onsubmit="handleODSubmit(event)">

        <div class="alert alert-info" style="margin-bottom:20px">
          ℹ Student information is automatically populated from your profile.
        </div>

        <div style="background:var(--gray-50);padding:14px 16px;border-radius:var(--r-md);border:1px solid var(--gray-200);margin-bottom:20px">
          <div style="font-size:var(--fs-xs);font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px">Student Information</div>
          <div class="form-grid form-grid-3" style="gap:12px">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" value="${user.name}" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">Roll Number</label>
              <input type="text" class="form-control" value="${profile?.rollNo || '—'}" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">Department</label>
              <input type="text" class="form-control" value="${profile?.departmentCode || '—'}" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">Year</label>
              <input type="text" class="form-control" value="Year ${profile?.year || '—'}" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">Section</label>
              <input type="text" class="form-control" value="Section ${profile?.section || '—'}" disabled />
            </div>
          </div>
        </div>

        <div style="font-size:var(--fs-xs);font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">OD Details</div>

        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label" for="od-event">Event / Activity Name <span class="required">*</span></label>
            <input type="text" id="od-event" class="form-control" placeholder="e.g., National Level Hackathon" required maxlength="200" />
          </div>
          <div class="form-group">
            <label class="form-label" for="od-venue">Venue <span class="required">*</span></label>
            <input type="text" id="od-venue" class="form-control" placeholder="e.g., Anna University, Chennai" required maxlength="200" />
          </div>
          <div class="form-group">
            <label class="form-label" for="od-date">OD Date <span class="required">*</span></label>
            <input type="date" id="od-date" class="form-control" required min="${today}" onchange="calcODHours()" />
          </div>
          <div class="form-group">
            <label class="form-label" for="od-reason">Reason / Purpose <span class="required">*</span></label>
            <input type="text" id="od-reason" class="form-control" placeholder="Brief reason for OD" required maxlength="200" />
          </div>
          <div class="form-group">
            <label class="form-label" for="od-start">Start Time <span class="required">*</span></label>
            <input type="time" id="od-start" class="form-control" required onchange="calcODHours()" />
          </div>
          <div class="form-group">
            <label class="form-label" for="od-end">End Time <span class="required">*</span></label>
            <input type="time" id="od-end" class="form-control" required onchange="calcODHours()" />
          </div>
          <div class="form-group">
            <label class="form-label">Number of Hours</label>
            <input type="text" id="od-hours" class="form-control" placeholder="Auto-calculated" disabled />
          </div>
        </div>

        <div class="form-group mt-3">
          <label class="form-label" for="od-desc">Description <span class="required">*</span></label>
          <textarea id="od-desc" class="form-control" rows="3" placeholder="Provide a detailed description of the event and your role/participation..." required maxlength="1000"></textarea>
          <span class="form-hint">Maximum 1000 characters</span>
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Supporting Document</label>
          ${fileUploadComponent('od-doc')}
          <span class="form-hint">Upload invitation letter, event registration, selection letter, etc.</span>
        </div>

        <div class="flex gap-2 mt-3" style="justify-content:flex-end">
          <button type="button" class="btn btn-secondary" onclick="App.navigate('dashboard')">Cancel</button>
          <button type="submit" id="od-submit-btn" class="btn btn-primary">
            ${Icon.upload} Submit OD Request
          </button>
        </div>
      </form>
    </div>
  </div>`;
}

window.calcODHours = function() {
  const start = document.getElementById('od-start')?.value;
  const end = document.getElementById('od-end')?.value;
  if (!start || !end) return;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const hours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  const hoursEl = document.getElementById('od-hours');
  if (hours <= 0) {
    Toast.error('End time must be after start time.');
    hoursEl.value = '';
  } else {
    hoursEl.value = hours.toFixed(1) + ' hours';
  }
};

window.handleODSubmit = function(e) {
  e.preventDefault();
  const user = Auth.getCurrentUser();
  const start = document.getElementById('od-start').value;
  const end = document.getElementById('od-end').value;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const hours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;

  if (hours <= 0) { Toast.error('End time must be after start time.'); return; }

  const uploaded = window._uploadedFiles['od-doc'];
  const btn = document.getElementById('od-submit-btn');
  btn.disabled = true;
  btn.innerHTML = `${spinner(14)} Submitting...`;

  try {
    API.submitOD(user.id, {
      eventName: document.getElementById('od-event').value.trim(),
      venue: document.getElementById('od-venue').value.trim(),
      odDate: document.getElementById('od-date').value,
      startTime: start, endTime: end,
      hours: parseFloat(hours.toFixed(1)),
      reason: document.getElementById('od-reason').value.trim(),
      description: document.getElementById('od-desc').value.trim(),
      documentName: uploaded?.name || null,
      documentData: uploaded?.data || null,
    });
    Toast.success('OD request submitted successfully! Awaiting faculty review.');
    App.navigate('my-requests');
  } catch(err) {
    Toast.error(err.message);
    btn.disabled = false;
    btn.innerHTML = `${Icon.upload} Submit OD Request`;
  }
};

// ---- Apply Leave ----
function renderApplyLeave(user) {
  const profile = user.profile;
  const today = new Date().toISOString().split('T')[0];

  return `
  <div class="page-header">
    <h1 class="page-title">Apply for Leave</h1>
    <p class="page-subtitle">Submit a leave application for medical, personal, or emergency reasons</p>
  </div>

  <div class="card" style="max-width:800px">
    <div class="card-header">
      <span class="card-title">Leave Application Form</span>
      <span class="text-muted text-small">All fields marked * are required</span>
    </div>
    <div class="card-body">
      <div id="leave-form-alert"></div>
      <form id="leave-form" onsubmit="handleLeaveSubmit(event)">

        <div style="background:var(--gray-50);padding:14px 16px;border-radius:var(--r-md);border:1px solid var(--gray-200);margin-bottom:20px">
          <div style="font-size:var(--fs-xs);font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px">Student Information</div>
          <div class="form-grid form-grid-3" style="gap:12px">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" value="${user.name}" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">Roll Number</label>
              <input type="text" class="form-control" value="${profile?.rollNo || '—'}" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">Department</label>
              <input type="text" class="form-control" value="${profile?.departmentCode || '—'}" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">Year</label>
              <input type="text" class="form-control" value="Year ${profile?.year || '—'}" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">Section</label>
              <input type="text" class="form-control" value="Section ${profile?.section || '—'}" disabled />
            </div>
          </div>
        </div>

        <div style="font-size:var(--fs-xs);font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">Leave Details</div>

        <div class="form-grid form-grid-2">
          <div class="form-group">
            <label class="form-label" for="leave-type">Leave Type <span class="required">*</span></label>
            <select id="leave-type" class="form-control" required>
              <option value="">Select leave type</option>
              <option>Sick Leave</option>
              <option>Personal Leave</option>
              <option>Emergency Leave</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="leave-reason">Reason <span class="required">*</span></label>
            <input type="text" id="leave-reason" class="form-control" placeholder="Brief reason for leave" required maxlength="200" />
          </div>
          <div class="form-group">
            <label class="form-label" for="leave-from">From Date <span class="required">*</span></label>
            <input type="date" id="leave-from" class="form-control" required onchange="calcLeaveDays()" />
          </div>
          <div class="form-group">
            <label class="form-label" for="leave-to">To Date <span class="required">*</span></label>
            <input type="date" id="leave-to" class="form-control" required onchange="calcLeaveDays()" />
          </div>
          <div class="form-group">
            <label class="form-label">Number of Days</label>
            <input type="text" id="leave-days" class="form-control" placeholder="Auto-calculated" disabled />
          </div>
        </div>

        <div class="form-group mt-3">
          <label class="form-label" for="leave-desc">Description <span class="required">*</span></label>
          <textarea id="leave-desc" class="form-control" rows="3" placeholder="Provide more details about your leave request..." required maxlength="1000"></textarea>
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Supporting Document</label>
          ${fileUploadComponent('leave-doc')}
          <span class="form-hint">Medical certificate, travel tickets, etc. (recommended for Sick/Emergency leave)</span>
        </div>

        <div class="flex gap-2 mt-3" style="justify-content:flex-end">
          <button type="button" class="btn btn-secondary" onclick="App.navigate('dashboard')">Cancel</button>
          <button type="submit" id="leave-submit-btn" class="btn btn-primary">
            ${Icon.upload} Submit Leave Request
          </button>
        </div>
      </form>
    </div>
  </div>`;
}

window.calcLeaveDays = function() {
  const from = document.getElementById('leave-from')?.value;
  const to = document.getElementById('leave-to')?.value;
  if (!from || !to) return;
  const diff = Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
  const daysEl = document.getElementById('leave-days');
  if (diff <= 0) {
    Toast.error('To date must be on or after from date.');
    daysEl.value = '';
  } else {
    daysEl.value = diff + (diff === 1 ? ' day' : ' days');
  }
};

window.handleLeaveSubmit = function(e) {
  e.preventDefault();
  const user = Auth.getCurrentUser();
  const from = document.getElementById('leave-from').value;
  const to = document.getElementById('leave-to').value;
  const days = Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;

  if (days <= 0) { Toast.error('To date must be on or after from date.'); return; }

  const uploaded = window._uploadedFiles['leave-doc'];
  const btn = document.getElementById('leave-submit-btn');
  btn.disabled = true;
  btn.innerHTML = `${spinner(14)} Submitting...`;

  try {
    API.submitLeave(user.id, {
      leaveType: document.getElementById('leave-type').value,
      fromDate: from,
      toDate: to,
      days,
      reason: document.getElementById('leave-reason').value.trim(),
      description: document.getElementById('leave-desc').value.trim(),
      documentName: uploaded?.name || null,
      documentData: uploaded?.data || null,
    });
    Toast.success('Leave request submitted successfully!');
    App.navigate('my-requests');
  } catch(err) {
    Toast.error(err.message);
    btn.disabled = false;
    btn.innerHTML = `${Icon.upload} Submit Leave Request`;
  }
};

// ---- My Requests (renderRequestsTable is global for inline script access) ----
window.renderRequestsTable = function(requests) {
  if (requests.length === 0) return `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No requests found</div><div class="empty-state-sub">Submit an OD or Leave request to see them here</div></div>`;
  return `<table class="table">
    <thead><tr><th>ID</th><th>Type</th><th>Details</th><th>Date</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
    <tbody>${requests.map(r => {
      const isOD = !!r.eventName;
      const isPending = r.status === 'PENDING';
      return `<tr>
        <td class="text-muted" style="font-size:10px;font-family:monospace">${r.id}</td>
        <td><span class="badge ${isOD ? 'badge-od' : 'badge-leave'}">${isOD ? 'OD' : 'Leave'}</span></td>
        <td style="max-width:200px"><div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${isOD ? r.eventName : r.leaveType}</div>
          <div class="text-muted text-small">${isOD ? r.venue : r.reason}</div>
        </td>
        <td>${isOD ? fmtDate(r.odDate) : fmtDate(r.fromDate) + (r.days > 1 ? ' – ' + fmtDate(r.toDate) : '')}</td>
        <td>${statusBadge(r.status)}</td>
        <td class="text-muted">${fmtRelative(r.createdAt)}</td>
        <td>
          <div style="display:flex;gap:4px;align-items:center">
            <button class="btn btn-ghost btn-sm" onclick="showStudentRequestDetail('${r.id}','${isOD ? 'OD' : 'LEAVE'}')">${Icon.eye} View</button>
            ${isPending ? `<button class="btn btn-sm" style="background:var(--error-light);color:var(--error);border:none" onclick="quickWithdraw('${r.id}','${isOD ? 'OD' : 'LEAVE'}')" title="Withdraw">${Icon.trash}</button>` : ''}
          </div>
        </td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
};

function renderMyRequests(user) {
  const odRequests = API.getMyODRequests(user.id);
  const leaveRequests = API.getMyLeaveRequests(user.id);

  const allRequests = [...odRequests.map(r => ({...r, _type: 'OD'})), ...leaveRequests.map(r => ({...r, _type: 'LEAVE'}))]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return `
  <div class="page-header flex-between">
    <div>
      <h1 class="page-title">My Requests</h1>
      <p class="page-subtitle">Track all your OD and leave applications</p>
    </div>
    <div class="flex gap-2">
      <button class="btn btn-secondary" onclick="exportMyRequestsPDF()">${Icon.download} Export PDF</button>
      <button class="btn btn-secondary" onclick="App.navigate('apply-od')">${Icon.od} Apply OD</button>
      <button class="btn btn-primary" onclick="App.navigate('apply-leave')">${Icon.leave} Apply Leave</button>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="tabs" style="margin-bottom:0;border-bottom:none;gap:4px">
        <button class="tab-btn active" id="tab-all" onclick="switchReqTab('all')">All (${allRequests.length})</button>
        <button class="tab-btn" id="tab-od" onclick="switchReqTab('od')">OD (${odRequests.length})</button>
        <button class="tab-btn" id="tab-leave" onclick="switchReqTab('leave')">Leave (${leaveRequests.length})</button>
        <button class="tab-btn" id="tab-pending" onclick="switchReqTab('pending')">Pending (${allRequests.filter(r=>r.status==='PENDING').length})</button>
      </div>
    </div>
    <div class="table-wrap" id="req-table">
      ${renderRequestsTable(allRequests)}
    </div>
  </div>
  <script>
    window._reqAllRequests = ${JSON.stringify(allRequests)};
    window._reqODRequests = ${JSON.stringify(odRequests)};
    window._reqLeaveRequests = ${JSON.stringify(leaveRequests)};
    window.switchReqTab = function(tab) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');
      const table = document.getElementById('req-table');
      let data;
      if (tab === 'all') data = window._reqAllRequests;
      else if (tab === 'od') data = window._reqODRequests.map(r=>({...r,_type:'OD'}));
      else if (tab === 'leave') data = window._reqLeaveRequests.map(r=>({...r,_type:'LEAVE'}));
      else data = window._reqAllRequests.filter(r=>r.status==='PENDING');
      table.innerHTML = renderRequestsTable(data);
    };
  </script>`;
}

window.showStudentRequestDetail = function(id, type) {
  const request = type === 'OD' ? DB.findById('od_requests', id) : DB.findById('leave_requests', id);
  if (!request) return;
  const user = Auth.getCurrentUser();
  const html = renderRequestDetailModal(request, type, user, "document.getElementById('req-modal-overlay').remove()");
  document.body.insertAdjacentHTML('beforeend', html);
};

// ---- Student Profile ----
function renderStudentProfile(user) {
  const profile = user.profile;
  const dept = profile ? DB.findById('departments', profile.departmentId) : null;

  return `
  <div class="page-header">
    <h1 class="page-title">My Profile</h1>
    <p class="page-subtitle">Your account information</p>
  </div>

  <div class="profile-header">
    <div class="profile-avatar">${Auth.initials(user.name)}</div>
    <div>
      <div class="profile-name">${user.name}</div>
      <div class="profile-meta">${profile?.rollNo} · ${dept?.name}</div>
      <div class="profile-badges">
        <span class="role-chip student">Student</span>
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
          <tr style="border-top:1px solid var(--gray-100)"><td style="padding:10px 0;color:var(--gray-500)">Role</td><td style="padding:10px 0"><span class="role-chip student">Student</span></td></tr>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Academic Information</span></div>
      <div class="card-body">
        <table style="width:100%;border-collapse:collapse;font-size:var(--fs-sm)">
          <tr><td style="padding:10px 0;color:var(--gray-500);width:40%">Roll Number</td><td style="padding:10px 0;font-weight:600">${profile?.rollNo || '—'}</td></tr>
          <tr style="border-top:1px solid var(--gray-100)"><td style="padding:10px 0;color:var(--gray-500)">Department</td><td style="padding:10px 0;font-weight:500">${dept?.name || '—'}</td></tr>
          <tr style="border-top:1px solid var(--gray-100)"><td style="padding:10px 0;color:var(--gray-500)">Year</td><td style="padding:10px 0;font-weight:500">Year ${profile?.year || '—'}</td></tr>
          <tr style="border-top:1px solid var(--gray-100)"><td style="padding:10px 0;color:var(--gray-500)">Section</td><td style="padding:10px 0;font-weight:500">Section ${profile?.section || '—'}</td></tr>
          <tr style="border-top:1px solid var(--gray-100)"><td style="padding:10px 0;color:var(--gray-500)">Batch</td><td style="padding:10px 0;font-weight:500">${profile?.batch || '—'}</td></tr>
        </table>
      </div>
    </div>
  </div>`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

// ---- Export My Requests as PDF ----
window.exportMyRequestsPDF = function() {
  const user = Auth.getCurrentUser();
  const profile = user.profile;
  const dept = profile ? DB.findById('departments', profile.departmentId) : null;
  const odReqs = API.getMyODRequests(user.id);
  const leaveReqs = API.getMyLeaveRequests(user.id);
  const all = [
    ...odReqs.map(r => ({ ...r, _type: 'OD' })),
    ...leaveReqs.map(r => ({ ...r, _type: 'LEAVE' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const rows = all.map(r => {
    const isOD = r._type === 'OD';
    const dateStr = isOD ? fmtDate(r.odDate) : `${fmtDate(r.fromDate)}${r.days > 1 ? ' – ' + fmtDate(r.toDate) : ''}`;
    const statusStr = r.status.replace(/_/g, ' ');
    return `<tr>
      <td style="font-family:monospace;font-size:10px">${r.id}</td>
      <td><strong>${isOD ? 'OD' : 'Leave'}</strong></td>
      <td>${isOD ? r.eventName : r.leaveType}</td>
      <td>${isOD ? r.venue : r.reason}</td>
      <td>${dateStr}</td>
      <td>${statusStr}</td>
      <td>${fmtDate(r.createdAt)}</td>
    </tr>`;
  }).join('');

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(`<!DOCTYPE html><html><head>
    <title>My Requests — ${user.name}</title>
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
      td { padding: 6px 10px; border: 1px solid #e5e7eb; font-size: 11px; vertical-align: top; }
      .summary-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
      .summary-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; text-align: center; }
      .summary-num { font-size: 22px; font-weight: 700; color: #1d4ed8; }
      .summary-lbl { font-size: 10px; color: #6b7280; margin-top: 2px; }
      .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
    </style>
  </head><body>
    <div class="header">
      <div class="logo">E</div>
      <div>
        <div class="title">EduLeave — My Requests Report</div>
        <div class="subtitle">OD &amp; Leave Management System</div>
      </div>
      <div style="margin-left:auto;text-align:right">
        <div style="font-size:10px;color:#6b7280">Generated on</div>
        <div style="font-weight:700">${new Date().toLocaleDateString('en-IN')}</div>
      </div>
    </div>

    <h2>Student Details</h2>
    <table>
      <tr><td style="width:25%;color:#6b7280">Name</td><td><strong>${user.name}</strong></td>
          <td style="width:25%;color:#6b7280">Roll Number</td><td>${profile?.rollNo || '—'}</td></tr>
      <tr><td style="color:#6b7280">Department</td><td>${dept?.name || '—'}</td>
          <td style="color:#6b7280">Year / Section</td><td>Year ${profile?.year} · Section ${profile?.section}</td></tr>
      <tr><td style="color:#6b7280">Email</td><td>${user.email}</td>
          <td style="color:#6b7280">Batch</td><td>${profile?.batch || '—'}</td></tr>
    </table>

    <div class="summary-grid">
      <div class="summary-box"><div class="summary-num">${all.length}</div><div class="summary-lbl">Total Requests</div></div>
      <div class="summary-box"><div class="summary-num" style="color:#d97706">${all.filter(r=>r.status==='PENDING').length}</div><div class="summary-lbl">Pending</div></div>
      <div class="summary-box"><div class="summary-num" style="color:#16a34a">${all.filter(r=>r.status==='HOD_APPROVED').length}</div><div class="summary-lbl">Approved</div></div>
      <div class="summary-box"><div class="summary-num" style="color:#dc2626">${all.filter(r=>['HOD_REJECTED','FACULTY_REJECTED'].includes(r.status)).length}</div><div class="summary-lbl">Rejected</div></div>
    </div>

    <h2>All Requests</h2>
    <table>
      <thead><tr><th>ID</th><th>Type</th><th>Event / Leave Type</th><th>Venue / Reason</th><th>Date</th><th>Status</th><th>Submitted</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="7" style="text-align:center;color:#9ca3af">No requests found</td></tr>'}</tbody>
    </table>

    <div class="footer">
      <span>Generated by EduLeave</span>
      <span>Printed on ${new Date().toLocaleString('en-IN')}</span>
    </div>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
};

// ---- Quick Withdraw from table row ----
window.quickWithdraw = function(requestId, type) {
  if (!confirm('Withdraw this request? This cannot be undone.')) return;
  const user = Auth.getCurrentUser();
  try {
    if (type === 'OD') API.withdrawOD(requestId, user.id);
    else API.withdrawLeave(requestId, user.id);
    Toast.success('Request withdrawn successfully.');
    App.navigate(App.currentPage);
  } catch(e) { Toast.error(e.message); }
};
