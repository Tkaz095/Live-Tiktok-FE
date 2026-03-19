"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Users, MessageSquare, Heart, Coins, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";

interface SessionStats {
  summary: {
    total_coins: number;
    total_likes: number;
    total_chats: number;
    total_members: number;
  };
  top_gifters: Array<{
    sender_name: string;
    total_coins: number;
    gift_count: number;
  }>;
}

interface SessionStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  username: string;
}

export default function SessionStatsModal({ isOpen, onClose, sessionId, username }: SessionStatsModalProps) {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchStats();
    }
  }, [isOpen, sessionId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/live-logs/session/${sessionId}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Fetch stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-tiktok-pink/10 to-tiktok-cyan/10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-tiktok-cyan" />
                Thống kê Phiên Live
              </h2>
              <p className="text-[10px] text-gray-500 mt-0.5">@ {username} • Session ID: {sessionId}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-2 border-tiktok-cyan/30 border-t-tiktok-cyan rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Đang tổng hợp dữ liệu...</p>
              </div>
            ) : stats ? (
              <div className="space-y-4">
                {/* Summary Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-tiktok-yellow/10 flex items-center justify-center text-tiktok-yellow">
                      <Coins size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Tổng Xu</p>
                      <p className="text-base font-bold text-white leading-tight">{stats.summary?.total_coins?.toLocaleString() ?? 0}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-tiktok-pink/10 flex items-center justify-center text-tiktok-pink">
                      <Heart size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Lượt Thích</p>
                      <p className="text-base font-bold text-white leading-tight">{stats.summary?.total_likes?.toLocaleString() ?? 0}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-tiktok-cyan/10 flex items-center justify-center text-tiktok-cyan">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Bình luận</p>
                      <p className="text-base font-bold text-white leading-tight">{stats.summary?.total_chats?.toLocaleString() ?? 0}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Người vào</p>
                      <p className="text-base font-bold text-white leading-tight">{stats.summary?.total_members?.toLocaleString() ?? 0}</p>
                    </div>
                  </div>
                </div>

                {/* Top Gifters */}
                <div>
                  <h3 className="text-[10px] font-bold text-tiktok-yellow uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Trophy size={12} />
                    Đại gia của phiên
                  </h3>
                  <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                    <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
                      {(stats.top_gifters?.length ?? 0) > 0 ? (
                        stats.top_gifters?.map((g, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-3">
                              <span className={`w-5 text-xs font-bold ${i === 0 ? 'text-tiktok-yellow' : i === 1 ? 'text-gray-400' : 'text-orange-400'}`}>
                                #{i + 1}
                              </span>
                              <span className="text-sm font-medium text-white/90">{g.sender_name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-tiktok-yellow">{g.total_coins?.toLocaleString() ?? 0} xu</p>
                              <p className="text-[10px] text-gray-600">{g.gift_count} món quà</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="px-4 py-8 text-center text-xs text-gray-600">Chưa có quà tặng nào được ghi nhận.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-red-500 py-8">Không có dữ liệu cho phiên này.</p>
            )}

            <button
              onClick={onClose}
              className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all border border-white/5"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
