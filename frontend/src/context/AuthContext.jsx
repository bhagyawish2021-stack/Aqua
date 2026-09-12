import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Aqua Farmer',
  email: 'farmer@aquamitra.com',
  phone: '+91 98765 43210',
  language: 'en',
};

const DEFAULT_TOKEN = 'demo-token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);
  const [token, setToken] = useState(() => localStorage.getItem('aqm_token') || DEFAULT_TOKEN);
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    // Kept for compatibility, but maintains logged-in state
    localStorage.removeItem('aqm_token');
    setUser(DEFAULT_USER);
    setToken(DEFAULT_TOKEN);
    api.defaults.headers.common['Authorization'] = 'Bearer ' + DEFAULT_TOKEN;
  }, []);

  useEffect(() => {
    const currentToken = token || DEFAULT_TOKEN;
    api.defaults.headers.common['Authorization'] = 'Bearer ' + currentToken;
    api.get('/api/profile')
      .then(res => {
        if (res.data?.data) setUser(res.data.data);
      })
      .catch(() => {
        // Keep default user if backend is offline or profile not found
      });
  }, [token]);

  function login(newToken, userData) {
    const t = newToken || DEFAULT_TOKEN;
    localStorage.setItem('aqm_token', t);
    api.defaults.headers.common['Authorization'] = 'Bearer ' + t;
    setToken(t);
    if (userData) setUser(userData);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
