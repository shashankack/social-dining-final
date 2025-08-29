/* @refresh reload */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  apiFetch,
  clearAccessToken,
  setAccessToken,
  getAccessToken,
} from "./api";

const AuthContext = createContext({
  user: null,
  loading: true,
  setUser: () => {},
  login: async () => {}, // email, password
  register: async () => {}, // name, email, password
  // aliases for compatibility:
  signin: async () => {},
  signup: async () => {},
  signout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap only if we already have an access token
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = getAccessToken();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const me = await apiFetch("/auth/me");
        if (!cancelled) setUser(me || null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ point to /auth/signin
  const login = async (email, password) => {
    const res = await apiFetch("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res?.accessToken) {
      setAccessToken(res.accessToken);
      setUser(res.user || null);
    }
    return res;
  };

  // ✅ point to /auth/signup  (your server also aliases /auth/register to the same)
  const register = async (name, email, password) => {
    const res = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (res?.accessToken) {
      setAccessToken(res.accessToken);
      setUser(res.user || null);
    }
    return res;
  };

  const signout = async () => {
    try {
      await apiFetch("/auth/signout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      setAccessToken,
      login,
      register,
      // aliases so older code using signin/signup still works
      signin: login,
      signup: register,
      signout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
