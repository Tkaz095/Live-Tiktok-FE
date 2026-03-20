"use client";

import React from 'react';
import DataTable from '../components/DataTable';
import { 
  Activity, 
  User, 
  Clock, 
  Power, 
  Signal, 
  ShieldAlert,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface LiveSession {
  id: string;
  tiktokId: string;
  userName: string;
  uptime: string;
  status: 'online' | 'reconnecting';
  bitrate: string;
}

const mockSessions: LiveSession[] = [
  { id: 'S-921', tiktokId: '@khaby.lame', userName: 'John Doe', uptime: '12:45:10', status: 'online', bitrate: '2.4 Mbps' },
  { id: 'S-920', tiktokId: '@bellapoarch', userName: 'Maria Smith', uptime: '08:20:05', status: 'online', bitrate: '1.8 Mbps' },
  { id: 'S-919', tiktokId: '@addisonre', userName: 'David Lee', uptime: '02:15:20', status: 'reconnecting', bitrate: '0 Kbps' },
  { id: 'S-918', tiktokId: '@charlidamelio', userName: 'Sarah Connor', uptime: '00:45:12', status: 'online', bitrate: '3.1 Mbps' },
];

export default function SystemMonitoringPage() {
  const columns = [
    { 
      header: 'TikTok Live', 
      accessor: (s: LiveSession) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tiktok-pink/10 border border-tiktok-pink/20 flex items-center justify-center text-tiktok-pink overflow-hidden">
             {/* Dynamic color based on ID seed */}
             <Activity size={20} />
          </div>
          <div>
            <p className="font-bold text-white text-sm">{s.tiktokId}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{s.id}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Chủ sở hữu', 
      accessor: (s: LiveSession) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
             <User size={12} />
          </div>
          <span className="text-sm">{s.userName}</span>
        </div>
      )
    },
    { 
      header: 'Thời gian chạy', 
      accessor: (s: LiveSession) => (
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
           <Clock size={14} className="text-gray-600" />
           {s.uptime}
        </div>
      )
    },
    { 
      header: 'Băng thông', 
      accessor: (s: LiveSession) => (
        <div className="flex items-center gap-2 text-xs">
           <Signal size={14} className={s.status === 'online' ? 'text-tiktok-cyan' : 'text-gray-600'} />
           <span className={s.status === 'online' ? 'text-gray-300' : 'text-gray-600'}>{s.bitrate}</span>
        </div>
      )
    },
    { 
      header: 'Trạng thái', 
      accessor: (s: LiveSession) => (
        <div className="flex items-center gap-2">
           <span className={`w-2 h-2 rounded-full ${s.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-tiktok-yellow'}`} />
           <span className={`text-[10px] font-bold uppercase tracking-widest ${s.status === 'online' ? 'text-green-500' : 'text-tiktok-yellow'}`}>
             {s.status === 'online' ? 'Hoạt động' : 'Mất kết nối'}
           </span>
        </div>
      )
    },
    { 
      header: 'Hành động', 
      accessor: (s: LiveSession) => (
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-tiktok-pink/10 text-tiktok-pink text-[10px] font-bold uppercase tracking-widest hover:bg-tiktok-pink/20 transition-all group">
            <Power size={14} className="group-hover:rotate-90 transition-transform" />
            Ngắt kết nối
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Giám sát hệ thống</h1>
           <p className="text-gray-500 text-xs mt-1">Theo dõi thời gian thực các phiên TikTok Live đang kết nối.</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-tiktok-border">
              <span className="text-gray-500 font-bold uppercase">Tổng CPU:</span>
              <span className="text-tiktok-cyan font-bold">14%</span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-tiktok-border">
              <span className="text-gray-500 font-bold uppercase">RAM:</span>
              <span className="text-tiktok-yellow font-bold">4.2GB</span>
           </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-tiktok-pink/5 border border-tiktok-pink/10 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <ShieldAlert className="text-tiktok-pink" size={20} />
            <p className="text-sm text-gray-300">
               <span className="font-bold text-white">Lưu ý:</span> Việc ngắt kết nối sẽ làm gián đoạn luồng dữ liệu của User ngay lập tức.
            </p>
         </div>
      </div>

      <DataTable columns={columns} data={mockSessions} />

      {/* Connection Logs Placeholder */}
      <div className="mt-10">
         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ExternalLink size={14} /> System Console Logs
         </h3>
         <div className="bg-tiktok-dark border border-tiktok-border rounded-2xl p-6 font-mono text-[11px] h-48 overflow-y-auto custom-scrollbar space-y-1">
            <p className="text-gray-600">[2026-03-20 16:30:05] <span className="text-tiktok-cyan">INFO:</span> New stream request for @khaby.lame via User John Doe</p>
            <p className="text-gray-600">[2026-03-20 16:30:10] <span className="text-green-500">SUCCESS:</span> Socket connected to TikTok Live @khaby.lame</p>
            <p className="text-gray-600">[2026-03-20 16:32:15] <span className="text-tiktok-yellow">WARN:</span> Late packet detected for @addisonre (120ms delay)</p>
            <p className="text-gray-600">[2026-03-20 16:35:00] <span className="text-tiktok-cyan">INFO:</span> Webhook dispatched successfully to https://mysite.com/webhook</p>
            <p className="text-gray-500 animate-pulse self-start border-l-2 border-tiktok-cyan pl-2">_</p>
         </div>
      </div>
    </div>
  );
}
