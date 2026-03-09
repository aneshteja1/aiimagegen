import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  if (!token) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--color-error)', marginBottom: 16 }}>Invalid or missing reset token.</p>
        <Link to="/forgot-password" style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Request a new link</Link>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    // In production: POST /api/auth/reset-password { token, password }
    setLoading(false);
    setDone(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 40 }}>
        {!done ? (
          <>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Set new password</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 28 }}>Choose a strong password for your account.</p>
            {error && <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-bg)', border: '1px solid var(--color-error)', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'New password', val: password, set: setPassword },
                { label: 'Confirm password', val: confirm, set: setConfirm },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 6 }}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      required value={f.val} onChange={e => f.set(e.target.value)}
                      placeholder="••••••••"
                      style={{ width: '100%', padding: '9px 36px 9px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', outline: 'none' }}
                    />
                    {i === 0 && (
                      <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading} style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Updating…' : 'Reset password'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 12 }}>Password updated</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 24 }}>You can now sign in with your new password.</p>
            <button onClick={() => navigate('/login')} style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              Go to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
