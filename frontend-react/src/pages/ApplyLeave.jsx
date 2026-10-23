import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ leaveType: 'Sick Leave', fromDate: '', toDate: '', days: 1, reason: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calcDays = (from, to) => {
    if (!from || !to) return 1;
    const diff = (new Date(to) - new Date(from)) / 86400000;
    return Math.max(1, Math.round(diff) + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const days = calcDays(form.fromDate, form.toDate);
      await api.post('/leave', { ...form, days });
      setSuccess(true);
      setTimeout(() => navigate('/my-requests'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="flex-center" style={{ height: 300, flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>✅</div>
      <h2 style={{ color: 'var(--success)' }}>Leave Request Submitted!</h2>
      <p style={{ color: 'var(--gray-500)' }}>Redirecting to your requests…</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Apply for Leave</h1>
          <p className="page-subtitle">Submit a leave request for approval</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        <div className="card-header"><span className="card-title">Leave Request Form</span></div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Leave Type *</label>
              <select className="form-select" value={form.leaveType} onChange={e => set('leaveType', e.target.value)}>
                <option>Sick Leave</option>
                <option>Personal Leave</option>
                <option>Emergency Leave</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">From Date *</label>
                <input type="date" className="form-input" value={form.fromDate}
                  onChange={e => { set('fromDate', e.target.value); set('days', calcDays(e.target.value, form.toDate)); }}
                  required />
              </div>
              <div className="form-group">
                <label className="form-label">To Date *</label>
                <input type="date" className="form-input" value={form.toDate}
                  onChange={e => { set('toDate', e.target.value); set('days', calcDays(form.fromDate, e.target.value)); }}
                  min={form.fromDate} required />
              </div>
            </div>
            {form.fromDate && form.toDate && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--primary-muted)', borderRadius: 6, fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                📅 Duration: {calcDays(form.fromDate, form.toDate)} day{calcDays(form.fromDate, form.toDate) > 1 ? 's' : ''}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Reason *</label>
              <input className="form-input" placeholder="Brief reason for leave" value={form.reason} onChange={e => set('reason', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Additional details…" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
            </div>
            {error && <div className="form-error" style={{ marginBottom: 12, fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting…' : 'Submit Leave Request'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
