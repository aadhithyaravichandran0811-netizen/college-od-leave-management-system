const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const { StudentProfile, FacultyProfile, Department, Subject, Attendance } = require('../models/Academic');
const { ODRequest, LeaveRequest, AuditLog } = require('../models/Requests');

function genId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// GET /api/admin/students
router.get('/students', protect, authorize('ADMIN', 'HOD', 'FACULTY'), async (req, res) => {
  try {
    const users = await User.find({ role: 'STUDENT' }).select('-passwordHash');
    const result = await Promise.all(users.map(async (u) => {
      const profile = await StudentProfile.findOne({ userId: u._id });
      const dept = profile ? await Department.findById(profile.departmentId) : null;
      return { ...u.toObject(), profile: profile?.toObject(), departmentName: dept?.name, departmentCode: dept?.code };
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/faculty
router.get('/faculty', protect, authorize('ADMIN', 'HOD'), async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['FACULTY', 'HOD'] } }).select('-passwordHash');
    const result = await Promise.all(users.map(async (u) => {
      const profile = await FacultyProfile.findOne({ userId: u._id });
      const dept = profile ? await Department.findById(profile.departmentId) : null;
      return { ...u.toObject(), profile: profile?.toObject(), departmentName: dept?.name, departmentCode: dept?.code };
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/departments
router.get('/departments', protect, async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', protect, authorize('ADMIN', 'HOD'), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/analytics
router.get('/analytics', protect, authorize('ADMIN', 'HOD'), async (req, res) => {
  try {
    const [students, faculty, odAll, leaveAll, depts] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: { $in: ['FACULTY', 'HOD'] } }),
      ODRequest.find(),
      LeaveRequest.find(),
      Department.find(),
    ]);

    const pending = [...odAll, ...leaveAll].filter(r => r.status === 'PENDING').length;
    const approved = [...odAll, ...leaveAll].filter(r => ['HOD_APPROVED', 'FACULTY_APPROVED'].includes(r.status)).length;
    const rejected = [...odAll, ...leaveAll].filter(r => ['HOD_REJECTED', 'FACULTY_REJECTED'].includes(r.status)).length;

    const today = new Date().toDateString();
    const todayOD = odAll.filter(r => new Date(r.createdAt).toDateString() === today).length;
    const todayLeave = leaveAll.filter(r => new Date(r.createdAt).toDateString() === today).length;

    const now = new Date();
    const monthlyOD = [];
    const monthlyLeave = [];
    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthLabels.push(m.toLocaleString('default', { month: 'short' }) + ' ' + m.getFullYear());
      monthlyOD.push(odAll.filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).length);
      monthlyLeave.push(leaveAll.filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
      }).length);
    }

    const deptStats = await Promise.all(depts.map(async (d) => {
      const stuProfiles = await StudentProfile.find({ departmentId: d._id });
      const deptStudentIds = stuProfiles.map(p => p.userId.toString());
      const deptOD = odAll.filter(r => deptStudentIds.includes(r.studentId.toString())).length;
      const deptLeave = leaveAll.filter(r => deptStudentIds.includes(r.studentId.toString())).length;
      return { name: d.code, students: stuProfiles.length, od: deptOD, leave: deptLeave };
    }));

    res.json({
      totalStudents: students, totalFaculty: faculty,
      totalOD: odAll.length, totalLeave: leaveAll.length,
      pending, approved, rejected, todayOD, todayLeave,
      monthlyOD, monthlyLeave, monthLabels, deptStats,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/admin/students — create new student
router.post('/students', protect, authorize('ADMIN'), async (req, res) => {
  try {
    const { name, email, password, phone, rollNo, departmentId, year, section, batch } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: 'An account with this email already exists.' });
    const rollExists = await StudentProfile.findOne({ rollNo: rollNo.toUpperCase().trim() });
    if (rollExists) return res.status(400).json({ message: 'A student with this Roll Number already exists.' });

    const passwordHash = await bcrypt.hash(password || 'Demo@1234', 10);
    const userId = genId('user-stu-');
    const newUser = await User.create({
      _id: userId, email: email.toLowerCase().trim(), passwordHash,
      role: 'STUDENT', name: name.trim(), phone: phone?.trim() || '', isActive: true,
    });

    const profile = await StudentProfile.create({
      _id: genId('sp-'), userId, rollNo: rollNo.toUpperCase().trim(),
      departmentId, year: parseInt(year) || 1, section: section || '', batch: batch || '',
    });

    // Initialize attendance
    const subjects = await Subject.find({ departmentId });
    for (const sub of subjects) {
      const existing = await Attendance.findOne({ subjectId: sub._id });
      const conducted = existing ? existing.conducted : 50;
      await Attendance.create({
        _id: genId('att-'), studentId: userId, subjectId: sub._id,
        conducted, present: 0, absent: conducted, od: 0, leave: 0,
      });
    }

    await AuditLog.create({
      _id: genId('aud-'), userId,
      action: 'CREATED_STUDENT', entityType: 'STUDENT', entityId: userId,
      description: `New student created: ${name} (${rollNo})`,
    });

    const dept = await Department.findById(departmentId);
    res.status(201).json({
      ...newUser.toObject(),
      profile: profile.toObject(),
      departmentName: dept?.name || 'Department',
      departmentCode: dept?.code || 'DEPT',
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/approval-history/:requestId
router.get('/approval-history/:requestId', protect, async (req, res) => {
  try {
    const { ApprovalHistory } = require('../models/Requests');
    const history = await ApprovalHistory.find({ requestId: req.params.requestId }).sort({ createdAt: 1 });
    res.json(history);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
