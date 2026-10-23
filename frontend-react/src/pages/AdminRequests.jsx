import { useState, useEffect } from 'react';
import api from '../api/client';
import { fmtDate, fmtDateTime, getStatusBadge } from '../utils/helpers';

export default function AdminRequests() {
  const [odAll, setOdAll] = useState([]);
  const [leaveAll, setLeaveAll] = useState([]);
  const [tab, setTab] = useState('od');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    Promise.all([api.get('/od/all'), api.get('/leave/all')]).then(([od, lv]) => {
      setOdAll(od.data); setLeaveAll(lv.data); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filterList = (list) => filter === 'ALL' ? list : list.filter(r => r.status.includes(filter));

  const tabStyle = (active) => ({
    padding: '9px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    background: active ? 'var(--primary)' : 'var(--gray-100)', color: active ? 'white' : 'var(--gray-600)',
  });

  if (loading) return <div className="flex-center" style={{ height: 200 }}><div className="loading-spinner" /></div>;

  const list = tab === 'od' ? filterList(odAll) : filterList(leaveAll);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">All Requests</h1>
          <p className="page-subtitle">Complete view of all OD and leave applications</p>
        </div>
        <select className="form-select" style={{ width: 180 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="FACULTY_APPROVED">Faculty Approved</option>
          <option value="HOD_APPROVED">HOD Approved</option>
          <option value="FACULTY_REJECTED">Faculty Rejected</option>
          <option value="HOD_REJECTED">HOD Rejected</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button style={tabStyle(tab === 'od')} onClick={() => setTab('od')}>OD ({odAll.length})</button>
        <button style={tabStyle(tab === 'leave')} onClick={() => setTab('leave')}>Leave ({leaveAll.length})</button>
      </div>

      <div className="card">
        {list.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No requests found</div></div>
        ) : tab === 'od' ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Student</th><th>Event</th><th>Date</th><th>Hours</th><th>Status</th><th>Submitted</th></tr></thead>
              <tbody>
                {list.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontSize: 12 }}>{r.studentId}</td>
                    <td style={{ fontWeight: 500 }}>{r.eventName}</td>
                    <td>{fmtDate(r.odDate)}</td>
                    <td>{r.hours}h</td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{fmtDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Student</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Submitted</th></tr></thead>
              <tbody>
                {list.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontSize: 12 }}>{r.studentId}</td>
                    <td style={{ fontWeight: 500 }}>{r.leaveType}</td>
                    <td>{fmtDate(r.fromDate)}</td>
                    <td>{fmtDate(r.toDate)}</td>
                    <td>{r.days}</td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{fmtDate(r.createdAt)}</td>
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
