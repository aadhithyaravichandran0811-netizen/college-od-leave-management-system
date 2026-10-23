import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Toast from './components/Toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Students from './pages/Students';
import Dashboard from './pages/Dashboard';
import MyRequests from './pages/MyRequests';
import ApplyOD from './pages/ApplyOD';
import ApplyLeave from './pages/ApplyLeave';
import Attendance from './pages/Attendance';
import FacultyAttendance from './pages/FacultyAttendance';
import PendingRequests from './pages/PendingRequests';
import AdminRequests from './pages/AdminRequests';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  requests: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),
  od: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  leave: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  attendance: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  pending: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  ),
  audit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  allReq: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  students: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

// ─── Nav config per role ──────────────────────────────────────────────────────
import { NavLink } from 'react-router-dom';

function NavItem({ to, icon, label, badge }) {
  return (
    <NavLink to={to} className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
      {icon}
      <span>{label}</span>
      {badge ? <span className="sidebar-badge">{badge}</span> : null}
    </NavLink>
  );
}

function studentNav(unread) {
  return (
    <>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Overview</div>
        <NavItem to="/dashboard" icon={icons.dashboard} label="Dashboard" />
        <NavItem to="/attendance" icon={icons.attendance} label="Attendance" />
        <NavItem to="/my-requests" icon={icons.requests} label="My Requests" />
      </div>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Apply</div>
        <NavItem to="/apply-od" icon={icons.od} label="Apply OD" />
        <NavItem to="/apply-leave" icon={icons.leave} label="Apply Leave" />
      </div>
    </>
  );
}

function facultyNav(unread) {
  return (
    <>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Overview</div>
        <NavItem to="/dashboard" icon={icons.dashboard} label="Dashboard" />
      </div>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Attendance &amp; Students</div>
        <NavItem to="/faculty-attendance" icon={icons.attendance} label="Attendance" />
        <NavItem to="/students" icon={icons.students} label="Students" />
      </div>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Requests</div>
        <NavItem to="/pending" icon={icons.pending} label="Pending Requests" badge={unread > 0 ? unread : null} />
      </div>
    </>
  );
}

function hodNav(unread) {
  return (
    <>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Overview</div>
        <NavItem to="/dashboard" icon={icons.dashboard} label="Dashboard" />
      </div>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Management</div>
        <NavItem to="/faculty-attendance" icon={icons.attendance} label="Attendance" />
        <NavItem to="/students" icon={icons.students} label="Students" />
      </div>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Approvals</div>
        <NavItem to="/pending" icon={icons.pending} label="HOD Review" badge={unread > 0 ? unread : null} />
      </div>
    </>
  );
}

function adminNav(unread) {
  return (
    <>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Overview</div>
        <NavItem to="/dashboard" icon={icons.dashboard} label="Dashboard" />
      </div>
      <div className="sidebar-section">
        <div className="sidebar-section-label">Management</div>
        <NavItem to="/faculty-attendance" icon={icons.attendance} label="Attendance" />
        <NavItem to="/students" icon={icons.students} label="Students" />
        <NavItem to="/all-requests" icon={icons.allReq} label="All Requests" />
        <NavItem to="/audit-logs" icon={icons.audit} label="Audit Logs" />
      </div>
    </>
  );
}

// ─── Protected Route wrapper ──────────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

// ─── Authed layout wrapper ────────────────────────────────────────────────────
function AppLayout({ children }) {
  const { user } = useAuth();

  const navMap = {
    STUDENT: studentNav,
    FACULTY: facultyNav,
    HOD: hodNav,
    ADMIN: adminNav,
  };

  const navFn = navMap[user?.role] || (() => null);

  return <Layout navItems={navFn}>{children}</Layout>;
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user } = useAuth();

  return (
    <>
      <Toast />
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* Dashboard (all authenticated roles) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Smart Attendance Route (Student -> Attendance, Faculty/HOD/Admin -> FacultyAttendance) */}
        <Route path="/attendance" element={
          <ProtectedRoute>
            <AppLayout>
              {user?.role === 'STUDENT' ? <Attendance /> : <FacultyAttendance />}
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Dedicated Faculty/Admin/HOD Attendance Management */}
        <Route path="/faculty-attendance" element={
          <ProtectedRoute roles={['FACULTY', 'HOD', 'ADMIN']}>
            <AppLayout><FacultyAttendance /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Student-only routes */}
        <Route path="/my-requests" element={
          <ProtectedRoute roles={['STUDENT']}>
            <AppLayout><MyRequests /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/apply-od" element={
          <ProtectedRoute roles={['STUDENT']}>
            <AppLayout><ApplyOD /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/apply-leave" element={
          <ProtectedRoute roles={['STUDENT']}>
            <AppLayout><ApplyLeave /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Faculty + HOD review routes */}
        <Route path="/pending" element={
          <ProtectedRoute roles={['FACULTY', 'HOD']}>
            <AppLayout><PendingRequests /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Student Management (Faculty, Admin & HOD) */}
        <Route path="/students" element={
          <ProtectedRoute roles={['ADMIN', 'HOD', 'FACULTY']}>
            <AppLayout><Students /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/all-requests" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AppLayout><AdminRequests /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/audit-logs" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AppLayout><AuditLogs /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Profile (all roles) */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout><Profile /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  );
}
