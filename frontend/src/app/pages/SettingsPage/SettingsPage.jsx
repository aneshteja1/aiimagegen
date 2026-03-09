import { useState } from 'react';
import { Check } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ full_name: user?.full_name || '', email: user?.email || '' });
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaved, setPwSaved] = useState(false);
  const [notif, setNotif] = useState({ job_complete: true, job_failed: true, credits_low: true });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setPw = k => e => setPwForm(f => ({ ...f, [k]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 400));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) return;
    await new Promise(r => setTimeout(r, 400));
    setPwSaved(true);
    setPwForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setPwSaved(false), 2000);
  };

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 6 };

  return (
    <div className="page-container" data-section="settings-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Manage your account and preferences.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
        {/* Profile */}
        <div className="card" data-section="settings-profile">
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 20 }}>Profile</h2>
          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={labelStyle}>Full name</label><input style={inputStyle} value={form.full_name} onChange={set('full_name')} /></div>
            <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={form.email} onChange={set('email')} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="submit" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>Save changes</button>
              {saved && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-success)' }}><Check size={13} /> Saved</span>}
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="card" data-section="settings-password">
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 20 }}>Change Password</h2>
          <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[['current','Current password'],['next','New password'],['confirm','Confirm new password']].map(([k,l]) => (
              <div key={k}><label style={labelStyle}>{l}</label><input style={inputStyle} type="password" value={pwForm[k]} onChange={setPw(k)} placeholder="••••••••" /></div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button type="submit" disabled={!pwForm.current || !pwForm.next || !pwForm.confirm}
                style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer', opacity: (!pwForm.current || !pwForm.next) ? 0.5 : 1 }}>
                Update password
              </button>
              {pwSaved && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-success)' }}><Check size={13} /> Updated</span>}
            </div>
          </form>
        </div>

        {/* Notifications */}
        <div className="card" data-section="settings-notifications">
          <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 20 }}>Notifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['job_complete', 'Email when job completes'],
              ['job_failed', 'Email when job fails'],
              ['credits_low', 'Alert when credits are low'],
            ].map(([k, label]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--font-size-sm)' }}>{label}</span>
                <button
                  onClick={() => setNotif(n => ({ ...n, [k]: !n[k] }))}
                  style={{
                    width: 40, height: 22, borderRadius: 11,
                    background: notif[k] ? 'var(--color-action)' : 'var(--color-border)',
                    border: 'none', cursor: 'pointer', position: 'relative', transition: 'background var(--transition-fast)',
                  }}
                >
                  <span style={{ position: 'absolute', top: 2, left: notif[k] ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left var(--transition-fast)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
