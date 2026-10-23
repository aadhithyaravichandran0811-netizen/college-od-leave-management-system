import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { fmtDate, getStatusBadge, getAttBarClass } from '../utils/helpers';

// ============ Student Dashboard ============
function StudentDashboard({ user }) {
  const [attendance, setAttendance] = useState([]);
  const [odRequests, setOdRequests] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    api.get('/attendance/my').then(r => setAttendance(r.data)).catch(() => {});
    api.get('/od/my').then(r => setOdRequests(r.data)).catch(() => {});
    api.get('/leave/my').then(r => setLeaveRequests(r.data)).catch(() => {});
  }, []);

  const total = attendance.reduce((s, r) => s + r.conducted, 0);
  const present = attendance.reduce((s, r) => s + r.present, 0);
  const odC = attendance.reduce((s, r) => s + r.od, 0);
  const pct = total ? Math.round(((present + odC) / total) * 100) : 0;
  const pending = [...odRequests, ...leaveRequests].filter(r => r.status === 'PENDING').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user.name.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">{user.profile?.rollNo} · {user.profile?.departmentName} · Year {user.profile?.year}</p>
        </div>
      </div>

      <div className="grid-4 mb-6">
        {[
          { label: 'Overall Attendance', value: `${pct}%`, color: pct >= 75 ? '#059669' : '#dc2626', bg: pct >= 75 ? '#d1fae5' : '#fee2e2' },
          { label: 'Total OD Requests', value: odRequests.length, color: '#1d4ed8', bg: '#dbeafe' },
          { label: 'Total Leave Requests', value: leaveRequests.length, color: '#7c3aed', bg: '#ede9fe' },
          { label: 'Pending Requests', value: pending, color: '#d97706', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: 22, color: s.color }}>
                {s.label.includes('Attendance') ? '📊' : s.label.includes('OD') ? '📋' : s.label.includes('Leave') ? '📅' : '⏳'}
              </span>
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Requests</span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Type</th><th>Details</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {[...odRequests.slice(0, 3).map(r => ({ ...r, type: 'OD', name: r.eventName, date: r.odDate })),
                  ...leaveRequests.slice(0, 2).map(r => ({ ...r, type: 'Leave', name: r.leaveType, date: r.fromDate }))]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(r => (
                  <tr key={r._id}>
                    <td><span className={`badge ${r.type === 'OD' ? 'badge-info' : 'badge-default'}`}>{r.type}</span></td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</td>
                    <td>{fmtDate(r.date)}</td>
                    <td>{getStatusBadge(r.status)}</td>
                  </tr>
                ))}
                {odRequests.length === 0 && leaveRequests.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '24px' }}>No requests yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Attendance Overview</span></div>
          <div className="card-body">
            {attendance.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No attendance data available.</p>
            ) : attendance.slice(0, 5).map(r => {
              const p = r.conducted ? Math.round(((r.present + r.od) / r.conducted) * 100) : 0;
              return (
                <div key={r._id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                    <span style={{ fontWeight: 500 }}>{r.subjectCode} — {r.subjectName}</span>
                    <span style={{ fontWeight: 700, color: p >= 75 ? 'var(--success)' : 'var(--error)' }}>{p}%</span>
                  </div>
                  <div className="att-bar-wrap">
                    <div className={`att-bar ${getAttBarClass(p)}`} style={{ width: `${p}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Faculty Dashboard ============
function FacultyDashboard({ user }) {
  const [pendingOD, setPendingOD] = useState([]);
  const [pendingLeave, setPendingLeave] = useState([]);

  useEffect(() => {
    api.get('/od/pending').then(r => setPendingOD(r.data)).catch(() => {});
    api.get('/leave/pending').then(r => setPendingLeave(r.data)).catch(() => {});
  }, []);

  const isHOD = user.role === 'HOD';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{user.profile?.designation} · {user.profile?.departmentName}</p>
        </div>
      </div>

      <div className="grid-4 mb-6">
        {[
          { label: 'Pending OD', value: pendingOD.length, color: '#d97706', bg: '#fef3c7' },
          { label: 'Pending Leave', value: pendingLeave.length, color: '#1d4ed8', bg: '#dbeafe' },
          { label: 'Total Pending', value: pendingOD.length + pendingLeave.length, color: '#dc2626', bg: '#fee2e2' },
          { label: 'Dept', value: user.profile?.departmentCode || '—', color: '#7c3aed', bg: '#ede9fe' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: 22 }}>
                {s.label.includes('OD') ? '📋' : s.label.includes('Leave') ? '📅' : s.label === 'Dept' ? '🏫' : '⚠️'}
              </span>
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Pending OD Requests</span></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Student</th><th>Event</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {pendingOD.slice(0, 5).map(r => (
                  <tr key={r._id}>
                    <td style={{ fontSize: 12 }}>{r.studentId}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{r.eventName}</td>
                    <td style={{ fontSize: 12 }}>{fmtDate(r.odDate)}</td>
                    <td>{getStatusBadge(r.status)}</td>
                  </tr>
                ))}
                {pendingOD.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 24 }}>No pending OD requests</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Pending Leave Requests</span></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Student</th><th>Type</th><th>From</th><th>Status</th></tr></thead>
              <tbody>
                {pendingLeave.slice(0, 5).map(r => (
                  <tr key={r._id}>
                    <td style={{ fontSize: 12 }}>{r.studentId}</td>
                    <td style={{ fontSize: 12 }}>{r.leaveType}</td>
                    <td style={{ fontSize: 12 }}>{fmtDate(r.fromDate)}</td>
                    <td>{getStatusBadge(r.status)}</td>
                  </tr>
                ))}
                {pendingLeave.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 24 }}>No pending leave requests</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Admin Dashboard ============
function AdminDashboard({ user }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then(r => setAnalytics(r.data)).catch(() => {});
  }, []);

  if (!analytics) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><div className="loading-spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">System-wide overview — EduLeave</p>
        </div>
      </div>

      <div className="grid-4 mb-6">
        {[
          { label: 'Total Students', value: analytics.totalStudents, color: '#1d4ed8', bg: '#dbeafe', icon: '👥' },
          { label: 'Total Faculty', value: analytics.totalFaculty, color: '#7c3aed', bg: '#ede9fe', icon: '👨‍🏫' },
          { label: 'Total OD Requests', value: analytics.totalOD, color: '#059669', bg: '#d1fae5', icon: '📋' },
          { label: 'Total Leave Requests', value: analytics.totalLeave, color: '#d97706', bg: '#fef3c7', icon: '📅' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-3 mb-6">
        {[
          { label: 'Pending', value: analytics.pending, color: '#d97706', bg: '#fef3c7' },
          { label: 'Approved', value: analytics.approved, color: '#059669', bg: '#d1fae5' },
          { label: 'Rejected', value: analytics.rejected, color: '#dc2626', bg: '#fee2e2' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <span style={{ fontSize: 22 }}>{s.label === 'Pending' ? '⏳' : s.label === 'Approved' ? '✅' : '❌'}</span>
            </div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label} Requests</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Department Statistics</span></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Department</th><th>Students</th><th>OD Requests</th><th>Leave Requests</th></tr></thead>
            <tbody>
              {analytics.deptStats.map(d => (
                <tr key={d.name}>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.students}</td>
                  <td>{d.od}</td>
                  <td>{d.leave}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============ Main Dashboard export ============
export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'STUDENT') return <StudentDashboard user={user} />;
  if (user.role === 'ADMIN') return <AdminDashboard user={user} />;
  return <FacultyDashboard user={user} />;
}
