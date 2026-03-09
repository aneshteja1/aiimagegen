import { useState, useRef } from 'react';
import { Upload, Package, Check, X, Trash2 } from 'lucide-react';
import useAuthStore from '../../../../store/authStore.js';
import { MOCK_AVATARS } from '../../../../services/mock/avatars.mock.js';

export default function AvatarManagementPage() {
  const { user } = useAuthStore();
  const [avatars, setAvatars] = useState(MOCK_AVATARS.filter(a => a.company_id === user?.company_id));
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [zipName, setZipName] = useState('');
  const fileRef = useRef(null);

  const handleZip = async (file) => {
    if (!file || !file.name.endsWith('.zip')) return;
    setZipName(file.name);
    setUploading(true);
    for (let i = 1; i <= 10; i++) {
      await new Promise(r => setTimeout(r, 120));
      setUploadProgress(i * 10);
    }
    setUploading(false);
    // Mock: add pending avatars
    const newAvatars = [
      { id: `av-new-${Date.now()}`, name: 'New Avatar 1', gender: 'female', ethnicity: 'european', status: 'pending', company_id: user?.company_id, image_url: null },
    ];
    setAvatars(prev => [...prev, ...newAvatars]);
  };

  const remove = (id) => setAvatars(prev => prev.filter(a => a.id !== id));

  const STATUS_MAP = { approved: 'Approved', pending: 'Pending Super Admin review', rejected: 'Rejected' };

  return (
    <div className="page-container" data-section="avatar-management-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Avatar Management</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Upload avatar ZIPs for your company. New avatars require Super Admin approval.</p>
      </div>

      {/* Upload zone */}
      <div className="card" style={{ marginBottom: 20 }} data-section="avatar-upload">
        <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 14 }}>Upload avatar ZIP</h2>
        {!uploading && uploadProgress === 0 ? (
          <div className="upload-zone" style={{ padding: '32px 24px', textAlign: 'center' }} onClick={() => fileRef.current?.click()}>
            <Package size={28} color="var(--color-text-muted)" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 4 }}>Upload a ZIP of avatar images</p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Name each image clearly (e.g. Sofia_female_european.jpg)</p>
            <input ref={fileRef} type="file" accept=".zip" style={{ display: 'none' }} onChange={e => handleZip(e.target.files?.[0])} />
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 6 }}>
              <span>{zipName}</span><span>{uploadProgress}%</span>
            </div>
            <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: uploadProgress === 100 ? 'var(--color-success)' : 'var(--color-info)', borderRadius: 2, width: `${uploadProgress}%`, transition: 'width 0.1s linear' }} />
            </div>
            {uploadProgress === 100 && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', marginTop: 6 }}>✓ Uploaded — awaiting Super Admin approval</p>}
          </div>
        )}
      </div>

      {/* Avatar list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }} data-section="avatar-list">
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
          Company avatars ({avatars.length})
        </div>
        {avatars.map((a, i) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < avatars.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{ width: 40, height: 52, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', overflow: 'hidden', flexShrink: 0 }}>
              {a.image_url ? <img src={a.image_url} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 3 }}>{a.name}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)', fontSize: 10, textTransform: 'capitalize' }}>{a.gender}</span>
                <span className="badge" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)', fontSize: 10, textTransform: 'capitalize' }}>{a.ethnicity}</span>
                <span className={`badge badge-${a.status}`} style={{ fontSize: 10 }}>{STATUS_MAP[a.status] || a.status}</span>
              </div>
            </div>
            <button onClick={() => remove(a.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 4 }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
