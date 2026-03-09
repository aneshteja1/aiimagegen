import { create } from 'zustand';
import { MOCK_COMPANIES } from '../services/mock/companies.mock';

const useCompanyStore = create((set, get) => ({
  companies: MOCK_COMPANIES,
  activeCompanyId: null,

  setActiveCompany: (id) => set({ activeCompanyId: id }),

  getActiveCompany: () => {
    const { companies, activeCompanyId } = get();
    return companies.find(c => c.id === activeCompanyId) || null;
  },

  getCompanyById: (id) => get().companies.find(c => c.id === id) || null,
}));

export default useCompanyStore;
