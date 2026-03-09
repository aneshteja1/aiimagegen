import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', company_name: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = register(form);
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    setSuccess(true);
  };

  if (success) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-background)', padding: 24,
    }}>
      <div style={{ maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 12 }}>Registration submitted</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 24, lineHeight: 1.6 }}>
          Your account is pending approval from your company admin. You'll receive an email once approved.
        </p>
        <button onClick={() => navigate('/login')} style={{
          padding: '9px 20px', borderRadius: 'var(--radius-md)',
          background: 'var(--color-action)', color: 'var(--color-action-text)',
          border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer',
        }}>
          Back to login
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface)', padding: 24 }} data-section="register-page">
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--color-background)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(24px, 4vw, 40px)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 32 }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Create account</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 28 }}>Join your team on AI Fashion Studio</p>

        {error && (
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-bg)', border: '1px solid var(--color-error)', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'full_name', label: 'Full name', type: 'text', placeholder: 'Your name' },
            { key: 'email', label: 'Work email', type: 'email', placeholder: 'you@company.com' },
            { key: 'company_name', label: 'Company name', type: 'text', placeholder: 'Your brand or company' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 6 }}>{f.label}</label>
              <input
                type={f.type} required
                value={form[f.key]} onChange={set(f.key)}
                placeholder={f.placeholder}
                style={{
                  width: '100%', padding: '9px 12px',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)', background: 'var(--color-background)',
                  color: 'var(--color-text-primary)', outline: 'none',
                }}
              />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                required value={form.password} onChange={set('password')}
                placeholder="Min. 8 characters"
                style={{
                  width: '100%', padding: '9px 36px 9px 12px',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)', background: 'var(--color-background)',
                  color: 'var(--color-text-primary)', outline: 'none',
                }}
              />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              padding: '10px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-action)', color: 'var(--color-action-text)',
              border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4,
            }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 20, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
