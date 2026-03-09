import { useState } from 'react';
import { Coins, Send } from 'lucide-react';
import useAuthStore from '../../../../store/authStore.js';
import { MOCK_USERS } from '../../../../services/mock/auth.mock.js';
import { MOCK_CREDIT_BALANCE, MOCK_TRANSACTIONS } from '../../../../services/mock/credits.mock.js';
import { USER_STATUS } from '../../../../utils/constants.js';
import { formatDateTime } from '../../../../utils/formatters.js';

export default function CreditManagementPage() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState(MOCK_CREDIT_BALANCE[user?.company_id] || 0);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS.filter(t => t.company_id === user?.company_id));
  const [allocateAmount, setAllocateAmount] = useState('');
  const [allocateNote, setAllocateNote] = useState('');
  const [success, setSuccess] = useState('');

  const approved = MOCK_USERS.filter(u => u.company_id === user?.company_id && u.status === USER_STATUS.APPROVED);

  const handleAllocate = (e) => {
    e.preventDefault();
    const amt = parseInt(allocateAmount);
    if (!amt || amt <= 0) return;
    const newTx = {
      id: `t-${Date.now()}`,
      company_id: user?.company_id,
      type: 'allocation',
      amount: amt,
      description: allocateNote || 'Manual allocation by admin',
      created_at: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);
    setBalance(b => b + amt);
    setAllocateAmount('');
    setAllocateNote('');
    setSuccess(`${amt} credits allocated successfully`);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="page-container" data-section="credit-management-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Credit Management</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>View balance and allocate credits to your company.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start', marginBottom: 20 }}>
        {/* Balance card */}
        <div className="card" data-section="credit-balance">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Coins size={16} />
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Company balance</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 4 }}>{balance.toLocaleString()}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>credits available</div>
        </div>

        {/* Allocate form */}
        <div className="card" data-section="credit-allocate">
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 14 }}>Add credits</h2>
          {success && (
            <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-success-bg)', border: '1px solid var(--color-success)', color: 'var(--color-success)', fontSize: 'var(--font-size-xs)', marginBottom: 12 }}>{success}</div>
          )}
          <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 500, marginBottom: 5 }}>Amount</label>
              <input type="number" min="1" value={allocateAmount} onChange={e => setAllocateAmount(e.target.value)} placeholder="100"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 500, marginBottom: 5 }}>Note (optional)</label>
              <input value={allocateNote} onChange={e => setAllocateNote(e.target.value)} placeholder="Reason for allocation"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', outline: 'none' }} />
            </div>
            <button type="submit" disabled={!allocateAmount} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: !allocateAmount ? 0.5 : 1 }}>
              <Send size={13} /> Allocate credits
            </button>
          </form>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }} data-section="credit-transactions">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Transaction history</div>
        {transactions.map((t, i) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < transactions.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{t.description}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{formatDateTime(t.created_at)}</div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: t.amount > 0 ? 'var(--color-success)' : 'var(--color-error)', flexShrink: 0 }}>
              {t.amount > 0 ? '+' : ''}{t.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
