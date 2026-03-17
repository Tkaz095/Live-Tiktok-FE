"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

export default function Navbar({
  onJoin,
  activeCount = 0,
}: {
  onJoin?: (username: string) => void;
  activeCount?: number;
}) {
  const [url, setUrl] = useState("");

  const handleJoin = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    let username = "";

    // Match tiktok.com/@username or tiktok.com/@username/live
    const match = trimmed.match(/tiktok\.com\/@([a-zA-Z0-9_.]+)/);
    if (match && match[1]) {
      username = match[1];
    } else if (trimmed.startsWith("@")) {
      // Direct @username input
      username = trimmed.slice(1);
    } else {
      // Plain username input
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

  return (
    <header className="h-[70px] border-b border-tiktok-border bg-tiktok-dark flex items-center justify-between px-6 shrink-0 z-10 w-full relative">
      {/* Brand */}
      <div className="flex items-center gap-3 w-[250px] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(37,244,238,0.2)]">
          TT
        </div>
        <h1 className="text-white font-bold text-lg tracking-tight">
          TikTok <span className="text-tiktok-cyan">Live</span> Monitor
        </h1>
      </div>

      {/* Center Input Form */}
      <div className="flex items-center justify-center flex-1 max-w-3xl px-8">
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
      </div>

      {/* Right Stats */}
      <div className="flex items-center justify-end gap-2 text-sm w-[250px] shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs">Đang theo dõi</span>
          <span className="text-tiktok-cyan font-bold text-xl leading-none">
            {activeCount}
          </span>
        </div>
      </div>
    </header>
  );
}
