import { useState } from 'react';
import { Shield, Check } from 'lucide-react';

// All API keys read from .env — never stored in frontend
const ENV_KEYS = [
  { key: 'VITE_API_BASE_URL', desc: 'Backend API base URL', example: 'http://localhost:3001' },
  { key: 'VITE_FACESWAP_UPSTREAM_URL', desc: 'External faceswap service URL', example: 'Configured in backend .env' },
  { key: 'VITE_STRIPE_PUBLISHABLE_KEY', desc: 'Stripe publishable key', example: 'pk_live_...' },
];

export default function GlobalSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container" data-section="global-settings-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>System Settings</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Global platform configuration. API keys are stored in server environment variables.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
        {/* Security notice */}
        <div style={{ padding: '12px 16px', background: 'var(--color-info-bg)', border: '1px solid var(--color-info)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Shield size={15} color="var(--color-info)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-info)', lineHeight: 1.5 }}>
            <strong>Security:</strong> All API keys (AI_KEY, STRIPE_SECRET_KEY, JWT_SECRET, FACESWAP_API_URL, database credentials) are stored exclusively in the server's <code>.env</code> file — never in frontend code or version control.
          </div>
        </div>

        {/* Environment variables reference */}
        <div className="card" data-section="global-env-vars">
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 16 }}>Frontend environment variables</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ENV_KEYS.map(e => (
              <div key={e.key} style={{ padding: '10px 12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-sm)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 3 }}>
                  <code style={{ fontSize: 12, background: 'var(--color-border)', padding: '1px 6px', borderRadius: 3 }}>{e.key}</code>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 2 }}>{e.desc}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>e.g. {e.example}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 12 }}>Edit these in <code>frontend/.env</code> (local) or your deployment environment variables.</p>
        </div>

        {/* Platform flags */}
        <div className="card" data-section="global-flags">
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 16 }}>Platform flags</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Maintenance mode</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Lock all non-admin access to the platform</div>
              </div>
              <button onClick={() => setMaintenance(m => !m)}
                style={{ width: 40, height: 22, borderRadius: 11, background: maintenance ? 'var(--color-error)' : 'var(--color-border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background var(--transition-fast)' }}>
                <span style={{ position: 'absolute', top: 2, left: maintenance ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left var(--transition-fast)' }} />
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={save} style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>Save settings</button>
          {saved && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-success)' }}><Check size={13} /> Saved</span>}
        </div>
      </div>
    </div>
  );
}
