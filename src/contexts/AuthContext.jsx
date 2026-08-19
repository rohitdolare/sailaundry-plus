// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();
const LOCAL_STORAGE_KEY = "auth_user";

const readStoredUser = () => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed?.expiresAt && new Date(parsed.expiresAt) > new Date()) {
      return parsed.data;
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  } catch (err) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return null;
  }
};

export const  AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Tracks the uid this tab believes is signed in, so we only notify on a
  // real account switch (not on our own login/logout writes).
  const currentUidRef = useRef(null);

  useEffect(() => {
    const initial = readStoredUser();
    currentUidRef.current = initial?.uid ?? null;
    setUser(initial);
    setLoading(false);

    // Re-sync whenever the session in localStorage changes from under this
    // tab — e.g. another tab/window on the same device logs out and signs
    // into a different account, which silently overwrites the shared key.
    const syncFromStorage = () => {
      const latest = readStoredUser();
      const latestUid = latest?.uid ?? null;
      if (latestUid !== currentUidRef.current) {
        if (currentUidRef.current && latestUid) {
          toast("Signed in as a different account on this device.");
        } else if (currentUidRef.current && !latestUid) {
          toast("You were signed out on this device.");
        }
        currentUidRef.current = latestUid;
        setUser(latest);
      }
    };

    const onStorage = (e) => {
      if (e.key === LOCAL_STORAGE_KEY) syncFromStorage();
    };
    // Covers same-device account switches happening in another tab, and a
    // PWA resumed from background after "some time" whose cached session
    // was replaced while it was suspended.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") syncFromStorage();
    };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", syncFromStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", syncFromStorage);
    };
  }, []);

  const login = (data) => {
    const session = {
      data,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24hr
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
    currentUidRef.current = data?.uid ?? null;
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    currentUidRef.current = null;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
