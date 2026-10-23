import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { getAttBarClass } from '../utils/helpers';

export default function Attendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance/my').then(r => { setRecords(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const total = records.reduce((s, r) => s + r.conducted, 0);
  const present = records.reduce((s, r) => s + r.present, 0);
  const absent = records.reduce((s, r) => s + r.absent, 0);
  const od = records.reduce((s, r) => s + r.od, 0);
  const leave = records.reduce((s, r) => s + r.leave, 0);
  const pct = total ? Math.round(((present + od) / total) * 100) : 0;

  if (loading) return <div className="flex-center" style={{ height: 200 }}><div className="loading-spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">Subject-wise attendance tracking</p>
        </div>
      </div>

      <div className="grid-4 mb-6">
        {[
          { label: 'Overall', value: `${pct}%`, color: pct >= 75 ? 'var(--success)' : 'var(--error)', bg: pct >= 75 ? 'var(--success-light)' : 'var(--error-light)', icon: '📊' },
          { label: 'Present', value: present, color: 'var(--success)', bg: 'var(--success-light)', icon: '✅' },
          { label: 'Absent', value: absent, color: 'var(--error)', bg: 'var(--error-light)', icon: '❌' },
          { label: 'OD / Leave', value: `${od} / ${leave}`, color: 'var(--info)', bg: 'var(--info-light)', icon: '📋' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Subject-wise Attendance</span></div>
        {records.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-title">No attendance data</div></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th><th>Code</th><th>Conducted</th><th>Present</th>
                  <th>Absent</th><th>OD</th><th>Leave</th><th>%</th><th>Bar</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const p = r.conducted ? Math.round(((r.present + r.od) / r.conducted) * 100) : 0;
                  return (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 500 }}>{r.subjectName}</td>
                      <td><code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>{r.subjectCode}</code></td>
                      <td>{r.conducted}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>{r.present}</td>
                      <td style={{ color: 'var(--error)', fontWeight: 600 }}>{r.absent}</td>
                      <td style={{ color: 'var(--info)', fontWeight: 600 }}>{r.od}</td>
                      <td>{r.leave}</td>
                      <td style={{ fontWeight: 700, color: p >= 75 ? 'var(--success)' : 'var(--error)' }}>{p}%</td>
                      <td style={{ minWidth: 100 }}>
                        <div className="att-bar-wrap">
                          <div className={`att-bar ${getAttBarClass(p)}`} style={{ width: `${p}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
