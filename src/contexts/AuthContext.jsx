// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const LOCAL_STORAGE_KEY = "auth_user";

export const  AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          setUser(parsed.data);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (err) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    const session = {
      data,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24hr
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
