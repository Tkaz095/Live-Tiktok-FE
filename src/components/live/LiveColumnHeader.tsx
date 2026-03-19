"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Wifi, WifiOff, Coins, BarChart2 } from "lucide-react";

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
}: LiveColumnHeaderProps) {
  return (
    <div className="flex flex-col border-b border-tiktok-border/50 relative z-10 bg-tiktok-card/90">
      {/* Action Bar Row */}
      <div className="px-3 py-1 flex items-center justify-end gap-2 bg-black/40 border-b border-white/5">
        <button
          onClick={onShowStats}
          className="text-gray-500 hover:text-tiktok-cyan p-1 transition-colors"
          title="Xem thống kê phiên Live"
        >
          <BarChart2 size={14} />
        </button>
        <button
          onClick={onReconnect}
          className="text-gray-500 hover:text-white p-1 transition-colors"
          title="Tải lại kết nối"
        >
          <RefreshCw size={14} />
        </button>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-tiktok-pink p-1 transition-colors"
          title="Đóng thẻ"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Profile Row */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-tiktok-cyan via-tiktok-pink to-tiktok-yellow shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt={username}
            className="w-full h-full rounded-full border-2 border-tiktok-card object-cover bg-[#111]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="font-bold text-base truncate flex items-center gap-2" title={hostNickname}>
              {hostNickname}{" "}
              {isLiveEnded && (
                <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded ml-1 uppercase">Ngoại tuyến</span>
              )}
            </h3>
            <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse shrink-0" title="LIVE" />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
            <span className="text-gray-400 truncate w-auto max-w-[120px]">@{username}</span>
            {hostFollowers !== null && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 whitespace-nowrap">{formatNumber(hostFollowers)} Người theo dõi</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
            <Coins size={12} className="text-tiktok-yellow" />
            <span>Tổng xu:</span>
            <span className="text-tiktok-yellow font-medium">{formatNumber(displayCoins)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
            {isLiveEnded ? (
              <>
                <WifiOff size={10} className="text-red-500" />
                <span className="text-red-500">phiên LIVE đã kết thúc</span>
              </>
            ) : error ? (
              <>
                <WifiOff size={10} className="text-red-500" />
                <span className="text-red-500 truncate max-w-[150px]" title={error}>{error}</span>
              </>
            ) : connected ? (
              <motion.div
                key={syncCount}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5"
              >
                <Wifi size={10} className="text-tiktok-cyan" />
                <span className="text-gray-300">{isConnectingTiktok ? "LIVE • Đang tải dữ liệu..." : "LIVE • Đã kết nối"}</span>
              </motion.div>
            ) : (
              <>
                <WifiOff size={10} className="text-gray-500" />
                <span className="text-gray-500">Đang kết nối tới Live...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
