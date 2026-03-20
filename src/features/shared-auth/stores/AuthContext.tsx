"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, SUBSCRIPTION_PLANS, SubscriptionInfo } from "../types/auth.types";
import { API_BASE } from "../api/authApi";

const STORAGE_KEY = "tiktok_monitor_user";

interface AuthContextValue {
  user: User | null;
  plan: SubscriptionInfo | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string; role_id?: number }>;
  logout: () => void;
  getToken: () => string | null;
  updateSubscription: (maxLiveSlots: number) => void;
  downgradeTimer: number | null;
  setDowngradeTimer: (timer: number | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [downgradeTimer, setDowngradeTimer] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameOrEmail, password })
      });
      const data = await res.json();
      
      if (data.success) {
        const role_id = data.user.role_id;
        const mappedUser: User = {
          id: data.user.id.toString(),
          name: data.user.full_name || data.user.username,
          email: data.user.email,
          avatar: `https://api.dicebear.com/8.x/thumbs/svg?seed=${data.user.username}&backgroundColor=0d1117`,
          role_id,
          subscription: role_id === 1 ? 'pro' : 'free'
        };
        setUser(mappedUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser));
        localStorage.setItem("token", data.token);
        return { success: true, role_id };
      }
      return { success: false, error: data.error || "Sai tài khoản hoặc mật khẩu." };
    } catch (err) {
      return { success: false, error: "Lỗi kết nối máy chủ." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("token");
  };

  const getToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // Called after successful subscription purchase to update local plan
  const updateSubscription = (maxLiveSlots: number) => {
    if (!user) return;
    let newSub: "free" | "plus" | "pro" = "free";
    if (maxLiveSlots >= 15) newSub = "pro";
    else if (maxLiveSlots >= 5) newSub = "plus";
    const updated = { ...user, subscription: newSub };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const plan = user ? SUBSCRIPTION_PLANS[user.subscription] : null;

  return (
    <AuthContext.Provider value={{ user, plan, isLoading, login, logout, getToken, updateSubscription, downgradeTimer, setDowngradeTimer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
