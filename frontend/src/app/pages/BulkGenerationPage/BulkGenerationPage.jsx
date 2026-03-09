import { useState, useRef, useCallback } from 'react';
import { Upload, Package, X, ChevronRight, AlertTriangle } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';
import useJobStore from '../../../store/jobStore.js';
import { MOCK_AVATARS } from '../../../services/mock/avatars.mock.js';
import { CREDIT_COSTS } from '../../../utils/constants.js';
import { formatBytes } from '../../../utils/formatters.js';

export default function BulkGenerationPage() {
  const { user, credits, setCredits } = useAuthStore();
  const { addJob } = useJobStore();
  const [zipFile, setZipFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileCount, setFileCount] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  const avatars = MOCK_AVATARS.filter(a => a.company_id === user?.company_id && a.status === 'approved');

  const simulateUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    // Simulate chunked upload progress
    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 80));
      setUploadProgress(Math.round((i / steps) * 100));
    }
    setUploading(false);
    // Mock: extract count from file size (1 image per ~200KB)
    setFileCount(Math.max(1, Math.round(file.size / 200000)));
  };

  const handleFile = useCallback(async (file) => {
    if (!file || !file.name.endsWith('.zip')) return;
    setZipFile(file);
    await simulateUpload(file);
  }, []);

  const totalCost = fileCount ? fileCount * CREDIT_COSTS.BULK_PER_IMAGE : 0;

  const handleSubmit = () => {
    if (!zipFile || !selectedAvatar || credits < totalCost) return;
    addJob({
      id: `j-${Date.now()}`,
      type: 'bulk',
      status: 'queued',
      progress: 0,
      user_id: user.id,
      company_id: user.company_id,
      input_files: [zipFile.name],
      output_files: [],
      avatar_id: selectedAvatar.id,
      credits_used: totalCost,
      created_at: new Date().toISOString(),
      completed_at: null,
    });
    setCredits(credits - totalCost);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <Package size={48} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 8 }}>Bulk job submitted!</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 24, lineHeight: 1.6 }}>
          {fileCount} images will be processed. Track progress in Job History.
        </p>
        <button onClick={() => { setSubmitted(false); setZipFile(null); setFileCount(null); setSelectedAvatar(null); }}
          style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
          New batch
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-container" data-section="bulk-generation-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Bulk Generation</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Upload a ZIP of images. Each image is processed separately as an individual job.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        {/* Upload */}
        <div className="card" data-section="bulk-upload">
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 16 }}>1 — Upload ZIP file</h2>
          {!zipFile ? (
            <div className={`upload-zone${dragActive ? ' drag-active' : ''}`}
              style={{ padding: '48px 24px', textAlign: 'center' }}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={e => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files?.[0]); }}
              onClick={() => fileRef.current?.click()}
            >
              <Package size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 4 }}>Drop ZIP file here</p>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Supports up to 100GB · JPG, PNG inside ZIP</p>
              <input ref={fileRef} type="file" accept=".zip" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
                <Package size={18} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{zipFile.name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{formatBytes(zipFile.size)}</div>
                </div>
                <button onClick={() => { setZipFile(null); setFileCount(null); setUploadProgress(0); }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
                  <X size={15} />
                </button>
              </div>
              {uploading ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    <span>Uploading…</span><span>{uploadProgress}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--color-info)', borderRadius: 2, width: `${uploadProgress}%`, transition: 'width 0.1s linear' }} />
                  </div>
                </div>
              ) : fileCount ? (
                <div style={{ padding: '10px 12px', background: 'var(--color-success-bg)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>
                  ✓ {fileCount} images detected — {totalCost} credits total
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Avatar selector */}
        <div className="card" data-section="bulk-avatar">
          <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 16 }}>2 — Select avatar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
            {avatars.map(a => (
              <button key={a.id} onClick={() => setSelectedAvatar(a)}
                style={{
                  border: selectedAvatar?.id === a.id ? '2px solid var(--color-action)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)', background: 'transparent', cursor: 'pointer', padding: 4, overflow: 'hidden',
                }}>
                <div style={{ aspectRatio: '3/4', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 4 }}>
                  {a.image_url ? <img src={a.image_url} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}
                </div>
                <div style={{ fontSize: 10, fontWeight: 500, textAlign: 'center' }}>{a.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div style={{ marginTop: 16, padding: '16px 20px', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            {!zipFile && 'Upload a ZIP file to continue'}
            {zipFile && !selectedAvatar && 'Select an avatar'}
            {zipFile && selectedAvatar && fileCount && `${fileCount} images × ${CREDIT_COSTS.BULK_PER_IMAGE} credit = ${totalCost} credits`}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Balance: {credits} credits</div>
        </div>
        {credits < totalCost && totalCost > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}>
            <AlertTriangle size={13} /> Insufficient credits
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!zipFile || !selectedAvatar || uploading || !fileCount || credits < totalCost}
          style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer', opacity: (!zipFile || !selectedAvatar || uploading || !fileCount) ? 0.5 : 1 }}
        >
          Start batch
        </button>
      </div>
    </div>
  );
}
