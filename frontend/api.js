// ============================================================
// api.js — All "API" methods (business logic layer)
// Operates on the in-browser DB, simulating a real REST API
// ============================================================

const API = {
  // ---- Notifications ----
  getNotifications(userId) {
    return DB.findWhere('notifications', n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getUnreadCount(userId) {
    return DB.findWhere('notifications', n => n.userId === userId && !n.isRead).length;
  },
  markNotifRead(id) { DB.update('notifications', id, { isRead: true }); },
  markAllRead(userId) {
    const notifs = DB.findWhere('notifications', n => n.userId === userId && !n.isRead);
    notifs.forEach(n => DB.update('notifications', n.id, { isRead: true }));
  },
  addNotification(userId, title, message, type = 'INFO', relatedId = null, relatedType = null) {
    return DB.insert('notifications', {
      id: generateId('ntf-'), userId, title, message, type,
      isRead: false, relatedId, relatedType,
      createdAt: new Date().toISOString(),
    });
  },

  // ---- Attendance ----
  getStudentAttendance(studentId) {
    const records = DB.findWhere('attendance', a => a.studentId === studentId);
    return records.map(r => {
      const subject = DB.findById('subjects', r.subjectId);
      return { ...r, subjectName: subject?.name, subjectCode: subject?.code };
    });
  },
  updateAttendanceForOD(studentId, odRequest) {
    const subjects = DB.findWhere('attendance', a => a.studentId === studentId);
    if (subjects.length === 0) return;
    // Mark first 2 subjects as affected by OD (realistic simulation)
    const toUpdate = subjects.slice(0, Math.min(2, subjects.length));
    toUpdate.forEach(att => {
      if (att.absent > 0) {
        DB.update('attendance', att.id, { absent: att.absent - 1, od: att.od + 1 });
      }
    });
    DB.insert('audit_logs', {
      id: generateId('aud-'), userId: studentId,
      action: 'ATTENDANCE_UPDATED', entityType: 'ATTENDANCE', entityId: odRequest.id,
      description: `Attendance updated for approved OD: ${odRequest.eventName}`,
      createdAt: new Date().toISOString(),
    });
  },
  updateAttendanceForLeave(studentId, leaveRequest) {
    const subjects = DB.findWhere('attendance', a => a.studentId === studentId);
    if (subjects.length === 0) return;
    const days = leaveRequest.days || 1;
    const toUpdate = subjects.slice(0, Math.min(days * 2, subjects.length));
    toUpdate.forEach(att => {
      if (att.absent > 0) {
        DB.update('attendance', att.id, { absent: att.absent - 1, leave: att.leave + 1 });
      }
    });
    DB.insert('audit_logs', {
      id: generateId('aud-'), userId: studentId,
      action: 'ATTENDANCE_UPDATED', entityType: 'ATTENDANCE', entityId: leaveRequest.id,
      description: `Attendance updated for approved leave: ${leaveRequest.leaveType}`,
      createdAt: new Date().toISOString(),
    });
  },
  computeAttendanceSummary(records) {
    const total = records.reduce((s, r) => s + r.conducted, 0);
    const present = records.reduce((s, r) => s + r.present, 0);
    const absent = records.reduce((s, r) => s + r.absent, 0);
    const od = records.reduce((s, r) => s + r.od, 0);
    const leave = records.reduce((s, r) => s + r.leave, 0);
    const pct = total ? Math.round(((present + od) / total) * 100) : 0;
    return { total, present, absent, od, leave, percentage: pct };
  },
  
  updateStudentAttendance(studentId, recordsData) {
    recordsData.forEach(data => {
      DB.update('attendance', data.id, {
        present: parseInt(data.present) || 0,
        absent: parseInt(data.absent) || 0,
        od: parseInt(data.od) || 0,
        updatedAt: new Date().toISOString()
      });
    });
    DB.insert('audit_logs', {
      id: generateId('aud-'), userId: Auth.getCurrentUser().id,
      action: 'ATTENDANCE_UPDATED_MANUALLY', entityType: 'STUDENT', entityId: studentId,
      description: 'Faculty manually updated attendance',
      createdAt: new Date().toISOString(),
    });
  },

  // ---- OD Requests ----
  submitOD(studentId, data) {
    const user = Auth.getCurrentUser();
    // Duplicate check
    const exists = DB.findOneWhere('od_requests', r =>
      r.studentId === studentId && r.odDate === data.odDate && r.status !== 'FACULTY_REJECTED' && r.status !== 'HOD_REJECTED' && r.status !== 'WITHDRAWN'
    );
    if (exists) throw new Error('A request already exists for this date. Please check your existing requests.');
    const id = generateId('od-');
    const request = {
      id, studentId,
      eventName: data.eventName,
      venue: data.venue,
      odDate: data.odDate,
      startTime: data.startTime,
      endTime: data.endTime,
      hours: data.hours,
      reason: data.reason,
      description: data.description,
      status: 'PENDING',
      facultyId: null, facultyRemarks: null,
      hodId: null, hodRemarks: null,
      attendanceUpdated: false,
      documentName: data.documentName || null,
      documentData: data.documentData || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    DB.insert('od_requests', request);
    DB.insert('audit_logs', {
      id: generateId('aud-'), userId: studentId,
      action: 'SUBMITTED_OD', entityType: 'OD', entityId: id,
      description: `Student submitted OD request for: ${data.eventName}`,
      createdAt: new Date().toISOString(),
    });
    // Notify faculty advisors
    const faculties = DB.findWhere('faculty_profiles', fp => {
      const sp = DB.findOneWhere('student_profiles', p => p.userId === studentId);
      return sp && fp.departmentId === sp.departmentId;
    });
    faculties.slice(0, 1).forEach(fp => {
      this.addNotification(fp.userId, 'New OD Request',
        `${user.name} has submitted an OD request for "${data.eventName}".`,
        'INFO', id, 'OD');
    });
    this.addNotification(studentId, 'OD Request Submitted',
      `Your OD request for "${data.eventName}" has been submitted and is awaiting faculty review.`,
      'INFO', id, 'OD');
    return request;
  },

  getMyODRequests(studentId) {
    return DB.findWhere('od_requests', r => r.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getPendingODRequests(facultyId) {
    // Faculty sees OD from their department students
    const fp = DB.findOneWhere('faculty_profiles', p => p.userId === facultyId);
    if (!fp) return [];
    const deptStudentIds = DB.findWhere('student_profiles', sp => sp.departmentId === fp.departmentId)
      .map(sp => sp.userId);
    return DB.findWhere('od_requests', r => deptStudentIds.includes(r.studentId) && r.status === 'PENDING')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAllODRequests() {
    return DB.getAll('od_requests').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getHODPendingRequests(hodId) {
    const fp = DB.findOneWhere('faculty_profiles', p => p.userId === hodId);
    if (!fp) return { od: [], leave: [] };
    const deptStudentIds = DB.findWhere('student_profiles', sp => sp.departmentId === fp.departmentId)
      .map(sp => sp.userId);
    const od = DB.findWhere('od_requests', r => deptStudentIds.includes(r.studentId) && r.status === 'FACULTY_APPROVED')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const leave = DB.findWhere('leave_requests', r => deptStudentIds.includes(r.studentId) && r.status === 'FACULTY_APPROVED')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { od, leave };
  },

  approveOD(requestId, facultyId, remarks, isHOD = false) {
    const request = DB.findById('od_requests', requestId);
    if (!request) throw new Error('Request not found.');
    const newStatus = isHOD ? 'HOD_APPROVED' : 'FACULTY_APPROVED';
    const updates = isHOD
      ? { status: newStatus, hodId: facultyId, hodRemarks: remarks, updatedAt: new Date().toISOString() }
      : { status: newStatus, facultyId, facultyRemarks: remarks, updatedAt: new Date().toISOString() };
    DB.update('od_requests', requestId, updates);
    DB.insert('approval_history', {
      id: generateId('aph-'), requestId, requestType: 'OD',
      approverId: facultyId, action: newStatus, remarks,
      createdAt: new Date().toISOString(),
    });
    DB.insert('audit_logs', {
      id: generateId('aud-'), userId: facultyId,
      action: isHOD ? 'HOD_APPROVED_OD' : 'FACULTY_APPROVED_OD',
      entityType: 'OD', entityId: requestId,
      description: `${isHOD ? 'HOD' : 'Faculty'} approved OD request`,
      createdAt: new Date().toISOString(),
    });
    if (isHOD) {
      // Update attendance
      const updatedRequest = { ...request, ...updates };
      if (!request.attendanceUpdated) {
        this.updateAttendanceForOD(request.studentId, updatedRequest);
        DB.update('od_requests', requestId, { attendanceUpdated: true });
      }
      this.addNotification(request.studentId, 'OD Request Approved ✓',
        `Your OD request for "${request.eventName}" has been fully approved. Attendance has been updated.`,
        'SUCCESS', requestId, 'OD');
    } else {
      this.addNotification(request.studentId, 'OD Approved by Faculty',
        `Your OD request for "${request.eventName}" has been approved by Faculty. Pending HOD review.`,
        'SUCCESS', requestId, 'OD');
      // Notify HOD
      const sp = DB.findOneWhere('student_profiles', p => p.userId === request.studentId);
      if (sp) {
        const dept = DB.findById('departments', sp.departmentId);
        if (dept?.hodId) {
          this.addNotification(dept.hodId, 'OD Request Awaiting Your Approval',
            `OD request for student requires your approval.`,
            'INFO', requestId, 'OD');
        }
      }
    }
  },

  rejectOD(requestId, facultyId, remarks, isHOD = false) {
    const request = DB.findById('od_requests', requestId);
    if (!request) throw new Error('Request not found.');
    const newStatus = isHOD ? 'HOD_REJECTED' : 'FACULTY_REJECTED';
    const updates = isHOD
      ? { status: newStatus, hodId: facultyId, hodRemarks: remarks, updatedAt: new Date().toISOString() }
      : { status: newStatus, facultyId, facultyRemarks: remarks, updatedAt: new Date().toISOString() };
    DB.update('od_requests', requestId, updates);
    DB.insert('approval_history', {
      id: generateId('aph-'), requestId, requestType: 'OD',
      approverId: facultyId, action: newStatus, remarks,
      createdAt: new Date().toISOString(),
    });
    DB.insert('audit_logs', {
      id: generateId('aud-'), userId: facultyId,
      action: isHOD ? 'HOD_REJECTED_OD' : 'FACULTY_REJECTED_OD',
      entityType: 'OD', entityId: requestId,
      description: `${isHOD ? 'HOD' : 'Faculty'} rejected OD request. Reason: ${remarks}`,
      createdAt: new Date().toISOString(),
    });
    this.addNotification(request.studentId, 'OD Request Rejected',
      `Your OD request for "${request.eventName}" was rejected. Reason: ${remarks}`,
      'ERROR', requestId, 'OD');
  },

  // ---- Leave Requests ----
  submitLeave(studentId, data) {
    const user = Auth.getCurrentUser();
    const id = generateId('lv-');
    const request = {
      id, studentId,
      leaveType: data.leaveType,
      fromDate: data.fromDate,
      toDate: data.toDate,
      days: data.days,
      reason: data.reason,
      description: data.description,
      status: 'PENDING',
      facultyId: null, facultyRemarks: null,
      hodId: null, hodRemarks: null,
      attendanceUpdated: false,
      documentName: data.documentName || null,
      documentData: data.documentData || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    DB.insert('leave_requests', request);
    DB.insert('audit_logs', {
      id: generateId('aud-'), userId: studentId,
      action: 'SUBMITTED_LEAVE', entityType: 'LEAVE', entityId: id,
      description: `Student submitted ${data.leaveType} request`,
      createdAt: new Date().toISOString(),
    });
    const faculties = DB.findWhere('faculty_profiles', fp => {
      const sp = DB.findOneWhere('student_profiles', p => p.userId === studentId);
      return sp && fp.departmentId === sp.departmentId;
    });
    faculties.slice(0, 1).forEach(fp => {
      this.addNotification(fp.userId, 'New Leave Request',
        `${user.name} has submitted a ${data.leaveType} request.`, 'INFO', id, 'LEAVE');
    });
    this.addNotification(studentId, 'Leave Request Submitted',
      `Your ${data.leaveType} request has been submitted successfully.`, 'INFO', id, 'LEAVE');
    return request;
  },

  getMyLeaveRequests(studentId) {
    return DB.findWhere('leave_requests', r => r.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getPendingLeaveRequests(facultyId) {
    const fp = DB.findOneWhere('faculty_profiles', p => p.userId === facultyId);
    if (!fp) return [];
    const deptStudentIds = DB.findWhere('student_profiles', sp => sp.departmentId === fp.departmentId)
      .map(sp => sp.userId);
    return DB.findWhere('leave_requests', r => deptStudentIds.includes(r.studentId) && r.status === 'PENDING')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getAllLeaveRequests() {
    return DB.getAll('leave_requests').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  approveLeave(requestId, facultyId, remarks, isHOD = false) {
    const request = DB.findById('leave_requests', requestId);
    if (!request) throw new Error('Request not found.');
    const newStatus = isHOD ? 'HOD_APPROVED' : 'FACULTY_APPROVED';
    const updates = isHOD
      ? { status: newStatus, hodId: facultyId, hodRemarks: remarks, updatedAt: new Date().toISOString() }
      : { status: newStatus, facultyId, facultyRemarks: remarks, updatedAt: new Date().toISOString() };
    DB.update('leave_requests', requestId, updates);
    DB.insert('approval_history', {
      id: generateId('aph-'), requestId, requestType: 'LEAVE',
      approverId: facultyId, action: newStatus, remarks,
      createdAt: new Date().toISOString(),
    });
    if (isHOD && !request.attendanceUpdated) {
      this.updateAttendanceForLeave(request.studentId, request);
      DB.update('leave_requests', requestId, { attendanceUpdated: true });
      this.addNotification(request.studentId, 'Leave Request Approved ✓',
        `Your ${request.leaveType} request has been approved. Attendance updated.`,
        'SUCCESS', requestId, 'LEAVE');
    } else if (!isHOD) {
      this.addNotification(request.studentId, 'Leave Approved by Faculty',
        `Your ${request.leaveType} request has been approved by Faculty.`,
        'SUCCESS', requestId, 'LEAVE');
      const sp = DB.findOneWhere('student_profiles', p => p.userId === request.studentId);
      if (sp) {
        const dept = DB.findById('departments', sp.departmentId);
        if (dept?.hodId) {
          this.addNotification(dept.hodId, 'Leave Awaiting HOD Approval',
            `Leave request requires your approval.`, 'INFO', requestId, 'LEAVE');
        }
      }
    }
    DB.insert('audit_logs', {
      id: generateId('aud-'), userId: facultyId,
      action: isHOD ? 'HOD_APPROVED_LEAVE' : 'FACULTY_APPROVED_LEAVE',
      entityType: 'LEAVE', entityId: requestId,
      description: `${isHOD ? 'HOD' : 'Faculty'} approved leave request`,
      createdAt: new Date().toISOString(),
    });
  },

  rejectLeave(requestId, facultyId, remarks, isHOD = false) {
    const request = DB.findById('leave_requests', requestId);
    if (!request) throw new Error('Request not found.');
    const newStatus = isHOD ? 'HOD_REJECTED' : 'FACULTY_REJECTED';
    const updates = isHOD
      ? { status: newStatus, hodId: facultyId, hodRemarks: remarks, updatedAt: new Date().toISOString() }
      : { status: newStatus, facultyId, facultyRemarks: remarks, updatedAt: new Date().toISOString() };
    DB.update('leave_requests', requestId, updates);
    DB.insert('approval_history', {
      id: generateId('aph-'), requestId, requestType: 'LEAVE',
      approverId: facultyId, action: newStatus, remarks,
      createdAt: new Date().toISOString(),
    });
    this.addNotification(request.studentId, 'Leave Request Rejected',
      `Your ${request.leaveType} request was rejected. Reason: ${remarks}`,
      'ERROR', requestId, 'LEAVE');
    DB.insert('audit_logs', {
      id: generateId('aud-'), userId: facultyId,
      action: isHOD ? 'HOD_REJECTED_LEAVE' : 'FACULTY_REJECTED_LEAVE',
      entityType: 'LEAVE', entityId: requestId,
      description: `${isHOD ? 'HOD' : 'Faculty'} rejected leave request`,
      createdAt: new Date().toISOString(),
    });
  },

  // ---- Student info helper ----
  getStudentInfo(studentId) {
    const user = DB.findById('users', studentId);
    const profile = DB.findOneWhere('student_profiles', p => p.userId === studentId);
    const dept = profile ? DB.findById('departments', profile.departmentId) : null;
    return { user, profile, dept };
  },

  // ---- Admin ----
  getAllStudents() {
    return DB.findWhere('users', u => u.role === 'STUDENT').map(u => {
      const profile = DB.findOneWhere('student_profiles', p => p.userId === u.id);
      const dept = profile ? DB.findById('departments', profile.departmentId) : null;
      return { ...u, profile, departmentName: dept?.name, departmentCode: dept?.code };
    });
  },
  getAllFaculty() {
    return DB.findWhere('users', u => ['FACULTY','HOD'].includes(u.role)).map(u => {
      const profile = DB.findOneWhere('faculty_profiles', p => p.userId === u.id);
      const dept = profile ? DB.findById('departments', profile.departmentId) : null;
      return { ...u, profile, departmentName: dept?.name, departmentCode: dept?.code };
    });
  },
  getDepartments() { return DB.getAll('departments'); },
  getAuditLogs() {
    return DB.getAll('audit_logs').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getApprovalHistory(requestId) {
    return DB.findWhere('approval_history', h => h.requestId === requestId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  async createStudent(data) {
    const existing = DB.findOneWhere('users', u => u.email === data.email.toLowerCase().trim());
    if (existing) throw new Error('An account with this email already exists.');
    const rollExists = DB.findOneWhere('student_profiles', sp => sp.rollNo === data.rollNo.toUpperCase().trim());
    if (rollExists) throw new Error('A student with this Roll Number already exists.');

    const userId = generateId('user-stu-');
    const passwordHash = await hashPassword(data.password || 'Demo@1234');

    const newUser = {
      id: userId,
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: 'STUDENT',
      name: data.name.trim(),
      phone: data.phone?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };
    DB.insert('users', newUser);

    const profile = {
      id: generateId('sp-'),
      userId,
      rollNo: data.rollNo.toUpperCase().trim(),
      departmentId: data.departmentId,
      year: parseInt(data.year) || 1,
      section: data.section || '',
      batch: data.batch?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    DB.insert('student_profiles', profile);

    // Initialize attendance by inheriting the current conducted classes for each subject
    const subjects = DB.findWhere('subjects', s => s.departmentId === data.departmentId);
    subjects.forEach(sub => {
      // Find what the common 'conducted' count is for this subject by checking other students
      const existingRecords = DB.findWhere('attendance', a => a.subjectId === sub.id);
      let commonConducted = 0;
      if (existingRecords.length > 0) {
        commonConducted = existingRecords[0].conducted; // inherit from peer
      } else {
        commonConducted = 50; // fallback default
      }
      
      DB.insert('attendance', {
        id: generateId('att-'),
        studentId: userId,
        subjectId: sub.id,
        conducted: commonConducted,
        present: 0,
        absent: commonConducted,
        od: 0,
        leave: 0,
        updatedAt: new Date().toISOString(),
      });
    });

    DB.insert('audit_logs', {
      id: generateId('aud-'),
      userId,
      action: 'CREATED_STUDENT',
      entityType: 'STUDENT',
      entityId: userId,
      description: `New student created: ${data.name} (${data.rollNo})`,
      createdAt: new Date().toISOString(),
    });

    return { ...newUser, profile };
  },

  // ---- Bulk Approve / Reject ----
  bulkProcessRequests(ids, type, facultyId, remarks, action, isHOD = false) {
    // action: 'APPROVE' | 'REJECT'
    const results = { success: 0, failed: 0 };
    ids.forEach(id => {
      try {
        if (action === 'APPROVE') {
          if (type === 'OD') this.approveOD(id, facultyId, remarks, isHOD);
          else this.approveLeave(id, facultyId, remarks, isHOD);
        } else {
          if (type === 'OD') this.rejectOD(id, facultyId, remarks, isHOD);
          else this.rejectLeave(id, facultyId, remarks, isHOD);
        }
        results.success++;
      } catch(e) {
        results.failed++;
      }
    });
    return results;
  },

  // ---- Request Withdrawal (Student) ----
  withdrawOD(requestId, studentId) {
    const request = DB.findById('od_requests', requestId);
    if (!request) throw new Error('Request not found.');
    if (request.studentId !== studentId) throw new Error('Unauthorized.');
    if (request.status !== 'PENDING') throw new Error('Only PENDING requests can be withdrawn.');
    DB.update('od_requests', requestId, { status: 'WITHDRAWN', updatedAt: new Date().toISOString() });
    DB.insert('audit_logs', {
      id: generateId('aud-'), userId: studentId,
      action: 'WITHDRAWN_OD', entityType: 'OD', entityId: requestId,
      description: `Student withdrew OD request: ${request.eventName}`,
      createdAt: new Date().toISOString(),
    });
    this.addNotification(studentId, 'OD Request Withdrawn',
      `Your OD request for "${request.eventName}" has been withdrawn.`,
      'INFO', requestId, 'OD');
  },

  withdrawLeave(requestId, studentId) {
    const request = DB.findById('leave_requests', requestId);
    if (!request) throw new Error('Request not found.');
    if (request.studentId !== studentId) throw new Error('Unauthorized.');
    if (request.status !== 'PENDING') throw new Error('Only PENDING requests can be withdrawn.');
    DB.update('leave_requests', requestId, { status: 'WITHDRAWN', updatedAt: new Date().toISOString() });
    DB.insert('audit_logs', {
      id: generateId('aud-'), userId: studentId,
      action: 'WITHDRAWN_LEAVE', entityType: 'LEAVE', entityId: requestId,
      description: `Student withdrew ${request.leaveType} leave request`,
      createdAt: new Date().toISOString(),
    });
    this.addNotification(studentId, 'Leave Request Withdrawn',
      `Your ${request.leaveType} request has been withdrawn.`,
      'INFO', requestId, 'LEAVE');
  },

  // ---- Analytics ----
  getAnalytics() {
    const students = this.getAllStudents();
    const faculty = this.getAllFaculty();
    const odAll = this.getAllODRequests();
    const leaveAll = this.getAllLeaveRequests();
    const depts = this.getDepartments();

    const pending = [...odAll, ...leaveAll].filter(r => r.status === 'PENDING').length;
    const approved = [...odAll, ...leaveAll].filter(r => ['HOD_APPROVED','FACULTY_APPROVED'].includes(r.status)).length;
    const rejected = [...odAll, ...leaveAll].filter(r => ['HOD_REJECTED','FACULTY_REJECTED'].includes(r.status)).length;

    const today = new Date().toDateString();
    const todayOD = odAll.filter(r => new Date(r.createdAt).toDateString() === today).length;
    const todayLeave = leaveAll.filter(r => new Date(r.createdAt).toDateString() === today).length;

    // Monthly OD
    const monthlyOD = Array(6).fill(0);
    const monthlyLeave = Array(6).fill(0);
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      monthlyOD[i] = odAll.filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).length;
      monthlyLeave[i] = leaveAll.filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).length;
    }

    // Department breakdown
    const deptStats = depts.map(d => {
      const stuCount = DB.findWhere('student_profiles', sp => sp.departmentId === d.id).length;
      const deptStudentIds = DB.findWhere('student_profiles', sp => sp.departmentId === d.id).map(sp => sp.userId);
      const deptOD = odAll.filter(r => deptStudentIds.includes(r.studentId)).length;
      const deptLeave = leaveAll.filter(r => deptStudentIds.includes(r.studentId)).length;
      return { name: d.code, students: stuCount, od: deptOD, leave: deptLeave };
    });

    return {
      totalStudents: students.length,
      totalFaculty: faculty.length,
      totalOD: odAll.length,
      totalLeave: leaveAll.length,
      pending, approved, rejected,
      todayOD, todayLeave,
      monthlyOD, monthlyLeave,
      deptStats,
    };
  },
};
