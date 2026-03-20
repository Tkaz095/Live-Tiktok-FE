import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: 'pink' | 'cyan' | 'yellow' | 'purple';
}

const colorMap = {
  pink: 'from-tiktok-pink/20 to-transparent text-tiktok-pink border-tiktok-pink/10',
  cyan: 'from-tiktok-cyan/20 to-transparent text-tiktok-cyan border-tiktok-cyan/10',
  yellow: 'from-tiktok-yellow/20 to-transparent text-tiktok-yellow border-tiktok-yellow/10',
  purple: 'from-purple-500/20 to-transparent text-purple-500 border-purple-500/10'
};

const iconBgMap = {
  pink: 'bg-tiktok-pink/10 text-tiktok-pink',
  cyan: 'bg-tiktok-cyan/10 text-tiktok-cyan',
  yellow: 'bg-tiktok-yellow/10 text-tiktok-yellow',
  purple: 'bg-purple-500/10 text-purple-500'
};

export default function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden p-6 rounded-2xl bg-tiktok-surface border ${colorMap[color]} bg-gradient-to-br`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight mb-2">{value}</h3>
          
          {trend && (
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${trend.isPositive ? 'text-green-400' : 'text-tiktok-pink'}`}>
              <span className={`px-1.5 py-0.5 rounded-md ${trend.isPositive ? 'bg-green-400/10' : 'bg-tiktok-pink/10'}`}>
                {trend.isPositive ? '+' : '-'}{trend.value}
              </span>
              <span className="text-gray-500 font-normal">so với tháng trước</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-xl ${iconBgMap[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      
      {/* Decorative background shape */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-current opacity-[0.03]" />
    </motion.div>
  );
}
