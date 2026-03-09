// Studio Nova — Company Dashboard
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Camera, Layers, User, CreditCard } from 'lucide-react';

const DATA = [
  { day: 'M', jobs: 4 }, { day: 'T', jobs: 6 }, { day: 'W', jobs: 3 },
  { day: 'T', jobs: 8 }, { day: 'F', jobs: 7 }, { day: 'S', jobs: 2 }, { day: 'S', jobs: 1 },
];

const BRAND = { accent: '#0f766e', bg: '#f0fdfa', border: '#99f6e4', text: '#042f2e' };

export default function StudioNovaDashboard() {
  return (
    <div className="page-container">
      <div style={{ background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 16, padding: '24px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: BRAND.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Camera size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: BRAND.text, margin: 0 }}>Studio Nova</h1>
          <p style={{ color: BRAND.accent, fontSize: 'var(--font-size-sm)', margin: '2px 0 0' }}>Basic Plan · Modern Minimalist Studio</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: BRAND.text }}>95</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: BRAND.accent }}>credits remaining</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: Layers, label: 'Total Jobs',  value: '38', sub: '+5 this week' },
          { icon: Camera, label: 'Success Rate', value: '91%', sub: 'Last 30 days' },
          { icon: User,   label: 'Team Members', value: '1', sub: 'Solo plan' },
          { icon: CreditCard, label: 'Credits Used', value: '55', sub: 'This month' },
        ].map(({ icon: I, label, value, sub }) => (
          <div key={label} style={{ background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: BRAND.accent, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              <I size={15} color={BRAND.accent} />
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: BRAND.text }}>{value}</div>
            <div style={{ fontSize: 12, color: '#5eead4', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: BRAND.text, margin: '0 0 20px' }}>Daily Activity (This Week)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke={BRAND.border} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: BRAND.accent }} />
            <YAxis tick={{ fontSize: 11, fill: BRAND.accent }} />
            <Tooltip />
            <Line type="monotone" dataKey="jobs" stroke={BRAND.accent} strokeWidth={2.5} dot={{ fill: BRAND.accent, r: 4 }} name="Jobs" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
