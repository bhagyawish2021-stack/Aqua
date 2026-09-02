import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Guard: treat literal "undefined" / "null" strings as no token (artefact of a broken earlier login)
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('aqm_token');
    if (!t || t === 'undefined' || t === 'null') {
      localStorage.removeItem('aqm_token');
      return null;
    }
    return t;
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('aqm_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      api.get('/api/profile')
        .then(res => setUser(res.data.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, logout]);

  function login(newToken, userData) {
    if (!newToken || newToken === 'undefined') {
      console.error('AuthContext.login: invalid token received', newToken);
      return;
    }
    localStorage.setItem('aqm_token', newToken);
    api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
    setToken(newToken);
    setUser(userData);
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
