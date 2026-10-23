import { useState, useEffect } from 'react';
import api from '../api/client';
import { fmtDate, getStatusBadge } from '../utils/helpers';

export default function MyRequests() {
  const [odRequests, setOdRequests] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [tab, setTab] = useState('od');
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/od/my'), api.get('/leave/my')]).then(([od, lv]) => {
      setOdRequests(od.data); setLeaveRequests(lv.data); setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const withdraw = async (id, type) => {
    if (!window.confirm('Withdraw this request?')) return;
    setWithdrawing(id);
    try {
      await api.patch(`/${type}/${id}/withdraw`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw.');
    } finally {
      setWithdrawing(null);
    }
  };

  if (loading) return <div className="flex-center" style={{ height: 200 }}><div className="loading-spinner" /></div>;

  const tabStyle = (active) => ({
    padding: '9px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    background: active ? 'var(--primary)' : 'var(--gray-100)',
    color: active ? 'white' : 'var(--gray-600)',
    transition: 'all 0.15s',
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Requests</h1>
          <p className="page-subtitle">Track all your OD and leave applications</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button style={tabStyle(tab === 'od')} onClick={() => setTab('od')}>OD Requests ({odRequests.length})</button>
        <button style={tabStyle(tab === 'leave')} onClick={() => setTab('leave')}>Leave Requests ({leaveRequests.length})</button>
      </div>

      {tab === 'od' && (
        <div className="card">
          {odRequests.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No OD requests</div><div className="empty-state-sub">Submit an OD request to get started</div></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Event</th><th>Venue</th><th>Date</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead>
                <tbody>
                  {odRequests.map(r => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 500 }}>{r.eventName}</td>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.venue}</td>
                      <td>{fmtDate(r.odDate)}</td>
                      <td>{getStatusBadge(r.status)}</td>
                      <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{fmtDate(r.createdAt)}</td>
                      <td>
                        {r.status === 'PENDING' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => withdraw(r._id, 'od')}
                            disabled={withdrawing === r._id}
                            style={{ color: 'var(--error)', borderColor: 'var(--error-light)' }}
                          >
                            {withdrawing === r._id ? '…' : 'Withdraw'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'leave' && (
        <div className="card">
          {leaveRequests.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📅</div><div className="empty-state-title">No leave requests</div><div className="empty-state-sub">Submit a leave request to get started</div></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {leaveRequests.map(r => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 500 }}>{r.leaveType}</td>
                      <td>{fmtDate(r.fromDate)}</td>
                      <td>{fmtDate(r.toDate)}</td>
                      <td>{r.days}</td>
                      <td>{getStatusBadge(r.status)}</td>
                      <td>
                        {r.status === 'PENDING' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => withdraw(r._id, 'leave')}
                            disabled={withdrawing === r._id}
                            style={{ color: 'var(--error)', borderColor: 'var(--error-light)' }}
                          >
                            {withdrawing === r._id ? '…' : 'Withdraw'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
