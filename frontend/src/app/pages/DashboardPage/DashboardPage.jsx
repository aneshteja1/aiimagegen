import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user, accessToken } = useAuthStore();
  const [liveData, setLiveData] = useState({ jobs: [], credits: 0 });

  // 1. Live Data Polling mechanism
  useEffect(() => {
    const fetchLiveStatus = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/live-status`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLiveData(data);
        }
      } catch (err) {
        console.error("Failed to fetch live data");
      }
    };

    fetchLiveStatus(); // Initial fetch
    const interval = setInterval(fetchLiveStatus, 5000); // Poll every 5 seconds for "live" feel

    return () => clearInterval(interval);
  }, [accessToken]);

  // 2. Client Approval Function [cite: 51]
  const handleClientApprove = async (jobId) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}/approve`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}` 
      },
      body: JSON.stringify({ action: 'client_approve' })
    });
    // The polling will automatically update the UI on the next tick
  };

  return (
    <div className="dashboard-layout">
      <header>
        <h1>{user.role === 'superadmin' ? 'VT Studio Admin' : 'Client Workspace'}</h1>
        <div className="credit-badge">
          Credits Remaining: <strong>{liveData.credits}</strong>
        </div>
      </header>

      <div className="job-queue">
        <h2>Active Generations</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Cost</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {liveData.jobs.map(job => (
              <tr key={job.id}>
                <td>{job.id.substring(0, 8)}...</td>
                <td>{job.type}</td>
                <td>
                  <span className={`status-badge ${job.status}`}>{job.status}</span>
                </td>
                <td>{job.credits_used}</td>
                <td>
                  {job.status === 'pending_approval' && user.role !== 'superadmin' && (
                    <button onClick={() => handleClientApprove(job.id)}>Approve Final</button>
                  )}
                  {job.status === 'pending_retouch' && user.role === 'superadmin' && (
                    <button onClick={() => console.log('Admin opens retouch tool')}>Retouch</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
