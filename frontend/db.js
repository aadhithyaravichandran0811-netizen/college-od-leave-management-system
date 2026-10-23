// ============================================================
// db.js — In-browser database layer (localStorage)
// Simulates a full relational database for demo purposes
// ============================================================

const DB_VERSION = '1.1.3';

const DB = {
  // ---- Utility ----
  _get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  },
  _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  _getObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
  },

  // ---- Generic CRUD ----
  getAll(table) { return this._get(`db_${table}`); },
  save(table, rows) { this._set(`db_${table}`, rows); },
  insert(table, record) {
    const rows = this.getAll(table);
    rows.push(record);
    this.save(table, rows);
    return record;
  },
  findById(table, id) {
    return this.getAll(table).find(r => r.id === id) || null;
  },
  update(table, id, updates) {
    const rows = this.getAll(table).map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r);
    this.save(table, rows);
    return rows.find(r => r.id === id);
  },
  delete(table, id) {
    const rows = this.getAll(table).filter(r => r.id !== id);
    this.save(table, rows);
  },
  findWhere(table, predicate) {
    return this.getAll(table).filter(predicate);
  },
  findOneWhere(table, predicate) {
    return this.getAll(table).find(predicate) || null;
  },

  // ---- Initialization ----
  isInitialized() {
    return localStorage.getItem('db_version') === DB_VERSION;
  },
  markInitialized() {
    localStorage.setItem('db_version', DB_VERSION);
  },
  reset() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('db_') || k === 'db_version');
    keys.forEach(k => localStorage.removeItem(k));
  }
};

// ---- ID Generator ----
function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ---- Password hashing (simple SHA-256 simulation using btoa for demo) ----
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const computed = await hashPassword(password);
  return computed === hash;
}
