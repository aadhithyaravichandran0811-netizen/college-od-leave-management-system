// ============================================================
// auth.js — Authentication & session management
// ============================================================

const Auth = {
  TOKEN_KEY: 'auth_token',
  USER_KEY:  'auth_user',

  getCurrentUser() {
    try {
      const u = localStorage.getItem(this.USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  },

  setCurrentUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, 'jwt_' + btoa(user.id + ':' + user.role + ':' + Date.now()));
  },

  isLoggedIn() { return !!this.getCurrentUser(); },

  async login(email, password) {
    const user = DB.findOneWhere('users', u => u.email === email.toLowerCase().trim());
    if (!user) throw new Error('No account found with this email address.');
    if (!user.isActive) throw new Error('This account has been deactivated. Please contact administration.');
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error('Incorrect password. Please try again.');
    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };
    // Attach profile data
    if (user.role === 'STUDENT') {
      const profile = DB.findOneWhere('student_profiles', p => p.userId === user.id);
      if (profile) {
        const dept = DB.findById('departments', profile.departmentId);
        sessionUser.profile = { ...profile, departmentName: dept?.name, departmentCode: dept?.code };
      }
    } else if (['FACULTY','HOD'].includes(user.role)) {
      const profile = DB.findOneWhere('faculty_profiles', p => p.userId === user.id);
      if (profile) {
        const dept = DB.findById('departments', profile.departmentId);
        sessionUser.profile = { ...profile, departmentName: dept?.name, departmentCode: dept?.code };
      }
    }
    this.setCurrentUser(sessionUser);
    return sessionUser;
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  requireRole(...roles) {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  },

  initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },
};
