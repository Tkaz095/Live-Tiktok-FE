"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw } from "lucide-react";

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
    <div className="grid grid-cols-1 xl:grid-cols-12 relative z-10 w-full border-b border-white/5 bg-black/20">
      {/* Host Box */}
      <div className="xl:col-span-4 flex flex-col p-4 justify-center xl:border-r border-white/5">
        <h4 className="font-bold text-gray-400 uppercase tracking-widest text-[11px] mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-tiktok-cyan"></span>
          Host
        </h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-tiktok-cyan via-tiktok-pink to-tiktok-yellow shrink-0">
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
            <div>
              <h3 className="font-bold text-base truncate flex items-center gap-2" title={hostNickname}>
                {hostNickname}
                {isLiveEnded && (
                  <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase">OFF</span>
                )}
              </h3>
              <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">Followers: <span className="text-gray-300 font-semibold">{hostFollowers ? formatNumber(hostFollowers) : "---"}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReconnect}
              className="text-gray-400 hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
              title="Tải lại"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-tiktok-pink p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5"
              title="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Box */}
      <div className="xl:col-span-8 flex flex-col p-4 justify-center border-t xl:border-t-0 border-white/5">
        <div className="flex justify-between items-center mb-3 gap-3">
          <h4 className="font-bold text-gray-400 uppercase tracking-widest text-[11px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-tiktok-yellow"></span>
            Thống kê chung
          </h4>
          <div className="text-[10px]">
            {isLiveEnded ? (
              <span className="text-red-500 font-black uppercase tracking-wider bg-red-500/10 px-2 py-1 rounded">LIVE KẾT THÚC</span>
            ) : connected ? (
              <div className="flex items-center gap-1.5 text-tiktok-cyan font-black uppercase tracking-widest animate-pulse bg-tiktok-cyan/10 border border-tiktok-cyan/20 px-2.5 py-1 rounded whitespace-nowrap">
                <div className="w-1.5 h-1.5 rounded-full bg-tiktok-pink shadow-[0_0_8px_rgba(254,44,85,0.6)]" />
                ĐANG PHÁT
              </div>
            ) : (
              <span className="text-gray-500 font-bold uppercase tracking-widest">ĐANG NỐI...</span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
            <span className="text-xl font-black text-white block">{formatNumber(viewers)}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 block">Lượt vào</span>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
            <span className="text-xl font-black text-tiktok-pink block">{formatNumber(displayLikes)}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 block">Lượt like</span>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
            <span className="text-xl font-black text-tiktok-yellow block">{formatNumber(displayCoins)}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 block">Xu (ước tính)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
