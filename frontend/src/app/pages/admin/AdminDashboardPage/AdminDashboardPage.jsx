import { useNavigate } from 'react-router-dom';
import { Users, Image, Coins, Activity, ArrowRight, Clock } from 'lucide-react';
import useAuthStore from '../../../../store/authStore.js';
import useJobStore from '../../../../store/jobStore.js';
import { MOCK_USERS } from '../../../../services/mock/auth.mock.js';
import { MOCK_CREDIT_BALANCE } from '../../../../services/mock/credits.mock.js';
import { USER_STATUS, USER_ROLES } from '../../../../utils/constants.js';
import { formatRelativeTime } from '../../../../utils/formatters.js';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { jobs } = useJobStore();
  const navigate = useNavigate();

  const companyUsers = MOCK_USERS.filter(u => u.company_id === user?.company_id);
  const pendingUsers = companyUsers.filter(u => u.status === USER_STATUS.PENDING);
  const companyJobs = jobs.filter(j => j.company_id === user?.company_id);
  const failedJobs = companyJobs.filter(j => j.status === 'failed');
  const credits = MOCK_CREDIT_BALANCE[user?.company_id] || 0;

  const stats = [
    { label: 'Team members', value: companyUsers.length, icon: Users, to: '/admin/users' },
    { label: 'Pending approval', value: pendingUsers.length, icon: Clock, to: '/admin/users', alert: pendingUsers.length > 0 },
    { label: 'Credits remaining', value: credits, icon: Coins, to: '/admin/credits' },
    { label: 'Failed jobs', value: failedJobs.length, icon: Activity, to: '/admin/jobs', alert: failedJobs.length > 0 },
  ];

  return (
    <div className="page-container" data-section="admin-dashboard-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Manage your company's users, avatars, and jobs.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <button key={s.label} onClick={() => navigate(s.to)}
            className="card"
            style={{
              display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left',
              border: s.alert ? '1px solid var(--color-warning)' : '1px solid var(--color-border)',
              background: s.alert ? 'var(--color-warning-bg)' : 'var(--color-background)',
              cursor: 'pointer',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <s.icon size={15} color={s.alert ? 'var(--color-warning)' : 'var(--color-text-muted)'} />
              <ArrowRight size={13} color="var(--color-text-muted)" />
            </div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: s.alert ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>{s.label}</div>
          </button>
        ))}
      </div>

      {pendingUsers.length > 0 && (
        <div data-section="admin-pending-approvals" className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Pending approvals</h2>
            <button onClick={() => navigate('/admin/users')} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              Manage <ArrowRight size={12} />
            </button>
          </div>
          {pendingUsers.map((u, i) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < pendingUsers.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                {u.full_name?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{u.full_name}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{u.email}</div>
              </div>
              <span className="badge badge-pending">Pending</span>
            </div>
          ))}
        </div>
      )}

      {/* Admin nav shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }} data-section="admin-shortcuts">
        {[
          { label: 'Manage Users', desc: 'Approve, reject, manage roles', to: '/admin/users' },
          { label: 'Manage Avatars', desc: 'Upload and review avatar ZIPs', to: '/admin/avatars' },
          { label: 'Credit Management', desc: 'Allocate credits to users', to: '/admin/credits' },
          { label: 'Job Monitor', desc: 'View all jobs and failures', to: '/admin/jobs' },
        ].map(item => (
          <button key={item.to} onClick={() => navigate(item.to)}
            style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', textAlign: 'left', cursor: 'pointer', transition: 'background var(--transition-fast)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-background)'}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
