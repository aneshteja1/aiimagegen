import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    // In production: POST /api/auth/forgot-password { email }
    setLoading(false);
    setSent(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)', padding: 24 }} data-section="forgot-password-page">
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 40 }}>
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 32 }}>
          <ArrowLeft size={14} /> Back to login
        </Link>

        {!sent ? (
          <>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Mail size={20} />
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Forgot your password?</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 28, lineHeight: 1.6 }}>
              Enter your email and we'll send you a link to reset it.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 6 }}>Email</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', outline: 'none' }}
                />
              </div>
              <button type="submit" disabled={loading} style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 12 }}>Check your inbox</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: 24 }}>
              We sent a reset link to <strong>{email}</strong>. It expires in 1 hour.
            </p>
            <Link to="/login" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', fontWeight: 600 }}>
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
