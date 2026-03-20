"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  CreditCard, 
  Activity, 
  LogOut, 
  Menu, 
  X,
  Shield,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/features/shared-auth/stores/AuthContext';
import { useTheme } from '@/features/shared-theme/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Người dùng', icon: Users, href: '/admin/users' },
  { name: 'Gói dịch vụ', icon: Package, href: '/admin/packages' },
  { name: 'Giao dịch', icon: CreditCard, href: '/admin/billing' },
  { name: 'Giám sát Live', icon: Activity, href: '/admin/monitoring' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-tiktok-pink text-white rounded-full shadow-lg shadow-tiktok-pink/20"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed inset-y-0 left-0 z-40 w-72 bg-tiktok-dark border-r border-tiktok-border flex flex-col pt-6"
          >
            {/* Logo Section */}
            <div className="px-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-tiktok-pink to-tiktok-cyan rounded-xl flex items-center justify-center p-2">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg tracking-tight">Middleware</h2>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Admin Panel</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300
                      ${isActive 
                        ? 'bg-tiktok-pink/10 text-tiktok-pink border border-tiktok-pink/20' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={isActive ? 'text-tiktok-pink' : 'group-hover:text-white transition-colors'} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    {isActive && (
                      <motion.div layoutId="active-indicator">
                        <ChevronRight size={14} className="text-tiktok-pink/50" />
                      </motion.div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Profile & Logout */}
            <div className="p-4 mt-auto border-t border-tiktok-border">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-4">
                <div className="w-10 h-10 rounded-full border border-tiktok-cyan/30 overflow-hidden bg-tiktok-dark">
                  <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-semibold truncate">{user?.name}</h3>
                  <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider font-bold">Quản trị viên</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-tiktok-pink hover:bg-tiktok-pink/5 transition-all text-sm group"
              >
                <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
