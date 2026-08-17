import axios from 'axios';
import { supabase } from './lib/supabase';

// Normalize base API URL to ensure /api suffix and no trailing slash
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000/api';
  const cleaned = envUrl.trim().replace(/\/+$/, '');
  if (cleaned.endsWith('/api')) return cleaned;
  return `${cleaned}/api`;
};

// Setup base instance
export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Supabase JWT token or Demo token
api.interceptors.request.use(async (config) => {
  const demoToken = localStorage.getItem('demo_token');
  const demoEmail = localStorage.getItem('demo_email');
  if (demoToken) {
    config.headers.Authorization = `Bearer ${demoToken}`;
    if (demoEmail) {
      config.headers['x-demo-email'] = demoEmail;
    }
    return config;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});



// Response interceptor to handle Render free-tier cold starts gracefully (up to 2 retries)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    const retryCount = (config as any)._retryCount || 0;
    if (
      retryCount < 2 &&
      (error.code === 'ECONNABORTED' || error.response?.status === 504 || !error.response)
    ) {
      (config as any)._retryCount = retryCount + 1;
      const delay = (retryCount + 1) * 2500;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }
    return Promise.reject(error);
  }
);

