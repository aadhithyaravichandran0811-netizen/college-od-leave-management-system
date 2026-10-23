// ============================================================
// seed.js — Demo data seeder
// Creates realistic Indian college data
// ============================================================

async function seedDatabase() {
  if (DB.isInitialized()) return;

  console.log('Seeding database...');
  DB.reset();

  // ---- Departments ----
  const departments = [
    { id: 'dept-cse', name: 'Computer Science and Engineering', code: 'CSE', hodId: 'user-hod-cse' },
    { id: 'dept-it', name: 'Information Technology', code: 'IT', hodId: 'user-hod-it' },
    { id: 'dept-ece', name: 'Electronics and Communication Engineering', code: 'ECE', hodId: 'user-hod-ece' },
    { id: 'dept-eee', name: 'Electrical and Electronics Engineering', code: 'EEE', hodId: 'user-hod-eee' },
  ];
  departments.forEach(d => DB.insert('departments', { ...d, createdAt: now() }));

  // ---- Subjects ----
  const subjects = [
    // CSE
    { id: 'sub-1', name: 'Data Structures and Algorithms', code: 'CS301', departmentId: 'dept-cse', year: 2, semester: 3, credits: 4 },
    { id: 'sub-2', name: 'Database Management Systems', code: 'CS302', departmentId: 'dept-cse', year: 2, semester: 3, credits: 4 },
    { id: 'sub-3', name: 'Operating Systems', code: 'CS303', departmentId: 'dept-cse', year: 2, semester: 3, credits: 3 },
    { id: 'sub-4', name: 'Computer Networks', code: 'CS304', departmentId: 'dept-cse', year: 2, semester: 3, credits: 3 },
    { id: 'sub-5', name: 'Software Engineering', code: 'CS305', departmentId: 'dept-cse', year: 2, semester: 3, credits: 3 },
    { id: 'sub-6', name: 'Web Technologies', code: 'CS306', departmentId: 'dept-cse', year: 2, semester: 3, credits: 3 },
    // IT
    { id: 'sub-7', name: 'Programming Fundamentals', code: 'IT301', departmentId: 'dept-it', year: 2, semester: 3, credits: 4 },
    { id: 'sub-8', name: 'Object Oriented Programming', code: 'IT302', departmentId: 'dept-it', year: 2, semester: 3, credits: 4 },
    // ECE
    { id: 'sub-9', name: 'Digital Electronics', code: 'EC301', departmentId: 'dept-ece', year: 2, semester: 3, credits: 4 },
    { id: 'sub-10', name: 'Signals and Systems', code: 'EC302', departmentId: 'dept-ece', year: 2, semester: 3, credits: 3 },
    // EEE
    { id: 'sub-11', name: 'Circuit Theory', code: 'EE301', departmentId: 'dept-eee', year: 2, semester: 3, credits: 4 },
    { id: 'sub-12', name: 'Electrical Machines', code: 'EE302', departmentId: 'dept-eee', year: 2, semester: 3, credits: 4 },
  ];
  subjects.forEach(s => DB.insert('subjects', { ...s, createdAt: now() }));

  // ---- Hash password once ----
  const demoHash = await hashPassword('Demo@1234');

  // ---- Admin ----
  const adminUser = {
    id: 'user-admin',
    email: 'admin@college.edu',
    passwordHash: demoHash,
    role: 'ADMIN',
    name: 'Dr. R. Krishnamurthy',
    phone: '9876543200',
    createdAt: now(),
    updatedAt: now(),
    isActive: true,
  };
  DB.insert('users', adminUser);
  DB.insert('admin_profiles', { id: 'admin-1', userId: 'user-admin', designation: 'Principal', createdAt: now() });

  // ---- HODs ----
  const hods = [
    { id: 'user-hod-cse', email: 'hod@college.edu', name: 'Dr. S. Ramachandran', departmentId: 'dept-cse', designation: 'Professor & HOD' },
    { id: 'user-hod-it', email: 'hod.it@college.edu', name: 'Dr. P. Meenakshi', departmentId: 'dept-it', designation: 'Associate Professor & HOD' },
    { id: 'user-hod-ece', email: 'hod.ece@college.edu', name: 'Dr. K. Subramaniam', departmentId: 'dept-ece', designation: 'Professor & HOD' },
    { id: 'user-hod-eee', email: 'hod.eee@college.edu', name: 'Dr. L. Vijayalakshmi', departmentId: 'dept-eee', designation: 'Professor & HOD' },
  ];
  for (const h of hods) {
    DB.insert('users', { id: h.id, email: h.email, passwordHash: demoHash, role: 'HOD', name: h.name, phone: '98765432' + Math.floor(Math.random()*99).toString().padStart(2,'0'), createdAt: now(), updatedAt: now(), isActive: true });
    DB.insert('faculty_profiles', { id: generateId('fp-'), userId: h.id, departmentId: h.departmentId, designation: h.designation, employeeId: 'EMP' + Math.floor(1000+Math.random()*9000), createdAt: now() });
  }

  // ---- Faculty ----
  const facultyList = [
    { id: 'user-fac-1', email: 'faculty@college.edu', name: 'Mr. A. Karthikeyan', departmentId: 'dept-cse', designation: 'Assistant Professor' },
    { id: 'user-fac-2', email: 'faculty2@college.edu', name: 'Ms. B. Divya Priya', departmentId: 'dept-cse', designation: 'Assistant Professor' },
    { id: 'user-fac-3', email: 'faculty3@college.edu', name: 'Dr. C. Selvaraj', departmentId: 'dept-it', designation: 'Associate Professor' },
    { id: 'user-fac-4', email: 'faculty4@college.edu', name: 'Ms. D. Kavitha', departmentId: 'dept-ece', designation: 'Assistant Professor' },
  ];
  for (const f of facultyList) {
    DB.insert('users', { id: f.id, email: f.email, passwordHash: demoHash, role: 'FACULTY', name: f.name, phone: '98765432' + Math.floor(Math.random()*99).toString().padStart(2,'0'), createdAt: now(), updatedAt: now(), isActive: true });
    DB.insert('faculty_profiles', { id: generateId('fp-'), userId: f.id, departmentId: f.departmentId, designation: f.designation, employeeId: 'EMP' + Math.floor(1000+Math.random()*9000), createdAt: now() });
  }

  // ---- Students ----
  const studentData = [
    { id: 'user-stu-1', email: 'student@college.edu', name: 'Arun Kumar M', rollNo: '20CS001', dept: 'dept-cse', year: 2, section: 'A' },
    { id: 'user-stu-2', email: 'student2@college.edu', name: 'Priya Dharshini R', rollNo: '20CS002', dept: 'dept-cse', year: 2, section: 'A' },
    { id: 'user-stu-3', email: 'student3@college.edu', name: 'Suriya Prakash K', rollNo: '20CS003', dept: 'dept-cse', year: 2, section: 'A' },
    { id: 'user-stu-4', email: 'student4@college.edu', name: 'Meenakshi Sundaram V', rollNo: '20CS004', dept: 'dept-cse', year: 2, section: 'B' },
    { id: 'user-stu-5', email: 'student5@college.edu', name: 'Devi Priya S', rollNo: '20CS005', dept: 'dept-cse', year: 2, section: 'B' },
    { id: 'user-stu-6', email: 'student6@college.edu', name: 'Karthik Rajan T', rollNo: '20IT001', dept: 'dept-it', year: 2, section: 'A' },
    { id: 'user-stu-7', email: 'student7@college.edu', name: 'Lavanya Bharathi N', rollNo: '20IT002', dept: 'dept-it', year: 2, section: 'A' },
    { id: 'user-stu-8', email: 'student8@college.edu', name: 'Murugesan P', rollNo: '20EC001', dept: 'dept-ece', year: 2, section: 'A' },
    { id: 'user-stu-9', email: 'student9@college.edu', name: 'Nandhini Krishnan', rollNo: '20EC002', dept: 'dept-ece', year: 2, section: 'A' },
    { id: 'user-stu-10', email: 'student10@college.edu', name: 'Omprakash Reddy G', rollNo: '20EE001', dept: 'dept-eee', year: 2, section: 'A' },
    { id: 'user-stu-11', email: 'student11@college.edu', name: 'Parvathi Suresh', rollNo: '20CS006', dept: 'dept-cse', year: 3, section: 'A' },
    { id: 'user-stu-12', email: 'student12@college.edu', name: 'Rajeshwari Muthusamy', rollNo: '20CS007', dept: 'dept-cse', year: 3, section: 'A' },
    { id: 'user-stu-13', email: 'student13@college.edu', name: 'Senthil Kumar A', rollNo: '20CS008', dept: 'dept-cse', year: 3, section: 'B' },
    { id: 'user-stu-14', email: 'student14@college.edu', name: 'Tamizharasi V', rollNo: '20IT003', dept: 'dept-it', year: 3, section: 'A' },
    { id: 'user-stu-15', email: 'student15@college.edu', name: 'Udhayakumar R', rollNo: '20IT004', dept: 'dept-it', year: 3, section: 'A' },
    { id: 'user-stu-16', email: 'student16@college.edu', name: 'Vaishnavi Chandran', rollNo: '20EC003', dept: 'dept-ece', year: 3, section: 'A' },
    { id: 'user-stu-17', email: 'student17@college.edu', name: 'Wasim Akram S', rollNo: '20EC004', dept: 'dept-ece', year: 3, section: 'A' },
    { id: 'user-stu-18', email: 'student18@college.edu', name: 'Xavier Francis P', rollNo: '20EE002', dept: 'dept-eee', year: 3, section: 'A' },
    { id: 'user-stu-19', email: 'student19@college.edu', name: 'Yamuna Devi K', rollNo: '20CS009', dept: 'dept-cse', year: 4, section: 'A' },
    { id: 'user-stu-20', email: 'student20@college.edu', name: 'Zubair Ahmed M', rollNo: '20CS010', dept: 'dept-cse', year: 4, section: 'A' },
  ];

  for (const s of studentData) {
    DB.insert('users', { id: s.id, email: s.email, passwordHash: demoHash, role: 'STUDENT', name: s.name, phone: '98765' + Math.floor(10000+Math.random()*89999), createdAt: now(), updatedAt: now(), isActive: true });
    DB.insert('student_profiles', {
      id: generateId('sp-'),
      userId: s.id,
      rollNo: s.rollNo,
      departmentId: s.dept,
      year: s.year,
      section: s.section,
      batch: '2020-2024',
      advisorId: 'user-fac-1',
      createdAt: now(),
    });
  }

  // ---- Attendance Records (seeded for first student) ----
  const cseSubjects = ['sub-1', 'sub-2', 'sub-3', 'sub-4', 'sub-5', 'sub-6'];
  const attendanceData = [
    { subjectId: 'sub-1', conducted: 52, present: 46, od: 2, leave: 1 },
    { subjectId: 'sub-2', conducted: 48, present: 40, od: 1, leave: 2 },
    { subjectId: 'sub-3', conducted: 44, present: 38, od: 2, leave: 0 },
    { subjectId: 'sub-4', conducted: 50, present: 44, od: 1, leave: 1 },
    { subjectId: 'sub-5', conducted: 46, present: 36, od: 3, leave: 1 },
    { subjectId: 'sub-6', conducted: 42, present: 40, od: 0, leave: 0 },
  ];

  for (const row of attendanceData) {
    DB.insert('attendance', {
      id: generateId('att-'),
      studentId: 'user-stu-1',
      subjectId: row.subjectId,
      conducted: row.conducted,
      present: row.present,
      absent: row.conducted - row.present - row.od - row.leave,
      od: row.od,
      leave: row.leave,
      updatedAt: now(),
    });
  }

  // Attendance for student2
  const attData2 = [
    { subjectId: 'sub-1', conducted: 52, present: 48, od: 1, leave: 0 },
    { subjectId: 'sub-2', conducted: 48, present: 45, od: 0, leave: 1 },
    { subjectId: 'sub-3', conducted: 44, present: 42, od: 0, leave: 0 },
    { subjectId: 'sub-4', conducted: 50, present: 46, od: 2, leave: 0 },
    { subjectId: 'sub-5', conducted: 46, present: 43, od: 1, leave: 0 },
    { subjectId: 'sub-6', conducted: 42, present: 41, od: 0, leave: 0 },
  ];
  for (const row of attData2) {
    DB.insert('attendance', {
      id: generateId('att-'),
      studentId: 'user-stu-2',
      subjectId: row.subjectId,
      conducted: row.conducted,
      present: row.present,
      absent: row.conducted - row.present - row.od - row.leave,
      od: row.od,
      leave: row.leave,
      updatedAt: now(),
    });
  }

  // Seed default attendance for all other students
  const allStudents = DB.findWhere('users', u => u.role === 'STUDENT');
  allStudents.forEach(stu => {
    const existing = DB.findWhere('attendance', a => a.studentId === stu.id);
    if (existing.length === 0) {
      const sp = DB.findWhere('student_profiles', p => p.userId === stu.id)[0];
      if (sp) {
        const dSubs = DB.findWhere('subjects', s => s.departmentId === sp.departmentId);
        dSubs.forEach((sub, i) => {
           let cond = 50;
           if (sp.departmentId === 'dept-cse' && attendanceData[i]) cond = attendanceData[i].conducted;
           DB.insert('attendance', {
             id: generateId('att-'),
             studentId: stu.id,
             subjectId: sub.id,
             conducted: cond,
             present: 0,
             absent: cond,
             od: 0,
             leave: 0,
             updatedAt: now()
           });
        });
      }
    }
  });

  // ---- OD Requests ----
  const odRequests = [
    {
      id: 'od-001',
      studentId: 'user-stu-1',
      eventName: 'National Level Hackathon - CodeFest 2024',
      venue: 'Anna University, Chennai',
      odDate: '2024-09-15',
      startTime: '08:00',
      endTime: '18:00',
      hours: 10,
      reason: 'Participating in national level hackathon representing the college',
      description: 'Our team has been selected to represent the college at the National Level Hackathon organized by Anna University. The event involves solving real-world problems using technology.',
      status: 'HOD_APPROVED',
      facultyId: 'user-fac-1',
      facultyRemarks: 'Good initiative. Approved.',
      hodId: 'user-hod-cse',
      hodRemarks: 'Approved. Represent the college well.',
      attendanceUpdated: true,
      documentName: 'hackathon_invite.pdf',
      createdAt: daysAgo(10),
      updatedAt: daysAgo(8),
    },
    {
      id: 'od-002',
      studentId: 'user-stu-2',
      eventName: 'Technical Paper Presentation',
      venue: 'SRM Institute of Science and Technology',
      odDate: '2024-09-20',
      startTime: '09:00',
      endTime: '17:00',
      hours: 8,
      reason: 'Paper presentation on ML applications in healthcare',
      description: 'Selected paper on machine learning applications in early disease detection will be presented at the inter-college symposium.',
      status: 'FACULTY_APPROVED',
      facultyId: 'user-fac-1',
      facultyRemarks: 'Impressive work. Approved.',
      hodId: null,
      hodRemarks: null,
      attendanceUpdated: false,
      documentName: 'paper_certificate.pdf',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(4),
    },
    {
      id: 'od-003',
      studentId: 'user-stu-3',
      eventName: 'Sports Meet - District Level',
      venue: 'Nehru Stadium, Coimbatore',
      odDate: '2024-09-25',
      startTime: '07:00',
      endTime: '19:00',
      hours: 12,
      reason: 'Selected for district-level athletics competition',
      description: 'Participating in 100m and 200m sprint events at the district level sports meet organized by DTE, Tamil Nadu.',
      status: 'PENDING',
      facultyId: null,
      facultyRemarks: null,
      hodId: null,
      hodRemarks: null,
      attendanceUpdated: false,
      documentName: 'sports_selection_letter.pdf',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: 'od-004',
      studentId: 'user-stu-1',
      eventName: 'Industry Visit - Infosys Campus',
      venue: 'Infosys Limited, Electronic City, Bangalore',
      odDate: '2024-09-10',
      startTime: '06:00',
      endTime: '22:00',
      hours: 16,
      reason: 'College-organized industry visit for placement preparation',
      description: 'Organized industry visit by the Training and Placement cell to Infosys campus for final year students.',
      status: 'FACULTY_REJECTED',
      facultyId: 'user-fac-1',
      facultyRemarks: 'This event was not officially registered. Insufficient documentation.',
      hodId: null,
      hodRemarks: null,
      attendanceUpdated: false,
      documentName: null,
      createdAt: daysAgo(15),
      updatedAt: daysAgo(13),
    },
  ];
  odRequests.forEach(r => DB.insert('od_requests', { ...r }));

  // ---- Leave Requests ----
  const leaveRequests = [
    {
      id: 'leave-001',
      studentId: 'user-stu-1',
      leaveType: 'Sick Leave',
      fromDate: '2024-09-05',
      toDate: '2024-09-07',
      days: 3,
      reason: 'Fever and viral infection',
      description: 'Diagnosed with viral fever by the college physician. Doctor has recommended 3 days of rest.',
      status: 'HOD_APPROVED',
      facultyId: 'user-fac-1',
      facultyRemarks: 'Medical certificate submitted. Approved.',
      hodId: 'user-hod-cse',
      hodRemarks: 'Approved. Take rest and recover.',
      attendanceUpdated: true,
      documentName: 'medical_certificate.pdf',
      createdAt: daysAgo(20),
      updatedAt: daysAgo(18),
    },
    {
      id: 'leave-002',
      studentId: 'user-stu-2',
      leaveType: 'Personal Leave',
      fromDate: '2024-09-18',
      toDate: '2024-09-18',
      days: 1,
      reason: 'Family function',
      description: 'Sister\'s engagement ceremony at our hometown.',
      status: 'PENDING',
      facultyId: null,
      facultyRemarks: null,
      hodId: null,
      hodRemarks: null,
      attendanceUpdated: false,
      documentName: null,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: 'leave-003',
      studentId: 'user-stu-3',
      leaveType: 'Emergency Leave',
      fromDate: '2024-09-12',
      toDate: '2024-09-13',
      days: 2,
      reason: 'Family emergency',
      description: 'Grandfather was hospitalized due to heart condition. Had to travel home immediately.',
      status: 'FACULTY_APPROVED',
      facultyId: 'user-fac-1',
      facultyRemarks: 'Genuine emergency. Approved.',
      hodId: null,
      hodRemarks: null,
      attendanceUpdated: false,
      documentName: 'hospital_doc.pdf',
      createdAt: daysAgo(12),
      updatedAt: daysAgo(11),
    },
  ];
  leaveRequests.forEach(r => DB.insert('leave_requests', { ...r }));

  // ---- Approval History ----
  const approvalHistory = [
    { id: generateId('aph-'), requestId: 'od-001', requestType: 'OD', approverId: 'user-fac-1', action: 'FACULTY_APPROVED', remarks: 'Good initiative. Approved.', createdAt: daysAgo(9) },
    { id: generateId('aph-'), requestId: 'od-001', requestType: 'OD', approverId: 'user-hod-cse', action: 'HOD_APPROVED', remarks: 'Approved. Represent the college well.', createdAt: daysAgo(8) },
    { id: generateId('aph-'), requestId: 'od-002', requestType: 'OD', approverId: 'user-fac-1', action: 'FACULTY_APPROVED', remarks: 'Impressive work. Approved.', createdAt: daysAgo(4) },
    { id: generateId('aph-'), requestId: 'od-004', requestType: 'OD', approverId: 'user-fac-1', action: 'FACULTY_REJECTED', remarks: 'This event was not officially registered. Insufficient documentation.', createdAt: daysAgo(13) },
    { id: generateId('aph-'), requestId: 'leave-001', requestType: 'LEAVE', approverId: 'user-fac-1', action: 'FACULTY_APPROVED', remarks: 'Medical certificate submitted. Approved.', createdAt: daysAgo(19) },
    { id: generateId('aph-'), requestId: 'leave-001', requestType: 'LEAVE', approverId: 'user-hod-cse', action: 'HOD_APPROVED', remarks: 'Approved. Take rest and recover.', createdAt: daysAgo(18) },
    { id: generateId('aph-'), requestId: 'leave-003', requestType: 'LEAVE', approverId: 'user-fac-1', action: 'FACULTY_APPROVED', remarks: 'Genuine emergency. Approved.', createdAt: daysAgo(11) },
  ];
  approvalHistory.forEach(a => DB.insert('approval_history', a));

  // ---- Notifications ----
  const notifications = [
    { id: generateId('ntf-'), userId: 'user-stu-1', title: 'OD Request Approved', message: 'Your OD request for "National Level Hackathon - CodeFest 2024" has been approved by HOD.', type: 'SUCCESS', isRead: true, relatedId: 'od-001', relatedType: 'OD', createdAt: daysAgo(8) },
    { id: generateId('ntf-'), userId: 'user-stu-1', title: 'Attendance Updated', message: 'Your attendance has been updated for the approved OD on 15 Sep 2024.', type: 'INFO', isRead: true, relatedId: 'od-001', relatedType: 'OD', createdAt: daysAgo(8) },
    { id: generateId('ntf-'), userId: 'user-stu-1', title: 'OD Request Rejected', message: 'Your OD request for "Industry Visit - Infosys Campus" was rejected by Faculty. Reason: Insufficient documentation.', type: 'ERROR', isRead: false, relatedId: 'od-004', relatedType: 'OD', createdAt: daysAgo(13) },
    { id: generateId('ntf-'), userId: 'user-stu-1', title: 'Leave Approved', message: 'Your sick leave from 05 Sep to 07 Sep 2024 has been approved by HOD.', type: 'SUCCESS', isRead: true, relatedId: 'leave-001', relatedType: 'LEAVE', createdAt: daysAgo(18) },
    { id: generateId('ntf-'), userId: 'user-stu-2', title: 'OD Request Faculty Approved', message: 'Your OD request for "Technical Paper Presentation" has been approved by Faculty. Pending HOD review.', type: 'SUCCESS', isRead: false, relatedId: 'od-002', relatedType: 'OD', createdAt: daysAgo(4) },
    { id: generateId('ntf-'), userId: 'user-fac-1', title: 'New OD Request', message: 'Suriya Prakash K (20CS003) has submitted an OD request for "Sports Meet - District Level".', type: 'INFO', isRead: false, relatedId: 'od-003', relatedType: 'OD', createdAt: daysAgo(2) },
    { id: generateId('ntf-'), userId: 'user-hod-cse', title: 'New Request for HOD Approval', message: 'OD request for Priya Dharshini R (20CS002) - "Technical Paper Presentation" is awaiting your approval.', type: 'INFO', isRead: false, relatedId: 'od-002', relatedType: 'OD', createdAt: daysAgo(4) },
  ];
  notifications.forEach(n => DB.insert('notifications', { ...n }));

  // ---- Audit Logs ----
  const audits = [
    { id: generateId('aud-'), userId: 'user-stu-1', action: 'SUBMITTED_OD', entityType: 'OD', entityId: 'od-001', description: 'Student submitted OD request for National Level Hackathon', createdAt: daysAgo(10) },
    { id: generateId('aud-'), userId: 'user-fac-1', action: 'APPROVED_OD', entityType: 'OD', entityId: 'od-001', description: 'Faculty approved OD request', createdAt: daysAgo(9) },
    { id: generateId('aud-'), userId: 'user-hod-cse', action: 'APPROVED_OD', entityType: 'OD', entityId: 'od-001', description: 'HOD approved OD request', createdAt: daysAgo(8) },
    { id: generateId('aud-'), userId: 'user-stu-1', action: 'ATTENDANCE_UPDATED', entityType: 'ATTENDANCE', entityId: 'od-001', description: 'Attendance updated for approved OD', createdAt: daysAgo(8) },
    { id: generateId('aud-'), userId: 'user-fac-1', action: 'REJECTED_OD', entityType: 'OD', entityId: 'od-004', description: 'Faculty rejected OD request - insufficient documentation', createdAt: daysAgo(13) },
    { id: generateId('aud-'), userId: 'user-stu-1', action: 'SUBMITTED_LEAVE', entityType: 'LEAVE', entityId: 'leave-001', description: 'Student submitted sick leave request', createdAt: daysAgo(20) },
    { id: generateId('aud-'), userId: 'user-fac-1', action: 'APPROVED_LEAVE', entityType: 'LEAVE', entityId: 'leave-001', description: 'Faculty approved leave request', createdAt: daysAgo(19) },
    { id: generateId('aud-'), userId: 'user-hod-cse', action: 'APPROVED_LEAVE', entityType: 'LEAVE', entityId: 'leave-001', description: 'HOD approved leave request', createdAt: daysAgo(18) },
  ];
  audits.forEach(a => DB.insert('audit_logs', a));

  DB.markInitialized();
  console.log('Database seeded successfully.');
}

function now() { return new Date().toISOString(); }
function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString(); }
