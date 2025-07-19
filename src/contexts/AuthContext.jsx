import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const LOCAL_STORAGE_KEY = "auth_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🔄

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
          setUser(parsed.data);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (err) {
        console.error("❌ Failed to parse localStorage:", err);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    setLoading(false); // ✅ Finish loading after checking
  }, []);

  const login = (userData) => {
    const dataToStore = {
      data: {
        name: userData.name,
        mobile: userData.mobile,
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    setUser(dataToStore.data);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
