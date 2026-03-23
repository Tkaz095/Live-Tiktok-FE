"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/features/shared-auth/stores/AuthContext";
import { LayoutDashboard, TrendingUp, Users, Activity, Monitor } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (user && user.role_name === 'admin') {
      router.push("/admin");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-tiktok-cyan/30 border-t-tiktok-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      <Navbar activeCount={0} />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto bg-background p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header section with minimal info */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <LayoutDashboard className="text-tiktok-cyan" size={24} />
                Tổng quan hệ thống
              </h2>
              <div className="bg-tiktok-surface border border-tiktok-border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Cập nhật lúc: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Đang theo dõi", value: "0", sub: "Kênh Live", color: "from-tiktok-pink/20", icon: <Activity size={16} className="text-tiktok-pink" /> },
                { label: "Tổng quà tặng", value: "0", sub: "Xu nhận được", color: "from-tiktok-yellow/20", icon: <TrendingUp size={16} className="text-tiktok-yellow" /> },
                { label: "Lượt xem cao nhất", value: "0", sub: "Người xem", color: "from-tiktok-cyan/20", icon: <Users size={16} className="text-tiktok-cyan" /> },
                { label: "Tin nhắn hệ thống", value: "0", sub: "Thông báo", color: "from-gray-500/20", icon: <Activity size={16} className="text-gray-400" /> },
              ].map((stat, i) => (
                <div key={i} className={`bg-tiktok-surface border border-tiktok-border rounded-2xl p-5 relative overflow-hidden group hover:border-white/10 transition-all`}>
                  <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${stat.color} to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">{stat.label}</p>
                    <div className="p-1.5 bg-white/5 rounded-lg border border-white/5 group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-1 relative z-10">{stat.value}</h3>
                  <p className="text-[10px] text-gray-400 font-bold relative z-10">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Main Action Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
              <div className="lg:col-span-2 bg-tiktok-surface border border-tiktok-border rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-6 shadow-2xl min-h-[400px]">
                <div className="w-20 h-20 rounded-3xl bg-tiktok-dark border border-tiktok-border flex items-center justify-center shadow-inner group transition-all hover:border-tiktok-cyan/30">
                  <Monitor size={40} className="text-tiktok-cyan transition-transform group-hover:scale-110" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">Sẵn sàng giám sát?</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto font-medium">
                    Chuyển sang trang Monitor để bắt đầu theo dõi các phiên Live TikTok và phân tích dữ liệu thời gian thực.
                  </p>
                </div>
                <Link 
                  href="/user/monitor"
                  className="bg-tiktok-cyan hover:bg-[#00d1ca] text-black px-10 py-4 rounded-2xl font-black text-sm transition-all shadow-[0_0_30px_rgba(37,244,238,0.3)] hover:scale-105 active:scale-95 uppercase tracking-widest"
                >
                  Mở trang giám sát
                </Link>
              </div>

              <div className="bg-tiktok-surface border border-tiktok-border rounded-3xl p-6 flex flex-col gap-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-tiktok-border pb-4">Tin tức & Cập nhật</h3>
                <div className="space-y-4 flex-1">
                  {[
                    "Cập nhật hệ thống Monitor v2.1",
                    "Tính năng theo dõi quà tặng mới",
                    "Tối ưu hóa tốc độ tải dữ liệu",
                    "Giao diện Pro Mode chính thức ra mắt",
                  ].map((news, i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-all">
                      <div className="w-2 h-2 rounded-full bg-tiktok-pink mt-1.5 shrink-0 shadow-[0_0_8px_rgba(254,44,85,0.5)]" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-300 group-hover:text-tiktok-cyan transition-colors line-clamp-1">{news}</p>
                        <p className="text-[10px] text-gray-600 font-bold">20/03/2026</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl border border-tiktok-border text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
                  Xem tất cả
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
