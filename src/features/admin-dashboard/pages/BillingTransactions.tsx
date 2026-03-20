"use client";

import React from 'react';
import DataTable from '../components/DataTable';
import { 
  CreditCard, 
  User, 
  Calendar, 
  FileText, 
  Search, 
  Download,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface TransactionData {
  id: string;
  userName: string;
  packageName: string;
  amount: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
}

const mockTransactions: TransactionData[] = [
  { id: 'TRX-1029', userName: 'Nguyễn Văn A', packageName: 'Pro', amount: '499,000', timestamp: '2026-03-20 14:32', status: 'success' },
  { id: 'TRX-1028', userName: 'Trần Thị B', packageName: 'Basic', amount: '199,000', timestamp: '2026-03-20 09:15', status: 'success' },
  { id: 'TRX-1027', userName: 'Lê Văn C', packageName: 'Pro', amount: '499,000', timestamp: '2026-03-19 22:40', status: 'failed' },
  { id: 'TRX-1026', userName: 'Phạm Minh D', packageName: 'Pro', amount: '499,000', timestamp: '2026-03-19 18:20', status: 'success' },
  { id: 'TRX-1025', userName: 'Hoàng Văn E', packageName: 'Basic', amount: '199,000', timestamp: '2026-03-19 12:05', status: 'pending' },
];

export default function BillingTransactionsPage() {
  const columns = [
    { 
      header: 'Mã giao dịch', 
      accessor: (t: TransactionData) => (
        <span className="font-mono text-xs font-bold text-tiktok-cyan/80">{t.id}</span>
      )
    },
    { 
      header: 'Khách hàng', 
      accessor: (t: TransactionData) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-500" />
          <span>{t.userName}</span>
        </div>
      )
    },
    { 
      header: 'Gói mua', 
      accessor: (t: TransactionData) => (
        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-tiktok-border text-[10px] font-bold uppercase tracking-wider">
          {t.packageName}
        </span>
      )
    },
    { 
      header: 'Số tiền', 
      accessor: (t: TransactionData) => (
        <div className="font-bold text-white flex items-center gap-1">
          {t.amount} <span className="text-[10px] text-gray-500 font-normal">VNĐ</span>
        </div>
      )
    },
    { 
      header: 'Thời gian', 
      accessor: (t: TransactionData) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar size={14} />
          <span>{t.timestamp}</span>
        </div>
      )
    },
    { 
      header: 'Trạng thái', 
      accessor: (t: TransactionData) => {
        const styles = {
          success: 'bg-green-500/10 text-green-500',
          failed: 'bg-tiktok-pink/10 text-tiktok-pink',
          pending: 'bg-tiktok-yellow/10 text-tiktok-yellow'
        };
        const icons = {
          success: <CheckCircle2 size={12} />,
          failed: <XCircle size={12} />,
          pending: <Clock size={12} />
        };
        const labels = {
          success: 'Thành công',
          failed: 'Thất bại',
          pending: 'Chờ xử lý'
        };

        return (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[t.status]}`}>
            {icons[t.status]}
            {labels[t.status]}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold tracking-tight">Lịch sử giao dịch</h1>
           <p className="text-gray-500 text-xs mt-1">Theo dõi dòng tiền và trạng thái thanh toán.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-tiktok-border text-sm font-semibold hover:bg-white/[0.08] transition-all">
            <Download size={16} /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
         <div className="p-4 rounded-2xl bg-gradient-to-br from-tiktok-cyan/10 to-transparent border border-tiktok-cyan/10">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Doanh thu hôm nay</p>
            <p className="text-2xl font-bold text-tiktok-cyan">1,240,000 <span className="text-xs font-normal opacity-50">VNĐ</span></p>
         </div>
         <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/10">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Giao dịch thành công</p>
            <p className="text-2xl font-bold text-green-500">842 <span className="text-xs font-normal opacity-50">Lượt</span></p>
         </div>
         <div className="p-4 rounded-2xl bg-gradient-to-br from-tiktok-pink/10 to-transparent border border-tiktok-pink/10">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Giao dịch thất bại</p>
            <p className="text-2xl font-bold text-tiktok-pink">12 <span className="text-xs font-normal opacity-50">Lượt</span></p>
         </div>
      </div>

      <DataTable columns={columns} data={mockTransactions} />
    </div>
  );
}
