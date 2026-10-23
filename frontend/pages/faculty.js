// ============================================================
// pages/faculty.js — Faculty and HOD pages
// ============================================================

// ---- Faculty Dashboard ----
function renderFacultyDashboard(user) {
  const isHOD = user.role === 'HOD';
  let pendingOD, pendingLeave, historyItems;

  if (isHOD) {
    const { od, leave } = API.getHODPendingRequests(user.id);
    pendingOD = od;
    pendingLeave = leave;
  } else {
    pendingOD = API.getPendingODRequests(user.id);
    pendingLeave = API.getPendingLeaveRequests(user.id);
  }

  const allPending = pendingOD.length + pendingLeave.length;
  const today = new Date().toDateString();

  // Recent history for this faculty
  const allOD = API.getAllODRequests();
  const allLeave = API.getAllLeaveRequests();
  const myApproved = [...allOD, ...allLeave].filter(r =>
    (r.facultyId === user.id || r.hodId === user.id) &&
    ['HOD_APPROVED','FACULTY_APPROVED','HOD_REJECTED','FACULTY_REJECTED'].includes(r.status)
  ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);

  const approvedToday = myApproved.filter(r => new Date(r.updatedAt).toDateString() === today).length;
  const rejectedToday = [...allOD, ...allLeave].filter(r =>
    (r.facultyId === user.id || r.hodId === user.id) &&
    ['FACULTY_REJECTED','HOD_REJECTED'].includes(r.status) &&
    new Date(r.updatedAt).toDateString() === today
  ).length;

  return `
  <div class="page-header">
    <h1 class="page-title">Dashboard</h1>
    <p class="page-subtitle">${isHOD ? 'HOD' : 'Faculty'} Dashboard — ${user.profile?.departmentName || user.profile?.departmentCode || ''}</p>
  </div>

  <div class="stat-grid">
    <div class="stat-card warning">
      <div class="stat-icon">${Icon.requests}</div>
      <div class="stat-label">Pending Review</div>
      <div class="stat-value">${allPending}</div>
      <div class="stat-sublabel">Requires your action</div>
    </div>
    <div class="stat-card success">
      <div class="stat-icon">${Icon.check}</div>
      <div class="stat-label">Approved Today</div>
      <div class="stat-value">${approvedToday}</div>
      <div class="stat-sublabel">By you today</div>
    </div>
    <div class="stat-card error">
      <div class="stat-icon">${Icon.x}</div>
      <div class="stat-label">Rejected Today</div>
      <div class="stat-value">${rejectedToday}</div>
      <div class="stat-sublabel">By you today</div>
    </div>
    <div class="stat-card primary">
      <div class="stat-icon">${Icon.od}</div>
      <div class="stat-label">Pending OD</div>
      <div class="stat-value">${pendingOD.length}</div>
      <div class="stat-sublabel">OD requests</div>
    </div>
    <div class="stat-card info">
      <div class="stat-icon">${Icon.leave}</div>
      <div class="stat-label">Pending Leave</div>
      <div class="stat-value">${pendingLeave.length}</div>
      <div class="stat-sublabel">Leave requests</div>
    </div>
  </div>

  ${allPending > 0 ? `
  <div class="alert alert-warning" style="margin-bottom:20px">
    ⚠ You have <strong>${allPending}</strong> pending request${allPending > 1 ? 's' : ''} requiring your review.
    <button class="btn btn-ghost btn-sm" onclick="App.navigate('pending-requests')" style="margin-left:auto">Review now →</button>
  </div>` : ''}

  <div class="grid-2" style="gap:20px;margin-bottom:20px">
    <div class="card">
      <div class="card-header">
        <span class="card-title">Pending OD Requests</span>
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('pending-od')">View all →</button>
      </div>
      <div class="table-wrap">
        ${pendingOD.length === 0
          ? `<div class="empty-state" style="padding:24px"><div class="empty-state-icon" style="font-size:28px">✓</div><div class="empty-state-title" style="font-size:var(--fs-sm)">No pending OD requests</div></div>`
          : `<table class="table"><thead><tr><th>Student</th><th>Event</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>${pendingOD.slice(0, 4).map(r => {
              const { user: stu, profile } = API.getStudentInfo(r.studentId);
              return `<tr>
                <td><div style="font-weight:500">${stu?.name}</div><div class="text-muted text-small">${profile?.rollNo}</div></td>
                <td style="max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.eventName}</td>
                <td>${fmtDate(r.odDate)}</td>
                <td><button class="btn btn-primary btn-sm" onclick="showFacultyRequestDetail('${r.id}','OD')">Review</button></td>
              </tr>`;
            }).join('')}</tbody></table>`}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Pending Leave Requests</span>
        <button class="btn btn-ghost btn-sm" onclick="App.navigate('pending-leave')">View all →</button>
      </div>
      <div class="table-wrap">
        ${pendingLeave.length === 0
          ? `<div class="empty-state" style="padding:24px"><div class="empty-state-icon" style="font-size:28px">✓</div><div class="empty-state-title" style="font-size:var(--fs-sm)">No pending leave requests</div></div>`
          : `<table class="table"><thead><tr><th>Student</th><th>Type</th><th>Dates</th><th>Action</th></tr></thead>
            <tbody>${pendingLeave.slice(0, 4).map(r => {
              const { user: stu, profile } = API.getStudentInfo(r.studentId);
              return `<tr>
                <td><div style="font-weight:500">${stu?.name}</div><div class="text-muted text-small">${profile?.rollNo}</div></td>
                <td>${r.leaveType}</td>
                <td>${fmtDate(r.fromDate)}</td>
                <td><button class="btn btn-primary btn-sm" onclick="showFacultyRequestDetail('${r.id}','LEAVE')">Review</button></td>
              </tr>`;
            }).join('')}</tbody></table>`}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <span class="card-title">Recently Processed</span>
    </div>
    <div class="table-wrap">
      ${myApproved.length === 0
        ? `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No processed requests yet</div></div>`
        : `<table class="table"><thead><tr><th>Student</th><th>Type</th><th>Details</th><th>Status</th><th>Processed</th></tr></thead>
          <tbody>${myApproved.map(r => {
            const isOD = !!r.eventName;
            const { user: stu, profile } = API.getStudentInfo(r.studentId);
            return `<tr>
              <td><div style="font-weight:500">${stu?.name}</div><div class="text-muted text-small">${profile?.rollNo}</div></td>
              <td><span class="badge ${isOD ? 'badge-od' : 'badge-leave'}">${isOD ? 'OD' : 'Leave'}</span></td>
              <td>${isOD ? r.eventName : r.leaveType}</td>
              <td>${statusBadge(r.status)}</td>
              <td class="text-muted">${fmtRelative(r.updatedAt)}</td>
            </tr>`;
          }).join('')}</tbody></table>`}
    </div>
  </div>`;
}

// ---- Pending Requests List ----
function renderPendingRequests(user, type = 'all') {
  const isHOD = user.role === 'HOD';
  let pendingOD, pendingLeave;

  if (isHOD) {
    const { od, leave } = API.getHODPendingRequests(user.id);
    pendingOD = od; pendingLeave = leave;
  } else {
    pendingOD = API.getPendingODRequests(user.id);
    pendingLeave = API.getPendingLeaveRequests(user.id);
  }

  const requests = type === 'od' ? pendingOD.map(r=>({...r,_type:'OD'}))
    : type === 'leave' ? pendingLeave.map(r=>({...r,_type:'LEAVE'}))
    : [...pendingOD.map(r=>({...r,_type:'OD'})), ...pendingLeave.map(r=>({...r,_type:'LEAVE'}))];

  return `
  <div class="page-header">
    <h1 class="page-title">${type === 'od' ? 'OD' : type === 'leave' ? 'Leave' : 'Pending'} Requests</h1>
    <p class="page-subtitle">${isHOD ? 'HOD' : 'Faculty'} review queue — ${requests.length} request${requests.length !== 1 ? 's' : ''} pending</p>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="tabs" style="margin-bottom:0;border-bottom:none">
        <button class="tab-btn ${type==='all'?'active':''}" onclick="App.navigate('pending-requests')">All (${pendingOD.length + pendingLeave.length})</button>
        <button class="tab-btn ${type==='od'?'active':''}" onclick="App.navigate('pending-od')">OD (${pendingOD.length})</button>
        <button class="tab-btn ${type==='leave'?'active':''}" onclick="App.navigate('pending-leave')">Leave (${pendingLeave.length})</button>
      </div>
    </div>
    <div class="table-wrap">
      ${requests.length === 0
        ? `<div class="empty-state"><div class="empty-state-icon">✓</div><div class="empty-state-title">All caught up!</div><div class="empty-state-sub">No pending requests require your attention</div></div>`
        : `<table class="table" id="pending-table">
          <thead><tr>
            <th style="width:36px"><input type="checkbox" id="select-all-chk" onchange="toggleSelectAll(this)" title="Select all" style="cursor:pointer;width:16px;height:16px"></th>
            <th>Student</th><th>Type</th><th>Details</th><th>Date</th><th>Submitted</th><th>Document</th><th>Action</th>
          </tr></thead>
          <tbody>${requests.map(r => {
            const isOD = r._type === 'OD';
            const { user: stu, profile, dept } = API.getStudentInfo(r.studentId);
            return `<tr>
              <td><input type="checkbox" class="req-chk" data-id="${r.id}" data-type="${r._type}" onchange="updateBulkBar()" style="cursor:pointer;width:16px;height:16px"></td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:28px;height:28px;border-radius:50%;background:var(--primary);color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${Auth.initials(stu?.name)}</div>
                  <div>
                    <div style="font-weight:500;font-size:var(--fs-xs)">${stu?.name}</div>
                    <div class="text-muted" style="font-size:10px">${profile?.rollNo} · ${dept?.code}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge ${isOD ? 'badge-od' : 'badge-leave'}">${isOD ? 'OD' : 'Leave'}</span></td>
              <td style="max-width:180px">
                <div style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:var(--fs-xs)">${isOD ? r.eventName : r.leaveType}</div>
                <div class="text-muted" style="font-size:10px">${isOD ? r.venue : r.reason}</div>
              </td>
              <td style="font-size:var(--fs-xs)">${isOD ? fmtDate(r.odDate) : fmtDate(r.fromDate) + (r.days > 1 ? ' + ' + (r.days-1) + 'd' : '')}</td>
              <td class="text-muted" style="font-size:10px">${fmtRelative(r.createdAt)}</td>
              <td>${r.documentName ? `<span style="font-size:10px;color:var(--info)">📄 ${r.documentName.slice(0,20)}...</span>` : '<span class="text-muted text-small">None</span>'}</td>
              <td>
                <button class="btn btn-primary btn-sm" onclick="showFacultyRequestDetail('${r.id}','${isOD ? 'OD' : 'LEAVE'}')">
                  ${Icon.eye} Review
                </button>
              </td>
            </tr>`;
          }).join('')}</tbody>
        </table>`}
    </div>
  </div>

  <!-- Bulk Action Bar -->
  <div class="bulk-action-bar" id="bulk-action-bar">
    <div class="bulk-action-inner">
      <span class="bulk-count" id="bulk-count">0 selected</span>
      <button class="btn btn-success" onclick="showBulkApproveDialog()">
        ${Icon.check} Approve Selected
      </button>
      <button class="btn btn-danger" onclick="showBulkRejectDialog()">
        ${Icon.x} Reject Selected
      </button>
      <button class="btn btn-secondary" onclick="clearBulkSelection()">
        Clear
      </button>
    </div>
  </div>
  <script>
    window.toggleSelectAll = function(chk) {
      document.querySelectorAll('.req-chk').forEach(c => c.checked = chk.checked);
      updateBulkBar();
    };
    window.updateBulkBar = function() {
      const checked = document.querySelectorAll('.req-chk:checked');
      const bar = document.getElementById('bulk-action-bar');
      const count = document.getElementById('bulk-count');
      const all = document.getElementById('select-all-chk');
      const total = document.querySelectorAll('.req-chk').length;
      if (bar) bar.classList.toggle('visible', checked.length > 0);
      if (count) count.textContent = checked.length + ' selected';
      if (all) all.indeterminate = checked.length > 0 && checked.length < total;
      if (all && checked.length === total && total > 0) all.checked = true;
      if (all && checked.length === 0) all.checked = false;
    };
    window.getSelectedItems = function() {
      return [...document.querySelectorAll('.req-chk:checked')].map(c => ({
        id: c.dataset.id, type: c.dataset.type
      }));
    };
    window.clearBulkSelection = function() {
      document.querySelectorAll('.req-chk').forEach(c => c.checked = false);
      const all = document.getElementById('select-all-chk');
      if (all) { all.checked = false; all.indeterminate = false; }
      updateBulkBar();
    };
    window.showBulkApproveDialog = function() {
      const items = getSelectedItems();
      if (!items.length) return;
      const remarks = prompt(\`Approve \${items.length} request\${items.length>1?'s':''}?\\nEnter remarks (required):\`);
      if (remarks === null) return;
      if (!remarks.trim()) { alert('Remarks are required.'); return; }
      const user = Auth.getCurrentUser();
      const isHOD = user.role === 'HOD';
      const odIds = items.filter(i=>i.type==='OD').map(i=>i.id);
      const leaveIds = items.filter(i=>i.type==='LEAVE').map(i=>i.id);
      let total = { success: 0, failed: 0 };
      if (odIds.length) { const r = API.bulkProcessRequests(odIds,'OD',user.id,remarks.trim(),'APPROVE',isHOD); total.success+=r.success; total.failed+=r.failed; }
      if (leaveIds.length) { const r = API.bulkProcessRequests(leaveIds,'LEAVE',user.id,remarks.trim(),'APPROVE',isHOD); total.success+=r.success; total.failed+=r.failed; }
      Toast.success(\`Approved \${total.success} request\${total.success>1?'s':''}.\${total.failed?' '+total.failed+' failed.':''}\`);
      App.navigate(App.currentPage);
    };
    window.showBulkRejectDialog = function() {
      const items = getSelectedItems();
      if (!items.length) return;
      const remarks = prompt(\`Reject \${items.length} request\${items.length>1?'s':''}?\\nEnter reason (required):\`);
      if (remarks === null) return;
      if (!remarks.trim()) { alert('Reason is required.'); return; }
      const user = Auth.getCurrentUser();
      const isHOD = user.role === 'HOD';
      const odIds = items.filter(i=>i.type==='OD').map(i=>i.id);
      const leaveIds = items.filter(i=>i.type==='LEAVE').map(i=>i.id);
      let total = { success: 0, failed: 0 };
      if (odIds.length) { const r = API.bulkProcessRequests(odIds,'OD',user.id,remarks.trim(),'REJECT',isHOD); total.success+=r.success; total.failed+=r.failed; }
      if (leaveIds.length) { const r = API.bulkProcessRequests(leaveIds,'LEAVE',user.id,remarks.trim(),'REJECT',isHOD); total.success+=r.success; total.failed+=r.failed; }
      Toast.success(\`Rejected \${total.success} request\${total.success>1?'s':''}.\${total.failed?' '+total.failed+' failed.':''}\`);
      App.navigate(App.currentPage);
    };
  </script>`;
}

// ---- Request History (Faculty) ----
function renderFacultyHistory(user) {
  const isHOD = user.role === 'HOD';
  const allOD = API.getAllODRequests();
  const allLeave = API.getAllLeaveRequests();
  const myHistory = [...allOD.map(r=>({...r,_type:'OD'})), ...allLeave.map(r=>({...r,_type:'LEAVE'}))]
    .filter(r => r.facultyId === user.id || r.hodId === user.id)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return `
  <div class="page-header">
    <h1 class="page-title">Request History</h1>
    <p class="page-subtitle">All requests you have reviewed</p>
  </div>

  <div class="card">
    <div class="card-header">
      <span class="card-title">${myHistory.length} processed requests</span>
    </div>
    <div class="table-wrap">
      ${myHistory.length === 0
        ? `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No requests processed yet</div></div>`
        : `<table class="table">
          <thead><tr><th>Student</th><th>Type</th><th>Details</th><th>Status</th><th>Your Remarks</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>${myHistory.map(r => {
            const isOD = r._type === 'OD';
            const { user: stu, profile, dept } = API.getStudentInfo(r.studentId);
            const myRemarks = isHOD ? r.hodRemarks : r.facultyRemarks;
            return `<tr>
              <td><div style="font-weight:500;font-size:var(--fs-xs)">${stu?.name}</div><div class="text-muted" style="font-size:10px">${profile?.rollNo}</div></td>
              <td><span class="badge ${isOD ? 'badge-od' : 'badge-leave'}">${isOD ? 'OD' : 'Leave'}</span></td>
              <td style="font-size:var(--fs-xs);max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${isOD ? r.eventName : r.leaveType}</td>
              <td>${statusBadge(r.status)}</td>
              <td style="font-size:var(--fs-xs);color:var(--gray-600);max-width:180px">${myRemarks || '<span class="text-muted">—</span>'}</td>
              <td class="text-muted" style="font-size:10px">${fmtRelative(r.updatedAt)}</td>
              <td><button class="btn btn-ghost btn-sm" onclick="showFacultyRequestDetail('${r.id}','${r._type}')">${Icon.eye}</button></td>
            </tr>`;
          }).join('')}</tbody>
        </table>`}
    </div>
  </div>`;
}

// ---- Faculty Students list ----
function renderFacultyStudents(user) {
  return renderFacultyAttendance(user);
}

// ---- Faculty Attendance Management Page ----
function renderFacultyAttendance(user) {
  const fp = DB.findOneWhere('faculty_profiles', p => p.userId === user.id);
  const deptId = fp?.departmentId || (user.profile?.departmentId);
  
  // Get department students
  let students = deptId
    ? DB.findWhere('student_profiles', sp => sp.departmentId === deptId)
    : DB.getAll('student_profiles');

  if (students.length === 0) {
    students = DB.getAll('student_profiles');
  }

  // Get department subjects
  const deptSubjects = deptId ? DB.findWhere('subjects', s => s.departmentId === deptId) : DB.getAll('subjects');

  // Compute overall stats
  let totalPctSum = 0;
  let goodCount = 0;
  let shortageCount = 0;

  const studentsWithAtt = students.map(sp => {
    const u = DB.findById('users', sp.userId);
    const att = API.getStudentAttendance(sp.userId);
    const summary = API.computeAttendanceSummary(att);
    totalPctSum += summary.percentage;
    if (summary.percentage >= 75) goodCount++;
    else shortageCount++;
    return { profile: sp, user: u, attendance: att, summary };
  });

  const avgPct = studentsWithAtt.length > 0 ? Math.round(totalPctSum / studentsWithAtt.length) : 0;

  return `
  <div class="page-header flex-between" style="flex-wrap:wrap;gap:12px;margin-bottom:20px">
    <div>
      <h1 class="page-title">Attendance Management</h1>
      <p class="page-subtitle">Student roster with subject-wise attendance breakdown &amp; monitoring</p>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-ghost btn-sm" onclick="toggleAllSubjectBreakdowns(true)">🔽 Expand All Subjects</button>
      <button class="btn btn-ghost btn-sm" onclick="toggleAllSubjectBreakdowns(false)">🔼 Collapse All</button>
    </div>
  </div>

  <div class="stat-grid" style="margin-bottom:20px">
    <div class="stat-card primary">
      <div class="stat-icon">${Icon.students}</div>
      <div class="stat-label">Total Students</div>
      <div class="stat-value">${studentsWithAtt.length}</div>
      <div class="stat-sublabel">In department roster</div>
    </div>
    <div class="stat-card success">
      <div class="stat-icon">${Icon.check}</div>
      <div class="stat-label">Eligible (≥ 75%)</div>
      <div class="stat-value">${goodCount}</div>
      <div class="stat-sublabel">Attendance in good standing</div>
    </div>
    <div class="stat-card error">
      <div class="stat-icon">${Icon.x}</div>
      <div class="stat-label">Shortage (&lt; 75%)</div>
      <div class="stat-value">${shortageCount}</div>
      <div class="stat-sublabel">At risk of detention</div>
    </div>
    <div class="stat-card info">
      <div class="stat-icon">${Icon.attendance}</div>
      <div class="stat-label">Class Average</div>
      <div class="stat-value">${avgPct}%</div>
      <div class="stat-sublabel">Across all subjects</div>
    </div>
  </div>

  <div class="card" style="margin-bottom:20px">
    <div class="card-body" style="padding:14px 18px">
      <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
        <div style="flex:1 1 200px;position:relative">
          <input type="text" id="faculty-att-search" class="form-control" placeholder="Search by name, roll no, or email..." oninput="filterFacultyAttendanceTable()" style="padding-left:32px" />
          <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--gray-400)">🔍</span>
        </div>
        <div style="min-width:180px">
          <select id="faculty-att-sub-filter" class="form-control" onchange="filterFacultyAttendanceTable()">
            <option value="ALL">📚 All Subjects</option>
            ${deptSubjects.map(s => `<option value="${s.id}">${s.code} - ${s.name}</option>`).join('')}
          </select>
        </div>
        <div style="min-width:140px">
          <select id="faculty-att-year-filter" class="form-control" onchange="filterFacultyAttendanceTable()">
            <option value="ALL">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>
        <div style="min-width:140px">
          <select id="faculty-att-status-filter" class="form-control" onchange="filterFacultyAttendanceTable()">
            <option value="ALL">All Status</option>
            <option value="GOOD">Eligible (≥ 75%)</option>
            <option value="SHORTAGE">Shortage (&lt; 75%)</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header flex-between">
      <span class="card-title">Enrolled Students &amp; Subject Attendance</span>
      <span class="badge" style="background:var(--primary-light);color:var(--primary);font-size:11px" id="faculty-att-count">
        ${studentsWithAtt.length} Students
      </span>
    </div>
    <div class="table-wrap">
      ${studentsWithAtt.length === 0
        ? `<div class="empty-state"><div class="empty-state-icon">👨‍🎓</div><div class="empty-state-title">No students found</div></div>`
        : `<table class="table" id="faculty-attendance-table">
          <thead>
            <tr>
              <th style="width:36px">#</th>
              <th>Student</th>
              <th>Roll No</th>
              <th>Class</th>
              <th>Overall %</th>
              <th>Status</th>
              <th>Subject Breakdown</th>
              <th style="text-align:right">Action</th>
            </tr>
          </thead>
          <tbody>
            ${studentsWithAtt.map((item, idx) => {
              const sp = item.profile;
              const u = item.user;
              const summary = item.summary;
              const att = item.attendance;
              const isGood = summary.percentage >= 75;

              return `
              <tr class="faculty-att-row" data-name="${(u?.name || '').toLowerCase()}" data-roll="${(sp.rollNo || '').toLowerCase()}" data-email="${(u?.email || '').toLowerCase()}" data-year="${sp.year}" data-status="${isGood ? 'GOOD' : 'SHORTAGE'}" data-subjects='${JSON.stringify(att.map(a => a.subjectId))}'>
                <td style="color:var(--gray-400);font-size:11px">${idx + 1}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:32px;height:32px;border-radius:50%;background:var(--primary);color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                      ${Auth.initials(u?.name)}
                    </div>
                    <div>
                      <div style="font-weight:600;font-size:var(--fs-xs);color:var(--gray-900)">${u?.name}</div>
                      <div class="text-muted" style="font-size:10px">${u?.email || ''}</div>
                    </div>
                  </div>
                </td>
                <td style="font-family:monospace;font-size:var(--fs-xs);font-weight:600">${sp.rollNo}</td>
                <td style="font-size:var(--fs-xs)">Year ${sp.year} • Sec ${sp.section || 'A'}</td>
                <td style="min-width:130px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="flex:1">${attendanceBar(summary.percentage)}</div>
                    <span style="font-size:var(--fs-xs);font-weight:700;width:34px;text-align:right;color:${isGood ? 'var(--success)' : 'var(--error)'}">
                      ${summary.percentage}%
                    </span>
                  </div>
                  <div style="font-size:10px;color:var(--gray-400);margin-top:2px">
                    ${summary.present}P / ${summary.conducted}C (+${summary.od} OD)
                  </div>
                </td>
                <td>
                  <span class="badge ${isGood ? 'badge-hod-approved' : 'badge-faculty-rejected'}" style="font-size:10px">
                    ${isGood ? 'Eligible' : 'Shortage'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-ghost btn-sm" onclick="toggleSubjectRow('${sp.userId}')" style="font-size:11px;padding:4px 8px;gap:4px">
                    Subjects (${att.length}) ▾
                  </button>
                </td>
                <td style="text-align:right">
                  <button class="btn btn-ghost btn-sm" onclick="showEditAttendanceModal('${sp.userId}')" title="Edit Attendance" style="font-size:11px;padding:4px 10px">
                    ✏️ Edit
                  </button>
                </td>
              </tr>
              <tr class="faculty-att-detail-row" id="att-detail-${sp.userId}" style="display:none;background:var(--gray-50)">
                <td colspan="8" style="padding:10px 16px">
                  <div style="background:#fff;border:1px solid var(--gray-200);border-radius:6px;overflow:hidden">
                    <div style="padding:6px 12px;background:var(--gray-100);border-bottom:1px solid var(--gray-200);font-size:11px;font-weight:600;display:flex;justify-content:space-between">
                      <span>Subject-wise Breakdown: ${u?.name} (${sp.rollNo})</span>
                      <span class="text-muted">Formula: (Present + OD) / Conducted × 100</span>
                    </div>
                    ${att.length === 0 ? `<div style="padding:12px;text-align:center;font-size:12px;color:var(--gray-400)">No subjects enrolled</div>` : `
                    <table class="table" style="font-size:11px;margin:0">
                      <thead>
                        <tr style="background:#fafafa">
                          <th>Code</th>
                          <th>Subject Name</th>
                          <th>Conducted</th>
                          <th style="color:var(--success)">Present</th>
                          <th style="color:var(--error)">Absent</th>
                          <th style="color:var(--info)">OD</th>
                          <th>Leave</th>
                          <th style="min-width:110px">Percentage</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${att.map(a => {
                          const pct = a.conducted ? Math.round(((a.present + a.od) / a.conducted) * 100) : 0;
                          const subGood = pct >= 75;
                          return `<tr>
                            <td><code style="background:var(--gray-100);padding:2px 5px;border-radius:3px">${a.subjectCode}</code></td>
                            <td style="font-weight:500">${a.subjectName}</td>
                            <td>${a.conducted}</td>
                            <td style="color:var(--success);font-weight:600">${a.present}</td>
                            <td style="color:var(--error);font-weight:600">${a.absent}</td>
                            <td style="color:var(--info);font-weight:600">${a.od}</td>
                            <td>${a.leave}</td>
                            <td>
                              <div style="display:flex;align-items:center;gap:6px">
                                <div style="flex:1">${attendanceBar(pct)}</div>
                                <span style="font-weight:700;color:${subGood ? 'var(--success)' : 'var(--error)'}">${pct}%</span>
                              </div>
                            </td>
                            <td>
                              <span class="badge ${subGood ? 'badge-hod-approved' : 'badge-faculty-rejected'}" style="font-size:9px">
                                ${subGood ? 'Good' : 'Shortage'}
                              </span>
                            </td>
                          </tr>`;
                        }).join('')}
                      </tbody>
                    </table>`}
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>`}
    </div>
  </div>`;
}

window.toggleSubjectRow = function(userId) {
  const row = document.getElementById('att-detail-' + userId);
  if (row) {
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
  }
};

window.toggleAllSubjectBreakdowns = function(show) {
  document.querySelectorAll('.faculty-att-detail-row').forEach(row => {
    row.style.display = show ? 'table-row' : 'none';
  });
};

window.filterFacultyAttendanceTable = function() {
  const q = (document.getElementById('faculty-att-search')?.value || '').toLowerCase().trim();
  const subFilter = document.getElementById('faculty-att-sub-filter')?.value || 'ALL';
  const yearFilter = document.getElementById('faculty-att-year-filter')?.value || 'ALL';
  const statusFilter = document.getElementById('faculty-att-status-filter')?.value || 'ALL';

  const rows = document.querySelectorAll('.faculty-att-row');
  let visibleCount = 0;

  rows.forEach(row => {
    const name = row.dataset.name || '';
    const roll = row.dataset.roll || '';
    const email = row.dataset.email || '';
    const year = row.dataset.year || '';
    const status = row.dataset.status || '';
    const subjects = JSON.parse(row.dataset.subjects || '[]');

    const matchQuery = !q || name.includes(q) || roll.includes(q) || email.includes(q);
    const matchYear = yearFilter === 'ALL' || year === yearFilter;
    const matchStatus = statusFilter === 'ALL' || status === statusFilter;
    const matchSub = subFilter === 'ALL' || subjects.includes(subFilter);

    if (matchQuery && matchYear && matchStatus && matchSub) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
      const detailRow = row.nextElementSibling;
      if (detailRow && detailRow.classList.contains('faculty-att-detail-row')) {
        detailRow.style.display = 'none';
      }
    }
  });

  const countBadge = document.getElementById('faculty-att-count');
  if (countBadge) countBadge.textContent = `${visibleCount} Students`;
};

window.showFacultyRequestDetail = function(id, type) {
  const request = type === 'OD' ? DB.findById('od_requests', id) : DB.findById('leave_requests', id);
  if (!request) return;
  const user = Auth.getCurrentUser();
  const html = renderRequestDetailModal(request, type, user, "document.getElementById('req-modal-overlay').remove()");
  document.body.insertAdjacentHTML('beforeend', html);
};

window.showEditAttendanceModal = function(studentId) {
  const studentUser = DB.findById('users', studentId);
  const attendance = API.getStudentAttendance(studentId);
  
  if (attendance.length === 0) {
    Toast.error('No subjects found for this student. They may be in a department/year with no assigned subjects.');
    return;
  }

  const html = `<div class="modal-overlay" id="edit-att-modal-overlay">
    <div class="modal" style="max-width:700px">
      <div class="modal-header">
        <h3 class="modal-title">Edit Attendance - ${studentUser.name}</h3>
        <button class="modal-close" onclick="document.getElementById('edit-att-modal-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-att-form" onsubmit="handleEditAttendanceSubmit(event, '${studentId}')">
          <table class="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Conducted</th>
                <th>Present</th>
                <th>Absent</th>
                <th>OD</th>
                <th>Leave</th>
              </tr>
            </thead>
            <tbody>
              ${attendance.map(a => `
                <tr>
                  <td style="max-width:150px;white-space:normal;font-size:var(--fs-xs)">${a.subjectName} (${a.subjectCode})</td>
                  <td><input type="number" class="form-control" name="conducted_${a.id}" id="cond_${a.id}" value="${a.conducted}" style="width:70px;padding:4px;background:var(--gray-100);color:var(--gray-500)" readonly></td>
                  <td><input type="number" class="form-control" name="present_${a.id}" id="pres_${a.id}" value="${a.present}" min="0" style="width:70px;padding:4px" required oninput="document.getElementById('abs_${a.id}').value = Math.max(0, parseInt(document.getElementById('cond_${a.id}').value) - (parseInt(this.value)||0) - (parseInt(document.getElementById('od_${a.id}').value)||0) - ${a.leave})"></td>
                  <td><input type="number" class="form-control" name="absent_${a.id}" id="abs_${a.id}" value="${a.absent}" min="0" style="width:70px;padding:4px" required></td>
                  <td><input type="number" class="form-control" name="od_${a.id}" id="od_${a.id}" value="${a.od}" min="0" style="width:70px;padding:4px" required oninput="document.getElementById('abs_${a.id}').value = Math.max(0, parseInt(document.getElementById('cond_${a.id}').value) - (parseInt(document.getElementById('pres_${a.id}').value)||0) - (parseInt(this.value)||0) - ${a.leave})"></td>
                  <td style="text-align:center">${a.leave}</td>
                  <input type="hidden" name="att_id" value="${a.id}">
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top:16px;display:flex;justify-content:flex-end;gap:12px">
            <button type="button" class="btn btn-ghost" onclick="document.getElementById('edit-att-modal-overlay').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary" id="save-att-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
};

window.handleEditAttendanceSubmit = function(e, studentId) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('save-att-btn');
  btn.disabled = true;
  btn.innerHTML = 'Saving...';
  
  try {
    const formData = new FormData(form);
    const ids = formData.getAll('att_id');
    const updates = ids.map(id => ({
      id,
      present: parseInt(formData.get('present_' + id)),
      absent: parseInt(formData.get('absent_' + id)),
      od: parseInt(formData.get('od_' + id)),
    }));
    
    // Validation
    const currentAtt = API.getStudentAttendance(studentId);
    for (const u of updates) {
      const orig = currentAtt.find(a => a.id === u.id);
      if (orig) {
        const total = u.present + u.absent + u.od + orig.leave;
        if (total > orig.conducted) {
          throw new Error(`Total (${total}) exceeds Conducted (${orig.conducted}) for a subject. Please decrease 'Absent' when you increase 'Present'.`);
        }
      }
    }
    
    API.updateStudentAttendance(studentId, updates);
    Toast.success('Attendance updated successfully');
    document.getElementById('edit-att-modal-overlay').remove();
    App.navigate(App.currentPage || 'faculty-attendance');
  } catch(err) {
    Toast.error(err.message);
    btn.disabled = false;
    btn.innerHTML = 'Save Changes';
  }
};
