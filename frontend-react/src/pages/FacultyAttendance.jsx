import { useState, useEffect, useMemo } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getAttBarClass, initials } from '../utils/helpers';

export default function FacultyAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    students: [],
    departments: [],
    subjects: [],
    facultyDeptId: null,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, GOOD (>=75), SHORTAGE (<75)

  // Expanded student row IDs for subject breakdown
  const [expandedStudents, setExpandedStudents] = useState({});

  // Edit modal state
  const [editingStudent, setEditingStudent] = useState(null);
  const [editRecords, setEditRecords] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Fetch overview data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendance/faculty/overview');
      setData(res.data);
      if (res.data.facultyDeptId && deptFilter === 'ALL') {
        // Default to faculty department if available
        setDeptFilter(res.data.facultyDeptId);
      }
    } catch (err) {
      console.error('Failed to load faculty attendance overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (studentId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const expandAll = () => {
    const all = {};
    filteredStudents.forEach(s => {
      all[s._id] = true;
    });
    setExpandedStudents(all);
  };

  const collapseAll = () => {
    setExpandedStudents({});
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    return (data.students || []).filter(s => {
      // Search filter
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.profile?.rollNo || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q);

      // Dept filter
      const matchDept =
        deptFilter === 'ALL' ||
        s.departmentId === deptFilter ||
        (s.departmentCode || '').toUpperCase() === deptFilter.toUpperCase();

      // Year filter
      const sYear = String(s.profile?.year || '');
      const matchYear = yearFilter === 'ALL' || sYear === yearFilter;

      // Status filter
      const pct = s.summary?.overallPercentage || 0;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'GOOD' && pct >= 75) ||
        (statusFilter === 'SHORTAGE' && pct < 75);

      // Subject filter
      const matchSubject =
        subjectFilter === 'ALL' ||
        (s.attendance || []).some(a => a.subjectId === subjectFilter || a.subjectCode === subjectFilter);

      return matchSearch && matchDept && matchYear && matchStatus && matchSubject;
    });
  }, [data.students, search, deptFilter, yearFilter, statusFilter, subjectFilter]);

  // Key statistics
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const good = filteredStudents.filter(s => (s.summary?.overallPercentage || 0) >= 75).length;
    const shortage = total - good;
    const avg = total > 0
      ? Math.round(filteredStudents.reduce((acc, s) => acc + (s.summary?.overallPercentage || 0), 0) / total)
      : 0;
    return { total, good, shortage, avg };
  }, [filteredStudents]);

  // Open edit modal
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditRecords(
      (student.attendance || []).map(r => ({
        id: r.id || r._id,
        subjectName: r.subjectName,
        subjectCode: r.subjectCode,
        conducted: r.conducted,
        present: r.present,
        absent: r.absent,
        od: r.od,
        leave: r.leave,
        percentage: r.percentage,
      }))
    );
    setSaveMessage(null);
  };

  // Handle input change in edit modal
  const handleRecordChange = (index, field, value) => {
    setEditRecords(prev => {
      const copy = [...prev];
      const val = Math.max(0, parseInt(value) || 0);
      copy[index] = { ...copy[index], [field]: val };

      // Auto reconcile absent if conducted, present, od, or leave changes
      if (['conducted', 'present', 'od', 'leave'].includes(field)) {
        const c = copy[index].conducted;
        const p = copy[index].present;
        const o = copy[index].od;
        const l = copy[index].leave;
        copy[index].absent = Math.max(0, c - p - o - l);
        copy[index].percentage = c > 0 ? Math.round(((p + o) / c) * 100) : 0;
      }
      return copy;
    });
  };

  // Save edited attendance
  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      await api.put(`/attendance/student/${editingStudent._id}`, {
        records: editRecords.map(r => ({
          id: r.id,
          conducted: r.conducted,
          present: r.present,
          absent: r.absent,
          od: r.od,
          leave: r.leave,
        })),
      });

      setSaveMessage({ type: 'success', text: `Attendance updated successfully for ${editingStudent.name}!` });

      // Update local state smoothly
      setData(prev => {
        const updatedStudents = prev.students.map(s => {
          if (s._id !== editingStudent._id) return s;

          const updatedAttendance = s.attendance.map(att => {
            const match = editRecords.find(r => r.id === (att.id || att._id));
            if (!match) return att;
            const c = match.conducted;
            const p = match.present;
            const o = match.od;
            const l = match.leave;
            const abs = Math.max(0, c - p - o - l);
            const pct = c > 0 ? Math.round(((p + o) / c) * 100) : 0;
            return {
              ...att,
              conducted: c,
              present: p,
              absent: abs,
              od: o,
              leave: l,
              percentage: pct,
            };
          });

          const totalConducted = updatedAttendance.reduce((acc, r) => acc + r.conducted, 0);
          const totalPresent = updatedAttendance.reduce((acc, r) => acc + r.present, 0);
          const totalAbsent = updatedAttendance.reduce((acc, r) => acc + r.absent, 0);
          const totalOD = updatedAttendance.reduce((acc, r) => acc + r.od, 0);
          const totalLeave = updatedAttendance.reduce((acc, r) => acc + r.leave, 0);
          const overallPercentage = totalConducted > 0
            ? Math.round(((totalPresent + totalOD) / totalConducted) * 100)
            : 0;

          return {
            ...s,
            attendance: updatedAttendance,
            summary: {
              totalConducted,
              totalPresent,
              totalAbsent,
              totalOD,
              totalLeave,
              overallPercentage,
              status: overallPercentage >= 75 ? 'ELIGIBLE' : 'SHORTAGE',
            },
          };
        });

        return { ...prev, students: updatedStudents };
      });

      setTimeout(() => {
        setEditingStudent(null);
        setSaveMessage(null);
      }, 900);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update attendance.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: 300, flexDirection: 'column', gap: 12 }}>
        <div className="loading-spinner" />
        <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>Loading student attendance records...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">
            Comprehensive student list with subject-wise attendance tracking and review
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={expandAll}
            title="Expand all subject details"
          >
            🔽 Expand All
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={collapseAll}
            title="Collapse all subject details"
          >
            🔼 Collapse All
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={fetchData}
            title="Refresh attendance records"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
            👥
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Students Listed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            ✅
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.good}</div>
            <div className="stat-label">Eligible (≥ 75%)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
            ⚠️
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--error)' }}>{stats.shortage}</div>
            <div className="stat-label">Shortage (&lt; 75%)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
            📊
          </div>
          <div>
            <div className="stat-value" style={{ color: stats.avg >= 75 ? 'var(--success)' : 'var(--warning)' }}>
              {stats.avg}%
            </div>
            <div className="stat-label">Class Average</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Card */}
      <div className="card mb-6">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ flex: '1 1 220px', minWidth: 200, position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search student by name, roll no, or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 34 }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-400)',
                  fontSize: 14,
                  pointerEvents: 'none',
                }}
              >
                🔍
              </span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--gray-400)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Subject Filter */}
            <div style={{ minWidth: 180 }}>
              <select
                className="form-select"
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                style={{ fontSize: 13 }}
              >
                <option value="ALL">📚 All Subjects</option>
                {(data.subjects || []).map(sub => (
                  <option key={sub._id || sub.id} value={sub._id || sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div style={{ minWidth: 150 }}>
              <select
                className="form-select"
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                style={{ fontSize: 13 }}
              >
                <option value="ALL">🏛️ All Departments</option>
                {(data.departments || []).map(dept => (
                  <option key={dept._id || dept.id} value={dept._id || dept.id}>
                    {dept.code} - {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div style={{ minWidth: 110 }}>
              <select
                className="form-select"
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                style={{ fontSize: 13 }}
              >
                <option value="ALL">Year: All</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ minWidth: 140 }}>
              <select
                className="form-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ fontSize: 13 }}
              >
                <option value="ALL">Status: All</option>
                <option value="GOOD">Eligible (≥ 75%)</option>
                <option value="SHORTAGE">Shortage (&lt; 75%)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Student List with Subject-Wise Attendance */}
      <div className="card">
        <div className="card-header flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="card-title">Student Attendance Roster</span>
            <span
              className="badge"
              style={{ background: 'var(--primary-muted)', color: 'var(--primary)', fontSize: 11 }}
            >
              {filteredStudents.length} Students
            </span>
          </div>
          {subjectFilter !== 'ALL' && (
            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
              Filtering by Subject:{' '}
              <strong>
                {data.subjects?.find(s => (s._id || s.id) === subjectFilter)?.code}
              </strong>
            </div>
          )}
        </div>

        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No matching students found</div>
            <div className="empty-state-sub">Try adjusting your filters or search keywords.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Student Info</th>
                  <th>Roll No</th>
                  <th>Dept / Class</th>
                  <th style={{ minWidth: 140 }}>Overall Attendance</th>
                  <th>Status</th>
                  <th>Subject Breakdown</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => {
                  const rollNo = s.profile?.rollNo || 'N/A';
                  const dept = s.departmentCode || 'CSE';
                  const year = s.profile?.year ? `Y${s.profile.year}` : 'Y1';
                  const section = s.profile?.section ? `Sec ${s.profile.section}` : '';
                  const pct = s.summary?.overallPercentage || 0;
                  const isGood = pct >= 75;
                  const isExpanded = !!expandedStudents[s._id];

                  // If subject filter is selected, find that specific subject record
                  const specificSubjectRecord =
                    subjectFilter !== 'ALL'
                      ? (s.attendance || []).find(
                          a => a.subjectId === subjectFilter || a.subjectCode === subjectFilter
                        )
                      : null;

                  return (
                    <tbody key={s._id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <tr
                        style={{
                          background: isExpanded ? 'var(--gray-50)' : 'transparent',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>{idx + 1}</td>
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
                                fontSize: 12,
                                flexShrink: 0,
                              }}
                            >
                              {initials(s.name)}
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
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-800)' }}>
                            {dept} • {year} {section}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                            {s.profile?.batch || '2023-2027'}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1, minWidth: 70 }}>
                              <div className="att-bar-wrap">
                                <div
                                  className={`att-bar ${getAttBarClass(pct)}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 13,
                                minWidth: 38,
                                textAlign: 'right',
                                color: isGood ? 'var(--success)' : 'var(--error)',
                              }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                            {s.summary?.totalPresent || 0}P / {s.summary?.totalConducted || 0}C (+
                            {s.summary?.totalOD || 0} OD)
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${isGood ? 'badge-approved' : 'badge-rejected'}`}>
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: 'currentColor',
                              }}
                            />
                            {isGood ? 'Eligible' : 'Shortage'}
                          </span>
                        </td>
                        <td>
                          {/* If a subject is filtered, show its specific stats pill */}
                          {specificSubjectRecord ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                background: '#f8fafc',
                                border: '1px solid var(--gray-200)',
                                padding: '4px 8px',
                                borderRadius: 6,
                                fontSize: 12,
                              }}
                            >
                              <strong>{specificSubjectRecord.subjectCode}:</strong>
                              <span>{specificSubjectRecord.percentage}%</span>
                              <span style={{ color: 'var(--gray-400)', fontSize: 11 }}>
                                ({specificSubjectRecord.present}P / {specificSubjectRecord.conducted}C)
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => toggleExpand(s._id)}
                              style={{
                                fontSize: 11,
                                padding: '4px 10px',
                                gap: 4,
                                background: isExpanded ? 'var(--primary-muted)' : '#fff',
                                borderColor: isExpanded ? 'var(--primary)' : 'var(--gray-200)',
                                color: isExpanded ? 'var(--primary)' : 'var(--gray-700)',
                              }}
                            >
                              {isExpanded ? 'Hide' : 'View'} Subjects ({s.attendance?.length || 0}){' '}
                              {isExpanded ? '▲' : '▼'}
                            </button>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleOpenEdit(s)}
                            style={{
                              padding: '5px 12px',
                              fontSize: 12,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            ✏️ Edit Attendance
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Subject-Wise Attendance Detail Drawer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} style={{ padding: '0 0 16px 0', background: 'var(--gray-50)' }}>
                            <div
                              style={{
                                margin: '8px 16px',
                                background: '#fff',
                                border: '1px solid var(--gray-200)',
                                borderRadius: 8,
                                overflow: 'hidden',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                              }}
                            >
                              <div
                                style={{
                                  padding: '10px 16px',
                                  background: 'var(--gray-50)',
                                  borderBottom: '1px solid var(--gray-200)',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--gray-700)' }}>
                                  📚 Subject-Wise Attendance Breakdown for {s.name} ({rollNo})
                                </span>
                                <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                                  Formula: (Present + OD) / Conducted × 100
                                </span>
                              </div>

                              {(!s.attendance || s.attendance.length === 0) ? (
                                <div style={{ padding: 16, textAlign: 'center', color: 'var(--gray-400)', fontSize: 12 }}>
                                  No subject attendance records found for this student.
                                </div>
                              ) : (
                                <table className="table" style={{ margin: 0 }}>
                                  <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                      <th style={{ fontSize: 10, padding: '8px 14px' }}>Subject Code</th>
                                      <th style={{ fontSize: 10, padding: '8px 14px' }}>Subject Name</th>
                                      <th style={{ fontSize: 10, padding: '8px 14px', textAlign: 'center' }}>Conducted</th>
                                      <th style={{ fontSize: 10, padding: '8px 14px', textAlign: 'center', color: 'var(--success)' }}>Present</th>
                                      <th style={{ fontSize: 10, padding: '8px 14px', textAlign: 'center', color: 'var(--error)' }}>Absent</th>
                                      <th style={{ fontSize: 10, padding: '8px 14px', textAlign: 'center', color: 'var(--info)' }}>OD</th>
                                      <th style={{ fontSize: 10, padding: '8px 14px', textAlign: 'center' }}>Leave</th>
                                      <th style={{ fontSize: 10, padding: '8px 14px', minWidth: 120 }}>Percentage</th>
                                      <th style={{ fontSize: 10, padding: '8px 14px' }}>Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {s.attendance.map(att => {
                                      const subPct = att.percentage;
                                      const subGood = subPct >= 75;
                                      return (
                                        <tr key={att.id || att._id}>
                                          <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12, padding: '8px 14px' }}>
                                            <span style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>
                                              {att.subjectCode}
                                            </span>
                                          </td>
                                          <td style={{ fontWeight: 500, fontSize: 12, padding: '8px 14px', color: 'var(--gray-900)' }}>
                                            {att.subjectName}
                                          </td>
                                          <td style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, padding: '8px 14px' }}>
                                            {att.conducted}
                                          </td>
                                          <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--success)', fontSize: 12, padding: '8px 14px' }}>
                                            {att.present}
                                          </td>
                                          <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--error)', fontSize: 12, padding: '8px 14px' }}>
                                            {att.absent}
                                          </td>
                                          <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--info)', fontSize: 12, padding: '8px 14px' }}>
                                            {att.od}
                                          </td>
                                          <td style={{ textAlign: 'center', fontSize: 12, padding: '8px 14px', color: 'var(--gray-600)' }}>
                                            {att.leave}
                                          </td>
                                          <td style={{ padding: '8px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                              <div style={{ flex: 1 }}>
                                                <div className="att-bar-wrap" style={{ height: 6 }}>
                                                  <div
                                                    className={`att-bar ${getAttBarClass(subPct)}`}
                                                    style={{ width: `${subPct}%` }}
                                                  />
                                                </div>
                                              </div>
                                              <span
                                                style={{
                                                  fontWeight: 700,
                                                  fontSize: 12,
                                                  width: 34,
                                                  textAlign: 'right',
                                                  color: subGood ? 'var(--success)' : 'var(--error)',
                                                }}
                                              >
                                                {subPct}%
                                              </span>
                                            </div>
                                          </td>
                                          <td style={{ padding: '8px 14px' }}>
                                            <span
                                              className="badge"
                                              style={{
                                                fontSize: 10,
                                                padding: '2px 7px',
                                                background: subGood ? 'var(--success-light)' : 'var(--error-light)',
                                                color: subGood ? 'var(--success)' : 'var(--error)',
                                              }}
                                            >
                                              {subGood ? 'Eligible' : 'Low'}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Attendance Modal */}
      {editingStudent && (
        <div className="modal-overlay" onClick={() => !saving && setEditingStudent(null)}>
          <div
            className="modal"
            style={{ maxWidth: 740 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Edit Subject Attendance</h3>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                  Student: <strong>{editingStudent.name}</strong> ({editingStudent.profile?.rollNo || 'N/A'}) • {editingStudent.departmentCode}
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => !saving && setEditingStudent(null)}
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAttendance}>
              <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
                {saveMessage && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 6,
                      fontSize: 13,
                      marginBottom: 16,
                      background: saveMessage.type === 'success' ? 'var(--success-light)' : 'var(--error-light)',
                      color: saveMessage.type === 'success' ? 'var(--success)' : 'var(--error)',
                    }}
                  >
                    {saveMessage.text}
                  </div>
                )}

                <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--gray-600)' }}>
                  Enter updated figures per subject. Absent counts and percentages update automatically as you type.
                </div>

                <div className="table-wrap">
                  <table className="table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: 140 }}>Subject</th>
                        <th style={{ width: 80 }}>Conducted</th>
                        <th style={{ width: 80, color: 'var(--success)' }}>Present</th>
                        <th style={{ width: 80, color: 'var(--error)' }}>Absent</th>
                        <th style={{ width: 75, color: 'var(--info)' }}>OD</th>
                        <th style={{ width: 75 }}>Leave</th>
                        <th style={{ width: 70, textAlign: 'right' }}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editRecords.map((rec, idx) => (
                        <tr key={rec.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                              {rec.subjectCode}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                              {rec.subjectName}
                            </div>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: 12 }}
                              value={rec.conducted}
                              onChange={e => handleRecordChange(idx, 'conducted', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max={rec.conducted}
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: 12, fontWeight: 600, color: 'var(--success)' }}
                              value={rec.present}
                              onChange={e => handleRecordChange(idx, 'present', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: 12, color: 'var(--error)' }}
                              value={rec.absent}
                              onChange={e => handleRecordChange(idx, 'absent', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: 12, color: 'var(--info)' }}
                              value={rec.od}
                              onChange={e => handleRecordChange(idx, 'od', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              className="form-input"
                              style={{ padding: '6px 8px', fontSize: 12 }}
                              value={rec.leave}
                              onChange={e => handleRecordChange(idx, 'leave', e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: rec.percentage >= 75 ? 'var(--success)' : 'var(--error)',
                              }}
                            >
                              {rec.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingStudent(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  {saving ? (
                    <>
                      <div className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                      Saving...
                    </>
                  ) : (
                    '💾 Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
