"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import LiveColumn from "@/components/LiveColumn";
import { AnimatePresence } from "framer-motion";

const STORAGE_KEY = "followedUsers";

export default function Home() {
  const [activeLives, setActiveLives] = useState<string[]>([]);

  // Load persisted list from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setActiveLives(parsed);
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  // Persist to localStorage whenever list changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeLives));
  }, [activeLives]);

  const handleJoin = (username: string) => {
    if (!username) return;
    setActiveLives(prev => {
      // Prevent duplicate columns for the same username
      if (prev.includes(username)) return prev;
      return [username, ...prev];
    });
  };

  const handleClose = (username: string) => {
    setActiveLives(prev => prev.filter(u => u !== username));
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-black text-white font-sans">
      <Navbar onJoin={handleJoin} activeCount={activeLives.length} />

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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
