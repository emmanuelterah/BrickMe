import { useCallback } from 'react';

/**
 * useApi - Centralized API hook for making requests to backend endpoints.
 * Handles token, error, and dynamic URL construction.
 * Usage: const api = useApi(); api.get('/api/user/profile')
 */
export default function useApi() {
  // Helper to get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Generic request
  const request = useCallback(async (url, { method = 'GET', headers = {}, body, formData = false } = {}) => {
    const token = getToken();
    const finalHeaders = { ...headers };
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
    if (!formData && body && !(body instanceof FormData)) {
      finalHeaders['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: formData ? body : body || undefined,
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data };
  }, []);

  // Shorthand methods
  const get = useCallback((url, options = {}) => request(url, { ...options, method: 'GET' }), [request]);
  const post = useCallback((url, body, options = {}) => request(url, { ...options, method: 'POST', body }), [request]);
  const put = useCallback((url, body, options = {}) => request(url, { ...options, method: 'PUT', body }), [request]);
  const del = useCallback((url, options = {}) => request(url, { ...options, method: 'DELETE' }), [request]);

  return { get, post, put, del, request };
} 