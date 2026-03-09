import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@venkat.tech'); // Pre-filled for testing
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
      background: '#050505', // VT Black Theme
      color: '#ffffff',
      padding: 'clamp(1rem, 5vw, 4rem)', // Fluid padding
    }}>
      <div style={{
        width: '100%',
        /* FLUID SCALING: Starts at 400px, grows up to 800px on 4K/8K screens */
        maxWidth: 'clamp(400px, 30vw, 800px)', 
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: '#a1a1aa',
          fontSize: 'clamp(14px, 1vw, 20px)',
          marginBottom: 'clamp(20px, 3vw, 60px)',
          textDecoration: 'none',
        }}>
          <ArrowLeft size={18} /> Back
        </Link>

        <h1 style={{
          fontSize: 'clamp(32px, 3vw, 64px)', // Fluid Typography for 4K
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: 'clamp(8px, 1vw, 16px)',
        }}>
          Welcome back
        </h1>
        <p style={{
          color: '#a1a1aa',
          fontSize: 'clamp(14px, 1vw, 24px)',
          marginBottom: 'clamp(24px, 3vw, 48px)',
        }}>
          Sign in to your VT Operations account
        </p>

        {error && (
          <div style={{
            padding: 'clamp(12px, 1vw, 20px)',
            borderRadius: '8px',
            background: '#3f0000',
            border: '1px solid #7f0000',
            color: '#ffb3b3',
            fontSize: 'clamp(14px, 1vw, 20px)',
            marginBottom: 'clamp(16px, 2vw, 32px)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(16px, 1.5vw, 32px)' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 'clamp(14px, 1vw, 20px)',
              fontWeight: 500,
              marginBottom: '8px',
            }}>
              Email
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@venkat.tech"
              style={{
                width: '100%', 
                padding: 'clamp(12px, 1vw, 20px)',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                fontSize: 'clamp(16px, 1vw, 24px)',
                background: '#121212',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: 'clamp(14px, 1vw, 20px)', fontWeight: 500 }}>Password</label>
              <Link to="/forgot-password" style={{
                fontSize: 'clamp(12px, 0.8vw, 18px)',
                color: '#a1a1aa',
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
                  width: '100%', 
                  padding: 'clamp(12px, 1vw, 20px)',
                  paddingRight: 'clamp(40px, 3vw, 60px)',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  fontSize: 'clamp(16px, 1vw, 24px)',
                  background: '#121212',
                  color: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(s => !s)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none', background: 'transparent',
                  cursor: 'pointer', color: '#a1a1aa',
                  padding: 0, display: 'flex',
                }}
              >
                {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              padding: 'clamp(14px, 1.2vw, 24px)',
              borderRadius: '8px',
              background: '#ffffff',
              color: '#000000',
              border: 'none', 
              fontWeight: 600,
              fontSize: 'clamp(16px, 1vw, 24px)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: '8px',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
