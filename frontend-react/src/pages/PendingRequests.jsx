import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { fmtDate, fmtDateTime, getStatusBadge } from '../utils/helpers';

function ApproveModal({ request, type, isHOD, onClose, onDone }) {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('approve');

  const submit = async () => {
    setLoading(true);
    try {
      const url = `/${type}/${request._id}/${action === 'approve' ? 'approve' : 'reject'}${isHOD ? '?level=hod' : ''}`;
      await api.patch(url, { remarks });
      onDone();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Review Request</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
            {type === 'od' ? <>
              <tr><td style={{ padding: '6px 0', color: 'var(--gray-500)', width: '40%' }}>Event</td><td style={{ fontWeight: 600 }}>{request.eventName}</td></tr>
              <tr><td style={{ padding: '6px 0', color: 'var(--gray-500)' }}>Venue</td><td>{request.venue}</td></tr>
              <tr><td style={{ padding: '6px 0', color: 'var(--gray-500)' }}>Date</td><td>{fmtDate(request.odDate)}</td></tr>
              <tr><td style={{ padding: '6px 0', color: 'var(--gray-500)' }}>Reason</td><td>{request.reason}</td></tr>
            </> : <>
              <tr><td style={{ padding: '6px 0', color: 'var(--gray-500)', width: '40%' }}>Type</td><td style={{ fontWeight: 600 }}>{request.leaveType}</td></tr>
              <tr><td style={{ padding: '6px 0', color: 'var(--gray-500)' }}>From</td><td>{fmtDate(request.fromDate)}</td></tr>
              <tr><td style={{ padding: '6px 0', color: 'var(--gray-500)' }}>To</td><td>{fmtDate(request.toDate)} ({request.days} days)</td></tr>
              <tr><td style={{ padding: '6px 0', color: 'var(--gray-500)' }}>Reason</td><td>{request.reason}</td></tr>
            </>}
          </table>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button onClick={() => setAction('approve')} className={`btn btn-sm ${action === 'approve' ? 'btn-success' : 'btn-secondary'}`}>✓ Approve</button>
            <button onClick={() => setAction('reject')} className={`btn btn-sm ${action === 'reject' ? 'btn-danger' : 'btn-secondary'}`}>✕ Reject</button>
          </div>
          <div className="form-group">
            <label className="form-label">Remarks {action === 'reject' && <span style={{ color: 'var(--error)' }}>*</span>}</label>
            <textarea className="form-textarea" rows={3} placeholder="Add remarks…" value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className={`btn ${action === 'approve' ? 'btn-success' : 'btn-danger'}`}
            onClick={submit} disabled={loading || (action === 'reject' && !remarks.trim())}
          >
            {loading ? 'Processing…' : action === 'approve' ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PendingRequests() {
  const { user } = useAuth();
  const isHOD = user?.role === 'HOD';
  const [odList, setOdList] = useState([]);
  const [leaveList, setLeaveList] = useState([]);
  const [tab, setTab] = useState('od');
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const odUrl = isHOD ? '/od/hod-pending' : '/od/pending';
    const lvUrl = isHOD ? '/leave/hod-pending' : '/leave/pending';
    Promise.all([api.get(odUrl), api.get(lvUrl)]).then(([od, lv]) => {
      setOdList(od.data); setLeaveList(lv.data); setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDone = () => { setModal(null); load(); };

  const tabStyle = (active) => ({
    padding: '9px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    background: active ? 'var(--primary)' : 'var(--gray-100)',
    color: active ? 'white' : 'var(--gray-600)',
  });

  if (loading) return <div className="flex-center" style={{ height: 200 }}><div className="loading-spinner" /></div>;

  return (
    <div>
      {modal && (
        <ApproveModal
          request={modal.request} type={modal.type} isHOD={isHOD}
          onClose={() => setModal(null)} onDone={handleDone}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">{isHOD ? 'HOD Review' : 'Pending Requests'}</h1>
          <p className="page-subtitle">{isHOD ? 'Faculty-approved requests awaiting your decision' : 'Student requests awaiting your review'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button style={tabStyle(tab === 'od')} onClick={() => setTab('od')}>OD ({odList.length})</button>
        <button style={tabStyle(tab === 'leave')} onClick={() => setTab('leave')}>Leave ({leaveList.length})</button>
      </div>

      {tab === 'od' && (
        <div className="card">
          {odList.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-title">No pending OD requests</div></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Student</th><th>Event</th><th>Venue</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {odList.map(r => (
                    <tr key={r._id}>
                      <td style={{ fontSize: 12 }}>{r.studentId}</td>
                      <td style={{ fontWeight: 500 }}>{r.eventName}</td>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.venue}</td>
                      <td>{fmtDate(r.odDate)}</td>
                      <td>{getStatusBadge(r.status)}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setModal({ request: r, type: 'od' })}>
                          Review
                        </button>
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
          {leaveList.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-title">No pending leave requests</div></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Student</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {leaveList.map(r => (
                    <tr key={r._id}>
                      <td style={{ fontSize: 12 }}>{r.studentId}</td>
                      <td style={{ fontWeight: 500 }}>{r.leaveType}</td>
                      <td>{fmtDate(r.fromDate)}</td>
                      <td>{fmtDate(r.toDate)}</td>
                      <td>{r.days}</td>
                      <td>{getStatusBadge(r.status)}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setModal({ request: r, type: 'leave' })}>
                          Review
                        </button>
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
