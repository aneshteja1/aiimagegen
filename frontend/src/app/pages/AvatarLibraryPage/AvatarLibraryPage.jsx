import { useState } from 'react';
import { Search } from 'lucide-react';
import { MOCK_AVATARS } from '../../../services/mock/avatars.mock.js';
import { AVATAR_GENDERS, AVATAR_ETHNICITIES } from '../../../utils/constants.js';
import useAuthStore from '../../../store/authStore.js';

export default function AvatarLibraryPage() {
  const { user } = useAuthStore();
  const [gender, setGender] = useState('all');
  const [ethnicity, setEthnicity] = useState('all');
  const [search, setSearch] = useState('');

  const avatars = MOCK_AVATARS.filter(a => a.company_id === user?.company_id && a.status === 'approved');

  const filtered = avatars.filter(a => {
    if (gender !== 'all' && a.gender !== gender) return false;
    if (ethnicity !== 'all' && a.ethnicity !== ethnicity) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page-container" data-section="avatar-library-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Avatar Library</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          {avatars.length} approved avatars for your company
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search avatars…"
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', outline: 'none' }} />
        </div>
        {[
          { val: gender, set: setGender, opts: [['all', 'All genders'], ...AVATAR_GENDERS.map(g => [g.value, g.label])] },
          { val: ethnicity, set: setEthnicity, opts: [['all', 'All ethnicities'], ...AVATAR_ETHNICITIES.map(e => [e.value, e.label])] },
        ].map((f, i) => (
          <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', cursor: 'pointer', outline: 'none' }}>
            {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          No avatars match your filters
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }} data-section="avatar-grid">
          {filtered.map(a => (
            <div key={a.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ aspectRatio: '3/4', background: 'var(--color-surface)' }}>
                {a.image_url ? (
                  <img src={a.image_url} alt={a.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>👤</div>
                )}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 4 }}>{a.name}</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)', textTransform: 'capitalize', fontSize: 10 }}>{a.gender}</span>
                  <span className="badge" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)', textTransform: 'capitalize', fontSize: 10 }}>{a.ethnicity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
