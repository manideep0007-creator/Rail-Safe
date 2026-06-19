import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, loginUser, registerUser } from '../api';

const AuthContext = createContext(null);
const tokenKey = 'railsafe_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getProfile();
        if (active) setUser(profile);
      } catch {
        localStorage.removeItem(tokenKey);
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSession();
    return () => {
      active = false;
    };
  }, [token]);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem(tokenKey, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => registerUser(payload);

  const logout = () => {
    localStorage.removeItem(tokenKey);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
