import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isPending, isRejected } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (isPending()) { navigate('/pending'); return; }
      if (isRejected()) { navigate('/rejected'); return; }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.error || err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-background)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-sm)',
          marginBottom: 40,
          textDecoration: 'none',
        }}>
          <ArrowLeft size={14} /> Back
        </Link>

        <h1 style={{
          fontSize: 'var(--font-size-3xl)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          Welcome back
        </h1>
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          marginBottom: 32,
        }}>
          Sign in to your account
        </p>

        {error && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-error)',
            color: 'var(--color-error)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              marginBottom: 6,
            }}>
              Email
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                width: '100%', padding: '9px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                background: 'var(--color-background)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Password</label>
              <Link to="/forgot-password" style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
              }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '9px 36px 9px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  background: 'var(--color-background)',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none', background: 'transparent',
                  cursor: 'pointer', color: 'var(--color-text-muted)',
                  padding: 0, display: 'flex',
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-action)',
              color: 'var(--color-action-text)',
              border: 'none', fontWeight: 600,
              fontSize: 'var(--font-size-sm)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)',
          marginTop: 20,
          textAlign: 'center',
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: 'var(--color-text-primary)',
            fontWeight: 600,
            textDecoration: 'none',
          }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
