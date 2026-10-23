const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { StudentProfile, FacultyProfile, Department } = require('../models/Academic');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'No account found with this email address.' });
    if (!user.isActive) return res.status(403).json({ message: 'This account has been deactivated.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password. Please try again.' });

    // Build session user object
    const sessionUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    // Attach profile
    if (user.role === 'STUDENT') {
      const profile = await StudentProfile.findOne({ userId: user._id });
      if (profile) {
        const dept = await Department.findById(profile.departmentId);
        sessionUser.profile = {
          ...profile.toObject(),
          departmentName: dept?.name,
          departmentCode: dept?.code,
        };
      }
    } else if (['FACULTY', 'HOD'].includes(user.role)) {
      const profile = await FacultyProfile.findOne({ userId: user._id });
      if (profile) {
        const dept = await Department.findById(profile.departmentId);
        sessionUser.profile = {
          ...profile.toObject(),
          departmentName: dept?.name,
          departmentCode: dept?.code,
        };
      }
    }

    res.json({ token: generateToken(user._id), user: sessionUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET /api/auth/me
const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    const sessionUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    if (user.role === 'STUDENT') {
      const profile = await StudentProfile.findOne({ userId: user._id });
      if (profile) {
        const dept = await Department.findById(profile.departmentId);
        sessionUser.profile = { ...profile.toObject(), departmentName: dept?.name, departmentCode: dept?.code };
      }
    } else if (['FACULTY', 'HOD'].includes(user.role)) {
      const profile = await FacultyProfile.findOne({ userId: user._id });
      if (profile) {
        const dept = await Department.findById(profile.departmentId);
        sessionUser.profile = { ...profile.toObject(), departmentName: dept?.name, departmentCode: dept?.code };
      }
    }

// GET /api/auth/departments — public endpoint for registration form
router.get('/departments', async (req, res) => {
  try {
    const depts = await Department.find().select('_id name code');
    res.json(depts);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving departments.' });
  }
});

// POST /api/auth/register — student self-registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, rollNo, departmentId, year, section, batch } = req.body;

    if (!name || !email || !password || !rollNo || !departmentId) {
      return res.status(400).json({ message: 'Name, email, password, roll number, and department are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRoll = rollNo.toUpperCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const existingRoll = await StudentProfile.findOne({ rollNo: cleanRoll });
    if (existingRoll) {
      return res.status(400).json({ message: `A student with roll number "${cleanRoll}" is already registered.` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'user-stu-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    const newUser = await User.create({
      _id: userId,
      email: cleanEmail,
      passwordHash,
      role: 'STUDENT',
      name: name.trim(),
      phone: phone?.trim() || '',
      isActive: true,
    });

    const profileId = 'sp-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const profile = await StudentProfile.create({
      _id: profileId,
      userId,
      rollNo: cleanRoll,
      departmentId,
      year: parseInt(year) || 1,
      section: (section || 'A').toUpperCase().trim(),
      batch: batch?.trim() || `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
    });

    // Populate initial attendance from Department subjects
    const { Subject, Attendance } = require('../models/Academic');
    const { AuditLog } = require('../models/Requests');
    const subjects = await Subject.find({ departmentId });
    for (const sub of subjects) {
      await Attendance.create({
        _id: 'att-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        studentId: userId,
        subjectId: sub._id,
        conducted: 50,
        present: 45,
        absent: 5,
        od: 0,
        leave: 0,
      });
    }

    try {
      await AuditLog.create({
        _id: 'aud-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        userId,
        action: 'STUDENT_SELF_REGISTERED',
        entityType: 'STUDENT',
        entityId: userId,
        description: `Student self-registered: ${name} (${cleanRoll})`,
      });
    } catch {
      // ignore audit log error if any
    }

    const dept = await Department.findById(departmentId);
    const sessionUser = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      profile: {
        ...profile.toObject(),
        departmentName: dept?.name || 'Department',
        departmentCode: dept?.code || 'DEPT',
      },
    };

    res.status(201).json({
      token: generateToken(newUser._id),
      user: sessionUser,
      message: 'Registration successful! Welcome to EduLeave.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error during student registration.' });
  }
});

module.exports = router;
