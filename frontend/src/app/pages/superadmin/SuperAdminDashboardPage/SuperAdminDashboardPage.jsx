import { useNavigate } from 'react-router-dom';
import { Building2, Users, Activity, Coins, ArrowRight } from 'lucide-react';
import { MOCK_COMPANIES } from '../../../../services/mock/companies.mock.js';
import { MOCK_USERS } from '../../../../services/mock/auth.mock.js';
import useJobStore from '../../../../store/jobStore.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PLAN_COLORS = { basic: '#525252', premium: '#2563eb', enterprise: '#7c3aed' };

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const { jobs } = useJobStore();

  const totalUsers = MOCK_USERS.length;
  const totalJobs = jobs.length;
  const totalCredits = MOCK_COMPANIES.reduce((s, c) => s + c.credit_balance, 0);

  const companyStats = MOCK_COMPANIES.map(c => ({
    name: c.name.split(' ')[0],
    jobs: jobs.filter(j => j.company_id === c.id).length,
    credits: c.credit_balance,
  }));

  return (
    <div className="page-container" data-section="superadmin-dashboard-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Global Overview</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Platform-wide metrics across all companies.</p>
      </div>

      {/* Global stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Companies', value: MOCK_COMPANIES.length, icon: Building2, to: '/superadmin/companies' },
          { label: 'Total users', value: totalUsers, icon: Users },
          { label: 'Total jobs', value: totalJobs, icon: Activity },
          { label: 'Credits in system', value: totalCredits.toLocaleString(), icon: Coins },
        ].map(s => (
          <div key={s.label} className="card" onClick={s.to ? () => navigate(s.to) : undefined}
            style={{ cursor: s.to ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <s.icon size={15} color="var(--color-text-muted)" />
              {s.to && <ArrowRight size={13} color="var(--color-text-muted)" />}
            </div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Jobs by company chart */}
      <div className="card" style={{ marginBottom: 16 }} data-section="superadmin-company-chart">
        <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 20 }}>Jobs by company</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={companyStats} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 12, border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: 'none' }} />
            <Bar dataKey="jobs" fill="var(--color-action)" radius={[3, 3, 0, 0]} name="Jobs" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Company list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }} data-section="superadmin-company-list">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>All companies</span>
          <button onClick={() => navigate('/superadmin/companies')} style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            Manage <ArrowRight size={12} />
          </button>
        </div>
        {MOCK_COMPANIES.map((c, i) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < MOCK_COMPANIES.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏢</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{c.user_count} users · {c.job_count} jobs</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="badge" style={{ background: 'var(--color-surface)', color: PLAN_COLORS[c.subscription_plan] || '#525252', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.subscription_plan}</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{c.credit_balance} cr</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
