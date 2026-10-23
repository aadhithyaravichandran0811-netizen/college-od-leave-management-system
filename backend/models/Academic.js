const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  hodId: { type: String, ref: 'User', default: null },
}, { timestamps: true });

const subjectSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  code: { type: String, required: true },
  departmentId: { type: String, ref: 'Department', required: true },
  year: { type: Number },
  semester: { type: Number },
  credits: { type: Number },
}, { timestamps: true });

const studentProfileSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: String, ref: 'User', required: true },
  rollNo: { type: String, required: true, unique: true },
  departmentId: { type: String, ref: 'Department', required: true },
  year: { type: Number, default: 1 },
  section: { type: String, default: '' },
  batch: { type: String, default: '' },
  advisorId: { type: String, ref: 'User', default: null },
}, { timestamps: true });

const facultyProfileSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: String, ref: 'User', required: true },
  departmentId: { type: String, ref: 'Department', required: true },
  designation: { type: String, default: '' },
  employeeId: { type: String, default: '' },
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  _id: { type: String },
  studentId: { type: String, ref: 'User', required: true },
  subjectId: { type: String, ref: 'Subject', required: true },
  conducted: { type: Number, default: 0 },
  present: { type: Number, default: 0 },
  absent: { type: Number, default: 0 },
  od: { type: Number, default: 0 },
  leave: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = {
  Department: mongoose.model('Department', departmentSchema),
  Subject: mongoose.model('Subject', subjectSchema),
  StudentProfile: mongoose.model('StudentProfile', studentProfileSchema),
  FacultyProfile: mongoose.model('FacultyProfile', facultyProfileSchema),
  Attendance: mongoose.model('Attendance', attendanceSchema),
};
