import React, { createContext, useState, useEffect } from 'react';
import useApi from '../hooks/useApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();

  // Check for token and fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      get('/api/user/profile').then(({ data }) => {
        setUser(data || null);
        if (data && data._id && !localStorage.getItem('userId')) {
          localStorage.setItem('userId', data._id);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [get]);

  const login = (token) => {
    localStorage.setItem('token', token);
    get('/api/user/profile').then(({ data }) => {
      setUser(data);
      if (data && data._id) {
        localStorage.setItem('userId', data._id);
      }
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
} 