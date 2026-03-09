import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Zap, Shield, Clock, Download } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Instant Face Swap', desc: 'Swap model identities in seconds while preserving every garment detail.' },
  { icon: Shield, title: 'Garment Preserved', desc: 'Clothing, pose, and proportions are never altered — only the model changes.' },
  { icon: Clock, title: 'Bulk Processing', desc: 'Upload hundreds of images as a ZIP and process them all in one batch.' },
  { icon: Download, title: '4K Output', desc: 'Every generated image outputs at 2730×4096 — print-ready resolution.' },
  { icon: CheckCircle2, title: 'Multi-Tenant', desc: 'Each brand gets isolated data, avatars, and usage analytics.' },
  { icon: ArrowRight, title: 'API Ready', desc: 'Connect your workflow directly via REST API with full documentation.' },
];

const STEPS = [
  { n: '01', title: 'Upload Image', desc: 'Upload a single photo or a ZIP of hundreds.' },
  { n: '02', title: 'Select Avatar', desc: 'Choose from your brand\'s approved avatar library.' },
  { n: '03', title: 'Generate', desc: 'AI swaps the model identity — garments stay perfect.' },
  { n: '04', title: 'Download', desc: 'Download individual results or a full ZIP.' },
];

const PLANS = [
  {
    id: 'basic', name: 'Basic', price: '$49', period: '/mo',
    credits: '100 credits/mo', users: '1 user',
    features: ['Standard avatars', 'Single image generation', 'Email support'],
    cta: 'Get started',
  },
  {
    id: 'premium', name: 'Premium', price: '$199', period: '/mo',
    credits: '500 credits/mo', users: '5 users',
    features: ['Company avatars', 'Bulk ZIP processing', 'Priority support', 'Usage analytics'],
    cta: 'Get started',
    featured: true,
  },
  {
    id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '',
    credits: 'Unlimited credits', users: 'Unlimited users',
    features: ['Custom avatars', 'Dedicated support', 'SLA guarantee', 'Custom integrations'],
    cta: 'Contact sales',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh' }} data-section="landing-page">
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center',
        padding: '0 clamp(16px, 4vw, 64px)',
        height: 56,
      }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', letterSpacing: '-0.01em', flex: 1 }}>
          AI Fashion Studio
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '7px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', background: 'transparent',
              fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontWeight: 500,
              color: 'var(--color-text-primary)',
            }}
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '7px 16px', borderRadius: 'var(--radius-md)',
              border: 'none', background: 'var(--color-action)',
              fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontWeight: 500,
              color: 'var(--color-action-text)',
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section data-section="landing-hero" style={{
        maxWidth: 1200, margin: '0 auto',
        padding: 'clamp(48px, 8vw, 96px) clamp(16px, 4vw, 64px)',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          marginBottom: 24,
          fontWeight: 500,
        }}>
          B2B AI Fashion Platform
        </div>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 64px)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          color: 'var(--color-text-primary)',
          marginBottom: 20,
        }}>
          Generate fashion model images<br />at scale
        </h1>
        <p style={{
          fontSize: 'clamp(15px, 1.5vw, 18px)',
          color: 'var(--color-text-secondary)',
          maxWidth: 520,
          margin: '0 auto 36px',
          lineHeight: 1.6,
        }}>
          Swap model identities while preserving garments, poses, and brand consistency — for the entire collection.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '11px 24px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-action)', border: 'none',
              color: 'var(--color-action-text)', fontWeight: 600,
              fontSize: 'var(--font-size-base)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            Start for free <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '11px 24px', borderRadius: 'var(--radius-md)',
              background: 'transparent', border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)', fontWeight: 500,
              fontSize: 'var(--font-size-base)', cursor: 'pointer',
            }}
          >
            Log in
          </button>
        </div>
      </section>

      {/* How it works */}
      <section data-section="landing-how-it-works" style={{
        borderTop: '1px solid var(--color-border)',
        padding: 'clamp(48px, 6vw, 80px) clamp(16px, 4vw, 64px)',
        maxWidth: 1200, margin: '0 auto',
      }}>
        <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 40, textAlign: 'center' }}>
          How it works
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 32,
        }}>
          {STEPS.map(step => (
            <div key={step.n} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                {step.n}
              </span>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{step.title}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section data-section="landing-features" style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        padding: 'clamp(48px, 6vw, 80px) clamp(16px, 4vw, 64px)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 40, textAlign: 'center' }}>
            Built for fashion brands
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 1,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: '24px',
                  background: 'var(--color-background)',
                  borderRight: (i + 1) % 2 === 0 ? 'none' : '1px solid var(--color-border)',
                  borderBottom: i < FEATURES.length - 2 ? '1px solid var(--color-border)' : 'none',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                <f.icon size={18} color="var(--color-text-primary)" />
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{f.title}</h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section data-section="landing-pricing" style={{
        borderTop: '1px solid var(--color-border)',
        padding: 'clamp(48px, 6vw, 80px) clamp(16px, 4vw, 64px)',
        maxWidth: 1200, margin: '0 auto',
      }}>
        <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8, textAlign: 'center' }}>
          Simple pricing
        </h2>
        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: 40 }}>
          Start free, scale as you grow.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16, alignItems: 'start',
        }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                padding: 24,
                borderRadius: 'var(--radius-lg)',
                border: plan.featured
                  ? '2px solid var(--color-action)'
                  : '1px solid var(--color-border)',
                background: 'var(--color-background)',
                position: 'relative',
              }}
            >
              {plan.featured && (
                <div style={{
                  position: 'absolute', top: -10, left: 24,
                  padding: '2px 10px', background: 'var(--color-action)',
                  color: 'var(--color-action-text)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)', fontWeight: 600,
                }}>
                  Most popular
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em' }}>{plan.price}</span>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  {plan.credits} · {plan.users}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <CheckCircle2 size={13} color="var(--color-success)" />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/register')}
                style={{
                  width: '100%', padding: '9px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: plan.featured ? 'none' : '1px solid var(--color-border)',
                  background: plan.featured ? 'var(--color-action)' : 'transparent',
                  color: plan.featured ? 'var(--color-action-text)' : 'var(--color-text-primary)',
                  fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer',
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '24px clamp(16px, 4vw, 64px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>AI Fashion Studio</span>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          © {new Date().getFullYear()} AI Fashion Studio. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
