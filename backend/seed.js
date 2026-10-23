require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const { Department, Subject, StudentProfile, FacultyProfile, Attendance } = require('./models/Academic');
const { ODRequest, LeaveRequest, ApprovalHistory, Notification, AuditLog } = require('./models/Requests');

function genId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
function daysAgo(n) { return new Date(Date.now() - n * 86400000); }

async function seed() {
  await connectDB();
  console.log('🌱 Starting database seed...');

  // Clear all collections
  await Promise.all([
    User.deleteMany(), Department.deleteMany(), Subject.deleteMany(),
    StudentProfile.deleteMany(), FacultyProfile.deleteMany(), Attendance.deleteMany(),
    ODRequest.deleteMany(), LeaveRequest.deleteMany(), ApprovalHistory.deleteMany(),
    Notification.deleteMany(), AuditLog.deleteMany(),
  ]);
  console.log('✅ Collections cleared');

  // --- Departments ---
  const departments = await Department.insertMany([
    { _id: 'dept-cse', name: 'Computer Science and Engineering', code: 'CSE', hodId: 'user-hod-cse' },
    { _id: 'dept-it',  name: 'Information Technology',           code: 'IT',  hodId: 'user-hod-it'  },
    { _id: 'dept-ece', name: 'Electronics and Communication Engineering', code: 'ECE', hodId: 'user-hod-ece' },
    { _id: 'dept-eee', name: 'Electrical and Electronics Engineering',    code: 'EEE', hodId: 'user-hod-eee' },
  ]);
  console.log('✅ Departments seeded');

  // --- Subjects ---
  await Subject.insertMany([
    { _id: 'sub-1',  name: 'Data Structures and Algorithms',   code: 'CS301', departmentId: 'dept-cse', year: 2, semester: 3, credits: 4 },
    { _id: 'sub-2',  name: 'Database Management Systems',      code: 'CS302', departmentId: 'dept-cse', year: 2, semester: 3, credits: 4 },
    { _id: 'sub-3',  name: 'Operating Systems',                code: 'CS303', departmentId: 'dept-cse', year: 2, semester: 3, credits: 3 },
    { _id: 'sub-4',  name: 'Computer Networks',                code: 'CS304', departmentId: 'dept-cse', year: 2, semester: 3, credits: 3 },
    { _id: 'sub-5',  name: 'Software Engineering',             code: 'CS305', departmentId: 'dept-cse', year: 2, semester: 3, credits: 3 },
    { _id: 'sub-6',  name: 'Web Technologies',                 code: 'CS306', departmentId: 'dept-cse', year: 2, semester: 3, credits: 3 },
    { _id: 'sub-7',  name: 'Programming Fundamentals',         code: 'IT301', departmentId: 'dept-it',  year: 2, semester: 3, credits: 4 },
    { _id: 'sub-8',  name: 'Object Oriented Programming',      code: 'IT302', departmentId: 'dept-it',  year: 2, semester: 3, credits: 4 },
    { _id: 'sub-9',  name: 'Digital Electronics',              code: 'EC301', departmentId: 'dept-ece', year: 2, semester: 3, credits: 4 },
    { _id: 'sub-10', name: 'Signals and Systems',              code: 'EC302', departmentId: 'dept-ece', year: 2, semester: 3, credits: 3 },
    { _id: 'sub-11', name: 'Circuit Theory',                   code: 'EE301', departmentId: 'dept-eee', year: 2, semester: 3, credits: 4 },
    { _id: 'sub-12', name: 'Electrical Machines',              code: 'EE302', departmentId: 'dept-eee', year: 2, semester: 3, credits: 4 },
  ]);
  console.log('✅ Subjects seeded');

  // --- Hash password ---
  const demoHash = await bcrypt.hash('Demo@1234', 10);

  // --- Admin ---
  await User.create({ _id: 'user-admin', email: 'admin@college.edu', passwordHash: demoHash, role: 'ADMIN', name: 'Dr. R. Krishnamurthy', phone: '9876543200', isActive: true });

  // --- HODs ---
  const hodData = [
    { _id: 'user-hod-cse', email: 'hod@college.edu',     name: 'Dr. S. Ramachandran', dept: 'dept-cse', designation: 'Professor & HOD' },
    { _id: 'user-hod-it',  email: 'hod.it@college.edu',  name: 'Dr. P. Meenakshi',    dept: 'dept-it',  designation: 'Associate Professor & HOD' },
    { _id: 'user-hod-ece', email: 'hod.ece@college.edu', name: 'Dr. K. Subramaniam',  dept: 'dept-ece', designation: 'Professor & HOD' },
    { _id: 'user-hod-eee', email: 'hod.eee@college.edu', name: 'Dr. L. Vijayalakshmi',dept: 'dept-eee', designation: 'Professor & HOD' },
  ];
  for (const h of hodData) {
    await User.create({ _id: h._id, email: h.email, passwordHash: demoHash, role: 'HOD', name: h.name, phone: '9876500001', isActive: true });
    await FacultyProfile.create({ _id: genId('fp-'), userId: h._id, departmentId: h.dept, designation: h.designation, employeeId: 'EMP' + Math.floor(1000 + Math.random() * 9000) });
  }

  // --- Faculty ---
  const facultyData = [
    { _id: 'user-fac-1', email: 'faculty@college.edu',  name: 'Mr. A. Karthikeyan',  dept: 'dept-cse', designation: 'Assistant Professor' },
    { _id: 'user-fac-2', email: 'faculty2@college.edu', name: 'Ms. B. Divya Priya',  dept: 'dept-cse', designation: 'Assistant Professor' },
    { _id: 'user-fac-3', email: 'faculty3@college.edu', name: 'Dr. C. Selvaraj',     dept: 'dept-it',  designation: 'Associate Professor' },
    { _id: 'user-fac-4', email: 'faculty4@college.edu', name: 'Ms. D. Kavitha',      dept: 'dept-ece', designation: 'Assistant Professor' },
  ];
  for (const f of facultyData) {
    await User.create({ _id: f._id, email: f.email, passwordHash: demoHash, role: 'FACULTY', name: f.name, phone: '9876500002', isActive: true });
    await FacultyProfile.create({ _id: genId('fp-'), userId: f._id, departmentId: f.dept, designation: f.designation, employeeId: 'EMP' + Math.floor(1000 + Math.random() * 9000) });
  }

  // --- Students ---
  const studentData = [
    { _id: 'user-stu-1',  email: 'student@college.edu',   name: 'Arun Kumar M',          rollNo: '20CS001', dept: 'dept-cse', year: 2, section: 'A' },
    { _id: 'user-stu-2',  email: 'student2@college.edu',  name: 'Priya Dharshini R',      rollNo: '20CS002', dept: 'dept-cse', year: 2, section: 'A' },
    { _id: 'user-stu-3',  email: 'student3@college.edu',  name: 'Suriya Prakash K',       rollNo: '20CS003', dept: 'dept-cse', year: 2, section: 'A' },
    { _id: 'user-stu-4',  email: 'student4@college.edu',  name: 'Meenakshi Sundaram V',   rollNo: '20CS004', dept: 'dept-cse', year: 2, section: 'B' },
    { _id: 'user-stu-5',  email: 'student5@college.edu',  name: 'Devi Priya S',           rollNo: '20CS005', dept: 'dept-cse', year: 2, section: 'B' },
    { _id: 'user-stu-6',  email: 'student6@college.edu',  name: 'Karthik Rajan T',        rollNo: '20IT001', dept: 'dept-it',  year: 2, section: 'A' },
    { _id: 'user-stu-7',  email: 'student7@college.edu',  name: 'Lavanya Bharathi N',     rollNo: '20IT002', dept: 'dept-it',  year: 2, section: 'A' },
    { _id: 'user-stu-8',  email: 'student8@college.edu',  name: 'Murugesan P',            rollNo: '20EC001', dept: 'dept-ece', year: 2, section: 'A' },
    { _id: 'user-stu-9',  email: 'student9@college.edu',  name: 'Nandhini Krishnan',      rollNo: '20EC002', dept: 'dept-ece', year: 2, section: 'A' },
    { _id: 'user-stu-10', email: 'student10@college.edu', name: 'Omprakash Reddy G',      rollNo: '20EE001', dept: 'dept-eee', year: 2, section: 'A' },
    { _id: 'user-stu-11', email: 'student11@college.edu', name: 'Parvathi Suresh',        rollNo: '20CS006', dept: 'dept-cse', year: 3, section: 'A' },
    { _id: 'user-stu-12', email: 'student12@college.edu', name: 'Rajeshwari Muthusamy',   rollNo: '20CS007', dept: 'dept-cse', year: 3, section: 'A' },
    { _id: 'user-stu-13', email: 'student13@college.edu', name: 'Senthil Kumar A',        rollNo: '20CS008', dept: 'dept-cse', year: 3, section: 'B' },
    { _id: 'user-stu-14', email: 'student14@college.edu', name: 'Tamizharasi V',          rollNo: '20IT003', dept: 'dept-it',  year: 3, section: 'A' },
    { _id: 'user-stu-15', email: 'student15@college.edu', name: 'Udhayakumar R',          rollNo: '20IT004', dept: 'dept-it',  year: 3, section: 'A' },
    { _id: 'user-stu-16', email: 'student16@college.edu', name: 'Vaishnavi Chandran',     rollNo: '20EC003', dept: 'dept-ece', year: 3, section: 'A' },
    { _id: 'user-stu-17', email: 'student17@college.edu', name: 'Wasim Akram S',          rollNo: '20EC004', dept: 'dept-ece', year: 3, section: 'A' },
    { _id: 'user-stu-18', email: 'student18@college.edu', name: 'Xavier Francis P',       rollNo: '20EE002', dept: 'dept-eee', year: 3, section: 'A' },
    { _id: 'user-stu-19', email: 'student19@college.edu', name: 'Yamuna Devi K',          rollNo: '20CS009', dept: 'dept-cse', year: 4, section: 'A' },
    { _id: 'user-stu-20', email: 'student20@college.edu', name: 'Zubair Ahmed M',         rollNo: '20CS010', dept: 'dept-cse', year: 4, section: 'A' },
  ];

  for (const s of studentData) {
    await User.create({ _id: s._id, email: s.email, passwordHash: demoHash, role: 'STUDENT', name: s.name, phone: '9876500003', isActive: true });
    await StudentProfile.create({ _id: genId('sp-'), userId: s._id, rollNo: s.rollNo, departmentId: s.dept, year: s.year, section: s.section, batch: '2020-2024', advisorId: 'user-fac-1' });
  }

  // --- Attendance for stu-1 ---
  const att1 = [
    { sub: 'sub-1', c: 52, p: 46, od: 2, l: 1 },
    { sub: 'sub-2', c: 48, p: 40, od: 1, l: 2 },
    { sub: 'sub-3', c: 44, p: 38, od: 2, l: 0 },
    { sub: 'sub-4', c: 50, p: 44, od: 1, l: 1 },
    { sub: 'sub-5', c: 46, p: 36, od: 3, l: 1 },
    { sub: 'sub-6', c: 42, p: 40, od: 0, l: 0 },
  ];
  for (const r of att1) {
    await Attendance.create({ _id: genId('att-'), studentId: 'user-stu-1', subjectId: r.sub, conducted: r.c, present: r.p, absent: r.c - r.p - r.od - r.l, od: r.od, leave: r.l });
  }

  // Attendance for stu-2
  const att2 = [
    { sub: 'sub-1', c: 52, p: 48, od: 1, l: 0 },
    { sub: 'sub-2', c: 48, p: 45, od: 0, l: 1 },
    { sub: 'sub-3', c: 44, p: 42, od: 0, l: 0 },
    { sub: 'sub-4', c: 50, p: 46, od: 2, l: 0 },
    { sub: 'sub-5', c: 46, p: 43, od: 1, l: 0 },
    { sub: 'sub-6', c: 42, p: 41, od: 0, l: 0 },
  ];
  for (const r of att2) {
    await Attendance.create({ _id: genId('att-'), studentId: 'user-stu-2', subjectId: r.sub, conducted: r.c, present: r.p, absent: r.c - r.p - r.od - r.l, od: r.od, leave: r.l });
  }

  // Default attendance for all other students
  const allProfiles = await StudentProfile.find();
  for (const sp of allProfiles) {
    if (['user-stu-1', 'user-stu-2'].includes(sp.userId)) continue;
    const subjects = await Subject.find({ departmentId: sp.departmentId });
    for (const sub of subjects) {
      await Attendance.create({ _id: genId('att-'), studentId: sp.userId, subjectId: sub._id, conducted: 50, present: 0, absent: 50, od: 0, leave: 0 });
    }
  }
  console.log('✅ Attendance seeded');

  // --- OD Requests ---
  await ODRequest.insertMany([
    { _id: 'od-001', studentId: 'user-stu-1', eventName: 'National Level Hackathon - CodeFest 2024', venue: 'Anna University, Chennai', odDate: '2024-09-15', startTime: '08:00', endTime: '18:00', hours: 10, reason: 'Participating in national level hackathon', description: 'Our team has been selected for the National Level Hackathon at Anna University.', status: 'HOD_APPROVED', facultyId: 'user-fac-1', facultyRemarks: 'Good initiative. Approved.', hodId: 'user-hod-cse', hodRemarks: 'Approved. Represent the college well.', attendanceUpdated: true, documentName: 'hackathon_invite.pdf', createdAt: daysAgo(10), updatedAt: daysAgo(8) },
    { _id: 'od-002', studentId: 'user-stu-2', eventName: 'Technical Paper Presentation', venue: 'SRM Institute of Science and Technology', odDate: '2024-09-20', startTime: '09:00', endTime: '17:00', hours: 8, reason: 'Paper presentation on ML applications', description: 'Selected paper on ML in healthcare at inter-college symposium.', status: 'FACULTY_APPROVED', facultyId: 'user-fac-1', facultyRemarks: 'Impressive work. Approved.', attendanceUpdated: false, documentName: 'paper_certificate.pdf', createdAt: daysAgo(5), updatedAt: daysAgo(4) },
    { _id: 'od-003', studentId: 'user-stu-3', eventName: 'Sports Meet - District Level', venue: 'Nehru Stadium, Coimbatore', odDate: '2024-09-25', startTime: '07:00', endTime: '19:00', hours: 12, reason: 'Selected for district athletics', description: 'Participating in 100m and 200m sprint at DTE Tamil Nadu sports meet.', status: 'PENDING', attendanceUpdated: false, documentName: 'sports_selection_letter.pdf', createdAt: daysAgo(2), updatedAt: daysAgo(2) },
    { _id: 'od-004', studentId: 'user-stu-1', eventName: 'Industry Visit - Infosys Campus', venue: 'Infosys Limited, Bangalore', odDate: '2024-09-10', startTime: '06:00', endTime: '22:00', hours: 16, reason: 'College-organized industry visit', description: 'Industry visit by T&P cell to Infosys campus.', status: 'FACULTY_REJECTED', facultyId: 'user-fac-1', facultyRemarks: 'Not officially registered. Insufficient documentation.', attendanceUpdated: false, createdAt: daysAgo(15), updatedAt: daysAgo(13) },
  ]);

  // --- Leave Requests ---
  await LeaveRequest.insertMany([
    { _id: 'leave-001', studentId: 'user-stu-1', leaveType: 'Sick Leave', fromDate: '2024-09-05', toDate: '2024-09-07', days: 3, reason: 'Fever and viral infection', description: 'Diagnosed with viral fever. Doctor recommended 3 days rest.', status: 'HOD_APPROVED', facultyId: 'user-fac-1', facultyRemarks: 'Medical certificate submitted. Approved.', hodId: 'user-hod-cse', hodRemarks: 'Approved. Take rest.', attendanceUpdated: true, documentName: 'medical_certificate.pdf', createdAt: daysAgo(20), updatedAt: daysAgo(18) },
    { _id: 'leave-002', studentId: 'user-stu-2', leaveType: 'Personal Leave', fromDate: '2024-09-18', toDate: '2024-09-18', days: 1, reason: 'Family function', description: "Sister's engagement ceremony.", status: 'PENDING', attendanceUpdated: false, createdAt: daysAgo(3), updatedAt: daysAgo(3) },
    { _id: 'leave-003', studentId: 'user-stu-3', leaveType: 'Emergency Leave', fromDate: '2024-09-12', toDate: '2024-09-13', days: 2, reason: 'Family emergency', description: 'Grandfather hospitalized due to heart condition.', status: 'FACULTY_APPROVED', facultyId: 'user-fac-1', facultyRemarks: 'Genuine emergency. Approved.', attendanceUpdated: false, documentName: 'hospital_doc.pdf', createdAt: daysAgo(12), updatedAt: daysAgo(11) },
  ]);
  console.log('✅ OD & Leave requests seeded');

  // --- Approval History ---
  await ApprovalHistory.insertMany([
    { _id: genId('aph-'), requestId: 'od-001',    requestType: 'OD',    approverId: 'user-fac-1',   action: 'FACULTY_APPROVED', remarks: 'Good initiative. Approved.',            createdAt: daysAgo(9) },
    { _id: genId('aph-'), requestId: 'od-001',    requestType: 'OD',    approverId: 'user-hod-cse', action: 'HOD_APPROVED',     remarks: 'Approved. Represent the college well.', createdAt: daysAgo(8) },
    { _id: genId('aph-'), requestId: 'od-002',    requestType: 'OD',    approverId: 'user-fac-1',   action: 'FACULTY_APPROVED', remarks: 'Impressive work. Approved.',             createdAt: daysAgo(4) },
    { _id: genId('aph-'), requestId: 'od-004',    requestType: 'OD',    approverId: 'user-fac-1',   action: 'FACULTY_REJECTED', remarks: 'Insufficient documentation.',           createdAt: daysAgo(13) },
    { _id: genId('aph-'), requestId: 'leave-001', requestType: 'LEAVE', approverId: 'user-fac-1',   action: 'FACULTY_APPROVED', remarks: 'Medical certificate submitted.',         createdAt: daysAgo(19) },
    { _id: genId('aph-'), requestId: 'leave-001', requestType: 'LEAVE', approverId: 'user-hod-cse', action: 'HOD_APPROVED',     remarks: 'Approved. Take rest.',                  createdAt: daysAgo(18) },
    { _id: genId('aph-'), requestId: 'leave-003', requestType: 'LEAVE', approverId: 'user-fac-1',   action: 'FACULTY_APPROVED', remarks: 'Genuine emergency. Approved.',           createdAt: daysAgo(11) },
  ]);

  // --- Notifications ---
  await Notification.insertMany([
    { _id: genId('ntf-'), userId: 'user-stu-1',   title: 'OD Request Approved',       message: 'Your OD for "National Level Hackathon" has been approved by HOD.',    type: 'SUCCESS', isRead: true,  relatedId: 'od-001',    relatedType: 'OD',    createdAt: daysAgo(8) },
    { _id: genId('ntf-'), userId: 'user-stu-1',   title: 'OD Request Rejected',       message: 'Your OD for "Industry Visit - Infosys" was rejected. Insufficient documentation.', type: 'ERROR', isRead: false, relatedId: 'od-004', relatedType: 'OD', createdAt: daysAgo(13) },
    { _id: genId('ntf-'), userId: 'user-stu-1',   title: 'Leave Approved',            message: 'Your sick leave (05–07 Sep) has been approved by HOD.',               type: 'SUCCESS', isRead: true,  relatedId: 'leave-001', relatedType: 'LEAVE', createdAt: daysAgo(18) },
    { _id: genId('ntf-'), userId: 'user-stu-2',   title: 'OD Approved by Faculty',    message: 'Your OD for "Technical Paper Presentation" approved by Faculty.',      type: 'SUCCESS', isRead: false, relatedId: 'od-002',    relatedType: 'OD',    createdAt: daysAgo(4) },
    { _id: genId('ntf-'), userId: 'user-fac-1',   title: 'New OD Request',            message: 'Suriya Prakash K (20CS003) submitted OD for "Sports Meet".',          type: 'INFO',    isRead: false, relatedId: 'od-003',    relatedType: 'OD',    createdAt: daysAgo(2) },
    { _id: genId('ntf-'), userId: 'user-hod-cse', title: 'OD Awaiting HOD Approval',  message: 'OD for Priya Dharshini R - "Technical Paper Presentation" needs your review.', type: 'INFO', isRead: false, relatedId: 'od-002', relatedType: 'OD', createdAt: daysAgo(4) },
  ]);

  // --- Audit Logs ---
  await AuditLog.insertMany([
    { _id: genId('aud-'), userId: 'user-stu-1',   action: 'SUBMITTED_OD',     entityType: 'OD',    entityId: 'od-001',    description: 'Student submitted OD for National Level Hackathon', createdAt: daysAgo(10) },
    { _id: genId('aud-'), userId: 'user-fac-1',   action: 'APPROVED_OD',      entityType: 'OD',    entityId: 'od-001',    description: 'Faculty approved OD request',                         createdAt: daysAgo(9) },
    { _id: genId('aud-'), userId: 'user-hod-cse', action: 'APPROVED_OD',      entityType: 'OD',    entityId: 'od-001',    description: 'HOD approved OD request',                             createdAt: daysAgo(8) },
    { _id: genId('aud-'), userId: 'user-fac-1',   action: 'REJECTED_OD',      entityType: 'OD',    entityId: 'od-004',    description: 'Faculty rejected OD - insufficient documentation',    createdAt: daysAgo(13) },
    { _id: genId('aud-'), userId: 'user-stu-1',   action: 'SUBMITTED_LEAVE',  entityType: 'LEAVE', entityId: 'leave-001', description: 'Student submitted sick leave request',                 createdAt: daysAgo(20) },
    { _id: genId('aud-'), userId: 'user-fac-1',   action: 'APPROVED_LEAVE',   entityType: 'LEAVE', entityId: 'leave-001', description: 'Faculty approved leave request',                       createdAt: daysAgo(19) },
    { _id: genId('aud-'), userId: 'user-hod-cse', action: 'APPROVED_LEAVE',   entityType: 'LEAVE', entityId: 'leave-001', description: 'HOD approved leave request',                           createdAt: daysAgo(18) },
  ]);
  console.log('✅ History, notifications, audit logs seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Accounts (password: Demo@1234):');
  console.log('  Student  → student@college.edu');
  console.log('  Faculty  → faculty@college.edu');
  console.log('  HOD      → hod@college.edu');
  console.log('  Admin    → admin@college.edu');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
