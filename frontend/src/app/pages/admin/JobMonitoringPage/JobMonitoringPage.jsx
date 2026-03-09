import { useState } from 'react';
import { AlertCircle, ChevronDown, RefreshCw } from 'lucide-react';
import useAuthStore from '../../../../store/authStore.js';
import useJobStore from '../../../../store/jobStore.js';
import { formatDateTime } from '../../../../utils/formatters.js';

const TYPE_LABELS = { swap_model: 'Swap Model', image_gen: 'Image Gen', video_gen: 'Video', bulk: 'Bulk' };

function ErrorDetail({ job }) {
  const [open, setOpen] = useState(false);
  if (job.status !== 'failed') return null;
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
        <AlertCircle size={11} /> Error detail <ChevronDown size={11} style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{ marginTop: 4, padding: '8px 10px', background: 'var(--color-error-bg)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', lineHeight: 1.6 }}>
          <strong>{job.error_code}</strong>: {job.error_message}
        </div>
      )}
    </div>
  );
}

export default function JobMonitoringPage() {
  const { user } = useAuthStore();
  const { jobs, updateJob } = useJobStore();
  const [statusFilter, setStatusFilter] = useState('all');

  const companyJobs = jobs.filter(j => j.company_id === user?.company_id);
  const filtered = statusFilter === 'all' ? companyJobs : companyJobs.filter(j => j.status === statusFilter);

  const counts = {
    total: companyJobs.length,
    processing: companyJobs.filter(j => j.status === 'processing').length,
    failed: companyJobs.filter(j => j.status === 'failed').length,
    completed: companyJobs.filter(j => j.status === 'completed').length,
  };

  return (
    <div className="page-container" data-section="job-monitoring-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Job Monitor</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>All company jobs with detailed error reporting.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['Total', counts.total, '#525252'], ['Processing', counts.processing, 'var(--color-info)'], ['Completed', counts.completed, 'var(--color-success)'], ['Failed', counts.failed, 'var(--color-error)']].map(([l, v, c]) => (
          <div key={l} style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-background)', minWidth: 90 }}>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 14 }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', cursor: 'pointer', outline: 'none' }}>
          <option value="all">All jobs</option>
          <option value="queued">Queued</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.map((job, i) => (
          <div key={job.id} style={{ padding: '12px 16px', borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 7, flexShrink: 0, background: { queued: '#a3a3a3', processing: '#2563eb', completed: '#16a34a', failed: '#dc2626', cancelled: '#d4d4d4' }[job.status] }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{TYPE_LABELS[job.type]}</span>
                  <span className={`badge badge-${job.status}`}>{job.status}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{job.id}</span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>{formatDateTime(job.created_at)} · User: {job.user_id}</div>
                <ErrorDetail job={job} />
              </div>
              {job.status === 'failed' && (
                <button onClick={() => updateJob(job.id, { status: 'queued', progress: 0, error_code: null, error_message: null })}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', fontSize: 'var(--font-size-xs)', cursor: 'pointer', flexShrink: 0 }}>
                  <RefreshCw size={11} /> Retry
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No jobs found</div>
        )}
      </div>
    </div>
  );
}
