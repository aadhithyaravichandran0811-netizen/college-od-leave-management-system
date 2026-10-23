import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'STUDENT') navigate('/dashboard');
      else if (['FACULTY', 'HOD'].includes(user.role)) navigate('/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const fill = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ maxWidth: 500 }}>
          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 14 }}>
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.2)"/>
              <path d="M10 20L17 27L30 13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>EduLeave</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>OD &amp; Leave Management</div>
            </div>
          </div>
          <h1 className="login-hero-title">Streamline OD &amp; Leave Requests</h1>
          <p className="login-hero-sub">A centralized digital platform for managing On-Duty and Leave applications with multi-level approval workflows and automatic attendance integration.</p>
          <div className="feature-list">
            {['Student OD & Leave applications', 'Faculty review & approval workflow', 'HOD final approval with attendance sync', 'Real-time notifications & tracking'].map(f => (
              <div key={f} className="feature-item">
                <div className="feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-logo">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#1d4ed8"/>
              <path d="M10 20L17 27L30 13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="login-logo-text">
              <h2>EduLeave</h2>
              <p>OD & Leave Management</p>
            </div>
          </div>

          <h2 className="login-title">Welcome back</h2>
          <p className="login-sub">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email" className="form-input" placeholder="you@college.edu"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className="form-input" placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
            </div>
            {error && <div className="form-error" style={{ marginBottom: 12, fontSize: 13 }}>{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--gray-600)' }}>
            New student without an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Register here →
            </Link>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: 'var(--gray-50)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 10 }}>Demo Accounts (password: Demo@1234)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                ['student@college.edu', 'Student'],
                ['faculty@college.edu', 'Faculty'],
                ['hod@college.edu', 'HOD'],
                ['admin@college.edu', 'Admin'],
              ].map(([e, label]) => (
                <button key={e} onClick={() => fill(e, 'Demo@1234')} className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
