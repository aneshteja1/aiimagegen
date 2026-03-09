import React, { useEffect, useState, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import { jobsApi } from '../services/api';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user, credits, setCredits, logout } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const { data } = await jobsApi.getLiveStatus();
      setJobs(data.jobs);
      if (data.credits !== undefined && data.credits !== credits) {
        setCredits(data.credits);
      }
    } catch (err) {
      console.error("Live sync failed:", err);
    } finally {
      setLoading(false);
    }
  }, [credits, setCredits]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000); // Live polling
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) return <div className="dashboard-container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>{user?.role === 'superadmin' ? 'VT Operations Control' : 'Client Workspace'}</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Welcome back, {user?.full_name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="credit-pill">
            <span>Credits:</span>
            <strong style={{ color: '#fff', fontSize: '1.2em' }}>{credits}</strong>
          </div>
          <button onClick={logout} style={{ background: 'transparent', color: '#fff', border: '1px solid var(--color-border)', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
            Log Out
          </button>
        </div>
      </header>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Workflow Stage</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>No jobs found.</td></tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>...{job.id.slice(-8)}</td>
                  <td style={{ textTransform: 'capitalize' }}>{job.type.replace('_', ' ')}</td>
                  <td><span className="status-badge">{job.status}</span></td>
                  <td style={{ textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>{job.workflow_stage.replace(/_/g, ' ')}</td>
                  <td>{job.credits_used}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
