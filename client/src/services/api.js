import axios from 'axios';
import { supabase } from './supabase.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000 // 2 minutes for long translation/TTS tasks
});

// Request interceptor to attach JWT token or guest token
api.interceptors.request.use(async (config) => {
  // 1. Check guest user first
  const guestUser = localStorage.getItem('voiceforge_guest_user');
  if (guestUser) {
    try {
      const parsed = JSON.parse(guestUser);
      config.headers.Authorization = `Bearer ${parsed.id || 'guest_user_active'}`;
      return config;
    } catch (_) {}
  }

  // 2. Check Supabase session
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }
    } catch (_) {}
  }

  // 3. Fallback demo token
  const storedDemoUser = localStorage.getItem('voiceforge_demo_user');
  if (storedDemoUser) {
    config.headers.Authorization = 'Bearer demo_session_active';
  }

  return config;
}, (error) => Promise.reject(error));

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data?.error || {};
    const formattedError = new Error(errorData.message || error.message || 'Network request failed');
    formattedError.code = errorData.code || 'UNKNOWN_ERROR';
    formattedError.status = error.response?.status || 500;
    formattedError.details = errorData.details;
    formattedError.provider = errorData.provider;
    return Promise.reject(formattedError);
  }
);
