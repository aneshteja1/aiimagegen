import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';

export default function RejectedPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)', padding: 24 }} data-section="rejected-page">
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-error-bg)', border: '1px solid var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <X size={28} color="var(--color-error)" />
        </div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>Access denied</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7, marginBottom: 8 }}>
          Your account registration was declined by the admin at{' '}
          <strong>{user?.company_name || 'your company'}</strong>.
        </p>
        {user?.rejection_reason && (
          <div style={{ margin: '16px 0', padding: '12px 16px', background: 'var(--color-error-bg)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-error)', textAlign: 'left' }}>
            <strong>Reason:</strong> {user.rejection_reason}
          </div>
        )}
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', marginBottom: 32 }}>
          If you believe this is an error, please contact your company admin directly.
        </p>
        <button onClick={() => { logout(); navigate('/'); }} style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
          Return to home
        </button>
      </div>
    </div>
  );
}
