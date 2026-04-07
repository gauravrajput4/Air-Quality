import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchAccessContext, loginUser, setAuthToken } from '../services/api';

const STORAGE_KEY = 'air_quality_auth_session';
const AccessContext = createContext(null);

export function AccessControlProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { token: '', user: null };
    } catch {
      return { token: '', user: null };
    }
  });
  const [loading, setLoading] = useState(Boolean(session.token));

  useEffect(() => {
    setAuthToken(session.token || '');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    if (!session.token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchAccessContext()
      .then((user) => setSession((prev) => ({ ...prev, user })))
      .catch(() => setSession({ token: '', user: null }))
      .finally(() => setLoading(false));
  }, [session.token]);

  const value = useMemo(
    () => ({
      token: session.token,
      user: session.user,
      loading,
      isAuthenticated: Boolean(session.token && session.user),
      login: async (username, password) => {
        const response = await loginUser({ username, password });
        setSession({ token: response.token, user: response.user });
        return response.user;
      },
      logout: () => setSession({ token: '', user: null }),
    }),
    [loading, session]
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccessControl() {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error('useAccessControl must be used within AccessControlProvider');
  }
  return context;
}

