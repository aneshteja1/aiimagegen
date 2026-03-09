import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: attach access token ──────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aifs_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response Interceptor: silent token refresh ────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 401 && code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('aifs_refresh_token');

      try {
        const { data } = await axios.post(`${BASE}/api/auth/refresh`, { refreshToken });
        localStorage.setItem('aifs_access_token', data.accessToken);
        localStorage.setItem('aifs_refresh_token', data.refreshToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('aifs_access_token');
        localStorage.removeItem('aifs_refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  login:         (data) => api.post('/auth/login', data),
  register:      (data) => api.post('/auth/register', data),
  logout:        (data) => api.post('/auth/logout', data),
  refresh:       (data) => api.post('/auth/refresh', data),
  forgotPassword:(data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  me:            ()     => api.get('/auth/me'),
};

// ── Users ─────────────────────────────────────────────────────
export const usersApi = {
  list:       () => api.get('/users'),
  updateStatus:(id, status) => api.patch(`/users/${id}/status`, { status }),
  updateRole:  (id, role)   => api.patch(`/users/${id}/role`, { role }),
  delete:      (id)          => api.delete(`/users/${id}`),
};

// ── Companies ─────────────────────────────────────────────────
export const companiesApi = {
  list:   ()           => api.get('/companies'),
  get:    (id)         => api.get(`/companies/${id}`),
  create: (data)       => api.post('/companies', data),
  update: (id, data)   => api.patch(`/companies/${id}`, data),
};

// ── Avatars ───────────────────────────────────────────────────
export const avatarsApi = {
  list:        ()         => api.get('/avatars'),
  listAll:     ()         => api.get('/avatars/all'),
  updateStatus:(id, s)    => api.patch(`/avatars/${id}/status`, { status: s }),
};

// ── Jobs ──────────────────────────────────────────────────────
export const jobsApi = {
  list:   (params) => api.get('/jobs', { params }),
  get:    (id)     => api.get(`/jobs/${id}`),
  cancel: (id)     => api.patch(`/jobs/${id}/cancel`),
};

// ── Credits ───────────────────────────────────────────────────
export const creditsApi = {
  balance:      ()     => api.get('/credits/balance'),
  transactions: ()     => api.get('/credits/transactions'),
  allocate:     (data) => api.post('/credits/allocate', data),
};

// ── Generate ──────────────────────────────────────────────────
export const generateApi = {
  image:     (data) => api.post('/generate/image', data),
  video:     (data) => api.post('/generate/video', data),
  swapModel: (data) => api.post('/generate/swap-model', data),
  bulk:      (data) => api.post('/generate/bulk', data),
};

// ── Payments ──────────────────────────────────────────────────
export const paymentsApi = {
  createCheckout:  (plan)   => api.post('/payments/create-checkout', { plan }),
  getSubscription: ()        => api.get('/payments/subscription'),
};
