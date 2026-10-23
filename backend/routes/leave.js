const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { LeaveRequest, ApprovalHistory, Notification, AuditLog } = require('../models/Requests');
const { StudentProfile, FacultyProfile, Department, Attendance } = require('../models/Academic');

function genId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

async function addNotification(userId, title, message, type = 'INFO', relatedId = null, relatedType = null) {
  return Notification.create({ _id: genId('ntf-'), userId, title, message, type, isRead: false, relatedId, relatedType });
}

async function updateAttendanceForLeave(studentId, leaveRequest) {
  const days = leaveRequest.days || 1;
  const records = await Attendance.find({ studentId }).limit(Math.min(days * 2, 10));
  await Promise.all(records.map(async (att) => {
    if (att.absent > 0) {
      await Attendance.findByIdAndUpdate(att._id, { absent: att.absent - 1, leave: att.leave + 1 });
    }
  }));
  await AuditLog.create({
    _id: genId('aud-'), userId: studentId,
    action: 'ATTENDANCE_UPDATED', entityType: 'ATTENDANCE', entityId: leaveRequest._id,
    description: `Attendance updated for approved leave: ${leaveRequest.leaveType}`,
  });
}

// GET /api/leave/my
router.get('/my', protect, async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/leave/pending
router.get('/pending', protect, authorize('FACULTY', 'HOD'), async (req, res) => {
  try {
    const fp = await FacultyProfile.findOne({ userId: req.user._id });
    if (!fp) return res.json([]);
    const deptProfiles = await StudentProfile.find({ departmentId: fp.departmentId });
    const deptStudentIds = deptProfiles.map(p => p.userId);
    const requests = await LeaveRequest.find({ studentId: { $in: deptStudentIds }, status: 'PENDING' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/leave/hod-pending
router.get('/hod-pending', protect, authorize('HOD', 'ADMIN'), async (req, res) => {
  try {
    const fp = await FacultyProfile.findOne({ userId: req.user._id });
    if (!fp) return res.json([]);
    const deptProfiles = await StudentProfile.find({ departmentId: fp.departmentId });
    const deptStudentIds = deptProfiles.map(p => p.userId);
    const requests = await LeaveRequest.find({ studentId: { $in: deptStudentIds }, status: 'FACULTY_APPROVED' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/leave/all
router.get('/all', protect, authorize('ADMIN', 'HOD'), async (req, res) => {
  try {
    const requests = await LeaveRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/leave/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    const history = await ApprovalHistory.find({ requestId: req.params.id }).sort({ createdAt: 1 });
    res.json({ request, history });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/leave
router.post('/', protect, authorize('STUDENT'), async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, days, reason, description, documentName, documentData } = req.body;
    const studentId = req.user._id;
    const id = genId('lv-');
    const request = await LeaveRequest.create({
      _id: id, studentId, leaveType, fromDate, toDate, days, reason, description,
      status: 'PENDING', documentName: documentName || null, documentData: documentData || null,
    });
    await AuditLog.create({
      _id: genId('aud-'), userId: studentId,
      action: 'SUBMITTED_LEAVE', entityType: 'LEAVE', entityId: id,
      description: `Student submitted ${leaveType} request`,
    });
    const sp = await StudentProfile.findOne({ userId: studentId });
    if (sp) {
      const fp = await FacultyProfile.findOne({ departmentId: sp.departmentId });
      if (fp) await addNotification(fp.userId, 'New Leave Request', `${req.user.name} submitted a ${leaveType} request.`, 'INFO', id, 'LEAVE');
    }
    await addNotification(studentId, 'Leave Request Submitted', `Your ${leaveType} request has been submitted.`, 'INFO', id, 'LEAVE');
    res.status(201).json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/leave/:id/approve
router.patch('/:id/approve', protect, authorize('FACULTY', 'HOD', 'ADMIN'), async (req, res) => {
  try {
    const { remarks } = req.body;
    const isHOD = ['HOD', 'ADMIN'].includes(req.user.role) && req.query.level === 'hod';
    const request = await LeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    const newStatus = isHOD ? 'HOD_APPROVED' : 'FACULTY_APPROVED';
    const updates = isHOD
      ? { status: newStatus, hodId: req.user._id, hodRemarks: remarks }
      : { status: newStatus, facultyId: req.user._id, facultyRemarks: remarks };
    const updated = await LeaveRequest.findByIdAndUpdate(req.params.id, updates, { new: true });

    await ApprovalHistory.create({
      _id: genId('aph-'), requestId: req.params.id, requestType: 'LEAVE',
      approverId: req.user._id, action: newStatus, remarks,
    });

    if (isHOD && !request.attendanceUpdated) {
      await updateAttendanceForLeave(request.studentId, request);
      await LeaveRequest.findByIdAndUpdate(req.params.id, { attendanceUpdated: true });
      await addNotification(request.studentId, 'Leave Approved ✓', `Your ${request.leaveType} is fully approved. Attendance updated.`, 'SUCCESS', req.params.id, 'LEAVE');
    } else if (!isHOD) {
      await addNotification(request.studentId, 'Leave Approved by Faculty', `Your ${request.leaveType} approved by Faculty. Pending HOD.`, 'SUCCESS', req.params.id, 'LEAVE');
      const sp = await StudentProfile.findOne({ userId: request.studentId });
      if (sp) {
        const dept = await Department.findById(sp.departmentId);
        if (dept?.hodId) await addNotification(dept.hodId, 'Leave Awaiting HOD Approval', `Leave request requires your approval.`, 'INFO', req.params.id, 'LEAVE');
      }
    }

    await AuditLog.create({
      _id: genId('aud-'), userId: req.user._id,
      action: isHOD ? 'HOD_APPROVED_LEAVE' : 'FACULTY_APPROVED_LEAVE',
      entityType: 'LEAVE', entityId: req.params.id,
      description: `${isHOD ? 'HOD' : 'Faculty'} approved leave request`,
    });

    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/leave/:id/reject
router.patch('/:id/reject', protect, authorize('FACULTY', 'HOD', 'ADMIN'), async (req, res) => {
  try {
    const { remarks } = req.body;
    const isHOD = ['HOD', 'ADMIN'].includes(req.user.role) && req.query.level === 'hod';
    const request = await LeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    const newStatus = isHOD ? 'HOD_REJECTED' : 'FACULTY_REJECTED';
    const updates = isHOD
      ? { status: newStatus, hodId: req.user._id, hodRemarks: remarks }
      : { status: newStatus, facultyId: req.user._id, facultyRemarks: remarks };
    const updated = await LeaveRequest.findByIdAndUpdate(req.params.id, updates, { new: true });

    await ApprovalHistory.create({
      _id: genId('aph-'), requestId: req.params.id, requestType: 'LEAVE',
      approverId: req.user._id, action: newStatus, remarks,
    });
    await addNotification(request.studentId, 'Leave Request Rejected', `Your ${request.leaveType} was rejected. Reason: ${remarks}`, 'ERROR', req.params.id, 'LEAVE');
    await AuditLog.create({
      _id: genId('aud-'), userId: req.user._id,
      action: isHOD ? 'HOD_REJECTED_LEAVE' : 'FACULTY_REJECTED_LEAVE',
      entityType: 'LEAVE', entityId: req.params.id,
      description: `${isHOD ? 'HOD' : 'Faculty'} rejected leave request`,
    });

    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/leave/:id/withdraw
router.patch('/:id/withdraw', protect, authorize('STUDENT'), async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (request.studentId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized.' });
    if (request.status !== 'PENDING')
      return res.status(400).json({ message: 'Only PENDING requests can be withdrawn.' });

    const updated = await LeaveRequest.findByIdAndUpdate(req.params.id, { status: 'WITHDRAWN' }, { new: true });
    await AuditLog.create({
      _id: genId('aud-'), userId: req.user._id,
      action: 'WITHDRAWN_LEAVE', entityType: 'LEAVE', entityId: req.params.id,
      description: `Student withdrew ${request.leaveType} request`,
    });
    await addNotification(req.user._id, 'Leave Withdrawn', `Your ${request.leaveType} has been withdrawn.`, 'INFO', req.params.id, 'LEAVE');
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
