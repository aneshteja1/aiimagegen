import { useState } from 'react';
import { Menu, ChevronDown, Zap, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/authStore.js';
import useCompanyStore from '../../../store/companyStore.js';
import { MOCK_COMPANIES } from '../../../services/mock/companies.mock.js';
import { CREDIT_WARNING_THRESHOLD, USER_ROLES } from '../../../utils/constants.js';
import { getInitials } from '../../../utils/formatters.js';

function CreditBadge({ credits }) {
  const low = credits <= CREDIT_WARNING_THRESHOLD;
  return (
    <div
      data-section="credit-badge"
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        background: low ? 'var(--color-warning-bg)' : 'var(--color-surface)',
        border: `1px solid ${low ? 'var(--color-warning)' : 'var(--color-border)'}`,
        fontSize: 'var(--font-size-xs)',
        fontWeight: 600,
        color: low ? 'var(--color-warning)' : 'var(--color-text-primary)',
        cursor: 'default',
      }}
    >
      {low ? <AlertTriangle size={12} /> : <Zap size={12} />}
      {credits} credits
    </div>
  );
}

function CompanySwitcher({ user, activeCompanyId, onSwitch }) {
  const [open, setOpen] = useState(false);
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;

  // Only show switcher for super admins or users with multiple companies
  if (!isSuperAdmin) return (
    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
      {user?.company_name || '—'}
    </span>
  );

  const active = MOCK_COMPANIES.find(c => c.id === activeCompanyId);

  return (
    <div style={{ position: 'relative' }} data-section="company-switcher">
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          background: 'transparent',
          fontSize: 'var(--font-size-sm)', fontWeight: 500,
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
        }}
      >
        {active?.name || 'All Companies'}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          background: 'var(--color-background)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          minWidth: 200, zIndex: 100,
          padding: 4,
        }}>
          {MOCK_COMPANIES.map(c => (
            <button
              key={c.id}
              onClick={() => { onSwitch(c.id); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: c.id === activeCompanyId ? 'var(--color-surface)' : 'transparent',
                fontSize: 'var(--font-size-sm)',
                fontWeight: c.id === activeCompanyId ? 600 : 400,
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopNav({ onMobileMenu }) {
  const { user, credits } = useAuthStore();
  const { activeCompanyId, setActiveCompany } = useCompanyStore();
  const navigate = useNavigate();

  return (
    <header
      data-section="topnav"
      style={{
        position: 'fixed',
        top: 0, right: 0, left: 0,
        zIndex: 30,
        height: 'var(--topnav-height)',
        background: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center',
        padding: '0 var(--space-4)',
        gap: 'var(--space-3)',
      }}
    >
      {/* Mobile menu */}
      <button
        onClick={onMobileMenu}
        className="lg:hidden"
        style={{
          display: 'none',
          alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, border: 'none', background: 'transparent', cursor: 'pointer',
        }}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <CompanySwitcher user={user} activeCompanyId={activeCompanyId} onSwitch={setActiveCompany} />

      <div style={{ flex: 1 }} />

      <CreditBadge credits={credits} />

      {/* User avatar */}
      {user && (
        <button
          onClick={() => navigate('/settings')}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--color-action)',
            color: 'var(--color-text-inverse)',
            border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Settings"
        >
          {getInitials(user.full_name)}
        </button>
      )}
    </header>
  );
}
