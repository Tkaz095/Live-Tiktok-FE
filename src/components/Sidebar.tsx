"use client";

import { Radio, X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  activeLives: string[];
  onSelect: (username: string) => void;
  onRemove: (username: string) => void;
}

export default function Sidebar({ activeLives, onSelect, onRemove }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`h-full shrink-0 border-r border-[#1e1e1e] bg-[#0d0d0d] flex flex-col transition-all duration-300 ${
        collapsed ? "w-[52px]" : "w-[260px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-[48px] border-b border-[#1e1e1e] shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-tiktok-pink" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">
              Đang theo dõi
            </span>
            <span className="bg-tiktok-cyan/15 text-tiktok-cyan text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {activeLives.length}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="text-gray-500 hover:text-white transition p-1 rounded-md hover:bg-white/5"
          title={collapsed ? "Mở sidebar" : "Thu gọn"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
        {collapsed ? (
          /* Collapsed: show avatars only */
          <div className="flex flex-col items-center gap-1 pt-2">
            {activeLives.map((username) => (
              <button
                key={username}
                onClick={() => onSelect(username)}
                title={`@${username}`}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-tiktok-cyan/20 to-tiktok-pink/20 border border-[#2a2a2a] flex items-center justify-center text-[11px] font-bold text-white/80 hover:border-tiktok-cyan transition-all hover:scale-105"
              >
                {username.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        ) : (
          /* Expanded: full list */
          <AnimatePresence>
            {activeLives.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-600 text-xs">Chưa theo dõi ai.</p>
                <p className="text-gray-700 text-[10px] mt-1">Dán link TikTok ở thanh trên để bắt đầu.</p>
              </div>
            )}
            {activeLives.map((username) => (
              <motion.div
                key={username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer border-b border-[#1a1a1a] last:border-0"
                onClick={() => onSelect(username)}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tiktok-cyan/30 to-tiktok-pink/30 border border-[#333] flex items-center justify-center text-[11px] font-bold text-white/80 shrink-0">
                  {username.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 font-medium truncate">
                    @{username}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-tiktok-pink animate-pulse" />
                    <span className="text-[10px] text-gray-500">Đang theo dõi</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <a
                    href={`https://www.tiktok.com/@${username}/live`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded-md text-gray-500 hover:text-tiktok-cyan hover:bg-tiktok-cyan/10 transition"
                    title="Mở TikTok"
                  >
                    <ExternalLink size={13} />
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(username); }}
                    className="p-1 rounded-md text-gray-500 hover:text-tiktok-pink hover:bg-tiktok-pink/10 transition"
                    title="Xóa"
                  >
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {!collapsed && activeLives.length > 0 && (
        <div className="px-3 py-2 border-t border-[#1e1e1e] shrink-0">
          <p className="text-[10px] text-gray-600 text-center">
            {activeLives.length} luồng đang hoạt động
          </p>
        </div>
      )}
    </aside>
  );
}
