import { useState, useEffect } from 'react';
import api from '../api/client';
import { fmtDateTime } from '../utils/helpers';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs').then(r => { setLogs(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const actionColor = (action) => {
    if (action.includes('APPROVED')) return 'var(--success)';
    if (action.includes('REJECTED')) return 'var(--error)';
    if (action.includes('SUBMITTED')) return 'var(--primary)';
    if (action.includes('WITHDRAWN')) return 'var(--warning)';
    return 'var(--gray-500)';
  };

  if (loading) return <div className="flex-center" style={{ height: 200 }}><div className="loading-spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Complete system action history</p>
        </div>
      </div>

      <div className="card">
        {logs.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📜</div><div className="empty-state-title">No audit logs</div></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Description</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l._id}>
                    <td style={{ fontSize: 11, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>{fmtDateTime(l.createdAt)}</td>
                    <td style={{ fontSize: 12 }}>{l.userId}</td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 700, color: actionColor(l.action), background: 'var(--gray-50)', padding: '2px 8px', borderRadius: 4 }}>
                        {l.action}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{l.entityType}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>{l.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
