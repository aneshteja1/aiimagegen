// ImageGenerationPage.jsx
import { useState } from 'react';
import { Image, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';
import useJobStore from '../../../store/jobStore.js';
import { CREDIT_COSTS } from '../../../utils/constants.js';

export default function ImageGenerationPage() {
  const { user, credits, setCredits } = useAuthStore();
  const { addJob } = useJobStore();
  const [prompt, setPrompt] = useState('');
  const [gender, setGender] = useState('female');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || credits < CREDIT_COSTS.IMAGE_GEN) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    addJob({
      id: `j-${Date.now()}`,
      type: 'image_gen',
      status: 'queued',
      progress: 0,
      user_id: user.id,
      company_id: user.company_id,
      input_files: [],
      output_files: [],
      credits_used: CREDIT_COSTS.IMAGE_GEN,
      parameters: { prompt, gender },
      created_at: new Date().toISOString(),
    });
    setCredits(credits - CREDIT_COSTS.IMAGE_GEN);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 8 }}>Job submitted</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 24 }}>Track progress in Job History.</p>
        <button onClick={() => { setSubmitted(false); setPrompt(''); }} style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>New image</button>
      </div>
    </div>
  );

  return (
    <div className="page-container" data-section="image-generation-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Image Generation</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Generate fashion images from a text prompt.</p>
      </div>
      <div style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 6 }}>Prompt</label>
            <textarea
              value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="A model wearing a white summer dress on a studio background…"
              rows={4}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 6 }}>Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', cursor: 'pointer', outline: 'none' }}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Cost: {CREDIT_COSTS.IMAGE_GEN} credit · Balance: {credits}</span>
            <button type="submit" disabled={!prompt.trim() || submitting || credits < CREDIT_COSTS.IMAGE_GEN}
              style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontWeight: 600, fontSize: 'var(--font-size-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: !prompt.trim() || submitting ? 0.5 : 1 }}>
              <Image size={14} />{submitting ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
