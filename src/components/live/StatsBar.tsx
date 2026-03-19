"use client";

import { Users, Heart } from "lucide-react";

interface StatsBarProps {
  viewers: number;
  displayLikes: number;
  connected: boolean;
  isConnectingTiktok: boolean;
  error: string | null;
  formatNumber: (n: number) => string;
}

export default function StatsBar({
  viewers,
  displayLikes,
  connected,
  isConnectingTiktok,
  error,
  formatNumber,
}: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 divide-x divide-tiktok-border/50 border-b border-tiktok-border p-3 bg-[#181818] relative z-10">
      <div className="flex flex-col items-center justify-center space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users size={14} className="text-tiktok-cyan" />
          Người xem
        </div>
        {isConnectingTiktok ? (
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 animate-pulse mt-1">Đang tải...</span>
          </div>
        ) : error ? (
          <span className="text-red-500 text-[10px] text-center px-1 font-medium">-</span>
        ) : connected ? (
          <span className="text-tiktok-cyan font-bold text-lg">{formatNumber(viewers)}</span>
        ) : (
          <div className="w-12 h-5 rounded-md bg-[#333] animate-pulse" />
        )}
      </div>
      <div className="flex flex-col items-center justify-center space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Heart size={14} className="text-tiktok-pink" />
          Tim
        </div>
        {isConnectingTiktok ? (
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 animate-pulse mt-1">Đang tải...</span>
          </div>
        ) : error ? (
          <span className="text-red-500 text-[10px] text-center px-1 font-medium">-</span>
        ) : connected ? (
          <span className="text-tiktok-pink font-bold text-lg">{formatNumber(displayLikes)}</span>
        ) : (
          <div className="w-12 h-5 rounded-md bg-[#333] animate-pulse" />
        )}
      </div>
    </div>
  );
}
