const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const { Attendance, Subject, StudentProfile, FacultyProfile, Department } = require('../models/Academic');
const { AuditLog } = require('../models/Requests');

function genId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// GET /api/attendance/my — student gets their attendance
router.get('/my', protect, async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.user._id });
    const populated = await Promise.all(records.map(async (r) => {
      const subject = await Subject.findById(r.subjectId);
      return {
        ...r.toObject(),
        subjectName: subject?.name,
        subjectCode: subject?.code,
      };
    }));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/faculty/overview — faculty/admin/HOD gets all students + subject-wise attendance
router.get('/faculty/overview', protect, async (req, res) => {
  try {
    // Check faculty department if role is FACULTY
    let facultyDeptId = null;
    if (req.user.role === 'FACULTY') {
      const fp = await FacultyProfile.findOne({ userId: req.user._id });
      if (fp) facultyDeptId = fp.departmentId;
    } else if (req.user.role === 'HOD') {
      const dept = await Department.findOne({ hodId: req.user._id });
      if (dept) facultyDeptId = dept._id;
    }

    const [allStudents, allProfiles, allDepts, allSubjects, allAttendance] = await Promise.all([
      User.find({ role: 'STUDENT' }).select('-passwordHash'),
      StudentProfile.find(),
      Department.find(),
      Subject.find(),
      Attendance.find(),
    ]);

    const deptMap = new Map(allDepts.map(d => [d._id.toString(), d]));
    const profileMap = new Map(allProfiles.map(p => [p.userId.toString(), p]));
    const subjectMap = new Map(allSubjects.map(s => [s._id.toString(), s]));

    // Group attendance by studentId
    const attendanceByStudent = new Map();
    for (const att of allAttendance) {
      const sid = att.studentId.toString();
      if (!attendanceByStudent.has(sid)) {
        attendanceByStudent.set(sid, []);
      }
      const sub = subjectMap.get(att.subjectId.toString());
      const cond = att.conducted || 0;
      const pres = att.present || 0;
      const od = att.od || 0;
      const abs = att.absent || 0;
      const leave = att.leave || 0;
      const percentage = cond > 0 ? Math.round(((pres + od) / cond) * 100) : 0;

      attendanceByStudent.get(sid).push({
        _id: att._id,
        id: att._id,
        studentId: att.studentId,
        subjectId: att.subjectId,
        subjectName: sub?.name || 'Unknown Subject',
        subjectCode: sub?.code || 'N/A',
        departmentId: sub?.departmentId,
        conducted: cond,
        present: pres,
        absent: abs,
        od,
        leave,
        percentage,
      });
    }

    const studentList = allStudents.map(u => {
      const prof = profileMap.get(u._id.toString());
      const dept = prof ? deptMap.get(prof.departmentId?.toString()) : null;
      const rawRecords = attendanceByStudent.get(u._id.toString()) || [];

      // Sort attendance records by subject code
      const records = [...rawRecords].sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));

      const totalConducted = records.reduce((s, r) => s + r.conducted, 0);
      const totalPresent = records.reduce((s, r) => s + r.present, 0);
      const totalAbsent = records.reduce((s, r) => s + r.absent, 0);
      const totalOD = records.reduce((s, r) => s + r.od, 0);
      const totalLeave = records.reduce((s, r) => s + r.leave, 0);
      const overallPercentage = totalConducted > 0
        ? Math.round(((totalPresent + totalOD) / totalConducted) * 100)
        : 0;

      return {
        _id: u._id,
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        isActive: u.isActive !== false,
        profile: prof ? {
          _id: prof._id,
          rollNo: prof.rollNo,
          departmentId: prof.departmentId,
          year: prof.year,
          section: prof.section,
          batch: prof.batch,
        } : null,
        departmentName: dept?.name || 'Department',
        departmentCode: dept?.code || 'DEPT',
        departmentId: prof?.departmentId || '',
        attendance: records,
        summary: {
          totalConducted,
          totalPresent,
          totalAbsent,
          totalOD,
          totalLeave,
          overallPercentage,
          status: overallPercentage >= 75 ? 'ELIGIBLE' : 'SHORTAGE',
        },
      };
    });

    res.json({
      students: studentList,
      departments: allDepts,
      subjects: allSubjects,
      facultyDeptId,
    });
  } catch (err) {
    console.error('Error fetching faculty attendance overview:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance/student/:studentId — faculty/admin gets a student's attendance
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId });
    const populated = await Promise.all(records.map(async (r) => {
      const subject = await Subject.findById(r.subjectId);
      return {
        ...r.toObject(),
        subjectName: subject?.name,
        subjectCode: subject?.code,
      };
    }));
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/attendance/student/:studentId — faculty updates a student's attendance
router.put('/student/:studentId', protect, async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ message: 'Records array is required' });
    }

    await Promise.all(records.map(({ id, conducted, present, absent, od, leave }) => {
      const updateData = {};
      if (conducted !== undefined) updateData.conducted = Math.max(0, parseInt(conducted) || 0);
      if (present !== undefined) updateData.present = Math.max(0, parseInt(present) || 0);
      if (absent !== undefined) updateData.absent = Math.max(0, parseInt(absent) || 0);
      if (od !== undefined) updateData.od = Math.max(0, parseInt(od) || 0);
      if (leave !== undefined) updateData.leave = Math.max(0, parseInt(leave) || 0);

      return Attendance.findByIdAndUpdate(id, updateData, { new: true });
    }));

    await AuditLog.create({
      _id: genId('aud-'),
      userId: req.user._id,
      action: 'ATTENDANCE_UPDATED_MANUALLY',
      entityType: 'STUDENT',
      entityId: req.params.studentId,
      description: `Faculty ${req.user.name || ''} manually updated subject attendance records for student ${req.params.studentId}`,
    });

    res.json({ success: true, message: 'Attendance updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/attendance/batch-update — batch update attendance for multiple students
router.post('/batch-update', protect, async (req, res) => {
  try {
    const { updates } = req.body; // array of { id, conducted, present, absent, od, leave }
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: 'Updates array is required' });
    }

    await Promise.all(updates.map(({ id, conducted, present, absent, od, leave }) => {
      const updateData = {};
      if (conducted !== undefined) updateData.conducted = Math.max(0, parseInt(conducted) || 0);
      if (present !== undefined) updateData.present = Math.max(0, parseInt(present) || 0);
      if (absent !== undefined) updateData.absent = Math.max(0, parseInt(absent) || 0);
      if (od !== undefined) updateData.od = Math.max(0, parseInt(od) || 0);
      if (leave !== undefined) updateData.leave = Math.max(0, parseInt(leave) || 0);

      return Attendance.findByIdAndUpdate(id, updateData);
    }));

    await AuditLog.create({
      _id: genId('aud-'),
      userId: req.user._id,
      action: 'BATCH_ATTENDANCE_UPDATED',
      entityType: 'ATTENDANCE',
      entityId: 'BATCH',
      description: `Faculty ${req.user.name || ''} bulk-updated ${updates.length} attendance records`,
    });

    res.json({ success: true, count: updates.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

