// Lumière Fashion — Company-specific dashboard
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wand2, TrendingUp, Users, Zap } from 'lucide-react';

const DATA = [
  { week: 'W1', jobs: 32 }, { week: 'W2', jobs: 48 }, { week: 'W3', jobs: 41 },
  { week: 'W4', jobs: 60 }, { week: 'W5', jobs: 55 }, { week: 'W6', jobs: 71 },
];

const BRAND = { accent: '#9b7f5e', bg: '#faf7f4', border: '#e8dfd6' };

export default function LumiereDashboard() {
  return (
    <div className="page-container">
      {/* Brand Header */}
      <div style={{ background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: '24px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: BRAND.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 24 }}>✨</span>
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#2c1810', margin: 0, letterSpacing: '-0.02em' }}>Lumière Fashion</h1>
          <p style={{ color: BRAND.accent, fontSize: 'var(--font-size-sm)', margin: '2px 0 0', fontStyle: 'italic' }}>Premium Plan · Paris-Inspired Couture</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#2c1810' }}>287</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: BRAND.accent }}>credits remaining</div>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: Wand2,     label: 'Total Jobs',  value: '142', sub: '+18 this week' },
          { icon: TrendingUp,label: 'Success Rate', value: '96%', sub: 'Last 30 days' },
          { icon: Users,     label: 'Team Members', value: '4',  sub: 'Active users' },
          { icon: Zap,       label: 'Credits Used', value: '213', sub: 'This month' },
        ].map(({ icon: I, label, value, sub }) => (
          <div key={label} style={{ background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: '20px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: BRAND.accent, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              <I size={15} color={BRAND.accent} />
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#2c1810' }}>{value}</div>
            <div style={{ fontSize: 12, color: '#a09080', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: '#2c1810', margin: '0 0 20px' }}>Weekly Job Volume</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={BRAND.border} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: BRAND.accent }} />
              <YAxis tick={{ fontSize: 11, fill: BRAND.accent }} />
              <Tooltip />
              <Bar dataKey="jobs" fill={BRAND.accent} radius={[4,4,0,0]} name="Jobs" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: '#2c1810', margin: '0 0 16px' }}>Top Avatars</h3>
          {[{ name: 'Ava', uses: 48 }, { name: 'Lora', uses: 35 }, { name: 'Himari', uses: 29 }, { name: 'Zola', uses: 21 }].map(a => (
            <div key={a.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span style={{ color: '#2c1810', fontWeight: 500 }}>{a.name}</span>
                <span style={{ color: BRAND.accent }}>{a.uses} uses</span>
              </div>
              <div style={{ height: 6, background: BRAND.bg, borderRadius: 99 }}>
                <div style={{ height: 6, width: `${(a.uses/48)*100}%`, background: BRAND.accent, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
