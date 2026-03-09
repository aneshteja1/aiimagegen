import { useNavigate } from 'react-router-dom';
import { Clock, X } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';

export function PendingPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)', padding: 24 }} data-section="pending-page">
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Clock size={28} color="var(--color-warning)" />
        </div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Awaiting approval
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7, marginBottom: 8 }}>
          Your account has been created successfully. A company admin at{' '}
          <strong>{user?.company_name || 'your company'}</strong> needs to approve your access.
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', marginBottom: 32 }}>
          You'll receive an email notification once your account is approved.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{
              padding: '8px 20px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', background: 'transparent',
              fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: 'pointer',
              color: 'var(--color-text-secondary)',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

export default PendingPage;
