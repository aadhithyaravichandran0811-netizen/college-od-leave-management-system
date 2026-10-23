const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { ODRequest, LeaveRequest, ApprovalHistory, Notification, AuditLog } = require('../models/Requests');
const { StudentProfile, FacultyProfile, Department, Attendance } = require('../models/Academic');

function genId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

async function addNotification(userId, title, message, type = 'INFO', relatedId = null, relatedType = null) {
  return Notification.create({
    _id: genId('ntf-'), userId, title, message, type,
    isRead: false, relatedId, relatedType,
  });
}

async function updateAttendanceForApproval(studentId, entityId, entityType) {
  const records = await Attendance.find({ studentId }).limit(2);
  await Promise.all(records.map(async (att) => {
    if (att.absent > 0) {
      const field = entityType === 'OD' ? { od: att.od + 1 } : { leave: att.leave + 1 };
      await Attendance.findByIdAndUpdate(att._id, { absent: att.absent - 1, ...field });
    }
  }));
  await AuditLog.create({
    _id: genId('aud-'), userId: studentId,
    action: 'ATTENDANCE_UPDATED', entityType: 'ATTENDANCE', entityId,
    description: `Attendance updated for approved ${entityType}`,
  });
}

// ============ OD ROUTES ============

// GET /api/od/my
router.get('/my', protect, async (req, res) => {
  try {
    const requests = await ODRequest.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/od/pending (faculty sees dept students' pending ODs)
router.get('/pending', protect, authorize('FACULTY', 'HOD'), async (req, res) => {
  try {
    const fp = await FacultyProfile.findOne({ userId: req.user._id });
    if (!fp) return res.json([]);
    const deptProfiles = await StudentProfile.find({ departmentId: fp.departmentId });
    const deptStudentIds = deptProfiles.map(p => p.userId);
    const requests = await ODRequest.find({ studentId: { $in: deptStudentIds }, status: 'PENDING' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/od/hod-pending (HOD sees faculty-approved ODs)
router.get('/hod-pending', protect, authorize('HOD', 'ADMIN'), async (req, res) => {
  try {
    const fp = await FacultyProfile.findOne({ userId: req.user._id });
    if (!fp) return res.json([]);
    const deptProfiles = await StudentProfile.find({ departmentId: fp.departmentId });
    const deptStudentIds = deptProfiles.map(p => p.userId);
    const requests = await ODRequest.find({ studentId: { $in: deptStudentIds }, status: 'FACULTY_APPROVED' }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/od/all (admin)
router.get('/all', protect, authorize('ADMIN', 'HOD'), async (req, res) => {
  try {
    const requests = await ODRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/od/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await ODRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    const history = await ApprovalHistory.find({ requestId: req.params.id }).sort({ createdAt: 1 });
    res.json({ request, history });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/od — student submits OD
router.post('/', protect, authorize('STUDENT'), async (req, res) => {
  try {
    const { eventName, venue, odDate, startTime, endTime, hours, reason, description, documentName, documentData } = req.body;
    const studentId = req.user._id;

    // Duplicate check
    const exists = await ODRequest.findOne({
      studentId, odDate,
      status: { $nin: ['FACULTY_REJECTED', 'HOD_REJECTED', 'WITHDRAWN'] },
    });
    if (exists) return res.status(400).json({ message: 'A request already exists for this date.' });

    const id = genId('od-');
    const request = await ODRequest.create({
      _id: id, studentId, eventName, venue, odDate, startTime, endTime, hours,
      reason, description, status: 'PENDING',
      documentName: documentName || null, documentData: documentData || null,
    });

    await AuditLog.create({
      _id: genId('aud-'), userId: studentId,
      action: 'SUBMITTED_OD', entityType: 'OD', entityId: id,
      description: `Student submitted OD request for: ${eventName}`,
    });

    // Notify faculty in dept
    const sp = await StudentProfile.findOne({ userId: studentId });
    if (sp) {
      const fp = await FacultyProfile.findOne({ departmentId: sp.departmentId });
      if (fp) await addNotification(fp.userId, 'New OD Request', `${req.user.name} submitted OD for "${eventName}".`, 'INFO', id, 'OD');
    }
    await addNotification(studentId, 'OD Request Submitted', `Your OD for "${eventName}" is awaiting faculty review.`, 'INFO', id, 'OD');

    res.status(201).json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/od/:id/approve
router.patch('/:id/approve', protect, authorize('FACULTY', 'HOD', 'ADMIN'), async (req, res) => {
  try {
    const { remarks } = req.body;
    const isHOD = ['HOD', 'ADMIN'].includes(req.user.role) && req.query.level === 'hod';
    const request = await ODRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    const newStatus = isHOD ? 'HOD_APPROVED' : 'FACULTY_APPROVED';
    const updates = isHOD
      ? { status: newStatus, hodId: req.user._id, hodRemarks: remarks }
      : { status: newStatus, facultyId: req.user._id, facultyRemarks: remarks };

    const updated = await ODRequest.findByIdAndUpdate(req.params.id, updates, { new: true });

    await ApprovalHistory.create({
      _id: genId('aph-'), requestId: req.params.id, requestType: 'OD',
      approverId: req.user._id, action: newStatus, remarks,
    });
    await AuditLog.create({
      _id: genId('aud-'), userId: req.user._id,
      action: isHOD ? 'HOD_APPROVED_OD' : 'FACULTY_APPROVED_OD',
      entityType: 'OD', entityId: req.params.id,
      description: `${isHOD ? 'HOD' : 'Faculty'} approved OD request`,
    });

    if (isHOD && !request.attendanceUpdated) {
      await updateAttendanceForApproval(request.studentId, req.params.id, 'OD');
      await ODRequest.findByIdAndUpdate(req.params.id, { attendanceUpdated: true });
      await addNotification(request.studentId, 'OD Request Approved ✓', `Your OD for "${request.eventName}" is fully approved. Attendance updated.`, 'SUCCESS', req.params.id, 'OD');
    } else if (!isHOD) {
      await addNotification(request.studentId, 'OD Approved by Faculty', `Your OD for "${request.eventName}" approved by Faculty. Pending HOD.`, 'SUCCESS', req.params.id, 'OD');
      const sp = await StudentProfile.findOne({ userId: request.studentId });
      if (sp) {
        const dept = await Department.findById(sp.departmentId);
        if (dept?.hodId) await addNotification(dept.hodId, 'OD Awaiting HOD Approval', `OD request requires your approval.`, 'INFO', req.params.id, 'OD');
      }
    }

    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/od/:id/reject
router.patch('/:id/reject', protect, authorize('FACULTY', 'HOD', 'ADMIN'), async (req, res) => {
  try {
    const { remarks } = req.body;
    const isHOD = ['HOD', 'ADMIN'].includes(req.user.role) && req.query.level === 'hod';
    const request = await ODRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    const newStatus = isHOD ? 'HOD_REJECTED' : 'FACULTY_REJECTED';
    const updates = isHOD
      ? { status: newStatus, hodId: req.user._id, hodRemarks: remarks }
      : { status: newStatus, facultyId: req.user._id, facultyRemarks: remarks };

    const updated = await ODRequest.findByIdAndUpdate(req.params.id, updates, { new: true });

    await ApprovalHistory.create({
      _id: genId('aph-'), requestId: req.params.id, requestType: 'OD',
      approverId: req.user._id, action: newStatus, remarks,
    });
    await AuditLog.create({
      _id: genId('aud-'), userId: req.user._id,
      action: isHOD ? 'HOD_REJECTED_OD' : 'FACULTY_REJECTED_OD',
      entityType: 'OD', entityId: req.params.id,
      description: `${isHOD ? 'HOD' : 'Faculty'} rejected OD. Reason: ${remarks}`,
    });

    await addNotification(request.studentId, 'OD Request Rejected', `Your OD for "${request.eventName}" was rejected. Reason: ${remarks}`, 'ERROR', req.params.id, 'OD');

    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/od/:id/withdraw
router.patch('/:id/withdraw', protect, authorize('STUDENT'), async (req, res) => {
  try {
    const request = await ODRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (request.studentId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized.' });
    if (request.status !== 'PENDING')
      return res.status(400).json({ message: 'Only PENDING requests can be withdrawn.' });

    const updated = await ODRequest.findByIdAndUpdate(req.params.id, { status: 'WITHDRAWN' }, { new: true });
    await AuditLog.create({
      _id: genId('aud-'), userId: req.user._id,
      action: 'WITHDRAWN_OD', entityType: 'OD', entityId: req.params.id,
      description: `Student withdrew OD request: ${request.eventName}`,
    });
    await addNotification(req.user._id, 'OD Withdrawn', `Your OD for "${request.eventName}" has been withdrawn.`, 'INFO', req.params.id, 'OD');

    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
