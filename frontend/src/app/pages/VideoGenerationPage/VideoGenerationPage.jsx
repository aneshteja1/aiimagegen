import { useState, useRef } from 'react';
import { Upload, Video, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';
import useJobStore from '../../../store/jobStore.js';
import { MOCK_AVATARS } from '../../../services/mock/avatars.mock.js';
import { CREDIT_COSTS } from '../../../utils/constants.js';
import { formatBytes } from '../../../utils/formatters.js';

export default function VideoGenerationPage() {
  const { user, credits, setCredits } = useAuthStore();
  const { addJob } = useJobStore();
  const [videoFile, setVideoFile] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);
  const avatars = MOCK_AVATARS.filter(a => a.company_id === user?.company_id && a.status === 'approved');

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) return;
    setVideoFile(file);
  };

  const handleSubmit = async () => {
    if (!videoFile || !selectedAvatar || credits < CREDIT_COSTS.VIDEO_GEN) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 700));
    addJob({ id: `j-${Date.now()}`, type: 'video_gen', status: 'queued', progress: 0, user_id: user.id, company_id: user.company_id, input_files: [videoFile.name], output_files: [], avatar_id: selectedAvatar.id, credits_used: CREDIT_COSTS.VIDEO_GEN, created_at: new Date().toISOString() });
    setCredits(credits - CREDIT_COSTS.VIDEO_GEN);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 8 }}>Video job submitted</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 24 }}>Video generation takes 5–15 minutes. Track in Job History.</p>
        <button onClick={() => { setSubmitted(false); setVideoFile(null); setSelectedAvatar(null); }} style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>New video</button>
      </div>
    </div>
  );

  return (
    <div className="page-container" data-section="video-generation-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Video Generation</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Upload a video clip and select an avatar to swap the model identity.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <div className="card">
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 16 }}>1 — Upload video</h2>
          {!videoFile ? (
            <div className="upload-zone" style={{ padding: '48px 24px', textAlign: 'center' }} onClick={() => fileRef.current?.click()}>
              <Video size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 4 }}>Click to upload video</p>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>MP4, MOV, WebM — max 2GB</p>
              <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
              <Video size={18} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{videoFile.name}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{formatBytes(videoFile.size)}</div>
              </div>
              <button onClick={() => setVideoFile(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}><X size={15} /></button>
            </div>
          )}
          <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', color: 'var(--color-warning)' }}>
            <strong>Note:</strong> Video generation costs {CREDIT_COSTS.VIDEO_GEN} credits. Processing time: 5–15 minutes.
          </div>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 16 }}>2 — Select avatar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
            {avatars.map(a => (
              <button key={a.id} onClick={() => setSelectedAvatar(a)} style={{ border: selectedAvatar?.id === a.id ? '2px solid var(--color-action)' : '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', padding: 4, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '3/4', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 4 }}>
                  {a.image_url ? <img src={a.image_url} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}
                </div>
                <div style={{ fontSize: 10, fontWeight: 500, textAlign: 'center' }}>{a.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, padding: '16px 20px', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{videoFile && selectedAvatar ? 'Ready to generate' : 'Upload a video and select an avatar'}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Cost: {CREDIT_COSTS.VIDEO_GEN} credits · Balance: {credits}</div>
        </div>
        {credits < CREDIT_COSTS.VIDEO_GEN && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}><AlertTriangle size={13} />Insufficient credits</div>}
        <button onClick={handleSubmit} disabled={!videoFile || !selectedAvatar || submitting || credits < CREDIT_COSTS.VIDEO_GEN}
          style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer', opacity: (!videoFile || !selectedAvatar) ? 0.5 : 1 }}>
          {submitting ? 'Submitting…' : 'Generate video'}
        </button>
      </div>
    </div>
  );
}
