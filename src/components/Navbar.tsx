"use client";

import { Plus, LogOut, Zap, Crown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { SUBSCRIPTION_PLANS } from "@/lib/auth";

export default function Navbar({
  onJoin,
  activeCount = 0,
}: {
  onJoin?: (username: string) => void;
  activeCount?: number;
}) {
  const router = useRouter();
  const { user, plan, logout } = useAuth();
  const [url, setUrl] = useState("");
  const [limitHit, setLimitHit] = useState(false);

  const handleJoin = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // Enforce column limit
    if (plan && plan.maxColumns !== -1 && activeCount >= plan.maxColumns) {
      setLimitHit(true);
      setTimeout(() => setLimitHit(false), 3000);
      return;
    }

    let username = "";
    const match = trimmed.match(/tiktok\.com\/@([a-zA-Z0-9_.]+)/);
    if (match && match[1]) {
      username = match[1];
    } else if (trimmed.startsWith("@")) {
      username = trimmed.slice(1);
    } else {
      username = trimmed;
    }

    if (onJoin && username) {
      onJoin(username);
    }
    setUrl("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleJoin();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const PlanIcon = plan?.tier === "pro" ? Crown : plan?.tier === "plus" ? Zap : null;

  return (
    <header className="h-[70px] border-b border-tiktok-border bg-tiktok-dark flex items-center justify-between px-6 shrink-0 z-10 w-full relative">
      {/* Brand */}
      <div className="flex items-center gap-3 w-[220px] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(37,244,238,0.2)]">
          TT
        </div>
        <h1 className="text-white font-bold text-lg tracking-tight">
          TikTok <span className="text-tiktok-cyan">Live</span> Monitor
        </h1>
      </div>

      {/* Center Input Form */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-3xl px-8 gap-1">
        <div className="flex items-center gap-3 w-full">
          <div className="relative w-full flex-1 group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Dán link TikTok Live hoặc @username..."
              className="w-full bg-[#1b1b1b] border border-tiktok-border rounded-full py-2.5 px-5 text-sm focus:outline-none focus:border-tiktok-cyan transition-colors text-white placeholder-gray-500 hover:border-[#444]"
            />
          </div>
          <button
            onClick={handleJoin}
            className="bg-tiktok-pink hover:bg-[#e0264c] text-white px-6 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all shrink-0 shadow-[0_0_10px_rgba(254,44,85,0.3)] hover:shadow-[0_0_20px_rgba(254,44,85,0.6)]"
          >
            <Plus size={18} strokeWidth={2.5} />
            Tham gia
          </button>
        </div>
        <AnimatePresence>
          {limitHit && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-tiktok-yellow"
            >
              ⚠️ Gói {plan?.label} chỉ hỗ trợ tối đa {plan?.maxColumns} luồng. <a href="/register" className="underline">Nâng cấp</a> để xem nhiều hơn.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Right — User Info */}
      <div className="flex items-center gap-3 w-[220px] shrink-0 justify-end">
        {/* Column counter */}
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-[10px]">Đang theo dõi</span>
          <span className="text-tiktok-cyan font-bold text-xl leading-none">
            {activeCount}
          </span>
        </div>

        {/* Subscription Badge */}
        {plan && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-bold shrink-0"
            style={{
              color: plan.color,
              borderColor: `${plan.color}50`,
              backgroundColor: `${plan.color}15`,
            }}
          >
            {PlanIcon && <PlanIcon size={11} />}
            {plan.badge} {plan.label}
          </div>
        )}

        {/* User Avatar + Logout */}
        {user && (
          <div className="flex items-center gap-2">
            <img
              src={user.avatar}
              alt={user.name}
              title={user.name}
              className="w-8 h-8 rounded-full border border-[#333] shrink-0"
            />
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="text-gray-500 hover:text-tiktok-pink transition-colors p-1 rounded-md"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
