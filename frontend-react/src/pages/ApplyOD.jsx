import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function ApplyOD() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ eventName: '', venue: '', odDate: '', startTime: '', endTime: '', hours: '', reason: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/od', form);
      setSuccess(true);
      setTimeout(() => navigate('/my-requests'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit OD request.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="flex-center" style={{ height: 300, flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>✅</div>
      <h2 style={{ color: 'var(--success)' }}>OD Request Submitted!</h2>
      <p style={{ color: 'var(--gray-500)' }}>Redirecting to your requests…</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Apply for OD</h1>
          <p className="page-subtitle">Submit an On-Duty request for events, competitions, or activities</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        <div className="card-header"><span className="card-title">OD Request Form</span></div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Event Name *</label>
              <input className="form-input" placeholder="e.g. National Level Hackathon" value={form.eventName} onChange={e => set('eventName', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Venue *</label>
              <input className="form-input" placeholder="e.g. Anna University, Chennai" value={form.venue} onChange={e => set('venue', e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">OD Date *</label>
                <input type="date" className="form-input" value={form.odDate} onChange={e => set('odDate', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (hours)</label>
                <input type="number" className="form-input" placeholder="e.g. 8" value={form.hours} onChange={e => set('hours', e.target.value)} min="1" max="24" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input type="time" className="form-input" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input type="time" className="form-input" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reason *</label>
              <input className="form-input" placeholder="Brief reason for OD" value={form.reason} onChange={e => set('reason', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Additional details about the event…" value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
            </div>
            {error && <div className="form-error" style={{ marginBottom: 12, fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Submitting…' : 'Submit OD Request'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
