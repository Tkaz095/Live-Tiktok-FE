"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/shared-auth/stores/AuthContext';
import AdminSidebar from './AdminSidebar';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Guard: Only admins allowed
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role_name !== 'admin') {
        router.push('/user');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role_name !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="w-12 h-12 border-4 border-tiktok-cyan/20 border-t-tiktok-cyan rounded-full animate-spin" />
          <p className="text-gray-500 text-sm animate-pulse">Đang xác thực quyền Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar - fixed on desktop */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen overflow-x-hidden pt-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto px-4 lg:px-10 pb-16"
        >
          {children}
        </motion.div>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-tiktok-pink/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-tiktok-cyan/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
