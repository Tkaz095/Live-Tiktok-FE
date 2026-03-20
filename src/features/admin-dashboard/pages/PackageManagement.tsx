"use client";

import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Share2,
  DollarSign
} from 'lucide-react';

interface PackageData {
  id: string;
  name: string;
  price: string;
  duration: string;
  maxLives: number;
  webhookLimit: string;
  description: string;
}

const mockPackages: PackageData[] = [
  { id: '1', name: 'Free', price: '0', duration: 'Vĩnh viễn', maxLives: 1, webhookLimit: '100/ngày', description: 'Gói dùng thử cho người mới.' },
  { id: '2', name: 'Basic', price: '199,000', duration: '30 ngày', maxLives: 5, webhookLimit: '10,000/ngày', description: 'Phù hợp cho streamer cá nhân.' },
  { id: '3', name: 'Pro', price: '499,000', duration: '30 ngày', maxLives: 15, webhookLimit: 'Không giới hạn', description: 'Dành cho các Agency và doanh nghiệp.' },
];

export default function PackageManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);

  const columns = [
    { 
      header: 'Gói dịch vụ', 
      accessor: (p: PackageData) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-tiktok-cyan/10 flex items-center justify-center text-tiktok-cyan">
            <Package size={14} />
          </div>
          <span className="font-bold text-white">{p.name}</span>
        </div>
      )
    },
    { header: 'Giá (VNĐ)', accessor: 'price' },
    { header: 'Thời hạn', accessor: 'duration' },
    { 
      header: 'Số Live tối đa', 
      accessor: (p: PackageData) => (
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-gray-500" />
          <span>{p.maxLives} slots</span>
        </div>
      )
    },
    { 
      header: 'Webhook Limit', 
      accessor: (p: PackageData) => (
        <div className="flex items-center gap-2">
          <Share2 size={14} className="text-gray-500" />
          <span>{p.webhookLimit}</span>
        </div>
      )
    },
    { 
      header: 'Hành động', 
      accessor: (p: PackageData) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setEditingPackage(p); setIsModalOpen(true); }}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <Edit size={16} />
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-tiktok-pink transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Quản lý gói dịch vụ</h1>
           <p className="text-gray-500 text-xs mt-1">Thiết lập các gói cước và giới hạn hệ thống.</p>
        </div>
        <button 
          onClick={() => { setEditingPackage(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-tiktok-pink text-white text-sm font-bold hover:bg-tiktok-pink/80 transition-all shadow-lg shadow-tiktok-pink/20"
        >
          <Plus size={18} /> Tạo gói mới
        </button>
      </div>

      <DataTable columns={columns} data={mockPackages} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPackage ? 'Cập nhật gói dịch vụ' : 'Tạo gói dịch vụ mới'}
        maxWidth="max-w-xl"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Tên gói</label>
                <input 
                  type="text" 
                  defaultValue={editingPackage?.name}
                  placeholder="Ví dụ: Pro Plan" 
                  className="w-full bg-white/5 border border-tiktok-border rounded-xl px-4 py-2.5 outline-none focus:border-tiktok-cyan/50 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Giá tiền (VNĐ)</label>
                <div className="relative">
                   <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                   <input 
                    type="text" 
                    defaultValue={editingPackage?.price}
                    placeholder="500,000" 
                    className="w-full bg-white/5 border border-tiktok-border rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-tiktok-cyan/50 transition-all text-sm font-mono"
                  />
                </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Thời hạn</label>
                <select className="w-full bg-white/5 border border-tiktok-border rounded-xl px-4 py-2.5 outline-none focus:border-tiktok-cyan/50 transition-all text-sm appearance-none cursor-pointer">
                   <option>30 ngày</option>
                   <option>90 ngày</option>
                   <option>1 năm</option>
                   <option>Vĩnh viễn</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Số Live tối đa</label>
                <input 
                  type="number" 
                  defaultValue={editingPackage?.maxLives || 1}
                  className="w-full bg-white/5 border border-tiktok-border rounded-xl px-4 py-2.5 outline-none focus:border-tiktok-cyan/50 transition-all text-sm"
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Mô tả gói</label>
              <textarea 
                rows={3}
                defaultValue={editingPackage?.description}
                placeholder="Mô tả các tính năng nổi bật..."
                className="w-full bg-white/5 border border-tiktok-border rounded-xl px-4 py-2.5 outline-none focus:border-tiktok-cyan/50 transition-all text-sm resize-none"
              />
           </div>

           <div className="flex items-center gap-3 pt-4">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-white/5 border border-tiktok-border text-sm font-bold hover:bg-white/10 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-tiktok-pink text-white text-sm font-bold hover:bg-tiktok-pink/80 transition-all shadow-lg shadow-tiktok-pink/20"
              >
                {editingPackage ? 'Lưu thay đổi' : 'Tạo gói ngay'}
              </button>
           </div>
        </form>
      </Modal>
    </div>
  );
}
