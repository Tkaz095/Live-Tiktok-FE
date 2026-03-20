"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Wifi, WifiOff, Coins, BarChart2, Users, Heart } from "lucide-react";

interface LiveColumnHeaderProps {
  username: string;
  hostNickname: string;
  hostFollowers: number | null;
  isLiveEnded: boolean;
  connected: boolean;
  isConnectingTiktok: boolean;
  error: string | null;
  syncCount: number;
  displayCoins: number;
  avatar: string;
  onReconnect: () => void;
  onClose: () => void;
  onShowStats: () => void;
  formatNumber: (n: number) => string;
  viewers: number;
  displayLikes: number;
}

export default function LiveColumnHeader({
  username,
  hostNickname,
  hostFollowers,
  isLiveEnded,
  connected,
  isConnectingTiktok,
  error,
  syncCount,
  displayCoins,
  avatar,
  onReconnect,
  onClose,
  onShowStats,
  formatNumber,
  viewers,
  displayLikes,
}: LiveColumnHeaderProps) {
  return (
    <div className="flex flex-col border-b border-tiktok-border/50 relative z-10 bg-tiktok-card/90">
      {/* Mini Header Row (Title & Actions) */}
      <div className="px-3 py-2 flex items-center justify-between bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-tiktok-cyan via-tiktok-pink to-tiktok-yellow shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={username}
              className="w-full h-full rounded-full border-2 border-tiktok-card object-cover bg-[#111]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(username)}&backgroundColor=0d1117`;
              }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate flex items-center gap-2" title={hostNickname}>
              {hostNickname}
              {isLiveEnded && (
                <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase">OFF</span>
              )}
            </h3>
            <p className="text-xs text-white truncate opacity-70 leading-tight">@{username}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowStats}
            className="text-white hover:text-tiktok-cyan p-1.5 transition-colors"
            title="Thống kê"
          >
            <BarChart2 size={16} />
          </button>
          <button
            onClick={onReconnect}
            className="text-white hover:text-white p-1.5 transition-colors"
            title="Tải lại"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-tiktok-pink p-1.5 transition-colors"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Stats & Status Row */}
      <div className="px-3 py-2 flex items-center justify-between bg-[#111]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-tiktok-cyan font-bold" title="Người xem">
            <Users size={14} />
            <span className="text-white">{formatNumber(viewers)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-tiktok-pink font-bold" title="Tim">
            <Heart size={14} />
            <span className="text-white">{formatNumber(displayLikes)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-tiktok-yellow font-bold" title="Tổng xu">
            <Coins size={14} />
            <span>{formatNumber(displayCoins)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          {isLiveEnded ? (
            <span className="text-red-500 font-black uppercase tracking-wider">LIVE KẾT THÚC</span>
          ) : connected ? (
            <div className="flex items-center gap-1.5 text-tiktok-cyan font-black uppercase tracking-widest animate-pulse">
              <div className="w-2 h-2 rounded-full bg-tiktok-pink shadow-[0_0_8px_rgba(254,44,85,0.6)]" />
              LIVE
            </div>
          ) : (
            <span className="text-gray-500 font-bold uppercase tracking-widest">ĐANG NỐI...</span>
          )}
        </div>
      </div>
    </div>
  );
}
