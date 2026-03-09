import { useState, useRef, useCallback } from 'react';
import { Upload, X, ChevronDown, Wand2, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';
import useJobStore from '../../../store/jobStore.js';
import { MOCK_AVATARS } from '../../../services/mock/avatars.mock.js';
import { AVATAR_GENDERS, AVATAR_ETHNICITIES, CREDIT_COSTS } from '../../../utils/constants.js';

function AvatarCard({ avatar, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        border: selected ? '2px solid var(--color-action)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: selected ? 'var(--color-surface)' : 'var(--color-background)',
        padding: 8, cursor: 'pointer', textAlign: 'left',
        transition: 'border-color var(--transition-fast)',
      }}
    >
      <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--color-surface)' }}>
        {avatar.image_url ? (
          <img src={avatar.image_url} alt={avatar.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 24 }}>
            👤
          </div>
        )}
      </div>
      <div style={{ padding: '0 2px' }}>
        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{avatar.name}</div>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{avatar.ethnicity}</div>
      </div>
    </button>
  );
}

export default function SwapModelPage() {
  const { user, credits, setCredits } = useAuthStore();
  const { addJob } = useJobStore();

  const [sourceFile, setSourceFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [genderFilter, setGenderFilter] = useState('all');
  const [ethnicityFilter, setEthnicityFilter] = useState('all');
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  const companyAvatars = MOCK_AVATARS.filter(a => a.company_id === user?.company_id && a.status === 'approved');

  const filteredAvatars = companyAvatars.filter(a => {
    if (genderFilter !== 'all' && a.gender !== genderFilter) return false;
    if (ethnicityFilter !== 'all' && a.ethnicity !== ethnicityFilter) return false;
    return true;
  });

  const handleFile = useCallback((file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) return;
    setSourceFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!sourceFile || !selectedAvatar) return;
    if (credits < CREDIT_COSTS.SWAP_MODEL) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    addJob({
      id: `j-${Date.now()}`,
      type: 'swap_model',
      status: 'queued',
      progress: 0,
      user_id: user.id,
      company_id: user.company_id,
      input_files: [sourceFile.name],
      output_files: [],
      avatar_id: selectedAvatar.id,
      credits_used: CREDIT_COSTS.SWAP_MODEL,
      created_at: new Date().toISOString(),
      completed_at: null,
    });
    setCredits(credits - CREDIT_COSTS.SWAP_MODEL);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="page-container" data-section="swap-model-submitted" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 8 }}>Job submitted!</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 24, lineHeight: 1.6 }}>
          Your swap job has been added to the queue. You can track progress in Job History.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => setSubmitted(false)} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'transparent', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: 'pointer' }}>
            New job
          </button>
          <button onClick={() => window.location.href = '/jobs'} style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontSize: 'var(--font-size-sm)', fontWeight: 500, cursor: 'pointer' }}>
            View jobs
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container" data-section="swap-model-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Swap Model</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Upload a garment image, select an avatar, and generate. Garments and poses are never modified.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Step 1: Upload */}
        <div data-section="swap-upload-panel" className="card">
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 16 }}>1 — Upload source image</h2>

          {!sourceFile ? (
            <div
              className={`upload-zone${dragActive ? ' drag-active' : ''}`}
              style={{ padding: '40px 24px', textAlign: 'center' }}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={28} color="var(--color-text-muted)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 4 }}>Drag & drop or click to upload</p>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>JPG, PNG, WebP — max 50MB</p>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <img src={preview} alt="Source" style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'block', maxHeight: 420, objectFit: 'contain', background: 'var(--color-surface)' }} />
              <button
                onClick={() => { setSourceFile(null); setPreview(null); }}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', border: 'none',
                  color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Tech rules notice */}
          <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--color-info-bg)', border: '1px solid var(--color-info)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-info)', lineHeight: 1.6 }}>
            <strong>Rules:</strong> Portrait → Portrait output. Landscape → Landscape. Garments, pose, and proportions are always preserved. Output: 2730×4096.
          </div>
        </div>

        {/* Step 2: Avatar selection */}
        <div data-section="swap-avatar-panel" className="card">
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 16 }}>2 — Select avatar</h2>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              style={{ padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)', background: 'var(--color-background)', color: 'var(--color-text-primary)', cursor: 'pointer' }}
            >
              <option value="all">All genders</option>
              {AVATAR_GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            <select
              value={ethnicityFilter}
              onChange={e => setEthnicityFilter(e.target.value)}
              style={{ padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-xs)', background: 'var(--color-background)', color: 'var(--color-text-primary)', cursor: 'pointer' }}
            >
              <option value="all">All ethnicities</option>
              {AVATAR_ETHNICITIES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {filteredAvatars.length === 0 ? (
              <p style={{ gridColumn: '1/-1', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', padding: '24px 0', textAlign: 'center' }}>No avatars match filters</p>
            ) : filteredAvatars.map(a => (
              <AvatarCard
                key={a.id} avatar={a}
                selected={selectedAvatar?.id === a.id}
                onClick={() => setSelectedAvatar(a)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div data-section="swap-submit-bar" style={{
        marginTop: 20, padding: '16px 20px',
        background: 'var(--color-background)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            {!sourceFile && !selectedAvatar && 'Upload an image and select an avatar to continue'}
            {sourceFile && !selectedAvatar && 'Select an avatar'}
            {!sourceFile && selectedAvatar && 'Upload a source image'}
            {sourceFile && selectedAvatar && `Ready — ${selectedAvatar.name} will be applied to your image`}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Cost: {CREDIT_COSTS.SWAP_MODEL} credit · Balance: {credits} credits</div>
        </div>
        {credits < CREDIT_COSTS.SWAP_MODEL && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}>
            <AlertTriangle size={13} /> Insufficient credits
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!sourceFile || !selectedAvatar || submitting || credits < CREDIT_COSTS.SWAP_MODEL}
          style={{
            padding: '9px 20px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-action)', color: 'var(--color-action-text)',
            border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            opacity: (!sourceFile || !selectedAvatar || submitting) ? 0.5 : 1,
          }}
        >
          <Wand2 size={15} />
          {submitting ? 'Submitting…' : 'Generate'}
        </button>
      </div>
    </div>
  );
}
