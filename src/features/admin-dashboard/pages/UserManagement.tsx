"use client";

import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { 
  User, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Lock, 
  Unlock,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Server
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'banned';
  plan: 'Free' | 'Basic' | 'Pro';
  webhookUrl: string;
}

const mockUsers: UserData[] = [
  { id: '1', name: 'Nguyễn Văn A', email: 'vana@gmail.com', status: 'active', plan: 'Pro', webhookUrl: 'https://mysite.com/webhook' },
  { id: '2', name: 'Trần Thị B', email: 'thib@yahoo.com', status: 'active', plan: 'Basic', webhookUrl: 'https://api.test.io/callback' },
  { id: '3', name: 'Lê Văn C', email: 'vanc@outlook.com', status: 'banned', plan: 'Free', webhookUrl: '' },
  { id: '4', name: 'Phạm Minh D', email: 'minhd@dev.com', status: 'active', plan: 'Pro', webhookUrl: 'https://webhook.site/abc' },
];

export default function UserManagementPage() {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { 
      header: 'Người dùng', 
      accessor: (u: UserData) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-tiktok-pink/10 flex items-center justify-center text-tiktok-pink">
            <User size={14} />
          </div>
          <div>
            <p className="font-semibold text-white">{u.name}</p>
            <p className="text-[10px] text-gray-500">{u.id}</p>
          </div>
        </div>
      )
    },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Gói', 
      accessor: (u: UserData) => (
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
          u.plan === 'Pro' ? 'bg-tiktok-cyan/10 text-tiktok-cyan' : 
          u.plan === 'Basic' ? 'bg-tiktok-yellow/10 text-tiktok-yellow' : 
          'bg-gray-500/10 text-gray-500'
        }`}>
          {u.plan}
        </span>
      )
    },
    { 
      header: 'Trạng thái', 
      accessor: (u: UserData) => (
        <div className="flex items-center gap-2">
          {u.status === 'active' ? (
            <><CheckCircle2 size={14} className="text-green-500" /> <span className="text-xs text-green-500">Hoạt động</span></>
          ) : (
            <><XCircle size={14} className="text-tiktok-pink" /> <span className="text-xs text-tiktok-pink">Bị khóa</span></>
          )}
        </div>
      )
    },
    { 
      header: 'Hành động', 
      accessor: (u: UserData) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-tiktok-cyan transition-colors"
          >
            <Eye size={16} />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Edit size={16} />
          </button>
          <button className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${u.status === 'active' ? 'text-gray-400 hover:text-tiktok-pink' : 'text-tiktok-pink hover:text-green-500'}`}>
            {u.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-tiktok-cyan transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm user..." 
              className="bg-tiktok-surface border border-tiktok-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none w-64 focus:border-tiktok-cyan/50 transition-all font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-tiktok-border text-sm font-semibold hover:bg-white/[0.08] transition-all">
            <Filter size={16} /> Lọc
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={mockUsers} />

      {/* User Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Chi tiết người dùng"
        maxWidth="max-w-lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
              <div className="w-16 h-16 rounded-full bg-tiktok-pink/20 flex items-center justify-center text-tiktok-pink">
                <User size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold">{selectedUser.name}</h4>
                <p className="text-gray-500 text-sm">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 rounded-2xl bg-white/5 border border-tiktok-border">
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Gói dịch vụ</p>
                 <p className="text-sm font-bold text-tiktok-cyan">{selectedUser.plan}</p>
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-tiktok-border">
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Trạng thái</p>
                 <p className={`text-sm font-bold ${selectedUser.status === 'active' ? 'text-green-500' : 'text-tiktok-pink'}`}>
                   {selectedUser.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                 </p>
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                 <LinkIcon size={14} /> Webhook URL
               </div>
               <div className="p-4 rounded-2xl bg-tiktok-dark border border-tiktok-border break-all font-mono text-xs text-gray-400">
                 {selectedUser.webhookUrl || 'Chưa cài đặt Webhook'}
               </div>
            </div>

            <div className="space-y-3 pt-2">
               <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest px-1">
                 <Server size={14} /> Lịch sử kết nối Live
               </div>
               <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-transparent hover:border-tiktok-border transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-tiktok-yellow/10 text-tiktok-yellow flex items-center justify-center">
                           <Activity size={14} />
                         </div>
                         <div>
                           <p className="text-xs font-semibold text-gray-300">@tiktok_username_{i}</p>
                           <p className="text-[10px] text-gray-500">20-03-2026 14:30</p>
                         </div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">342 logs</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
