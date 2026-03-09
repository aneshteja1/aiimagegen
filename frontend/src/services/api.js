const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('aifs_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // VERCEL FIX: Prevent double-slashes (e.g., https://domain.com//api/...)
  const baseUrl = (API_URL || '').replace(/\/$/, ''); // Removes trailing slash if it exists
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Execute the fetch with the cleaned URL
  const response = await fetch(`${baseUrl}${cleanEndpoint}`, { ...options, headers });
  const data = await response.json();
  
  if (!response.ok) throw data;
  return { data };
}

export const authApi = {
  login: (credentials) => fetchWithAuth('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
};

export const jobsApi = {
  getLiveStatus: () => fetchWithAuth('/api/jobs/live-status', { method: 'GET' }),
  generateBulk: (payload) => fetchWithAuth('/api/jobs/bulk-generate', { method: 'POST', body: JSON.stringify(payload) }),
};
