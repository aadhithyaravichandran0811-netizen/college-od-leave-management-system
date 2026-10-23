import { useState, useCallback } from 'react';

// Toast hook
let _addToast = null;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  _addToast = addToast;
  return { toasts, addToast };
}

export function toast(message, type = 'info') {
  if (_addToast) _addToast(message, type);
}

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' && <span style={{ color: 'var(--success)' }}>✓</span>}
          {t.type === 'error' && <span style={{ color: 'var(--error)' }}>✕</span>}
          {t.type === 'info' && <span style={{ color: 'var(--primary)' }}>ℹ</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// Default export: self-contained Toast host component
export default function Toast() {
  const { toasts } = useToast();
  return <ToastContainer toasts={toasts} />;
}
