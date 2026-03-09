import { useState } from 'react';
import { Search, RefreshCw, X, ChevronDown, AlertCircle, Download } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';
import useJobStore from '../../../store/jobStore.js';
import { formatDateTime, formatRelativeTime } from '../../../utils/formatters.js';

const TYPE_LABELS = { swap_model: 'Swap Model', image_gen: 'Image Gen', video_gen: 'Video', bulk: 'Bulk' };

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

function ErrorDetail({ job }) {
  const [open, setOpen] = useState(false);
  if (job.status !== 'failed') return null;
  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 500 }}
      >
        <AlertCircle size={12} /> Show error <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--transition-fast)' }} />
      </button>
      {open && (
        <div style={{ marginTop: 6, padding: '10px 12px', background: 'var(--color-error-bg)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', lineHeight: 1.6 }}>
          <strong>Error code:</strong> {job.error_code || 'UNKNOWN'}<br />
          {job.error_message}
        </div>
      )}
    </div>
  );
}

export default function JobHistoryPage() {
  const { user } = useAuthStore();
  const { jobs, cancelJob, updateJob } = useJobStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const userJobs = jobs.filter(j => j.company_id === user?.company_id);

  const filtered = userJobs.filter(j => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false;
    if (typeFilter !== 'all' && j.type !== typeFilter) return false;
    if (search && !j.id.toLowerCase().includes(search.toLowerCase()) && !TYPE_LABELS[j.type]?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleRetry = (job) => {
    updateJob(job.id, { status: 'queued', progress: 0, error_code: null, error_message: null });
  };

  return (
    <div className="page-container" data-section="job-history-page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Job History</h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>All generation jobs — track status, retry failures, cancel queued jobs.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs…"
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', outline: 'none' }}
          />
        </div>
        {[
          { val: statusFilter, set: setStatusFilter, opts: [['all','All status'],['queued','Queued'],['processing','Processing'],['completed','Completed'],['failed','Failed'],['cancelled','Cancelled']] },
          { val: typeFilter, set: setTypeFilter, opts: [['all','All types'],['swap_model','Swap Model'],['image_gen','Image Gen'],['video_gen','Video'],['bulk','Bulk']] },
        ].map((f, i) => (
          <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', background: 'var(--color-background)', color: 'var(--color-text-primary)', cursor: 'pointer', outline: 'none' }}>
            {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* Job list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            No jobs found
          </div>
        ) : filtered.map((job, i) => (
          <div
            key={job.id}
            data-section="job-card"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              padding: '14px 16px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            {/* Status dot */}
            <div style={{
              width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
              background: { queued: '#a3a3a3', processing: '#2563eb', completed: '#16a34a', failed: '#dc2626', cancelled: '#d4d4d4' }[job.status],
            }} className={job.status === 'processing' ? 'pulse' : ''} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{TYPE_LABELS[job.type]}</span>
                <StatusBadge status={job.status} />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{job.id}</span>
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 2 }}>
                {formatDateTime(job.created_at)} · {job.credits_used} credit{job.credits_used !== 1 ? 's' : ''}
              </div>

              {/* Progress bar for processing jobs */}
              {job.status === 'processing' && (
                <div style={{ marginTop: 8, height: 3, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden', width: 200 }}>
                  <div style={{ height: '100%', background: 'var(--color-info)', borderRadius: 2, width: `${job.progress}%`, transition: 'width 0.5s ease' }} />
                </div>
              )}

              <ErrorDetail job={job} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {job.status === 'queued' && (
                <button onClick={() => cancelJob(job.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', fontSize: 'var(--font-size-xs)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                  <X size={12} /> Cancel
                </button>
              )}
              {job.status === 'failed' && (
                <button onClick={() => handleRetry(job)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'transparent', fontSize: 'var(--font-size-xs)', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                  <RefreshCw size={12} /> Retry
                </button>
              )}
              {job.status === 'completed' && job.output_files?.length > 0 && (
                <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--color-action)', fontSize: 'var(--font-size-xs)', cursor: 'pointer', color: 'var(--color-action-text)' }}>
                  <Download size={12} /> Download
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
