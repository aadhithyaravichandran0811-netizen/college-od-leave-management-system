import { useState, useEffect, useMemo } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Students() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    phone: '',
    departmentId: '',
    year: '1',
    section: 'A',
    batch: `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
    password: 'Demo@1234',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, deptRes] = await Promise.allSettled([
        api.get('/admin/students'),
        api.get('/admin/departments').catch(() => api.get('/auth/departments')),
      ]);

      if (stuRes.status === 'fulfilled' && Array.isArray(stuRes.value.data)) {
        setStudents(stuRes.value.data);
      }
      if (deptRes.status === 'fulfilled' && Array.isArray(deptRes.value.data)) {
        setDepartments(deptRes.value.data);
        if (deptRes.value.data.length > 0) {
          setFormData(prev => ({ ...prev, departmentId: prev.departmentId || deptRes.value.data[0]._id || deptRes.value.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = search.toLowerCase();
      const name = (s.name || '').toLowerCase();
      const roll = (s.profile?.rollNo || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      const matchesSearch = !q || name.includes(q) || roll.includes(q) || email.includes(q);

      const sDeptId = s.profile?.departmentId || '';
      const sDeptCode = (s.departmentCode || s.profile?.departmentCode || '').toUpperCase();
      const matchesDept =
        deptFilter === 'ALL' ||
        sDeptId === deptFilter ||
        sDeptCode === deptFilter;

      const sYear = String(s.profile?.year || '');
      const matchesYear = yearFilter === 'ALL' || sYear === yearFilter;

      return matchesSearch && matchesDept && matchesYear;
    });
  }, [students, search, deptFilter, yearFilter]);

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rollNo' ? value.toUpperCase().trim() : value,
    }));
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');

    if (!formData.name.trim() || !formData.rollNo.trim() || !formData.email.trim() || !formData.departmentId) {
      setModalError('Please fill in all required fields.');
      return;
    }

    setModalLoading(true);
    try {
      const res = await api.post('/admin/students', {
        ...formData,
        year: parseInt(formData.year) || 1,
      });

      setModalSuccess(`Student "${formData.name}" (${formData.rollNo}) successfully registered!`);
      // Append to local student state
      setStudents(prev => [res.data, ...prev]);

      // Reset form
      setFormData({
        name: '',
        rollNo: '',
        email: '',
        phone: '',
        departmentId: departments[0]?._id || departments[0]?.id || '',
        year: '1',
        section: 'A',
        batch: `${new Date().getFullYear()}-${new Date().getFullYear() + 4}`,
        password: 'Demo@1234',
      });

      setTimeout(() => {
        setShowModal(false);
        setModalSuccess('');
      }, 1200);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to create student.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header flex-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Student Directory &amp; Registration</h1>
          <p className="page-subtitle">
            View enrolled students, inspect profiles, and register new students into the system
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setModalError('');
            setModalSuccess('');
            setShowModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 600 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Register New Student
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{students.length}</div>
          <div className="stat-sublabel">Enrolled across departments</div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🎓</div>
          <div className="stat-label">Active Records</div>
          <div className="stat-value">{students.filter(s => s.isActive !== false).length}</div>
          <div className="stat-sublabel">Eligible for OD &amp; Leave</div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🏛️</div>
          <div className="stat-label">Departments</div>
          <div className="stat-value">{departments.length || 4}</div>
          <div className="stat-sublabel">Academic faculties</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🔍</div>
          <div className="stat-label">Filtered Results</div>
          <div className="stat-value">{filteredStudents.length}</div>
          <div className="stat-sublabel">Matching criteria</div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: '1 1 240px', minWidth: 200, position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by student name, roll number, or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                🔍
              </span>
            </div>

            {/* Department Filter */}
            <div style={{ width: 180 }}>
              <select
                className="form-select"
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d._id || d.id} value={d._id || d.id || d.code}>
                    {d.code} - {d.name.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div style={{ width: 140 }}>
              <select
                className="form-select"
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
              >
                <option value="ALL">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            {(search || deptFilter !== 'ALL' || yearFilter !== 'ALL') && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSearch('');
                  setDeptFilter('ALL');
                  setYearFilter('ALL');
                }}
                style={{ fontSize: 12 }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="card">
        <div className="card-header flex-between">
          <span className="card-title">Enrolled Students ({filteredStudents.length})</span>
          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 12px' }} />
            <div style={{ color: 'var(--gray-500)', fontSize: 13 }}>Loading student records…</div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🧑‍🎓</div>
            <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--gray-800)', marginBottom: 4 }}>
              No students found
            </div>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 16 }}>
              {search || deptFilter !== 'ALL' || yearFilter !== 'ALL'
                ? 'Try adjusting your search criteria or filter options.'
                : 'No student accounts have been created yet.'}
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              + Register First Student
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll Number</th>
                  <th>Department</th>
                  <th>Year / Section</th>
                  <th>Batch</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const rollNo = s.profile?.rollNo || 'N/A';
                  const dept = s.departmentCode || s.profile?.departmentCode || 'CSE';
                  const year = s.profile?.year ? `Year ${s.profile.year}` : 'Year 1';
                  const section = s.profile?.section ? `Sec ${s.profile.section}` : 'Sec A';
                  const batch = s.profile?.batch || '2023-2027';

                  return (
                    <tr key={s._id || s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: 'var(--primary-muted)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            {(s.name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {rollNo}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">{dept}</span>
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {year} • {section}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>{batch}</td>
                      <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>{s.phone || '—'}</td>
                      <td>
                        <span className="badge badge-approved">
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Register New Student */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !modalLoading && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Register New Student</h3>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                  Create and enroll a new student account in the OD &amp; Leave portal
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => !modalLoading && setShowModal(false)}
                disabled={modalLoading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {modalError && (
                  <div style={{
                    background: 'var(--error-light)',
                    color: 'var(--error)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                  }}>
                    ⚠️ {modalError}
                  </div>
                )}
                {modalSuccess && (
                  <div style={{
                    background: 'var(--success-light)',
                    color: 'var(--success)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                  }}>
                    ✓ {modalSuccess}
                  </div>
                )}

                {/* Name & Roll No */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      placeholder="e.g. Priya Sundaram"
                      value={formData.name}
                      onChange={handleModalChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Roll Number *</label>
                    <input
                      type="text"
                      name="rollNo"
                      className="form-input"
                      placeholder="e.g. 23CS089"
                      value={formData.rollNo}
                      onChange={handleModalChange}
                      style={{ textTransform: 'uppercase', fontWeight: 600 }}
                      required
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="priya@college.edu"
                      value={formData.email}
                      onChange={handleModalChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleModalChange}
                    />
                  </div>
                </div>

                {/* Department, Year, Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Department *</label>
                    <select
                      name="departmentId"
                      className="form-select"
                      value={formData.departmentId}
                      onChange={handleModalChange}
                      required
                    >
                      {departments.map(d => (
                        <option key={d._id || d.id} value={d._id || d.id}>
                          {d.code} - {d.name.split(' ')[0]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Year</label>
                    <select
                      name="year"
                      className="form-select"
                      value={formData.year}
                      onChange={handleModalChange}
                    >
                      <option value="1">1st</option>
                      <option value="2">2nd</option>
                      <option value="3">3rd</option>
                      <option value="4">4th</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Section</label>
                    <select
                      name="section"
                      className="form-select"
                      value={formData.section}
                      onChange={handleModalChange}
                    >
                      <option value="A">Sec A</option>
                      <option value="B">Sec B</option>
                      <option value="C">Sec C</option>
                    </select>
                  </div>
                </div>

                {/* Batch & Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Academic Batch</label>
                    <input
                      type="text"
                      name="batch"
                      className="form-input"
                      placeholder="e.g. 2024-2028"
                      value={formData.batch}
                      onChange={handleModalChange}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Initial Password</label>
                    <input
                      type="text"
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleModalChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading}
                  style={{ minWidth: 140, justifyContent: 'center' }}
                >
                  {modalLoading ? 'Registering…' : 'Save & Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
