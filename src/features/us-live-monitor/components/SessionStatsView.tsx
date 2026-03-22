"use client";

import { TrendingUp, Users, MessageSquare, Heart, Coins, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE } from "@/features/shared-auth/api/authApi";
import { useAuth } from "@/features/shared-auth/stores/AuthContext";

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

interface SessionStatsViewProps {
  sessionId: number;
  username: string;
}

export default function SessionStatsView({ sessionId, username }: SessionStatsViewProps) {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchStats();
    }
  }, [sessionId]);

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

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
        <div className="w-8 h-8 border-2 border-tiktok-cyan/30 border-t-tiktok-cyan rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Đang tổng hợp dữ liệu cho @{username}...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-full flex items-center justify-center py-8">
        <p className="text-sm text-red-500">Không có dữ liệu cho phiên này.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
      {/* Summary Stats */}
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        <StatCard 
          icon={<Coins size={18} />} 
          label="Tổng Xu" 
          value={stats.summary?.total_coins ?? 0} 
          colorClass="text-tiktok-yellow" 
          bgColorClass="bg-tiktok-yellow/10"
        />
        <StatCard 
          icon={<Heart size={18} />} 
          label="Lượt Thích" 
          value={stats.summary?.total_likes ?? 0} 
          colorClass="text-tiktok-pink" 
          bgColorClass="bg-tiktok-pink/10"
        />
        <StatCard 
          icon={<MessageSquare size={18} />} 
          label="Bình luận" 
          value={stats.summary?.total_chats ?? 0} 
          colorClass="text-tiktok-cyan" 
          bgColorClass="bg-tiktok-cyan/10"
        />
        <StatCard 
          icon={<Users size={18} />} 
          label="Người vào" 
          value={stats.summary?.total_members ?? 0} 
          colorClass="text-purple-500" 
          bgColorClass="bg-purple-500/10"
        />
      </div>

      {/* Vertical Divider (Desktop) */}
      <div className="hidden md:block w-px bg-white/5 self-stretch" />

      {/* Top Gifters */}
      <div className="w-full md:w-[320px] shrink-0 flex flex-col bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 relative overflow-hidden group/gifters h-[180px]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-tiktok-yellow/10 blur-[40px] rounded-full opacity-30 group-hover/gifters:opacity-60 transition-opacity duration-700"></div>
        <h3 className="relative z-10 text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-tiktok-yellow to-orange-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 drop-shadow-sm">
          <Trophy size={16} className="text-tiktok-yellow" />
          Đại gia của phiên
        </h3>
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
          {(stats.top_gifters?.length ?? 0) > 0 ? (
            stats.top_gifters?.map((g, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/[0.03] rounded-xl border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/[0.15] hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-black ${
                    i === 0 ? 'bg-tiktok-yellow/20 text-tiktok-yellow ring-1 ring-tiktok-yellow/50 shadow-[0_0_10px_rgba(250,206,21,0.3)]' : 
                    i === 1 ? 'bg-gray-300/20 text-gray-300 ring-1 ring-gray-400/50' : 
                    i === 2 ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50' : 
                    'bg-white/5 text-gray-500'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-white/80 truncate max-w-[120px] group-hover:text-white transition-colors">{g.sender_name}</span>
                </div>
                <div className="text-right flex items-center gap-1.5">
                  <p className="text-[13px] font-black text-tiktok-yellow/90 group-hover:text-tiktok-yellow drop-shadow-sm transition-colors">{g.total_coins?.toLocaleString() ?? 0}</p>
                  <Coins size={12} className="text-tiktok-yellow/60 group-hover:text-tiktok-yellow/100" />
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
               <Trophy size={28} className="mb-2 text-white/20" />
               <p className="text-xs text-white/40 font-medium tracking-wide">Chưa có quà tặng nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, colorClass, bgColorClass }: { 
  icon: React.ReactNode, 
  label: string, 
  value: number, 
  colorClass: string, 
  bgColorClass: string 
}) {
  return (
    <div className="relative overflow-hidden bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex items-center gap-4 group hover:border-white/30 hover:shadow-[0_8_30px_rgba(255,255,255,0.06)] transition-all duration-300 transform hover:-translate-y-1 h-[100px]">
      <div className={`absolute top-0 right-0 w-24 h-24 ${bgColorClass} blur-[40px] opacity-30 -mr-6 -mt-6 rounded-full transition-opacity duration-500 group-hover:opacity-70`}></div>
      <div className={`relative z-10 w-12 h-12 rounded-xl ${bgColorClass} flex items-center justify-center ${colorClass} shrink-0 shadow-lg ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="relative z-10 min-w-0">
        <p className="text-[11px] text-gray-400 uppercase font-black tracking-widest mb-1 group-hover:text-gray-300 transition-colors">{label}</p>
        <p className="text-2xl font-black text-white leading-tight truncate drop-shadow-md">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
