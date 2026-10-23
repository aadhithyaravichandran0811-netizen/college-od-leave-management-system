const mongoose = require('mongoose');

const odRequestSchema = new mongoose.Schema({
  _id: { type: String },
  studentId: { type: String, ref: 'User', required: true },
  eventName: { type: String, required: true },
  venue: { type: String, required: true },
  odDate: { type: String, required: true },
  startTime: { type: String },
  endTime: { type: String },
  hours: { type: Number },
  reason: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['PENDING', 'FACULTY_APPROVED', 'FACULTY_REJECTED', 'HOD_APPROVED', 'HOD_REJECTED', 'WITHDRAWN'],
    default: 'PENDING',
  },
  facultyId: { type: String, ref: 'User', default: null },
  facultyRemarks: { type: String, default: null },
  hodId: { type: String, ref: 'User', default: null },
  hodRemarks: { type: String, default: null },
  attendanceUpdated: { type: Boolean, default: false },
  documentName: { type: String, default: null },
  documentData: { type: String, default: null }, // base64 for demo
}, { timestamps: true });

const leaveRequestSchema = new mongoose.Schema({
  _id: { type: String },
  studentId: { type: String, ref: 'User', required: true },
  leaveType: { type: String, enum: ['Sick Leave', 'Personal Leave', 'Emergency Leave', 'Other'], required: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['PENDING', 'FACULTY_APPROVED', 'FACULTY_REJECTED', 'HOD_APPROVED', 'HOD_REJECTED', 'WITHDRAWN'],
    default: 'PENDING',
  },
  facultyId: { type: String, ref: 'User', default: null },
  facultyRemarks: { type: String, default: null },
  hodId: { type: String, ref: 'User', default: null },
  hodRemarks: { type: String, default: null },
  attendanceUpdated: { type: Boolean, default: false },
  documentName: { type: String, default: null },
  documentData: { type: String, default: null },
}, { timestamps: true });

const approvalHistorySchema = new mongoose.Schema({
  _id: { type: String },
  requestId: { type: String, required: true },
  requestType: { type: String, enum: ['OD', 'LEAVE'], required: true },
  approverId: { type: String, ref: 'User', required: true },
  action: { type: String, required: true },
  remarks: { type: String },
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: String, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['INFO', 'SUCCESS', 'ERROR', 'WARNING'], default: 'INFO' },
  isRead: { type: Boolean, default: false },
  relatedId: { type: String, default: null },
  relatedType: { type: String, enum: ['OD', 'LEAVE', null], default: null },
}, { timestamps: true });

const auditLogSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: String, ref: 'User', required: true },
  action: { type: String, required: true },
  entityType: { type: String },
  entityId: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = {
  ODRequest: mongoose.model('ODRequest', odRequestSchema),
  LeaveRequest: mongoose.model('LeaveRequest', leaveRequestSchema),
  ApprovalHistory: mongoose.model('ApprovalHistory', approvalHistorySchema),
  Notification: mongoose.model('Notification', notificationSchema),
  AuditLog: mongoose.model('AuditLog', auditLogSchema),
};
