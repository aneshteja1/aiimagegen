import { create } from 'zustand';
import { authApi, creditsApi } from '../services/api.js';

const useAuthStore = create((set, get) => ({
  user: null,
  credits: 0,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem('aifs_access_token');
    if (!token) return set({ isLoading: false });
    try {
      const { data } = await authApi.me();
      set({ 
        user: data, 
        credits: data.credit_balance ?? 0, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch {
      localStorage.removeItem('aifs_access_token');
      localStorage.removeItem('aifs_refresh_token');
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('aifs_access_token', data.accessToken);
    localStorage.setItem('aifs_refresh_token', data.refreshToken);
    set({ 
      user: data.user, 
      credits: data.user.credit_balance ?? 0, 
      isAuthenticated: true 
    });
    return data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('aifs_refresh_token');
    try { await authApi.logout({ refreshToken }); } catch { /* ignore */ }
    localStorage.removeItem('aifs_access_token');
    localStorage.removeItem('aifs_refresh_token');
    set({ user: null, credits: 0, isAuthenticated: false });
  },

  register:      (data)            => authApi.register(data),
  forgotPassword:(email)           => authApi.forgotPassword({ email }),
  resetPassword: (token, password) => authApi.resetPassword({ token, password }),
  setCredits:    (n)               => set({ credits: n }),

  refreshCredits: async () => {
    try {
      const { data } = await creditsApi.balance();
      set({ credits: data.balance });
    } catch { /* ignore */ }
  },

  // Role helpers
  isSuperAdmin:   () => get().user?.role === 'superadmin',
  isCompanyAdmin: () => ['company_admin', 'superadmin'].includes(get().user?.role),
  isPending:      () => get().user?.status === 'pending',
  isRejected:     () => get().user?.status === 'rejected',
  isApproved:     () => get().user?.status === 'approved',
}));

export default useAuthStore;
