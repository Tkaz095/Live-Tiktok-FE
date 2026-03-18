"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, login as authLogin, SUBSCRIPTION_PLANS, SubscriptionInfo } from "./auth";

const STORAGE_KEY = "tiktok_monitor_user";

interface AuthContextValue {
  user: User | null;
  plan: SubscriptionInfo | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = authLogin(email, password);
    if (!result) return { success: false, error: "Sai email hoặc mật khẩu." };
    setUser(result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const plan = user ? SUBSCRIPTION_PLANS[user.subscription] : null;

  return (
    <AuthContext.Provider value={{ user, plan, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
