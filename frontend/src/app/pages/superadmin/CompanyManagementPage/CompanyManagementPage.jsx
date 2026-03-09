import { useState } from 'react';
import { Plus, Trash2, Building2, Coins } from 'lucide-react';
import { MOCK_COMPANIES } from '../../../../services/mock/companies.mock.js';

export default function CompanyManagementPage() {
  const [companies, setCompanies] = useState(MOCK_COMPANIES);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [allocating, setAllocating] = useState(null);
  const [allocAmt, setAllocAmt] = useState('');

  const createCompany = () => {
    if (!newName.trim()) return;
    setCompanies(prev => [...prev, {
      id: `c-${Date.now()}`, name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-'),
      logo_url: null, credit_balance: 0, subscription_plan: 'basic',
      subscription_status: 'active', user_count: 0, job_count: 0,
      created_at: new Date().toISOString(),
    }]);
    setNewName('');
    setShowCreate(false);
  };

  const deleteCompany = (id) => setCompanies(prev => prev.filter(c => c.id !== id));

  const allocateCredits = (id) => {
    const amt = parseInt(allocAmt);
    if (!amt) return;
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, credit_balance: c.credit_balance + amt } : c));
    setAllocating(null);
    setAllocAmt('');
  };

  const PLAN_LABELS = { basic: 'Basic', premium: 'Premium', enterprise: 'Enterprise' };

  return (
    <div className="page-container" data-section="company-management-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Company Management</h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Create, manage, and allocate credits to companies.</p>
        </div>
        <button onClick={() => setShowCreate(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
          <Plus size={14} /> New company
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 12 }}>Create company</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Company name"
              style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', outline: 'none' }} />
            <button onClick={createCompany} disabled={!newName.trim()}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer', opacity: !newName.trim() ? 0.5 : 1 }}>
              Create
            </button>
            <button onClick={() => setShowCreate(false)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Company list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {companies.map((c, i) => (
          <div key={c.id} style={{ padding: '14px 16px', borderBottom: i < companies.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={16} color="var(--color-text-muted)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{c.name}</span>
                  <span className="badge" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)', fontSize: 10, textTransform: 'capitalize' }}>{PLAN_LABELS[c.subscription_plan]}</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{c.user_count} users · {c.job_count} jobs · {c.credit_balance} credits</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => setAllocating(allocating === c.id ? null : c.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>
                  <Coins size={11} /> Add credits
                </button>
                <button onClick={() => deleteCompany(c.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {allocating === c.id && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 52 }}>
                <input type="number" min="1" value={allocAmt} onChange={e => setAllocAmt(e.target.value)} placeholder="Amount"
                  style={{ width: 100, padding: '6px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', background: 'var(--color-background)', outline: 'none' }} />
                <button onClick={() => allocateCredits(c.id)} style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer' }}>Allocate</button>
                <button onClick={() => { setAllocating(null); setAllocAmt(''); }} style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
