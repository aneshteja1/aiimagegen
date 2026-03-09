import { Download, FileImage } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';
import useJobStore from '../../../store/jobStore.js';
import { formatRelativeTime } from '../../../utils/formatters.js';

export default function DownloadCenterPage() {
  const { user } = useAuthStore();
  const { jobs } = useJobStore();
  const completed = jobs.filter(j => j.company_id === user?.company_id && j.status === 'completed' && j.output_files?.length > 0);

  return (
    <div className="page-container" data-section="download-center-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Download Center</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{completed.length} completed outputs available</p>
      </div>
      {completed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--color-text-muted)' }}>
          <Download size={40} style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 'var(--font-size-sm)' }}>No completed outputs yet. Submit a generation job to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {completed.map(job => (
            <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ height: 140, background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileImage size={32} color="var(--color-text-muted)" />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 2 }}>{job.type.replace('_', ' ')}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{formatRelativeTime(job.completed_at)}</div>
              </div>
              <button style={{ padding: '7px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-action)', color: 'var(--color-action-text)', border: 'none', fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <Download size={12} /> Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
