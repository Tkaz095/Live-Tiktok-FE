"use client";

import React from 'react';
import NextLink from 'next/link';
import { 
  Users, 
  DollarSign, 
  Activity, 
  Share2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Tổng quan hệ thống</h1>
          <p className="text-gray-500 text-sm">Chào mừng quay trở lại. Dưới đây là những gì đang diễn ra với nền tảng của bạn.</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-green-500">Hệ thống đang ổn định</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Tổng người dùng" 
          value="1,284" 
          icon={Users} 
          color="cyan"
          trend={{ value: '12%', isPositive: true }}
        />
        <StatsCard 
          title="Doanh thu (tháng)" 
          value="$12,450" 
          icon={DollarSign} 
          color="pink"
          trend={{ value: '8.4%', isPositive: true }}
        />
        <StatsCard 
          title="Lives đang chạy" 
          value="42" 
          icon={Activity} 
          color="yellow"
        />
        <StatsCard 
          title="Webhook Requests" 
          value="1.2M" 
          icon={Share2} 
          color="purple"
          trend={{ value: '24%', isPositive: true }}
        />
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Registration Chart Placeholder */}
        <div className="lg:col-span-2 bg-tiktok-surface border border-tiktok-border rounded-3xl p-8 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Tăng trưởng người dùng</h3>
              <p className="text-gray-500 text-xs">Số lượng đăng ký mới trong 7 ngày qua</p>
            </div>
            <select className="bg-white/5 border border-tiktok-border rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 outline-none hover:border-tiktok-cyan/50 transition-colors">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>

          {/* Simple SVG Chart */}
          <div className="h-64 w-full relative group">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#25f4ee" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#25f4ee" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20 L400,100 L0,100 Z" 
                fill="url(#chartGradient)"
              />
              <path 
                d="M0,80 Q50,40 100,60 T200,30 T300,50 T400,20" 
                fill="none" 
                stroke="#25f4ee" 
                strokeWidth="3"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(37,244,238,0.5)]"
              />
              {/* Data Points */}
              {[0, 100, 200, 300, 400].map((x, i) => (
                 <circle key={i} cx={x} cy={[80, 60, 30, 50, 20][i]} r="4" fill="#25f4ee" className="animate-pulse" />
              ))}
            </svg>
            
            {/* Legend / Axis bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between pt-4 border-t border-tiktok-border text-[10px] text-gray-600 font-bold uppercase tracking-widest">
              <span>Thứ 2</span>
              <span>Thứ 3</span>
              <span>Thứ 4</span>
              <span>Thứ 5</span>
              <span>Thứ 6</span>
              <span>Thứ 7</span>
              <span>Chủ Nhật</span>
            </div>
          </div>
        </div>

        {/* Live Status Summary */}
        <div className="bg-tiktok-surface border border-tiktok-border rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-tiktok-pink/10 text-tiktok-pink">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-lg font-bold tracking-tight">Hoạt động Live</h3>
            </div>
            
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-tiktok-cyan" />
                   <span className="text-sm font-medium text-gray-300">Kết nối thành công</span>
                 </div>
                 <span className="text-sm font-bold">98.2%</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-tiktok-pink" />
                   <span className="text-sm font-medium text-gray-300">Lỗi kết nối</span>
                 </div>
                 <span className="text-sm font-bold">1.8%</span>
               </div>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-tiktok-yellow" />
                   <span className="text-sm font-medium text-gray-300">Tốc độ trung bình</span>
                 </div>
                 <span className="text-sm font-bold">142ms</span>
               </div>
            </div>
          </div>

          <NextLink href="/admin/monitoring" className="mt-8 group flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 border border-tiktok-border hover:border-tiktok-pink/50 text-sm font-semibold transition-all">
             Xem chi tiết giám sát
             <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </NextLink>
        </div>
      </div>
    </div>
  );
}
