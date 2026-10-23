# College OD & Leave Management System

**EduLeave** — A complete, production-style digital OD and Leave request management system for engineering colleges.

---

## 🎯 Project Overview

A centralized web application for managing student On-Duty (OD) and Leave requests digitally, with multi-level approval workflows and automatic attendance integration.

---

## ✨ Features

### Student
- Dashboard with attendance overview and quick actions
- Apply for OD (On-Duty) with event details, document upload
- Apply for Leave (Sick, Personal, Emergency, Other)
- Track request status in real-time
- View approval timeline and history
- Receive in-app notifications
- Subject-wise attendance with visual bars

### Faculty
- Dashboard with pending request summary
- Review and approve/reject OD requests
- Review and approve/reject Leave requests
- Add remarks during approval
- View student attendance data
- View processing history

### HOD / Admin
- Full dashboard with analytics and charts
- Second-level approval for faculty-approved requests
- Student and faculty management
- Department overview
- System-wide attendance view
- Analytics with monthly charts and department stats
- Complete audit trail
- System settings

---

## 🏗 Architecture

```
/frontend               — Pure browser SPA (no build step required)
  index.html            — Entry point
  style.css             — Complete design system
  db.js                 — In-browser database layer (localStorage)
  seed.js               — Demo data seeder
  auth.js               — Authentication & session management
  api.js                — Business logic layer
  components.js         — Shared UI components
  pages/
    login.js            — Login page
    student.js          — Student pages
    faculty.js          — Faculty & HOD pages
    admin.js            — Admin pages
  app.js                — Router & app shell
```

**Technology**: Vanilla HTML + CSS + JavaScript (no framework, no build tools needed)  
**Storage**: Browser localStorage (simulates a complete relational database)

---

## 🚀 Getting Started

### Option 1: Open Directly (Recommended)
1. Open `frontend/index.html` in any modern browser
2. The app initializes and seeds demo data automatically
3. Log in with demo credentials

### Option 2: With a Local Server
```bash
cd frontend
python -m http.server 8080
# Open http://localhost:8080
```

---

## 🔐 Demo Accounts

| Role    | Email                   | Password    | Department |
|---------|-------------------------|-------------|------------|
| Student | student@college.edu     | Demo@1234   | CSE        |
| Faculty | faculty@college.edu     | Demo@1234   | CSE        |
| HOD     | hod@college.edu         | Demo@1234   | CSE        |
| Admin   | admin@college.edu       | Demo@1234   | All        |

Additional accounts:
- IT HOD: `hod.it@college.edu`
- ECE HOD: `hod.ece@college.edu`
- EEE HOD: `hod.eee@college.edu`
- Additional students: `student2@college.edu` through `student20@college.edu` (same password)  
- Additional faculty: `faculty2@college.edu` through `faculty4@college.edu` (same password)

---

## 🔄 Approval Workflow

```
Student submits request
        ↓
PENDING (awaiting faculty review)
        ↓
Faculty reviews → FACULTY_APPROVED or FACULTY_REJECTED
        ↓
If approved → HOD reviews → HOD_APPROVED or HOD_REJECTED
        ↓
If HOD_APPROVED → Attendance automatically updated
        ↓
Student receives notification
```

**Status Values:**
- `PENDING` — Submitted, awaiting faculty review
- `FACULTY_APPROVED` — Faculty approved, awaiting HOD
- `FACULTY_REJECTED` — Rejected by faculty (final)
- `HOD_APPROVED` — Fully approved, attendance updated
- `HOD_REJECTED` — Rejected by HOD (final)

---

## 🗄 Data Model

The in-browser database simulates these tables:

| Table | Description |
|-------|-------------|
| `users` | All users with role, email, hashed password |
| `student_profiles` | Roll no, dept, year, section, batch |
| `faculty_profiles` | Employee ID, dept, designation |
| `departments` | 4 engineering departments |
| `subjects` | Department subjects |
| `attendance` | Per-student per-subject attendance |
| `od_requests` | OD applications with approval data |
| `leave_requests` | Leave applications with approval data |
| `approval_history` | Full approval audit trail |
| `notifications` | In-app notifications |
| `audit_logs` | System-wide action logs |

---

## 🎨 Design System

- **Font**: Inter (Google Fonts)
- **Colors**: Professional blue primary (`#1d4ed8`), clean grays
- **Components**: Cards, tables, badges, modals, toasts, timelines
- **Responsive**: Works on desktop, tablet, and mobile

---

## 📊 Sample Data

- **4 departments**: CSE, IT, ECE, EEE
- **20 students** with realistic Indian names and roll numbers
- **4 faculty** + 4 HODs + 1 admin
- **10 subjects** across departments
- **Attendance records** for 2 students (12 subject records)
- **4 OD requests** in various states
- **3 Leave requests** in various states
- **8 approval history entries**
- **7 notifications**
- **8 audit log entries**

---

## 🔒 Security Notes

For this browser-based demo:
- Passwords are hashed using SHA-256 (via Web Crypto API)
- Sessions stored in localStorage with simulated JWT tokens
- Role-based page access enforced at router level
- Input validation on all forms
- File upload validation (type + size)

**For production deployment**, migrate to a proper backend (Node.js/Express + PostgreSQL) using the API structure defined in `api.js`.

---

## 📁 File Sizes

| File | Purpose |
|------|---------|
| `index.html` | Entry point |
| `style.css` | ~400 lines — Complete design system |
| `db.js` | ~80 lines — Database layer |
| `seed.js` | ~200 lines — Demo data |
| `auth.js` | ~60 lines — Authentication |
| `api.js` | ~260 lines — Business logic |
| `components.js` | ~350 lines — UI components |
| `pages/login.js` | ~80 lines |
| `pages/student.js` | ~300 lines |
| `pages/faculty.js` | ~250 lines |
| `pages/admin.js` | ~450 lines |
| `app.js` | ~280 lines — Router |

---

## 🛠 Future Enhancements (for production)

1. Migrate to React + TypeScript + Vite frontend
2. Express + TypeScript backend with REST APIs
3. PostgreSQL with Prisma ORM
4. JWT authentication with refresh tokens
5. File upload to cloud storage (AWS S3 / Cloudinary)
6. Email notifications (Nodemailer)
7. Export to PDF/Excel
8. Mobile app (React Native)

---

*EduLeave v1.0.0*
