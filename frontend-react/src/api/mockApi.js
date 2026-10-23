// ============================================================
// mockApi.js — Client-side Mock API & Demo Database
// Provides offline/mock support for React frontend when the
// backend server is not running, ensuring all demo accounts,
// workflows, attendance, and analytics work out-of-the-box.
// ============================================================

const STORAGE_KEY_PREFIX = 'eduleave_mock_';
const SEED_VERSION = 'v1.0.3';

function getStorage(key, fallback = []) {
  try {
    const val = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

function genId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

// ---- Initial Demo Data ----
function initializeMockDb(force = false) {
  if (!force && localStorage.getItem(STORAGE_KEY_PREFIX + 'version') === SEED_VERSION) {
    return;
  }

  const departments = [
    { _id: 'dept-cse', id: 'dept-cse', name: 'Computer Science and Engineering', code: 'CSE', hodId: 'user-hod-cse' },
    { _id: 'dept-it', id: 'dept-it', name: 'Information Technology', code: 'IT', hodId: 'user-hod-it' },
    { _id: 'dept-ece', id: 'dept-ece', name: 'Electronics and Communication Engineering', code: 'ECE', hodId: 'user-hod-ece' },
    { _id: 'dept-eee', id: 'dept-eee', name: 'Electrical and Electronics Engineering', code: 'EEE', hodId: 'user-hod-eee' },
  ];

  const users = [
    {
      _id: 'user-admin',
      id: 'user-admin',
      email: 'admin@college.edu',
      name: 'Dr. R. Krishnamurthy',
      role: 'ADMIN',
      phone: '9876543200',
      profile: { employeeId: 'ADM001', designation: 'Principal / Admin' },
    },
    {
      _id: 'user-hod-cse',
      id: 'user-hod-cse',
      email: 'hod@college.edu',
      name: 'Dr. S. Ramachandran',
      role: 'HOD',
      phone: '9876543210',
      profile: {
        employeeId: 'EMP1001',
        designation: 'Professor & HOD',
        departmentId: 'dept-cse',
        departmentName: 'Computer Science and Engineering',
        departmentCode: 'CSE',
      },
    },
    {
      _id: 'user-fac-1',
      id: 'user-fac-1',
      email: 'faculty@college.edu',
      name: 'Mr. A. Karthikeyan',
      role: 'FACULTY',
      phone: '9876543220',
      profile: {
        employeeId: 'EMP1002',
        designation: 'Assistant Professor',
        departmentId: 'dept-cse',
        departmentName: 'Computer Science and Engineering',
        departmentCode: 'CSE',
      },
    },
    {
      _id: 'user-stu-1',
      id: 'user-stu-1',
      email: 'student@college.edu',
      name: 'Arun Kumar M',
      role: 'STUDENT',
      phone: '9876543230',
      profile: {
        rollNo: '20CS001',
        departmentId: 'dept-cse',
        departmentName: 'Computer Science and Engineering',
        departmentCode: 'CSE',
        year: 2,
        section: 'A',
        batch: '2022-2026',
        advisorId: 'user-fac-1',
      },
    },
  ];

  const subjects = [
    { _id: 'sub-1', id: 'sub-1', name: 'Data Structures and Algorithms', code: 'CS301' },
    { _id: 'sub-2', id: 'sub-2', name: 'Database Management Systems', code: 'CS302' },
    { _id: 'sub-3', id: 'sub-3', name: 'Operating Systems', code: 'CS303' },
    { _id: 'sub-4', id: 'sub-4', name: 'Computer Networks', code: 'CS304' },
    { _id: 'sub-5', id: 'sub-5', name: 'Software Engineering', code: 'CS305' },
    { _id: 'sub-6', id: 'sub-6', name: 'Web Technologies', code: 'CS306' },
  ];

  const attendance = [
    { _id: 'att-1', studentId: 'user-stu-1', subjectName: 'Data Structures and Algorithms', subjectCode: 'CS301', conducted: 52, present: 46, absent: 3, od: 2, leave: 1 },
    { _id: 'att-2', studentId: 'user-stu-1', subjectName: 'Database Management Systems', subjectCode: 'CS302', conducted: 48, present: 40, absent: 5, od: 1, leave: 2 },
    { _id: 'att-3', studentId: 'user-stu-1', subjectName: 'Operating Systems', subjectCode: 'CS303', conducted: 44, present: 38, absent: 4, od: 2, leave: 0 },
    { _id: 'att-4', studentId: 'user-stu-1', subjectName: 'Computer Networks', subjectCode: 'CS304', conducted: 50, present: 44, absent: 4, od: 1, leave: 1 },
    { _id: 'att-5', studentId: 'user-stu-1', subjectName: 'Software Engineering', subjectCode: 'CS305', conducted: 46, present: 36, absent: 6, od: 3, leave: 1 },
    { _id: 'att-6', studentId: 'user-stu-1', subjectName: 'Web Technologies', subjectCode: 'CS306', conducted: 42, present: 40, absent: 2, od: 0, leave: 0 },
  ].map(a => ({
    ...a,
    percentage: Math.round(((a.present + a.od) / a.conducted) * 100),
  }));

  const odRequests = [
    {
      _id: 'od-001',
      id: 'od-001',
      studentId: 'user-stu-1',
      studentName: 'Arun Kumar M',
      eventName: 'National Level Hackathon - CodeFest',
      venue: 'Anna University, Chennai',
      odDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '18:00',
      hours: 10,
      reason: 'Participating in national level hackathon representing the department',
      description: 'Selected to represent the college at the inter-collegiate hackathon.',
      status: 'HOD_APPROVED',
      facultyRemarks: 'Verified registration. Approved.',
      hodRemarks: 'Best wishes. Approved.',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      _id: 'od-002',
      id: 'od-002',
      studentId: 'user-stu-1',
      studentName: 'Arun Kumar M',
      eventName: 'AI / ML Hands-on Workshop',
      venue: 'IIT Madras Research Park',
      odDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      hours: 8,
      reason: 'Attending IEEE sponsored technical workshop on Deep Learning',
      description: 'Workshop certificate and invitation submitted.',
      status: 'PENDING',
      facultyRemarks: null,
      hodRemarks: null,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      _id: 'od-003',
      id: 'od-003',
      studentId: 'user-stu-1',
      studentName: 'Arun Kumar M',
      eventName: 'Paper Presentation - Smart Tech',
      venue: 'PSG College of Technology',
      odDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      startTime: '09:30',
      endTime: '16:30',
      hours: 7,
      reason: 'Presenting research paper on IoT sensor networks',
      description: 'Paper accepted for oral presentation in track 2.',
      status: 'FACULTY_APPROVED',
      facultyRemarks: 'Paper accepted. Recommended for HOD approval.',
      hodRemarks: null,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  const leaveRequests = [
    {
      _id: 'lv-001',
      id: 'lv-001',
      studentId: 'user-stu-1',
      studentName: 'Arun Kumar M',
      leaveType: 'Medical Leave',
      reason: 'Viral fever and prescribed medical rest',
      fromDate: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0],
      toDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      days: 2,
      status: 'HOD_APPROVED',
      facultyRemarks: 'Doctor certificate attached.',
      hodRemarks: 'Approved.',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      _id: 'lv-002',
      id: 'lv-002',
      studentId: 'user-stu-1',
      studentName: 'Arun Kumar M',
      leaveType: 'Personal',
      reason: 'Family function in hometown',
      fromDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      toDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      days: 2,
      status: 'PENDING',
      facultyRemarks: null,
      hodRemarks: null,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const notifications = [
    {
      _id: 'ntf-1',
      id: 'ntf-1',
      userId: 'user-stu-1',
      title: 'OD Request Approved',
      message: 'Your OD request for "National Level Hackathon" has been approved by HOD.',
      type: 'SUCCESS',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      _id: 'ntf-2',
      id: 'ntf-2',
      userId: 'user-fac-1',
      title: 'New OD Request Submitted',
      message: 'Arun Kumar M submitted an OD request for review.',
      type: 'INFO',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      _id: 'ntf-3',
      id: 'ntf-3',
      userId: 'user-hod-cse',
      title: 'OD Request Awaiting Final Approval',
      message: 'Paper Presentation request recommended by faculty.',
      type: 'INFO',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ];

  const auditLogs = [
    {
      _id: 'aud-1',
      userId: 'user-hod-cse',
      action: 'HOD_APPROVED',
      entityType: 'OD',
      entityId: 'od-001',
      description: 'HOD approved OD request for National Level Hackathon',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      _id: 'aud-2',
      userId: 'user-fac-1',
      action: 'FACULTY_APPROVED',
      entityType: 'OD',
      entityId: 'od-003',
      description: 'Faculty approved OD request for Paper Presentation',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  setStorage('departments', departments);
  setStorage('users', users);
  setStorage('subjects', subjects);
  setStorage('attendance', attendance);
  setStorage('od', odRequests);
  setStorage('leave', leaveRequests);
  setStorage('notifications', notifications);
  setStorage('audit_logs', auditLogs);
  localStorage.setItem(STORAGE_KEY_PREFIX + 'version', SEED_VERSION);
}

// Ensure database is initialized on load
initializeMockDb();

// ---- Mock Request Handler ----
export async function handleMockRequest(config) {
  initializeMockDb();

  const method = (config.method || 'get').toUpperCase();
  // Strip baseURL or leading slash
  let url = config.url || '';
  if (url.startsWith('http')) {
    try {
      const parsed = new URL(url);
      url = parsed.pathname;
    } catch {
      // ignore
    }
  }
  // Strip /api prefix if present
  url = url.replace(/^\/api/, '');
  const [path, queryString] = url.split('?');
  const queryParams = new URLSearchParams(queryString || '');

  // Get current session user
  let sessionUser = null;
  try {
    sessionUser = JSON.parse(localStorage.getItem('user'));
  } catch {
    sessionUser = null;
  }

  // Parse body
  let body = {};
  if (config.data) {
    body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
  }

  // Helper response wrapper
  const ok = (data, status = 200) => Promise.resolve({ data, status, statusText: 'OK', headers: {}, config });
  const error = (message, status = 400) => {
    const err = new Error(message);
    err.response = { status, data: { message } };
    return Promise.reject(err);
  };

  // 1. POST /auth/login
  if (method === 'POST' && path === '/auth/login') {
    const email = (body.email || '').trim().toLowerCase();
    const users = getStorage('users', []);
    let user = users.find(u => u.email.toLowerCase() === email);

    // If demo account clicked or common email format, support seamless login
    if (!user) {
      if (email.startsWith('student')) {
        user = users.find(u => u.role === 'STUDENT');
      } else if (email.startsWith('faculty')) {
        user = users.find(u => u.role === 'FACULTY');
      } else if (email.startsWith('hod')) {
        user = users.find(u => u.role === 'HOD');
      } else if (email.startsWith('admin')) {
        user = users.find(u => u.role === 'ADMIN');
      }
    }

    if (!user) {
      return error('Invalid email address. Use one of the demo accounts.', 401);
    }

    const token = 'mock_jwt_token_' + btoa(user._id + ':' + Date.now());
    return ok({ token, user });
  }

  // 1b. GET /auth/departments or /admin/departments
  if (path === '/auth/departments' || path === '/admin/departments' || path === '/departments') {
    return ok(getStorage('departments', []));
  }

  // 1c. POST /auth/register — Student self-registration
  if (method === 'POST' && (path === '/auth/register' || path === '/auth/student-register')) {
    const { name, email, password, phone, rollNo, departmentId, year, section, batch } = body;
    if (!name || !email || !rollNo || !departmentId) {
      return error('Name, email, roll number, and department are required.', 400);
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanRoll = rollNo.toUpperCase().trim();
    const users = getStorage('users', []);

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return error('An account with this email address already exists.', 400);
    }
    if (users.some(u => u.profile?.rollNo?.toUpperCase() === cleanRoll)) {
      return error(`A student with roll number "${cleanRoll}" is already registered.`, 400);
    }

    const depts = getStorage('departments', []);
    const dept = depts.find(d => d._id === departmentId || d.id === departmentId || d.code === departmentId) || {
      _id: departmentId,
      name: 'Computer Science and Engineering',
      code: 'CSE',
    };

    const userId = genId('user-stu-');
    const newUser = {
      _id: userId,
      id: userId,
      email: cleanEmail,
      name: name.trim(),
      role: 'STUDENT',
      phone: phone?.trim() || '',
      profile: {
        rollNo: cleanRoll,
        departmentId: dept._id || dept.id,
        departmentName: dept.name,
        departmentCode: dept.code,
        year: parseInt(year) || 1,
        section: (section || 'A').toUpperCase().trim(),
        batch: batch?.trim() || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
        advisorId: 'user-fac-1',
      },
    };

    users.push(newUser);
    setStorage('users', users);

    // Initial student attendance
    const subjects = getStorage('subjects', [
      { _id: 'sub-1', name: 'Data Structures and Algorithms', code: 'CS301' },
      { _id: 'sub-2', name: 'Database Management Systems', code: 'CS302' },
      { _id: 'sub-3', name: 'Operating Systems', code: 'CS303' },
      { _id: 'sub-4', name: 'Computer Networks', code: 'CS304' },
      { _id: 'sub-5', name: 'Software Engineering', code: 'CS305' },
      { _id: 'sub-6', name: 'Web Technologies', code: 'CS306' },
    ]);

    const att = getStorage('attendance', []);
    subjects.forEach((s) => {
      att.push({
        _id: genId('att-'),
        studentId: userId,
        subjectName: s.name,
        subjectCode: s.code,
        conducted: 50,
        present: 45,
        absent: 5,
        od: 0,
        leave: 0,
      });
    });
    setStorage('attendance', att);

    // Audit log
    const auditLogs = getStorage('audit_logs', []);
    auditLogs.unshift({
      _id: genId('aud-'),
      userId,
      action: 'STUDENT_REGISTERED',
      entityType: 'STUDENT',
      entityId: userId,
      description: `New student registration: ${newUser.name} (${cleanRoll}) - ${dept.code}`,
      createdAt: new Date().toISOString(),
    });
    setStorage('audit_logs', auditLogs);

    const token = 'mock_jwt_token_' + btoa(newUser._id + ':' + Date.now());
    return ok({ token, user: newUser, message: 'Student registered successfully!' }, 201);
  }

  // 1d. /admin/students — List & Create Students
  if (path === '/admin/students') {
    if (method === 'GET') {
      const users = getStorage('users', []);
      const students = users.filter(u => u.role === 'STUDENT').map(u => ({
        ...u,
        departmentName: u.profile?.departmentName || 'CSE',
        departmentCode: u.profile?.departmentCode || 'CSE',
      }));
      return ok(students);
    }
    if (method === 'POST') {
      const { name, email, phone, rollNo, departmentId, year, section, batch } = body;
      if (!name || !email || !rollNo || !departmentId) {
        return error('Name, email, roll number, and department are required.', 400);
      }
      const cleanEmail = email.toLowerCase().trim();
      const cleanRoll = rollNo.toUpperCase().trim();
      const users = getStorage('users', []);
      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        return error('An account with this email address already exists.', 400);
      }
      if (users.some(u => u.profile?.rollNo?.toUpperCase() === cleanRoll)) {
        return error(`Roll number "${cleanRoll}" already exists.`, 400);
      }
      const depts = getStorage('departments', []);
      const dept = depts.find(d => d._id === departmentId || d.id === departmentId || d.code === departmentId) || {
        _id: departmentId, name: 'Computer Science and Engineering', code: 'CSE'
      };
      const userId = genId('user-stu-');
      const newUser = {
        _id: userId,
        id: userId,
        email: cleanEmail,
        name: name.trim(),
        role: 'STUDENT',
        phone: phone?.trim() || '',
        profile: {
          rollNo: cleanRoll,
          departmentId: dept._id || dept.id,
          departmentName: dept.name,
          departmentCode: dept.code,
          year: parseInt(year) || 1,
          section: (section || 'A').toUpperCase().trim(),
          batch: batch?.trim() || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
        },
        departmentName: dept.name,
        departmentCode: dept.code,
      };
      users.push(newUser);
      setStorage('users', users);

      const auditLogs = getStorage('audit_logs', []);
      auditLogs.unshift({
        _id: genId('aud-'),
        userId: sessionUser?.id || 'admin',
        action: 'ADMIN_CREATED_STUDENT',
        entityType: 'STUDENT',
        entityId: userId,
        description: `Admin registered student: ${name} (${cleanRoll})`,
        createdAt: new Date().toISOString(),
      });
      setStorage('audit_logs', auditLogs);

      return ok(newUser, 201);
    }
  }

  // 2. Notifications
  if (path === '/notifications') {
    if (method === 'GET') {
      const notifs = getStorage('notifications', []);
      const userNotifs = sessionUser ? notifs.filter(n => n.userId === sessionUser.id || n.userId === sessionUser._id) : notifs;
      return ok(userNotifs);
    }
  }

  if (path === '/notifications/unread-count') {
    const notifs = getStorage('notifications', []);
    const count = sessionUser
      ? notifs.filter(n => (n.userId === sessionUser.id || n.userId === sessionUser._id) && !n.isRead).length
      : 0;
    return ok({ count });
  }

  const notifReadMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
  if (method === 'PATCH' && notifReadMatch) {
    const notifId = notifReadMatch[1];
    const notifs = getStorage('notifications', []).map(n =>
      (n._id === notifId || n.id === notifId) ? { ...n, isRead: true } : n
    );
    setStorage('notifications', notifs);
    return ok({ success: true });
  }

  // 3. Attendance
  if (path === '/attendance/my') {
    const att = getStorage('attendance', []);
    return ok(att);
  }

  // 4. Student OD & Leave Requests
  if (path === '/od/my') {
    const ods = getStorage('od', []);
    return ok(ods);
  }

  if (path === '/leave/my') {
    const leaves = getStorage('leave', []);
    return ok(leaves);
  }

  // 5. Submit OD
  if (method === 'POST' && path === '/od') {
    const ods = getStorage('od', []);
    const newOD = {
      _id: genId('od-'),
      studentId: sessionUser?.id || sessionUser?._id || 'user-stu-1',
      studentName: sessionUser?.name || 'Student',
      eventName: body.eventName || 'Event',
      venue: body.venue || 'Venue',
      odDate: body.odDate || new Date().toISOString().split('T')[0],
      startTime: body.startTime || '09:00',
      endTime: body.endTime || '17:00',
      hours: Number(body.hours) || 8,
      reason: body.reason || '',
      description: body.description || '',
      status: 'PENDING',
      facultyRemarks: null,
      hodRemarks: null,
      createdAt: new Date().toISOString(),
    };
    ods.unshift(newOD);
    setStorage('od', ods);

    // Add faculty notification
    const notifs = getStorage('notifications', []);
    notifs.unshift({
      _id: genId('ntf-'),
      userId: 'user-fac-1',
      title: 'New OD Request Submitted',
      message: `${newOD.studentName} applied for OD: ${newOD.eventName}`,
      type: 'INFO',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setStorage('notifications', notifs);

    return ok(newOD, 201);
  }

  // 6. Submit Leave
  if (method === 'POST' && path === '/leave') {
    const leaves = getStorage('leave', []);
    const newLeave = {
      _id: genId('lv-'),
      studentId: sessionUser?.id || sessionUser?._id || 'user-stu-1',
      studentName: sessionUser?.name || 'Student',
      leaveType: body.leaveType || 'Medical Leave',
      fromDate: body.fromDate || new Date().toISOString().split('T')[0],
      toDate: body.toDate || new Date().toISOString().split('T')[0],
      days: Number(body.days) || 1,
      reason: body.reason || '',
      status: 'PENDING',
      facultyRemarks: null,
      hodRemarks: null,
      createdAt: new Date().toISOString(),
    };
    leaves.unshift(newLeave);
    setStorage('leave', leaves);

    // Add faculty notification
    const notifs = getStorage('notifications', []);
    notifs.unshift({
      _id: genId('ntf-'),
      userId: 'user-fac-1',
      title: 'New Leave Request Submitted',
      message: `${newLeave.studentName} applied for ${newLeave.leaveType}`,
      type: 'INFO',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setStorage('notifications', notifs);

    return ok(newLeave, 201);
  }

  // 7. Withdraw OD / Leave
  const withdrawODMatch = path.match(/^\/od\/([^/]+)\/withdraw$/);
  if (method === 'PATCH' && withdrawODMatch) {
    const id = withdrawODMatch[1];
    const ods = getStorage('od', []).map(r =>
      (r._id === id || r.id === id) ? { ...r, status: 'WITHDRAWN' } : r
    );
    setStorage('od', ods);
    return ok({ success: true });
  }

  const withdrawLeaveMatch = path.match(/^\/leave\/([^/]+)\/withdraw$/);
  if (method === 'PATCH' && withdrawLeaveMatch) {
    const id = withdrawLeaveMatch[1];
    const leaves = getStorage('leave', []).map(r =>
      (r._id === id || r.id === id) ? { ...r, status: 'WITHDRAWN' } : r
    );
    setStorage('leave', leaves);
    return ok({ success: true });
  }

  // 8. Pending Requests (Faculty & HOD)
  if (path === '/od/pending') {
    const ods = getStorage('od', []).filter(r => r.status === 'PENDING');
    return ok(ods);
  }

  if (path === '/leave/pending') {
    const leaves = getStorage('leave', []).filter(r => r.status === 'PENDING');
    return ok(leaves);
  }

  if (path === '/od/hod-pending') {
    const ods = getStorage('od', []).filter(r => r.status === 'FACULTY_APPROVED');
    return ok(ods);
  }

  if (path === '/leave/hod-pending') {
    const leaves = getStorage('leave', []).filter(r => r.status === 'FACULTY_APPROVED');
    return ok(leaves);
  }

  // 9. All requests (Admin)
  if (path === '/od/all') {
    return ok(getStorage('od', []));
  }

  if (path === '/leave/all') {
    return ok(getStorage('leave', []));
  }

  // 10. Approve / Reject OD & Leave
  const actionODMatch = path.match(/^\/od\/([^/]+)\/(approve|reject)$/);
  if (method === 'PATCH' && actionODMatch) {
    const [, id, action] = actionODMatch;
    const isHOD = queryParams.get('level') === 'hod' || sessionUser?.role === 'HOD';
    const newStatus = action === 'approve'
      ? (isHOD ? 'HOD_APPROVED' : 'FACULTY_APPROVED')
      : (isHOD ? 'HOD_REJECTED' : 'FACULTY_REJECTED');

    let updatedReq = null;
    const ods = getStorage('od', []).map(r => {
      if (r._id === id || r.id === id) {
        updatedReq = {
          ...r,
          status: newStatus,
          [isHOD ? 'hodRemarks' : 'facultyRemarks']: body.remarks || 'Reviewed',
        };
        return updatedReq;
      }
      return r;
    });
    setStorage('od', ods);

    // If HOD Approved, automatically update student's attendance
    if (newStatus === 'HOD_APPROVED') {
      const att = getStorage('attendance', []).map((a, idx) => {
        if (idx === 0 && a.absent > 0) {
          const absent = a.absent - 1;
          const od = a.od + 1;
          return { ...a, absent, od, percentage: Math.round(((a.present + od) / a.conducted) * 100) };
        }
        return a;
      });
      setStorage('attendance', att);
    }

    // Add notification for student
    if (updatedReq) {
      const notifs = getStorage('notifications', []);
      notifs.unshift({
        _id: genId('ntf-'),
        userId: updatedReq.studentId,
        title: `OD Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Your OD request for "${updatedReq.eventName}" was ${action === 'approve' ? 'approved' : 'rejected'}${isHOD ? ' by HOD' : ' by Faculty'}.`,
        type: action === 'approve' ? 'SUCCESS' : 'ERROR',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setStorage('notifications', notifs);
    }

    return ok({ success: true, request: updatedReq });
  }

  const actionLeaveMatch = path.match(/^\/leave\/([^/]+)\/(approve|reject)$/);
  if (method === 'PATCH' && actionLeaveMatch) {
    const [, id, action] = actionLeaveMatch;
    const isHOD = queryParams.get('level') === 'hod' || sessionUser?.role === 'HOD';
    const newStatus = action === 'approve'
      ? (isHOD ? 'HOD_APPROVED' : 'FACULTY_APPROVED')
      : (isHOD ? 'HOD_REJECTED' : 'FACULTY_REJECTED');

    let updatedReq = null;
    const leaves = getStorage('leave', []).map(r => {
      if (r._id === id || r.id === id) {
        updatedReq = {
          ...r,
          status: newStatus,
          [isHOD ? 'hodRemarks' : 'facultyRemarks']: body.remarks || 'Reviewed',
        };
        return updatedReq;
      }
      return r;
    });
    setStorage('leave', leaves);

    // If HOD Approved, automatically update attendance
    if (newStatus === 'HOD_APPROVED') {
      const att = getStorage('attendance', []).map((a, idx) => {
        if (idx === 0 && a.absent > 0) {
          const absent = a.absent - 1;
          const leave = a.leave + 1;
          return { ...a, absent, leave, percentage: Math.round(((a.present + a.od) / a.conducted) * 100) };
        }
        return a;
      });
      setStorage('attendance', att);
    }

    // Add notification for student
    if (updatedReq) {
      const notifs = getStorage('notifications', []);
      notifs.unshift({
        _id: genId('ntf-'),
        userId: updatedReq.studentId,
        title: `Leave Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Your leave request for "${updatedReq.leaveType}" was ${action === 'approve' ? 'approved' : 'rejected'}${isHOD ? ' by HOD' : ' by Faculty'}.`,
        type: action === 'approve' ? 'SUCCESS' : 'ERROR',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setStorage('notifications', notifs);
    }

    return ok({ success: true, request: updatedReq });
  }

  // 11. Admin Analytics & Audit Logs
  if (path === '/admin/analytics') {
    const ods = getStorage('od', []);
    const leaves = getStorage('leave', []);
    const all = [...ods, ...leaves];
    const total = all.length;
    const pending = all.filter(r => r.status === 'PENDING' || r.status === 'FACULTY_APPROVED').length;
    const approved = all.filter(r => r.status === 'HOD_APPROVED').length;
    const rejected = all.filter(r => r.status.includes('REJECTED')).length;

    return ok({
      totalStudents: 20,
      totalFaculty: 8,
      totalOD: ods.length,
      totalLeave: leaves.length,
      pending,
      approved,
      rejected,
      approvalRate: total ? Math.round((approved / total) * 100) : 0,
      monthlyTrends: [
        { month: 'May', od: 8, leave: 4, total: 12 },
        { month: 'Jun', od: 12, leave: 6, total: 18 },
        { month: 'Jul', od: 15, leave: 9, total: 24 },
        { month: 'Aug', od: 20, leave: 8, total: 28 },
        { month: 'Sep', od: ods.length, leave: leaves.length, total: ods.length + leaves.length },
      ],
      deptBreakdown: [
        { dept: 'CSE', students: 10, od: ods.length, leave: leaves.length, total: ods.length + leaves.length },
        { dept: 'IT',  students: 4,  od: 5, leave: 2, total: 7 },
        { dept: 'ECE', students: 3,  od: 4, leave: 3, total: 7 },
        { dept: 'EEE', students: 3,  od: 2, leave: 1, total: 3 },
      ],
    });
  }

  if (path === '/admin/audit-logs') {
    return ok(getStorage('audit_logs', []));
  }

  return error(`Mock route not found: ${method} ${path}`, 404);
}
