import useAuthStore from '../../../store/authStore.js';
import useCompanyStore from '../../../store/companyStore.js';
import { MOCK_TRANSACTIONS } from '../../../services/mock/credits.mock.js';
import { formatDateTime, formatCredits } from '../../../utils/formatters.js';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';

export default function BillingPage() {
  const { user, credits } = useAuthStore();
  const { getActiveCompany } = useCompanyStore();
  const company = getActiveCompany();

  const transactions = MOCK_TRANSACTIONS.filter(t => t.company_id === user?.company_id);

  const TYPE_COLORS = { purchase: 'var(--color-success)', usage: 'var(--color-error)', allocation: 'var(--color-info)', refund: 'var(--color-success)' };

  return (
    <div className="page-container" data-section="billing-page">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Billing</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Credit balance and transaction history</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Zap size={15} color="var(--color-text-muted)" />
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>{formatCredits(credits)}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Credits remaining</div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Plan</div>
          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, textTransform: 'capitalize' }}>{company?.subscription_plan || '—'}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)' }}>Active</div>
        </div>
      </div>

      <div className="card" data-section="billing-transactions" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Transaction history</h2>
        </div>
        {transactions.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No transactions yet</div>
        ) : transactions.map((t, i) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < transactions.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: t.amount > 0 ? 'var(--color-success-bg)' : 'var(--color-error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {t.amount > 0 ? <TrendingUp size={14} color="var(--color-success)" /> : <TrendingDown size={14} color="var(--color-error)" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{formatDateTime(t.created_at)}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: t.amount > 0 ? 'var(--color-success)' : 'var(--color-error)', flexShrink: 0 }}>
              {t.amount > 0 ? '+' : ''}{t.amount}
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade section */}
      <div data-section="billing-upgrade" className="card" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 4 }}>Need more credits?</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Upgrade your plan for more monthly credits and features.</p>
        </div>
        <button style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer', flexShrink: 0 }}>
          View plans
        </button>
      </div>
    </div>
  );
}
