import { create } from 'zustand';
import { MOCK_JOBS } from '../services/mock/jobs.mock.js';

const useJobStore = create((set, get) => ({
  jobs: MOCK_JOBS,

  addJob: (job) => set(s => ({ jobs: [job, ...s.jobs] })),

  updateJob: (id, updates) => set(s => ({
    jobs: s.jobs.map(j => j.id === id ? { ...j, ...updates } : j),
  })),

  cancelJob: (id) => set(s => ({
    jobs: s.jobs.map(j => j.id === id ? { ...j, status: 'cancelled' } : j),
  })),

  getJobsByCompany: (companyId) => get().jobs.filter(j => j.company_id === companyId),
  getJobsByUser: (userId) => get().jobs.filter(j => j.user_id === userId),
  getRecentJobs: (companyId, limit = 5) =>
    get().jobs.filter(j => j.company_id === companyId).slice(0, limit),
}));

export default useJobStore;
