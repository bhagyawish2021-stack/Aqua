import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Aqua Farmer',
  email: 'farmer@aquamitra.com',
  phone: '+91 98765 43210',
  language: 'en',
  role: 'farmer',
};

const DEFAULT_TOKEN = 'demo-token';

export function AuthProvider({ children }) {
  // If user previously logged out, honor null; otherwise default to demo token
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('aqm_token');
    if (stored === 'logged_out') return null;
    return stored || DEFAULT_TOKEN;
  });

  const [user, setUser] = useState(() => (token ? DEFAULT_USER : null));
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    localStorage.setItem('aqm_token', 'logged_out');
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const login = useCallback((newToken, userData) => {
    const t = newToken || DEFAULT_TOKEN;
    localStorage.setItem('aqm_token', t);
    api.defaults.headers.common['Authorization'] = 'Bearer ' + t;
    setToken(t);
    if (userData) {
      setUser({ ...DEFAULT_USER, ...userData });
    } else {
      setUser(DEFAULT_USER);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    api.get('/api/profile')
      .then(res => {
        if (res.data?.data) {
          setUser(prev => ({ ...prev, ...res.data.data }));
        }
      })
      .catch(() => {
        // Retain current user if backend profile is offline
      });
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
