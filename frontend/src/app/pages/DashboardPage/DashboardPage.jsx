import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Image, Video, Package, ArrowRight, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../../../store/authStore.js';
import useCompanyStore from '../../../store/companyStore.js';
import useJobStore from '../../../store/jobStore.js';
import { MOCK_ANALYTICS } from '../../../services/mock/credits.mock.js';
import { formatRelativeTime, formatCredits } from '../../../utils/formatters.js';

const JOB_TYPE_LABELS = { swap_model: 'Swap Model', image_gen: 'Image Gen', video_gen: 'Video', bulk: 'Bulk' };
const STATUS_COLORS = { queued: '#a3a3a3', processing: '#2563eb', completed: '#16a34a', failed: '#dc2626', cancelled: '#a3a3a3' };

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        {Icon && <Icon size={15} color="var(--color-text-muted)" />}
      </div>
      <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      {sub && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{sub}</span>}
    </div>
  );
}

function JobStatusBadge({ status }) {
  const labels = { queued: 'Queued', processing: 'Processing', completed: 'Completed', failed: 'Failed', cancelled: 'Cancelled' };
  return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
}

// Company-specific accent colors (branding differentiation)
const COMPANY_THEMES = {
  'c-001': { accent: '#171717', lightAccent: '#f5f5f5' },  // Lumière — neutral
  'c-002': { accent: '#0f766e', lightAccent: '#f0fdfa' },  // Studio Nova — teal
  'c-003': { accent: '#7c3aed', lightAccent: '#faf5ff' },  // Apex Atelier — violet
};

export default function DashboardPage() {
  const { user, credits } = useAuthStore();
  const { activeCompanyId, getActiveCompany } = useCompanyStore();
  const { getRecentJobs } = useJobStore();
  const navigate = useNavigate();

  const company = getActiveCompany();
  const recentJobs = getRecentJobs(user?.company_id || activeCompanyId, 6);
  const theme = COMPANY_THEMES[user?.company_id] || COMPANY_THEMES['c-001'];

  const stats = useMemo(() => {
    const all = recentJobs;
    return {
      total: MOCK_ANALYTICS.totalJobs,
      completed: all.filter(j => j.status === 'completed').length,
      failed: all.filter(j => j.status === 'failed').length,
      processing: all.filter(j => j.status === 'processing' || j.status === 'queued').length,
    };
  }, [recentJobs]);

  const quickActions = [
    { label: 'Swap Model', icon: Wand2, to: '/swap-model', desc: 'Swap a model identity' },
    { label: 'Image Generation', icon: Image, to: '/image-generation', desc: 'Generate from prompt' },
    { label: 'Video Generation', icon: Video, to: '/video-generation', desc: 'Generate video' },
    { label: 'Bulk Generation', icon: Package, to: '/bulk-generation', desc: 'Upload a ZIP batch' },
  ];

  return (
    <div className="page-container" data-section="dashboard-page">
      {/* Header */}
      <div data-section="dashboard-header" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {company ? `${company.name} — Dashboard` : 'Dashboard'}
            </h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
            </p>
          </div>
          {/* Company accent strip */}
          <div style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: theme.lightAccent, border: `1px solid ${theme.accent}22`, fontSize: 'var(--font-size-xs)', fontWeight: 600, color: theme.accent }}>
            {company?.subscription_plan?.toUpperCase() || 'PLAN'} PLAN
          </div>
        </div>
      </div>

      {/* Stats */}
      <div data-section="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard label="Credits" value={formatCredits(credits)} sub="remaining" />
        <StatCard label="Total Jobs" value={MOCK_ANALYTICS.totalJobs} sub="all time" />
        <StatCard label="Success Rate" value={`${MOCK_ANALYTICS.successRate}%`} sub="last 30 days" />
        <StatCard label="Avg. Time" value={MOCK_ANALYTICS.avgProcessingTime} sub="per job" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        <div>
          {/* Usage chart */}
          <div data-section="dashboard-usage-chart" className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 20 }}>Usage — last 7 days</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={MOCK_ANALYTICS.dailyUsage} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.accent} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={theme.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: 'none' }} />
                <Area type="monotone" dataKey="credits" stroke={theme.accent} fill="url(#grad)" strokeWidth={2} dot={false} name="Credits used" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent jobs */}
          <div data-section="dashboard-recent-jobs" className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Recent jobs</h2>
              <button onClick={() => navigate('/jobs')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 500 }}>
                View all <ArrowRight size={12} />
              </button>
            </div>
            {recentJobs.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: '24px 0' }}>No jobs yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentJobs.map((job, i) => (
                  <div key={job.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < recentJobs.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[job.status], flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{JOB_TYPE_LABELS[job.type]}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{formatRelativeTime(job.created_at)}</div>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div data-section="dashboard-quick-actions">
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 12 }}>Quick actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quickActions.map(a => (
              <button
                key={a.to}
                onClick={() => navigate(a.to)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-background)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-background)'}
              >
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <a.icon size={15} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{a.label}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{a.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
