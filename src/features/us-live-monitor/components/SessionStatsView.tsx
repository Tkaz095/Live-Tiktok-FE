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
      <div className="w-full md:w-[320px] shrink-0 flex flex-col">
        <h3 className="text-[10px] font-bold text-tiktok-yellow uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          <Trophy size={14} />
          Đại gia của phiên
        </h3>
        <div className="flex-1 min-h-[140px] max-h-[140px] overflow-y-auto custom-scrollbar bg-black/20 rounded-xl border border-white/5">
          {(stats.top_gifters?.length ?? 0) > 0 ? (
            stats.top_gifters?.map((g, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-5 text-xs font-bold ${i === 0 ? 'text-tiktok-yellow' : i === 1 ? 'text-gray-400' : 'text-orange-400'}`}>
                    #{i + 1}
                  </span>
                  <span className="text-[13px] font-medium text-white/90 truncate max-w-[120px]">{g.sender_name}</span>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-tiktok-yellow">{g.total_coins?.toLocaleString() ?? 0} xu</p>
                </div>
              </div>
            ))
          ) : (
            <p className="px-4 py-8 text-center text-xs text-gray-600">Chưa có quà tặng nào.</p>
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
    <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-4 flex items-center gap-4 group hover:border-white/10 transition-colors h-full">
      <div className={`w-10 h-10 rounded-xl ${bgColorClass} flex items-center justify-center ${colorClass} shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider mb-1">{label}</p>
        <p className="text-xl font-black text-white leading-tight truncate">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
