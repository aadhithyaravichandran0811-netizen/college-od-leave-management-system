// ============================================================
// pages/login.js — Login page
// ============================================================

function renderLoginPage() {
  const root = document.getElementById('page-root');
  root.innerHTML = `
  <div class="login-page">
    <div class="login-left">
      <div class="login-illustration">🎓</div>
      <h1 class="login-headline">College OD & Leave<br>Management System</h1>
      <p class="login-tagline">Digital Request & Attendance Management</p>
      <ul class="login-features">
        <li>Paperless OD & Leave applications</li>
        <li>Multi-level approval workflow</li>
        <li>Automatic attendance integration</li>
        <li>Real-time status tracking</li>
        <li>Role-based access control</li>
        <li>Complete audit trail</li>
      </ul>
    </div>
    <div class="login-right">
      <div class="login-logo">
        <div class="login-logo-icon">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <path d="M10 20L17 27L30 13" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <div class="login-logo-text">EduLeave</div>
          <div class="login-logo-sub">OD &amp; Leave Management</div>
        </div>
      </div>

      <h2 class="login-form-title">Welcome back</h2>
      <p class="login-form-sub">Sign in to your account to continue</p>

      <div id="login-error" style="display:none" class="alert alert-error"></div>

      <form class="login-form" id="login-form" onsubmit="handleLogin(event)">
        <div class="form-group">
          <label class="form-label" for="email">Email Address</label>
          <input type="email" id="email" class="form-control" placeholder="you@college.edu" required autocomplete="email" />
        </div>
        <div class="form-group" style="margin-top:12px">
          <label class="form-label" for="password">Password</label>
          <div style="position:relative">
            <input type="password" id="password" class="form-control" placeholder="Enter your password" required autocomplete="current-password" />
            <button type="button" onclick="togglePassword()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--gray-400);cursor:pointer;display:flex;align-items:center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <button type="submit" id="login-btn" class="btn btn-primary btn-lg" style="width:100%;margin-top:20px;justify-content:center">
          Sign In
        </button>

        <div style="margin-top:16px;text-align:center;padding:10px;background:#eff6ff;border-radius:var(--r-md);border:1px solid #bfdbfe">
          <span style="font-size:var(--fs-xs);color:#1e40af">Don't have an account? </span>
          <button type="button" onclick="showRegisterStudentModal()" class="btn btn-sm btn-primary" style="margin-left:6px;padding:4px 12px;font-size:11px">
            + Register as Student
          </button>
        </div>
      </form>

      <div class="login-demo-accounts">
        <div class="demo-accounts-title">Quick Demo Login</div>
        <div class="demo-account-btns">
          <button class="demo-btn" onclick="setDemo('student@college.edu')">Student</button>
          <button class="demo-btn" onclick="setDemo('faculty@college.edu')">Faculty</button>
          <button class="demo-btn" onclick="setDemo('hod@college.edu')">HOD</button>
          <button class="demo-btn" onclick="setDemo('admin@college.edu')">Admin</button>
        </div>
        <div style="margin-top:12px;padding:10px 12px;background:var(--gray-50);border-radius:var(--r-md);border:1px solid var(--gray-200)">
          <div style="font-size:11px;color:var(--gray-500);font-weight:600;margin-bottom:6px">Demo Credentials</div>
          <div style="font-size:11px;color:var(--gray-600);line-height:1.8">
            Password for all accounts: <code style="background:var(--gray-100);padding:1px 6px;border-radius:3px;font-weight:600">Demo@1234</code><br>
            student@college.edu · faculty@college.edu<br>
            hod@college.edu · admin@college.edu
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

window.showRegisterStudentModal = function() {
  const depts = DB.getAll('departments');
  const html = `
  <div class="modal-overlay" id="reg-stu-modal-overlay" onclick="if(event.target.id==='reg-stu-modal-overlay')this.remove()">
    <div class="modal modal-md">
      <div class="modal-header">
        <span class="modal-title">Student Registration</span>
        <button class="modal-close" onclick="document.getElementById('reg-stu-modal-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <p style="font-size:var(--fs-xs);color:var(--gray-600);margin-bottom:16px">Create your student account to apply for OD and Leave requests.</p>
        <form onsubmit="handleRegisterStudentSubmit(event)">
          <div class="form-grid form-grid-2" style="gap:12px">
            <div class="form-group">
              <label class="form-label">Full Name <span class="required">*</span></label>
              <input type="text" id="reg-stu-name" class="form-control" placeholder="Enter full name" required />
            </div>
            <div class="form-group">
              <label class="form-label">Roll Number <span class="required">*</span></label>
              <input type="text" id="reg-stu-roll" class="form-control" placeholder="e.g., 22CS102" required maxlength="15" />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address <span class="required">*</span></label>
              <input type="email" id="reg-stu-email" class="form-control" placeholder="e.g., student@college.edu" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password <span class="required">*</span></label>
              <input type="password" id="reg-stu-pwd" class="form-control" placeholder="Create password" required minlength="4" />
            </div>
            <div class="form-group">
              <label class="form-label">Department <span class="required">*</span></label>
              <select id="reg-stu-dept" class="form-control" required>
                <option value="">Select Department</option>
                ${depts.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Year <span class="required">*</span></label>
              <select id="reg-stu-year" class="form-control" required>
                <option value="">Select Year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Section <span class="required">*</span></label>
              <select id="reg-stu-section" class="form-control" required>
                <option value="">Select Section</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Batch <span class="required">*</span></label>
              <input type="text" id="reg-stu-batch" class="form-control" placeholder="e.g., 2024-2028" required />
            </div>
          </div>
          <div class="flex gap-2 mt-3" style="justify-content:flex-end">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('reg-stu-modal-overlay').remove()">Cancel</button>
            <button type="submit" id="reg-stu-btn" class="btn btn-primary">Register & Sign In</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
};

window.handleRegisterStudentSubmit = async function(e) {
  e.preventDefault();
  const btn = document.getElementById('reg-stu-btn');
  btn.disabled = true;
  btn.innerHTML = `${spinner(14)} Registering...`;

  const email = document.getElementById('reg-stu-email').value;
  const password = document.getElementById('reg-stu-pwd').value;

  try {
    await API.createStudent({
      name: document.getElementById('reg-stu-name').value,
      rollNo: document.getElementById('reg-stu-roll').value,
      email,
      password,
      departmentId: document.getElementById('reg-stu-dept').value,
      year: document.getElementById('reg-stu-year').value,
      section: document.getElementById('reg-stu-section').value,
      batch: document.getElementById('reg-stu-batch').value,
    });
    Toast.success('Registration successful! Logging you in...');
    document.getElementById('reg-stu-modal-overlay')?.remove();
    // Auto login
    await Auth.login(email, password);
    App.navigate('dashboard');
  } catch(err) {
    Toast.error(err.message);
    btn.disabled = false;
    btn.innerHTML = 'Register & Sign In';
  }
};

window.setDemo = function(email) {
  document.getElementById('email').value = email;
  document.getElementById('password').value = 'Demo@1234';
};

window.togglePassword = function() {
  const inp = document.getElementById('password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
};

window.handleLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');

  btn.disabled = true;
  btn.innerHTML = `${spinner(16)} Signing in...`;
  errEl.style.display = 'none';

  try {
    const user = await Auth.login(email, password);
    Toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    setTimeout(() => App.navigate('dashboard'), 300);
  } catch(err) {
    errEl.textContent = err.message;
    errEl.style.display = 'flex';
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
  }
};
