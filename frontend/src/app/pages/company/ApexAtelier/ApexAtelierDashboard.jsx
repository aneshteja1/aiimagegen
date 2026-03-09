// Apex Atelier — Enterprise Company Dashboard
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Crown, TrendingUp, Users, Zap, Package, Activity } from 'lucide-react';

const MONTHLY = [
  { month: 'Oct', jobs: 210, credits: 320 }, { month: 'Nov', jobs: 280, credits: 410 },
  { month: 'Dec', jobs: 190, credits: 280 }, { month: 'Jan', jobs: 340, credits: 510 },
  { month: 'Feb', jobs: 420, credits: 630 }, { month: 'Mar', jobs: 390, credits: 580 },
];

const DEPT = [
  { dept: 'Womenswear', jobs: 340 }, { dept: 'Menswear', jobs: 220 },
  { dept: 'Accessories', jobs: 190 }, { dept: 'Campaign', jobs: 140 },
];

const BRAND = { accent: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', text: '#2e1065' };

export default function ApexAtelierDashboard() {
  return (
    <div className="page-container">
      {/* Hero header */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND.text} 0%, #4c1d95 100%)`, borderRadius: 16, padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, color: '#fff' }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Crown size={26} color="#fbbf24" />
        </div>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Apex Atelier</h1>
          <p style={{ color: '#c4b5fd', fontSize: 'var(--font-size-sm)', margin: '2px 0 0' }}>Enterprise Plan · Multi-Department Fashion House</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>1,240</div>
          <div style={{ fontSize: 12, color: '#c4b5fd', marginTop: 4 }}>credits remaining</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: Package,   label: 'Total Jobs',    value: '890' },
          { icon: TrendingUp,label: 'Success Rate',  value: '97%' },
          { icon: Users,     label: 'Team',          value: '12' },
          { icon: Zap,       label: 'Credits Used',  value: '3.8k' },
          { icon: Activity,  label: 'Avg Time',      value: '58s' },
          { icon: Crown,     label: 'Plan',          value: 'ENT' },
        ].map(({ icon: I, label, value }) => (
          <div key={label} style={{ background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <I size={16} color={BRAND.accent} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: 20, fontWeight: 800, color: BRAND.text }}>{value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: BRAND.text, margin: '0 0 20px' }}>Monthly Volume — Jobs & Credits</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="jobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND.accent} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={BRAND.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={BRAND.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: BRAND.accent }} />
              <YAxis tick={{ fontSize: 11, fill: BRAND.accent }} />
              <Tooltip />
              <Area type="monotone" dataKey="jobs" stroke={BRAND.accent} fill="url(#jobs)" strokeWidth={2} name="Jobs" />
              <Area type="monotone" dataKey="credits" stroke="#a78bfa" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Credits" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: BRAND.text, margin: '0 0 20px' }}>Jobs by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEPT} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={BRAND.border} />
              <XAxis type="number" tick={{ fontSize: 11, fill: BRAND.accent }} />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: BRAND.accent }} width={90} />
              <Tooltip />
              <Bar dataKey="jobs" fill={BRAND.accent} radius={[0,4,4,0]} name="Jobs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
