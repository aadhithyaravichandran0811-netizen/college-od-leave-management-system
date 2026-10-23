import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Register() {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    phone: '',
    departmentId: '',
    year: '1',
    section: 'A',
    batch: `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
    password: '',
    confirmPassword: '',
  });

  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch departments
  useEffect(() => {
    let isMounted = true;
    api.get('/auth/departments')
      .then(res => {
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          setDepartments(res.data);
          setFormData(prev => ({ ...prev, departmentId: prev.departmentId || res.data[0]._id || res.data[0].id }));
        }
      })
      .catch(() => {
        // Fallback default departments
        const fallbackDepts = [
          { _id: 'dept-cse', id: 'dept-cse', name: 'Computer Science and Engineering', code: 'CSE' },
          { _id: 'dept-it', id: 'dept-it', name: 'Information Technology', code: 'IT' },
          { _id: 'dept-ece', id: 'dept-ece', name: 'Electronics and Communication Engineering', code: 'ECE' },
          { _id: 'dept-eee', id: 'dept-eee', name: 'Electrical and Electronics Engineering', code: 'EEE' },
        ];
        if (isMounted) {
          setDepartments(fallbackDepts);
          setFormData(prev => ({ ...prev, departmentId: prev.departmentId || fallbackDepts[0]._id }));
        }
      });
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rollNo' ? value.toUpperCase().trim() : value,
    }));
  };

  // Password strength helper
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 25, text: 'Weak', color: '#ef4444' };
    if (score === 2) return { score: 50, text: 'Fair', color: '#f59e0b' };
    if (score === 3) return { score: 75, text: 'Good', color: '#3b82f6' };
    return { score: 100, text: 'Strong', color: '#10b981' };
  };

  const strength = getPasswordStrength(formData.password);

  const selectedDept = departments.find(
    d => d._id === formData.departmentId || d.id === formData.departmentId
  ) || departments[0] || { name: 'Computer Science and Engineering', code: 'CSE' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Please enter your full name.');
    if (!formData.rollNo.trim()) return setError('Please enter your roll number.');
    if (!formData.email.trim()) return setError('Please enter your email address.');
    if (!formData.departmentId) return setError('Please select your department.');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters.');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
    if (!termsAccepted) return setError('Please confirm that your student information matches college records.');

    setLoading(true);
    try {
      await registerStudent({
        name: formData.name.trim(),
        rollNo: formData.rollNo.toUpperCase().trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone.trim(),
        departmentId: formData.departmentId,
        year: parseInt(formData.year) || 1,
        section: formData.section.toUpperCase().trim(),
        batch: formData.batch.trim(),
        password: formData.password,
      });

      // Auto logged in via AuthContext, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ alignItems: 'flex-start', minHeight: '100vh', overflowY: 'auto' }}>
      {/* Left Hero Sidebar */}
      <div className="login-left" style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 460 }}>
          <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
            <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="rgba(255,255,255,0.2)"/>
              <path d="M10 20L17 27L30 13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>EduLeave</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>College OD &amp; Leave Portal</div>
            </div>
          </div>

          <h1 className="login-hero-title" style={{ fontSize: 34, marginBottom: 14 }}>
            Student Registration
          </h1>
          <p className="login-hero-sub" style={{ fontSize: 14, marginBottom: 28, opacity: 0.9 }}>
            Create your official student account to submit digital On-Duty (OD) and Leave applications, monitor faculty and HOD approvals in real time, and safeguard your 75% attendance threshold.
          </p>

          {/* Interactive Live Student ID Preview */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: 14,
            padding: '20px',
            marginBottom: 28,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>
                Live Student ID Card Preview
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.25)',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
              }}>
                STUDENT
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: 'white',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                {formData.name.trim() ? formData.name.trim()[0].toUpperCase() : 'S'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 16, fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {formData.name.trim() || 'Your Full Name'}
                </div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                  Roll No: <strong>{formData.rollNo.trim() || '24CS001'}</strong>
                </div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
                  {selectedDept?.code || 'CSE'} • Year {formData.year || '1'} (Sec {formData.section || 'A'}) • {formData.batch || '2024-2028'}
                </div>
              </div>
            </div>
          </div>

          <div className="feature-list" style={{ gap: 10 }}>
            {[
              'Instant profile activation with department attendance sync',
              'Quick application for Symposiums, Hackathons & Competitions',
              'Paperless multi-tier approval tracking from Faculty to HOD',
            ].map(f => (
              <div key={f} className="feature-item" style={{ fontSize: 13 }}>
                <div className="feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Registration Form */}
      <div className="login-right" style={{ width: '640px', maxWidth: '100%', padding: '40px 48px' }}>
        <div style={{ width: '100%', maxWidth: 540 }}>
          <div className="login-logo" style={{ marginBottom: 20 }}>
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#1d4ed8"/>
              <path d="M10 20L17 27L30 13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="login-logo-text">
              <h2>EduLeave</h2>
              <p>Student Portal Registration</p>
            </div>
          </div>

          <h2 className="login-title" style={{ fontSize: 22 }}>Create Student Account</h2>
          <p className="login-sub" style={{ marginBottom: 20 }}>
            Enter your academic and personal credentials to register
          </p>

          {error && (
            <div style={{
              background: 'var(--error-light)',
              color: 'var(--error)',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid #fca5a5'
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Row 1: Name and Roll Number */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color: 'var(--error)' }}>*</span></label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Arun Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Roll Number <span style={{ color: 'var(--error)' }}>*</span></label>
                <input
                  type="text"
                  name="rollNo"
                  className="form-input"
                  placeholder="e.g. 23CS045"
                  value={formData.rollNo}
                  onChange={handleChange}
                  style={{ textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600 }}
                  required
                />
              </div>
            </div>

            {/* Row 2: Email and Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">College Email <span style={{ color: 'var(--error)' }}>*</span></label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="student@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 3: Department, Year, Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Department <span style={{ color: 'var(--error)' }}>*</span></label>
                <select
                  name="departmentId"
                  className="form-select"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                >
                  {departments.map(d => (
                    <option key={d._id || d.id} value={d._id || d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Year</label>
                <select
                  name="year"
                  className="form-select"
                  value={formData.year}
                  onChange={handleChange}
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Section</label>
                <select
                  name="section"
                  className="form-select"
                  value={formData.section}
                  onChange={handleChange}
                >
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                  <option value="D">Sec D</option>
                </select>
              </div>
            </div>

            {/* Row 4: Academic Batch */}
            <div className="form-group">
              <label className="form-label">Academic Batch</label>
              <input
                type="text"
                name="batch"
                className="form-input"
                placeholder="e.g. 2023-2027"
                value={formData.batch}
                onChange={handleChange}
              />
            </div>

            {/* Row 5: Password and Confirm Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password <span style={{ color: 'var(--error)' }}>*</span></label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password <span style={{ color: 'var(--error)' }}>*</span></label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password strength & Match indicator */}
            {formData.password && (
              <div style={{ marginBottom: 14, marginTop: -4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: 'var(--gray-500)' }}>Password Strength:</span>
                  <span style={{ fontWeight: 600, color: strength.color }}>{strength.text}</span>
                </div>
                <div style={{ height: 4, background: 'var(--gray-200)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${strength.score}%`, height: '100%', background: strength.color, transition: 'all 0.3s ease' }} />
                </div>
                {formData.confirmPassword && (
                  <div style={{
                    fontSize: 11,
                    marginTop: 6,
                    color: formData.password === formData.confirmPassword ? 'var(--success)' : 'var(--error)',
                    fontWeight: 500
                  }}>
                    {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>
            )}

            {/* Confirmation checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '16px 0 20px' }}>
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                style={{ marginTop: 3, cursor: 'pointer' }}
                required
              />
              <label htmlFor="terms" style={{ fontSize: 12, color: 'var(--gray-600)', cursor: 'pointer', lineHeight: 1.4 }}>
                I verify that the above information is accurate and matches my college enrollment records.
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Creating Student Account…
                </span>
              ) : (
                'Complete Student Registration →'
              )}
            </button>
          </form>

          {/* Link back to login */}
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--gray-600)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in to your account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
