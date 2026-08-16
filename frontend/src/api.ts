import axios from 'axios';
import { supabase } from './lib/supabase';

// Setup base instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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



// Response interceptor to handle Render free-tier cold starts gracefully
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (
      config &&
      !config._retry &&
      (error.code === 'ECONNABORTED' || error.response?.status === 504 || !error.response)
    ) {
      config._retry = true;
      // Wait 2.5s for Render free-tier instance cold start
      await new Promise((resolve) => setTimeout(resolve, 2500));
      return api(config);
    }
    return Promise.reject(error);
  }
);

