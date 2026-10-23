// ============================================================
// pages/admin.js — Admin & HOD management pages
// ============================================================

// ---- Admin Dashboard ----
function renderAdminDashboard(user) {
  const analytics = API.getAnalytics();
  const isHOD = user.role === 'HOD';
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(m.toLocaleString('en-IN', { month: 'short' }));
  }

  return `
  <div class="page-header">
    <h1 class="page-title">Admin Dashboard</h1>
    <p class="page-subtitle">${isHOD ? 'HOD' : 'Administrator'} — System Overview</p>
  </div>

  <div class="stat-grid" style="margin-bottom:20px">
    <div class="stat-card primary">
      <div class="stat-icon">${Icon.students}</div>
      <div class="stat-label">Total Students</div>
      <div class="stat-value">${analytics.totalStudents}</div>
      <div class="stat-sublabel">Enrolled students</div>
    </div>
    <div class="stat-card info">
      <div class="stat-icon">${Icon.faculty}</div>
      <div class="stat-label">Total Faculty</div>
      <div class="stat-value">${analytics.totalFaculty}</div>
      <div class="stat-sublabel">Faculty members</div>
    </div>
    <div class="stat-card warning">
      <div class="stat-icon">${Icon.od}</div>
      <div class="stat-label">Pending Requests</div>
      <div class="stat-value">${analytics.pending}</div>
      <div class="stat-sublabel">Requires action</div>
    </div>
    <div class="stat-card success">
      <div class="stat-icon">${Icon.check}</div>
      <div class="stat-label">Approved</div>
      <div class="stat-value">${analytics.approved}</div>
      <div class="stat-sublabel">Total approved</div>
    </div>
    <div class="stat-card error">
      <div class="stat-icon">${Icon.x}</div>
      <div class="stat-label">Rejected</div>
      <div class="stat-value">${analytics.rejected}</div>
      <div class="stat-sublabel">Total rejected</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">${Icon.od}</div>
      <div class="stat-label">Today's OD</div>
      <div class="stat-value">${analytics.todayOD}</div>
      <div class="stat-sublabel">Submitted today</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">${Icon.leave}</div>
      <div class="stat-label">Today's Leave</div>
      <div class="stat-value">${analytics.todayLeave}</div>
      <div class="stat-sublabel">Submitted today</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">${Icon.requests}</div>
      <div class="stat-label">Total Requests</div>
      <div class="stat-value">${analytics.totalOD + analytics.totalLeave}</div>
      <div class="stat-sublabel">All time</div>
    </div>
  </div>

  <div class="grid-2" style="gap:20px;margin-bottom:20px">
    <div class="card">
      <div class="card-header"><span class="card-title">OD Requests (Last 6 Months)</span></div>
      <div class="card-body">
        ${barChart(months, analytics.monthlyOD, 'var(--primary-light)')}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Leave Requests (Last 6 Months)</span></div>
      <div class="card-body">
        ${barChart(months, analytics.monthlyLeave, '#ede9fe')}
      </div>
    </div>
  </div>

  <div class="grid-2" style="gap:20px;margin-bottom:20px">
    <div class="card">
      <div class="card-header"><span class="card-title">Department Statistics</span></div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>Department</th><th>Students</th><th>OD</th><th>Leave</th><th>Total</th></tr></thead>
          <tbody>${analytics.deptStats.map(d => `
            <tr>
              <td style="font-weight:600"><span class="badge" style="background:var(--primary-light);color:var(--primary)">${d.name}</span></td>
              <td>${d.students}</td>
              <td>${d.od}</td>
              <td>${d.leave}</td>
              <td style="font-weight:600">${d.od + d.leave}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">Approval Overview</span></div>
      <div class="card-body">
        <div style="margin-bottom:16px">
          <div class="flex-between mb-1" style="font-size:var(--fs-xs)"><span>Pending</span><span style="font-weight:600">${analytics.pending}</span></div>
          <div class="attendance-bar-container"><div class="attendance-bar warning" style="width:${analytics.totalOD+analytics.totalLeave ? Math.round(analytics.pending/(analytics.totalOD+analytics.totalLeave)*100) : 0}%"></div></div>
        </div>
        <div style="margin-bottom:16px">
          <div class="flex-between mb-1" style="font-size:var(--fs-xs)"><span>Approved</span><span style="font-weight:600;color:var(--success)">${analytics.approved}</span></div>
          <div class="attendance-bar-container"><div class="attendance-bar" style="width:${analytics.totalOD+analytics.totalLeave ? Math.round(analytics.approved/(analytics.totalOD+analytics.totalLeave)*100) : 0}%"></div></div>
        </div>
        <div>
          <div class="flex-between mb-1" style="font-size:var(--fs-xs)"><span>Rejected</span><span style="font-weight:600;color:var(--error)">${analytics.rejected}</span></div>
          <div class="attendance-bar-container"><div class="attendance-bar danger" style="width:${analytics.totalOD+analytics.totalLeave ? Math.round(analytics.rejected/(analytics.totalOD+analytics.totalLeave)*100) : 0}%"></div></div>
        </div>
        <div class="divider"></div>
        <div style="font-size:var(--fs-xs);color:var(--gray-500)">
          Total: ${analytics.totalOD + analytics.totalLeave} requests · ${analytics.totalOD} OD · ${analytics.totalLeave} Leave
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <span class="card-title">Recent Activity</span>
      <button class="btn btn-ghost btn-sm" onclick="App.navigate('audit-logs')">View audit logs →</button>
    </div>
    <div class="table-wrap">
      ${renderRecentActivity()}
    </div>
  </div>`;
}

function renderRecentActivity() {
  const logs = API.getAuditLogs().slice(0, 8);
  if (logs.length === 0) return `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No activity yet</div></div>`;
  const actionLabels = {
    SUBMITTED_OD: 'Submitted OD',
    SUBMITTED_LEAVE: 'Submitted Leave',
    FACULTY_APPROVED_OD: 'Faculty Approved OD',
    FACULTY_REJECTED_OD: 'Faculty Rejected OD',
    HOD_APPROVED_OD: 'HOD Approved OD',
    HOD_REJECTED_OD: 'HOD Rejected OD',
    FACULTY_APPROVED_LEAVE: 'Faculty Approved Leave',
    FACULTY_REJECTED_LEAVE: 'Faculty Rejected Leave',
    HOD_APPROVED_LEAVE: 'HOD Approved Leave',
    HOD_REJECTED_LEAVE: 'HOD Rejected Leave',
    APPROVED_OD: 'Approved OD',
    REJECTED_OD: 'Rejected OD',
    APPROVED_LEAVE: 'Approved Leave',
    ATTENDANCE_UPDATED: 'Attendance Updated',
  };
  return `<table class="table">
    <thead><tr><th>User</th><th>Action</th><th>Description</th><th>Time</th></tr></thead>
    <tbody>${logs.map(l => {
      const u = DB.findById('users', l.userId);
      return `<tr>
        <td style="font-size:var(--fs-xs);font-weight:500">${u?.name || '—'}</td>
        <td><span class="badge" style="background:var(--gray-100);color:var(--gray-700);font-weight:600">${actionLabels[l.action] || l.action}</span></td>
        <td style="font-size:var(--fs-xs);color:var(--gray-600);max-width:300px">${l.description}</td>
        <td class="text-muted" style="font-size:10px;white-space:nowrap">${fmtRelative(l.createdAt)}</td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

// ---- Admin — All Requests ----
function renderAdminRequests(user) {
  const allOD = API.getAllODRequests();
  const allLeave = API.getAllLeaveRequests();
  const all = [...allOD.map(r=>({...r,_type:'OD'})), ...allLeave.map(r=>({...r,_type:'LEAVE'}))]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let searchTerm = '';
  let filterStatus = '';
  let filterType = '';

  function filtered() {
    return all.filter(r => {
      const { user: stu } = API.getStudentInfo(r.studentId);
      const nameMatch = !searchTerm || stu?.name?.toLowerCase().includes(searchTerm) || r.id.includes(searchTerm);
      const statusMatch = !filterStatus || r.status === filterStatus;
      const typeMatch = !filterType || r._type === filterType;
      return nameMatch && statusMatch && typeMatch;
    });
  }

  return `
  <div class="page-header">
    <h1 class="page-title">All Requests</h1>
    <p class="page-subtitle">Manage all OD and Leave requests across departments</p>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="filter-row" style="margin-bottom:0;flex:1">
        <div class="search-bar">
          ${Icon.search}
          <input type="text" class="form-control" placeholder="Search student, ID..." id="admin-search" oninput="adminSearchChange()" />
        </div>
        <select class="filter-select" id="admin-filter-status" onchange="adminSearchChange()">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="FACULTY_APPROVED">Faculty Approved</option>
          <option value="FACULTY_REJECTED">Faculty Rejected</option>
          <option value="HOD_APPROVED">HOD Approved</option>
          <option value="HOD_REJECTED">HOD Rejected</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>
        <select class="filter-select" id="admin-filter-type" onchange="adminSearchChange()">
          <option value="">All Types</option>
          <option value="OD">OD</option>
          <option value="LEAVE">Leave</option>
        </select>
        <span class="text-muted text-small" id="admin-result-count">${all.length} requests</span>
      </div>
    </div>
    <div class="table-wrap" id="admin-requests-table">
      ${renderAdminRequestsTable(all)}
    </div>
  </div>
  <script>
    window._adminAllRequests = ${JSON.stringify(all)};
    window.adminSearchChange = function() {
      const search = document.getElementById('admin-search').value.toLowerCase().trim();
      const status = document.getElementById('admin-filter-status').value;
      const type = document.getElementById('admin-filter-type').value;
      const filtered = window._adminAllRequests.filter(r => {
        const stu = DB.findById('users', r.studentId);
        const nameMatch = !search || (stu?.name?.toLowerCase().includes(search)) || r.id.includes(search);
        const statusMatch = !status || r.status === status;
        const typeMatch = !type || r._type === type;
        return nameMatch && statusMatch && typeMatch;
      });
      document.getElementById('admin-requests-table').innerHTML = renderAdminRequestsTable(filtered);
      document.getElementById('admin-result-count').textContent = filtered.length + ' requests';
    };
  </script>`;
}

function renderAdminRequestsTable(requests) {
  if (requests.length === 0) return `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No requests found</div></div>`;
  return `<table class="table">
    <thead><tr><th>ID</th><th>Student</th><th>Type</th><th>Details</th><th>Date</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead>
    <tbody>${requests.map(r => {
      const isOD = r._type === 'OD';
      const { user: stu, profile, dept } = API.getStudentInfo(r.studentId);
      return `<tr>
        <td style="font-size:10px;font-family:monospace;color:var(--gray-400)">${r.id}</td>
        <td>
          <div style="font-weight:500;font-size:var(--fs-xs)">${stu?.name}</div>
          <div style="font-size:10px;color:var(--gray-400)">${profile?.rollNo} · ${dept?.code}</div>
        </td>
        <td><span class="badge ${isOD ? 'badge-od' : 'badge-leave'}">${isOD ? 'OD' : 'Leave'}</span></td>
        <td style="max-width:160px">
          <div style="font-size:var(--fs-xs);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${isOD ? r.eventName : r.leaveType}</div>
          <div style="font-size:10px;color:var(--gray-400)">${isOD ? r.reason : r.reason}</div>
        </td>
        <td style="font-size:var(--fs-xs)">${isOD ? fmtDate(r.odDate) : fmtDate(r.fromDate)}</td>
        <td>${statusBadge(r.status)}</td>
        <td style="font-size:10px;color:var(--gray-400)">${fmtRelative(r.createdAt)}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="showAdminRequestDetail('${r.id}','${r._type}')">${Icon.eye} View</button></td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

window.showAdminRequestDetail = function(id, type) {
  const request = type === 'OD' ? DB.findById('od_requests', id) : DB.findById('leave_requests', id);
  if (!request) return;
  const user = Auth.getCurrentUser();
  const html = renderRequestDetailModal(request, type, user, "document.getElementById('req-modal-overlay').remove()");
  document.body.insertAdjacentHTML('beforeend', html);
};

// ---- Admin Students ----
function renderAdminStudents() {
  const students = API.getAllStudents();
  let searchTerm = '';

  return `
  <div class="page-header flex-between">
    <div>
      <h1 class="page-title">Students</h1>
      <p class="page-subtitle">Manage all enrolled students across departments</p>
    </div>
    <button class="btn btn-primary" onclick="showAddStudentModal()">${Icon.plus} Add Student</button>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="search-bar">
        ${Icon.search}
        <input type="text" class="form-control" placeholder="Search by name or roll no..." id="stu-search" oninput="stuSearchChange()" />
      </div>
      <span class="text-muted text-small" id="stu-count">${students.length} students</span>
    </div>
    <div class="table-wrap" id="stu-table">
      ${renderStudentsTable(students)}
    </div>
  </div>
  <script>
    window._adminStudents = ${JSON.stringify(students)};
    window.stuSearchChange = function() {
      const s = document.getElementById('stu-search').value.toLowerCase();
      const filtered = window._adminStudents.filter(st =>
        !s || st.name.toLowerCase().includes(s) || (st.profile?.rollNo || '').toLowerCase().includes(s)
      );
      document.getElementById('stu-table').innerHTML = renderStudentsTable(filtered);
      document.getElementById('stu-count').textContent = filtered.length + ' students';
    };
  </script>`;
}

window.showAddStudentModal = function() {
  const depts = API.getDepartments();
  const html = `
  <div class="modal-overlay" id="add-stu-modal-overlay" onclick="if(event.target.id==='add-stu-modal-overlay')this.remove()">
    <div class="modal modal-md">
      <div class="modal-header">
        <span class="modal-title">Add New Student</span>
        <button class="modal-close" onclick="document.getElementById('add-stu-modal-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <form onsubmit="handleCreateStudentSubmit(event)">
          <div class="form-grid form-grid-2" style="gap:12px">
            <div class="form-group">
              <label class="form-label">Full Name <span class="required">*</span></label>
              <input type="text" id="new-stu-name" class="form-control" placeholder="Enter full name" required />
            </div>
            <div class="form-group">
              <label class="form-label">Roll Number <span class="required">*</span></label>
              <input type="text" id="new-stu-roll" class="form-control" placeholder="e.g., 22CS101" required maxlength="15" />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address <span class="required">*</span></label>
              <input type="email" id="new-stu-email" class="form-control" placeholder="e.g., student@college.edu" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password <span class="required">*</span></label>
              <input type="password" id="new-stu-pwd" class="form-control" placeholder="Enter password" required minlength="4" />
            </div>
            <div class="form-group">
              <label class="form-label">Department <span class="required">*</span></label>
              <select id="new-stu-dept" class="form-control" required>
                <option value="">Select Department</option>
                ${depts.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Year <span class="required">*</span></label>
              <select id="new-stu-year" class="form-control" required>
                <option value="">Select Year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Section <span class="required">*</span></label>
              <select id="new-stu-section" class="form-control" required>
                <option value="">Select Section</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Batch <span class="required">*</span></label>
              <input type="text" id="new-stu-batch" class="form-control" placeholder="e.g., 2024-2028" required />
            </div>
          </div>
          <div class="flex gap-2 mt-3" style="justify-content:flex-end">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('add-stu-modal-overlay').remove()">Cancel</button>
            <button type="submit" id="create-stu-btn" class="btn btn-primary">${Icon.check} Create Student</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
};

window.handleCreateStudentSubmit = async function(e) {
  e.preventDefault();
  const btn = document.getElementById('create-stu-btn');
  btn.disabled = true;
  btn.innerHTML = `${spinner(14)} Creating...`;

  try {
    await API.createStudent({
      name: document.getElementById('new-stu-name').value,
      rollNo: document.getElementById('new-stu-roll').value,
      email: document.getElementById('new-stu-email').value,
      password: document.getElementById('new-stu-pwd').value,
      departmentId: document.getElementById('new-stu-dept').value,
      year: document.getElementById('new-stu-year').value,
      section: document.getElementById('new-stu-section').value,
      batch: document.getElementById('new-stu-batch').value,
    });
    Toast.success('Student account created successfully!');
    document.getElementById('add-stu-modal-overlay')?.remove();
    App.navigate('admin-students');
  } catch(err) {
    Toast.error(err.message);
    btn.disabled = false;
    btn.innerHTML = `${Icon.check} Create Student`;
  }
};

function renderStudentsTable(students) {
  if (students.length === 0) return `<div class="empty-state"><div class="empty-state-icon">👨‍🎓</div><div class="empty-state-title">No students found</div></div>`;
  return `<table class="table">
    <thead><tr><th>Name</th><th>Roll No</th><th>Department</th><th>Year</th><th>Section</th><th>Email</th><th>Requests</th><th>Attendance</th></tr></thead>
    <tbody>${students.map(s => {
      const odCount = API.getMyODRequests(s.id).length;
      const leaveCount = API.getMyLeaveRequests(s.id).length;
      const att = API.getStudentAttendance(s.id);
      const sum = API.computeAttendanceSummary(att);
      return `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:28px;height:28px;border-radius:50%;background:var(--primary);color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${Auth.initials(s.name)}</div>
            <span style="font-weight:500;font-size:var(--fs-xs)">${s.name}</span>
          </div>
        </td>
        <td style="font-family:monospace;font-size:var(--fs-xs)">${s.profile?.rollNo || '—'}</td>
        <td style="font-size:var(--fs-xs)"><span class="badge" style="background:var(--primary-light);color:var(--primary)">${s.departmentCode || '—'}</span></td>
        <td>Year ${s.profile?.year || '—'}</td>
        <td>Section ${s.profile?.section || '—'}</td>
        <td style="font-size:var(--fs-xs);color:var(--gray-500)">${s.email}</td>
        <td style="font-size:var(--fs-xs)">${odCount} OD · ${leaveCount} Leave</td>
        <td>
          <div class="flex gap-2" style="align-items:center;min-width:90px">
            <div style="flex:1">${attendanceBar(sum.percentage)}</div>
            <span style="font-size:var(--fs-xs);font-weight:700;width:32px;color:${sum.percentage >= 75 ? 'var(--success)' : 'var(--error)'}">${sum.percentage}%</span>
          </div>
        </td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;
}

// ---- Admin Faculty ----
function renderAdminFaculty() {
  const faculty = API.getAllFaculty();
  return `
  <div class="page-header">
    <h1 class="page-title">Faculty</h1>
    <p class="page-subtitle">Manage all faculty members and HODs</p>
  </div>

  <div class="card">
    <div class="card-header"><span class="card-title">${faculty.length} faculty members</span></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Name</th><th>Employee ID</th><th>Department</th><th>Designation</th><th>Role</th><th>Email</th></tr></thead>
        <tbody>${faculty.map(f => `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;border-radius:50%;background:var(--secondary);color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${Auth.initials(f.name)}</div>
                <span style="font-weight:500;font-size:var(--fs-xs)">${f.name}</span>
              </div>
            </td>
            <td style="font-family:monospace;font-size:var(--fs-xs)">${f.profile?.employeeId || '—'}</td>
            <td style="font-size:var(--fs-xs)"><span class="badge" style="background:var(--primary-light);color:var(--primary)">${f.departmentCode || '—'}</span></td>
            <td style="font-size:var(--fs-xs)">${f.profile?.designation || '—'}</td>
            <td><span class="role-chip ${f.role.toLowerCase()}">${f.role}</span></td>
            <td style="font-size:var(--fs-xs);color:var(--gray-500)">${f.email}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ---- Departments ----
function renderDepartments() {
  const depts = API.getDepartments();
  return `
  <div class="page-header">
    <h1 class="page-title">Departments</h1>
    <p class="page-subtitle">All academic departments in the institution</p>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px">
    ${depts.map(d => {
      const students = DB.findWhere('student_profiles', sp => sp.departmentId === d.id).length;
      const fac = DB.findWhere('faculty_profiles', fp => fp.departmentId === d.id).length;
      const hod = DB.findById('users', d.hodId);
      return `<div class="card">
        <div style="padding:20px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div>
              <div style="font-size:var(--fs-xs);font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">${d.code}</div>
              <div style="font-weight:600;color:var(--gray-900);font-size:var(--fs-sm);line-height:1.3">${d.name}</div>
            </div>
            <div style="width:40px;height:40px;background:var(--primary-muted);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;font-size:18px">🏛</div>
          </div>
          <div class="divider"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
            <div>
              <div style="font-size:10px;color:var(--gray-500);margin-bottom:3px">Students</div>
              <div style="font-size:var(--fs-xl);font-weight:700;color:var(--gray-900)">${students}</div>
            </div>
            <div>
              <div style="font-size:10px;color:var(--gray-500);margin-bottom:3px">Faculty</div>
              <div style="font-size:var(--fs-xl);font-weight:700;color:var(--gray-900)">${fac}</div>
            </div>
          </div>
          <div style="font-size:var(--fs-xs);color:var(--gray-500)">
            HOD: <span style="font-weight:500;color:var(--gray-700)">${hod?.name || '—'}</span>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ---- Analytics ----
function renderAnalytics() {
  const analytics = API.getAnalytics();
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(m.toLocaleString('en-IN', { month: 'short' }));
  }
  const total = analytics.totalOD + analytics.totalLeave;
  const approvalRate = total ? Math.round((analytics.approved / total) * 100) : 0;
  const rejectionRate = total ? Math.round((analytics.rejected / total) * 100) : 0;

  return `
  <div class="page-header flex-between">
    <div>
      <h1 class="page-title">Analytics</h1>
      <p class="page-subtitle">Request trends and insights across all departments</p>
    </div>
    <button class="btn btn-secondary" onclick="exportAnalyticsPDF()">${Icon.download} Export Report</button>
  </div>

  <div class="stat-grid" style="margin-bottom:24px">
    <div class="stat-card success">
      <div class="stat-label">Approval Rate</div>
      <div class="stat-value">${approvalRate}%</div>
      <div class="stat-sublabel">${analytics.approved} of ${total} approved</div>
    </div>
    <div class="stat-card error">
      <div class="stat-label">Rejection Rate</div>
      <div class="stat-value">${rejectionRate}%</div>
      <div class="stat-sublabel">${analytics.rejected} of ${total} rejected</div>
    </div>
    <div class="stat-card warning">
      <div class="stat-label">Pending Rate</div>
      <div class="stat-value">${total ? Math.round((analytics.pending / total) * 100) : 0}%</div>
      <div class="stat-sublabel">${analytics.pending} awaiting review</div>
    </div>
    <div class="stat-card primary">
      <div class="stat-label">OD vs Leave</div>
      <div class="stat-value">${total ? Math.round((analytics.totalOD / total) * 100) : 0}%</div>
      <div class="stat-sublabel">OD out of total</div>
    </div>
  </div>

  <div class="grid-2" style="gap:20px;margin-bottom:20px">
    <div class="card">
      <div class="card-header"><span class="card-title">Monthly OD Requests</span></div>
      <div class="card-body">
        ${barChart(months, analytics.monthlyOD, 'var(--primary-light)')}
        <div class="divider"></div>
        <div style="font-size:var(--fs-xs);color:var(--gray-500)">Total: ${analytics.totalOD} OD requests all time</div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Monthly Leave Requests</span></div>
      <div class="card-body">
        ${barChart(months, analytics.monthlyLeave, '#ede9fe')}
        <div class="divider"></div>
        <div style="font-size:var(--fs-xs);color:var(--gray-500)">Total: ${analytics.totalLeave} leave requests all time</div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-bottom:20px">
    <div class="card-header"><span class="card-title">Department-wise Request Distribution</span></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Department</th><th>Students</th><th>OD Requests</th><th>Leave Requests</th><th>Total</th><th>OD Rate</th></tr></thead>
        <tbody>${analytics.deptStats.map(d => {
          const total = d.od + d.leave;
          const odRate = total ? Math.round((d.od / total) * 100) : 0;
          return `<tr>
            <td><span class="badge" style="background:var(--primary-light);color:var(--primary);font-weight:700">${d.name}</span></td>
            <td>${d.students}</td>
            <td>${d.od}</td>
            <td>${d.leave}</td>
            <td style="font-weight:600">${total}</td>
            <td>
              <div class="flex gap-2" style="align-items:center;min-width:80px">
                <div style="flex:1">${attendanceBar(odRate)}</div>
                <span style="font-size:var(--fs-xs);font-weight:600;width:30px">${odRate}%</span>
              </div>
            </td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ---- Audit Logs ----
function renderAuditLogs() {
  const logs = API.getAuditLogs();
  return `
  <div class="page-header">
    <h1 class="page-title">Audit Logs</h1>
    <p class="page-subtitle">Complete system activity trail</p>
  </div>

  <div class="card">
    <div class="card-header">
      <span class="card-title">${logs.length} log entries</span>
    </div>
    <div class="table-wrap">
      ${logs.length === 0
        ? `<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No audit logs</div></div>`
        : `<table class="table">
          <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Description</th></tr></thead>
          <tbody>${logs.map(l => {
            const u = DB.findById('users', l.userId);
            return `<tr>
              <td style="font-size:10px;white-space:nowrap;color:var(--gray-500)">${fmtDateTime(l.createdAt)}</td>
              <td>
                <div style="font-weight:500;font-size:var(--fs-xs)">${u?.name || '—'}</div>
                <div style="font-size:10px;color:var(--gray-400)">${u?.role}</div>
              </td>
              <td><span class="badge" style="background:var(--gray-100);color:var(--gray-700);font-size:10px">${l.action}</span></td>
              <td><span class="badge ${l.entityType === 'OD' ? 'badge-od' : l.entityType === 'LEAVE' ? 'badge-leave' : ''}" style="font-size:10px">${l.entityType}</span></td>
              <td style="font-size:var(--fs-xs);color:var(--gray-600);max-width:300px">${l.description}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>`}
    </div>
  </div>`;
}

// ---- Admin Attendance Overview ----
function renderAdminAttendance() {
  const students = API.getAllStudents().slice(0, 15);
  return `
  <div class="page-header">
    <h1 class="page-title">Attendance Overview</h1>
    <p class="page-subtitle">Student attendance across all departments</p>
  </div>

  <div class="card">
    <div class="card-header"><span class="card-title">Student Attendance Summary</span></div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Student</th><th>Roll No</th><th>Department</th><th>Year</th><th>Present</th><th>Absent</th><th>OD</th><th>Leave</th><th>Attendance</th><th>Status</th></tr></thead>
        <tbody>${students.map(s => {
          const att = API.getStudentAttendance(s.id);
          const sum = API.computeAttendanceSummary(att);
          return `<tr>
            <td style="font-weight:500;font-size:var(--fs-xs)">${s.name}</td>
            <td style="font-family:monospace;font-size:var(--fs-xs)">${s.profile?.rollNo}</td>
            <td><span class="badge" style="background:var(--primary-light);color:var(--primary);font-size:10px">${s.departmentCode}</span></td>
            <td>Year ${s.profile?.year}</td>
            <td style="color:var(--success);font-weight:500">${sum.present}</td>
            <td style="color:var(--error);font-weight:500">${sum.absent}</td>
            <td style="color:var(--info);font-weight:500">${sum.od}</td>
            <td style="color:var(--accent);font-weight:500">${sum.leave}</td>
            <td>
              <div class="flex gap-2" style="align-items:center;min-width:100px">
                <div style="flex:1">${attendanceBar(sum.percentage)}</div>
                <span style="font-size:var(--fs-xs);font-weight:700;width:36px;color:${sum.percentage >= 75 ? 'var(--success)' : 'var(--error)'}">${sum.percentage}%</span>
              </div>
            </td>
            <td><span class="badge ${sum.percentage >= 75 ? 'badge-hod-approved' : 'badge-faculty-rejected'}">${sum.percentage >= 75 ? 'Good' : 'Low'}</span></td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>
  </div>`;
}

// ---- System Settings ----
function renderSettings(user) {
  return `
  <div class="page-header">
    <h1 class="page-title">System Settings</h1>
    <p class="page-subtitle">Application configuration and preferences</p>
  </div>

  <div style="max-width:600px">
    <div class="card mb-4">
      <div class="card-header"><span class="card-title">HOD Approval Requirement</span></div>
      <div class="card-body">
        <p style="font-size:var(--fs-sm);color:var(--gray-600);margin-bottom:16px">Configure which requests require HOD approval in addition to faculty approval.</p>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${[
            { label: 'OD requests always require HOD approval', checked: true },
            { label: 'Leave requests require HOD approval', checked: true },
            { label: 'Emergency leave bypasses faculty approval', checked: false },
          ].map((s, i) => `
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer">
              <input type="checkbox" ${s.checked ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--primary)" />
              <span style="font-size:var(--fs-sm)">${s.label}</span>
            </label>`).join('')}
        </div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="card-header"><span class="card-title">Attendance Rules</span></div>
      <div class="card-body">
        <div class="form-grid form-grid-2" style="gap:12px">
          <div class="form-group">
            <label class="form-label">Minimum Attendance %</label>
            <input type="number" class="form-control" value="75" min="0" max="100" />
          </div>
          <div class="form-group">
            <label class="form-label">Max OD per Semester</label>
            <input type="number" class="form-control" value="10" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Max Leave per Semester</label>
            <input type="number" class="form-control" value="15" min="0" />
          </div>
        </div>
        <button class="btn btn-primary mt-2" onclick="Toast.success('Settings saved successfully.')">Save Changes</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">Data Management</span></div>
      <div class="card-body">
        <p style="font-size:var(--fs-sm);color:var(--gray-600);margin-bottom:16px">Manage application data. These actions cannot be undone.</p>
        <div class="flex gap-2">
          <button class="btn btn-secondary" onclick="Toast.success('Export initiated. Data will be downloaded as CSV.')">Export All Data</button>
          <button class="btn btn-danger" onclick="if(confirm('Reset all data? This cannot be undone.')){DB.reset();location.reload()}">Reset Demo Data</button>
        </div>
      </div>
    </div>
  </div>`;
}

// ---- Export Analytics Report as PDF ----
window.exportAnalyticsPDF = function() {
  const analytics = API.getAnalytics();
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(m.toLocaleString('en-IN', { month: 'short', year: 'numeric' }));
  }
  const total = analytics.totalOD + analytics.totalLeave;
  const approvalRate = total ? Math.round((analytics.approved / total) * 100) : 0;

  const deptRows = analytics.deptStats.map(d =>
    `<tr><td>${d.name}</td><td>${d.students}</td><td>${d.od}</td><td>${d.leave}</td><td>${d.od + d.leave}</td></tr>`
  ).join('');

  const monthlyRows = months.map((m, i) =>
    `<tr><td>${m}</td><td>${analytics.monthlyOD[i]}</td><td>${analytics.monthlyLeave[i]}</td><td>${analytics.monthlyOD[i] + analytics.monthlyLeave[i]}</td></tr>`
  ).join('');

  const win = window.open('', '_blank', 'width=860,height=700');
  win.document.write(`<!DOCTYPE html><html><head>
    <title>EduLeave Analytics Report</title>
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
      td { padding: 6px 10px; border: 1px solid #e5e7eb; text-align: center; }
      td:first-child { text-align: left; font-weight: 600; }
      .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
      .kpi { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; text-align: center; }
      .kpi-num { font-size: 26px; font-weight: 700; color: #1d4ed8; }
      .kpi-lbl { font-size: 10px; color: #6b7280; margin-top: 2px; }
      .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
    </style>
  </head><body>
    <div class="header">
      <div class="logo">E</div>
      <div>
        <div class="title">EduLeave — Analytics Report</div>
        <div class="subtitle">OD &amp; Leave Management System</div>
      </div>
      <div style="margin-left:auto;text-align:right">
        <div style="font-size:10px;color:#6b7280">Report Date</div>
        <div style="font-weight:700">${now.toLocaleDateString('en-IN')}</div>
      </div>
    </div>

    <h2>Key Metrics</h2>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-num">${analytics.totalStudents}</div><div class="kpi-lbl">Total Students</div></div>
      <div class="kpi"><div class="kpi-num">${analytics.totalFaculty}</div><div class="kpi-lbl">Total Faculty</div></div>
      <div class="kpi"><div class="kpi-num">${total}</div><div class="kpi-lbl">Total Requests</div></div>
      <div class="kpi"><div class="kpi-num">${approvalRate}%</div><div class="kpi-lbl">Approval Rate</div></div>
    </div>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-num" style="color:#1d4ed8">${analytics.totalOD}</div><div class="kpi-lbl">OD Requests</div></div>
      <div class="kpi"><div class="kpi-num" style="color:#7c3aed">${analytics.totalLeave}</div><div class="kpi-lbl">Leave Requests</div></div>
      <div class="kpi"><div class="kpi-num" style="color:#d97706">${analytics.pending}</div><div class="kpi-lbl">Pending</div></div>
      <div class="kpi"><div class="kpi-num" style="color:#dc2626">${analytics.rejected}</div><div class="kpi-lbl">Rejected</div></div>
    </div>

    <h2>Monthly Trends (Last 6 Months)</h2>
    <table>
      <thead><tr><th>Month</th><th>OD Requests</th><th>Leave Requests</th><th>Total</th></tr></thead>
      <tbody>${monthlyRows}</tbody>
    </table>

    <h2>Department Breakdown</h2>
    <table>
      <thead><tr><th>Department</th><th>Students</th><th>OD Requests</th><th>Leave Requests</th><th>Total</th></tr></thead>
      <tbody>${deptRows}</tbody>
    </table>

    <div class="footer">
      <span>Generated by EduLeave</span>
      <span>Printed on ${now.toLocaleString('en-IN')}</span>
    </div>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 400);
};
