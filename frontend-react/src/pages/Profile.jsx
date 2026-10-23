import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, initials } = useAuth();

  if (!user) return null;

  const infoRows = user.role === 'STUDENT'
    ? [
        ['Roll Number', user.profile?.rollNo],
        ['Department', user.profile?.departmentName],
        ['Year', user.profile?.year],
        ['Section', user.profile?.section],
        ['Batch', user.profile?.batch],
      ]
    : user.role === 'ADMIN'
    ? [
        ['Employee ID', user.profile?.employeeId || '—'],
        ['Role', 'System Administrator'],
      ]
    : [
        ['Employee ID', user.profile?.employeeId],
        ['Department', user.profile?.departmentName],
        ['Designation', user.profile?.designation],
      ];

  const roleColors = {
    STUDENT: { bg: '#dbeafe', color: '#1d4ed8' },
    FACULTY: { bg: '#ede9fe', color: '#7c3aed' },
    HOD: { bg: '#fef3c7', color: '#d97706' },
    ADMIN: { bg: '#fee2e2', color: '#dc2626' },
  };
  const rc = roleColors[user.role] || { bg: '#f3f4f6', color: '#374151' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Account details and information</p>
        </div>
      </div>

      {/* Profile header card */}
      <div className="profile-header">
        <div className="profile-avatar">{initials(user.name)}</div>
        <div>
          <div className="profile-name">{user.name}</div>
          <div className="profile-meta">{user.email}</div>
          <div className="profile-badges">
            <span
              className="role-chip"
              style={{ background: rc.bg, color: rc.color }}
            >
              {user.role}
            </span>
            {user.profile?.departmentCode && (
              <span className="role-chip" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }}>
                {user.profile.departmentCode}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Profile Details</span>
        </div>
        <div className="card-body">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
              {[
                ['Full Name', user.name],
                ['Email', user.email],
                ['Role', user.role],
                ...infoRows,
              ].filter(([, v]) => v !== undefined && v !== null).map(([label, value]) => (
                <tr key={label} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '12px 0', color: 'var(--gray-500)', fontWeight: 500, width: '40%' }}>
                    {label}
                  </td>
                  <td style={{ padding: '12px 0', color: 'var(--gray-900)', fontWeight: 500 }}>
                    {value || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security note */}
      <div
        style={{
          marginTop: 16,
          padding: '14px 18px',
          background: 'var(--primary-muted)',
          borderRadius: 'var(--radius)',
          border: '1px solid #bfdbfe',
          fontSize: 13,
          color: 'var(--primary-dark)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span>🔒</span>
        <span>To change your password or update profile details, please contact your department administrator.</span>
      </div>
    </div>
  );
}
