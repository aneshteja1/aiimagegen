import { useState } from 'react';
import { Check, X, Search } from 'lucide-react';
import useAuthStore from '../../../../store/authStore.js';
import { MOCK_USERS } from '../../../../services/mock/auth.mock.js';
import { USER_STATUS } from '../../../../utils/constants.js';
import { getInitials } from '../../../../utils/formatters.js';

export default function UserManagementPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState(MOCK_USERS.filter(u => u.company_id === user?.company_id));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const filtered = users.filter(u => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    if (search && !u.full_name?.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const approve = (id) => setUsers(us => us.map(u => u.id === id ? { ...u, status: USER_STATUS.APPROVED } : u));
  const reject = (id, reason) => {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: USER_STATUS.REJECTED, rejection_reason: reason } : u));
    setRejectingId(null);
    setRejectReason('');
  };

  const ROLE_LABELS = { superadmin: 'Super Admin', company_admin: 'Admin', user: 'User' };

  return (
    <div className="page-container" data-section="user-management-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>User Management</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Approve, reject, and manage your team.</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', outline: 'none' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No users found</div>
        ) : filtered.map((u, i) => (
          <div key={u.id} style={{ padding: '14px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-action)', color: 'var(--color-action-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                {getInitials(u.full_name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{u.full_name}</span>
                  <span className="badge" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)', fontSize: 10 }}>{ROLE_LABELS[u.role]}</span>
                  <span className={`badge badge-${u.status}`}>{u.status.charAt(0).toUpperCase() + u.status.slice(1)}</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{u.email}</div>
              </div>
              {u.status === USER_STATUS.PENDING && u.id !== user?.id && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => approve(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer' }}>
                    <Check size={12} /> Approve
                  </button>
                  <button onClick={() => setRejectingId(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', fontSize: 'var(--font-size-xs)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                    <X size={12} /> Reject
                  </button>
                </div>
              )}
            </div>
            {rejectingId === u.id && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection (optional)"
                  style={{ flex: 1, padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', background: 'var(--color-background)', outline: 'none' }} />
                <button onClick={() => reject(u.id, rejectReason)} style={{ padding: '7px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-error)', color: '#fff', border: 'none', fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer' }}>Confirm reject</button>
                <button onClick={() => setRejectingId(null)} style={{ padding: '7px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
