import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Zap, Image, Video, Package } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';

const DAILY = [
  { date: 'Mar 3', jobs: 7, credits: 12 },
  { date: 'Mar 4', jobs: 5, credits: 6 },
  { date: 'Mar 5', jobs: 12, credits: 20 },
  { date: 'Mar 6', jobs: 9, credits: 14 },
  { date: 'Mar 7', jobs: 15, credits: 22 },
  { date: 'Mar 8', jobs: 6, credits: 11 },
  { date: 'Mar 9', jobs: 10, credits: 16 },
];

const TYPE_DATA = [
  { name: 'Swap Model', value: 58, color: '#171717' },
  { name: 'Image Gen', value: 24, color: '#525252' },
  { name: 'Bulk', value: 14, color: '#a3a3a3' },
  { name: 'Video', value: 4, color: '#d4d4d4' },
];

const STATS = [
  { label: 'Total Jobs', value: '142', icon: Package, trend: +12 },
  { label: 'Credits Used', value: '213', icon: Zap, trend: -5 },
  { label: 'Success Rate', value: '94%', icon: TrendingUp, trend: +2 },
  { label: 'Avg. Time', value: '1m 24s', icon: TrendingDown, trend: null },
];

const S = {
  page: { padding: 'var(--space-6)' },
  header: { marginBottom: 'var(--space-6)' },
  title: { fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 },
  sub: { fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 4 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' },
  card: { background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' },
  charts: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' },
  chartCard: { background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' },
  chartTitle: { fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' },
  tabs: { display: 'flex', gap: 4, marginBottom: 'var(--space-6)', background: 'var(--color-surface)', padding: 4, borderRadius: 8, width: 'fit-content' },
  tab: (active) => ({ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: active ? 600 : 400, background: active ? '#fff' : 'transparent', color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)', boxShadow: active ? 'var(--shadow-sm)' : 'none' }),
};

export default function UsageAnalyticsPage() {
  const { user } = useAuthStore();
  const [range, setRange] = useState('7d');

  return (
    <div className="page-container">
      <div style={S.header}>
        <h1 style={S.title}>Usage Analytics</h1>
        <p style={S.sub}>{user?.company_name || 'Your company'} · Last updated just now</p>
      </div>

      <div style={S.tabs}>
        {['7d', '30d', '90d'].map(r => (
          <button key={r} style={S.tab(range === r)} onClick={() => setRange(r)}>{r}</button>
        ))}
      </div>

      <div style={S.grid}>
        {STATS.map(({ label, value, icon: Icon, trend }) => (
          <div key={label} style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
              <Icon size={16} color="var(--color-text-muted)" />
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</div>
            {trend != null && (
              <div style={{ fontSize: 'var(--font-size-xs)', color: trend >= 0 ? 'var(--color-success)' : 'var(--color-error)', marginTop: 4 }}>
                {trend >= 0 ? '+' : ''}{trend}% vs last period
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={S.charts}>
        <div style={S.chartCard}>
          <div style={S.chartTitle}>Jobs & Credits Over Time</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={DAILY}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <Tooltip />
              <Line type="monotone" dataKey="jobs" stroke="#171717" strokeWidth={2} dot={false} name="Jobs" />
              <Line type="monotone" dataKey="credits" stroke="#a3a3a3" strokeWidth={2} dot={false} name="Credits" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={S.chartCard}>
          <div style={S.chartTitle}>By Job Type</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={TYPE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                {TYPE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {TYPE_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-size-xs)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: 'var(--color-text-secondary)' }}>{d.name}</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
