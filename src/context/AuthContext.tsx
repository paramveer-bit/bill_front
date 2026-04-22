"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import api, { setTokenGetter, setRefreshFn } from "@/lib/api";

export interface User {
  name: string;
  email: string;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  role: string;
}
const BASE = process.env.NEXT_PUBLIC_BASEURL;
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  verifyEmail: (otp: string, userId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  // Keep ref in sync for the axios interceptor
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await axios.get(`${BASE}/auth/refresh`, {
        withCredentials: true,
      });
      const { accessToken: newToken, user: newUser } = res.data.data;
      setAccessToken(newToken);
      setUser(newUser);
      accessTokenRef.current = newToken;
      return newToken;
    } catch {
      setAccessToken(null);
      setUser(null);
      accessTokenRef.current = null;
      return null;
    }
  }, []);

  // Wire up interceptors once on mount
  useEffect(() => {
    setTokenGetter(() => accessTokenRef.current);
    setRefreshFn(refreshAccessToken);
  }, [refreshAccessToken]);
  // Restore session on mount
  useEffect(() => {
    refreshAccessToken().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await axios.post(
      `${BASE ?? ""}/auth/login`,
      { email, password },
      { withCredentials: true },
    );
    const { accessToken: newToken, user: newUser } = res.data.data;
    setAccessToken(newToken);
    setUser(newUser);
    accessTokenRef.current = newToken;
  }, []);

  const verifyEmail = useCallback(async (otp: string, userId: string) => {
    const res = await axios.post(
      `${BASE ?? ""}/auth/otp/verify`,
      { otp, id: userId },
      { withCredentials: true },
    );
    const { accessToken: newToken, user: newUser } = res.data.data;
    setAccessToken(newToken);
    setUser(newUser);
    accessTokenRef.current = newToken;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post(`${BASE}/auth/logout`, {}, { withCredentials: true });
    } finally {
      setAccessToken(null);
      setUser(null);
      accessTokenRef.current = null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        verifyEmail,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
