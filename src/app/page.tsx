"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LiveColumn from "@/components/LiveColumn";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

const STORAGE_KEY = "followedUsers";

export default function Home() {
  const router = useRouter();
  const { user, plan, isLoading } = useAuth();

  // Auth guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Load persisted list from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const apiKey = localStorage.getItem('api_key');
    if (!token && !apiKey) {
      router.push('/login');
    }
  }, [router]);

  const [activeLives, setActiveLives] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const parsed: string[] = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeLives));
  }, [activeLives]);

  const handleJoin = (username: string) => {
    if (!username || !plan) return;
    setActiveLives(prev => {
      if (prev.includes(username)) return prev;
      // Enforce subscription column limit
      const maxCols = plan.maxColumns;
      if (maxCols !== -1 && prev.length >= maxCols) {
        return prev; // silently reject — Navbar shows alert
      }
      return [username, ...prev];
    });
  };

  const handleClose = (username: string) => {
    setActiveLives(prev => prev.filter(u => u !== username));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-tiktok-cyan/30 border-t-tiktok-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-black text-white font-sans">
      <Navbar
        onJoin={handleJoin}
        activeCount={activeLives.length}
      />

      {/* Main Container */}
      <main className="flex-1 overflow-x-hidden md:overflow-x-auto overflow-y-auto md:overflow-y-hidden bg-[#0a0a0a]">
        <div className="h-full p-4 flex flex-col md:flex-row gap-4 md:min-w-max items-center md:items-start">
          <AnimatePresence mode="popLayout">
            {activeLives.map((username) => (
              <LiveColumn
                key={username}
                username={username}
                onClose={handleClose}
              />
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {activeLives.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4 mt-20">
              <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center border border-[#333]">
                <span className="text-2xl text-gray-400">+</span>
              </div>
              <p>Chưa có luồng Live nào. Hãy dán link và tham gia!</p>
              {plan && plan.maxColumns !== -1 && (
                <p className="text-xs text-gray-600">
                  Gói <span style={{ color: plan.color }} className="font-bold">{plan.badge} {plan.label}</span>: tối đa {plan.maxColumns} luồng đồng thời.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
