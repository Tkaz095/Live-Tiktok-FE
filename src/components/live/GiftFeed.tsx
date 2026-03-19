"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Gift } from "lucide-react";
import type { GiftItem } from "./types";

interface GiftFeedProps {
  gifts: GiftItem[];
  connected: boolean;
  flex1: boolean; // true when filter === "gift"
}

export default function GiftFeed({ gifts, connected, flex1 }: GiftFeedProps) {
  return (
    <div
      className={`flex flex-col border-b border-tiktok-border bg-gradient-to-b from-[#1a1515] to-transparent ${
        flex1 ? "flex-1" : "flex-none max-h-[40%] min-h-[120px]"
      }`}
    >
      <div className="px-3 py-2 flex items-center text-xs font-semibold text-tiktok-yellow/80 bg-black/20 shrink-0 gap-1.5">
        <Gift size={14} />
        Thông báo quà tặng
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <AnimatePresence>
          {gifts.map((g) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`bg-gradient-to-r ${
                g.isBigGift
                  ? "from-tiktok-yellow/30 to-tiktok-pink/20 border-tiktok-yellow/50"
                  : "from-tiktok-yellow/10 to-transparent border-tiktok-yellow/20"
              } border rounded-lg p-2 flex items-center justify-between shadow-sm`}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-black/40 shrink-0 flex items-center justify-center text-lg overflow-hidden border border-white/5">
                  {g.icon.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.icon} alt={g.giftName} className="w-full h-full object-contain p-0.5" />
                  ) : (
                    g.icon
                  )}
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-xs font-bold text-white max-w-[140px] truncate">{g.user}</span>
                  <span className="text-[10px] text-tiktok-yellow truncate max-w-[140px]">Đã tặng {g.giftName}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-bold text-white text-sm">x{g.amount}</span>
                {g.isBigGift && <span className="text-[9px] text-tiktok-pink font-bold">BÙM!</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {gifts.length === 0 && (
          <div className="text-xs text-center text-gray-500 mt-4 italic">
            {connected ? "Đang chờ quà tặng..." : "Đang kết nối tới Live..."}
          </div>
        )}
      </div>
    </div>
  );
}
