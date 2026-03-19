"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Gift, Clock, TrendingUp, Hash, User, ShieldAlert, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { GiftItem } from "./types";

interface GiftFeedProps {
  gifts: GiftItem[];
  connected: boolean;
  flex1: boolean; // true when filter === "gift"
}

export default function GiftFeed({ gifts, connected, flex1 }: GiftFeedProps) {
  const [sortBy, setSortBy] = useState<'time' | 'top_user_value' | 'top_total_gift' | 'whale_alert' | 'top_count_gift'>('time');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Sorting / Aggregation Logic
  const getDisplayGifts = () => {
    if (sortBy === 'time') return gifts;

    if (sortBy === 'top_user_value') {
      // Aggregate by user
      const userMap: Record<string, { user: string, amount: number, value: number, icon: string, id: string }> = {};
      gifts.forEach(g => {
        if (!userMap[g.user]) {
          userMap[g.user] = { ...g, amount: 0, value: 0 };
        }
        userMap[g.user].amount += g.amount;
        userMap[g.user].value += g.value;
      });
      return Object.values(userMap).sort((a, b) => b.value - a.value)
        .map(u => ({ ...u, giftName: 'Đại gia chi đậm nhất', isBigGift: u.value >= 500 }));
    }

    if (sortBy === 'top_total_gift' || sortBy === 'top_count_gift') {
      // Aggregate by gift record
      const giftMap: Record<string, { user: string, giftName: string, amount: number, value: number, icon: string, id: string }> = {};
      gifts.forEach(g => {
        if (!giftMap[g.giftName]) {
          giftMap[g.giftName] = { ...g, user: 'Tổng hợp' };
        } else {
          giftMap[g.giftName].amount += g.amount;
          giftMap[g.giftName].value += g.value;
        }
      });
      return Object.values(giftMap).sort((a, b) => 
        sortBy === 'top_total_gift' ? b.value - a.value : b.amount - a.amount
      ).map(g => ({ ...g, isBigGift: g.value >= 500 }));
    }

    if (sortBy === 'whale_alert') {
      // Keep feed format but remove 1-coin gifts
      return gifts.filter(g => (g.value / g.amount) > 1);
    }

    return gifts;
  };

  const sortedGifts = getDisplayGifts();

  const filterOptions = [
    { id: 'time', label: 'Tất cả (Mới nhất)', icon: <Clock size={12} /> },
    { id: 'top_user_value', label: 'Đại gia chi đậm', icon: <User size={12} className="text-tiktok-cyan" /> },
    { id: 'top_total_gift', label: 'Quà có giá trị cao nhất', icon: <TrendingUp size={12} className="text-tiktok-pink" /> },
    { id: 'whale_alert', label: 'Quà tặng lớn (>1 xu)', icon: <ShieldAlert size={12} className="text-tiktok-yellow" /> },
    { id: 'top_count_gift', label: 'Quà tặng phổ biến nhất', icon: <Hash size={12} className="text-tiktok-yellow" /> },
  ] as const;

  const currentFilter = filterOptions.find(f => f.id === sortBy);

  return (
    <div
      className={`flex flex-col border-b border-tiktok-border bg-gradient-to-b from-[#1a1515] to-transparent min-h-0 ${
        flex1 ? "flex-1" : "flex-none max-h-[40%] min-h-[120px]"
      }`}
    >
      <div className="px-3 py-2 flex items-center justify-between bg-black/40 shrink-0 border-b border-white/5 relative z-50">
        <div className="flex items-center text-[10px] font-bold text-tiktok-yellow/90 gap-1.5 uppercase tracking-tighter">
          <Gift size={13} className="text-tiktok-pink" />
          Quà tặng
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md border border-white/10 transition-all text-[10px] text-gray-300 shadow-sm"
          >
            {currentFilter?.icon}
            <span className="max-w-[80px] truncate">{currentFilter?.label}</span>
            <ChevronDown size={10} className={`transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showFilterDropdown && (
              <>
                {/* Backdrop to close */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowFilterDropdown(false)} 
                />
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute right-0 mt-1 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1"
                >
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSortBy(opt.id);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-[10px] text-left transition-colors ${
                        sortBy === opt.id 
                          ? 'bg-tiktok-pink/20 text-tiktok-pink' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {sortedGifts.map((g) => (
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
                  <span className="text-xs font-bold text-white max-w-[140px] truncate">
                    {sortBy.startsWith('top_total_gift') || sortBy.startsWith('top_unit_gift') ? g.giftName : g.user}
                  </span>
                  <span className="text-[10px] text-tiktok-yellow leading-tight">
                    {sortBy === 'top_user_value' 
                      ? `Tổng chi: ${g.value} xu` 
                      : (sortBy === 'top_total_gift' || sortBy === 'top_count_gift')
                        ? `Số lượng: ${g.amount} | Tổng: ${g.value} xu`
                        : (sortBy === 'whale_alert')
                          ? `Quà lớn: ${g.giftName} (${g.value / g.amount} xu)`
                          : `Đã tặng ${g.giftName}`
                    }
                  </span>
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
