"use client";
import React, { useState, useEffect } from 'react';
import { Shield, User, ChevronLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/shared-auth/stores/AuthContext';

export default function AdminPage() {
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();

    // Auth guard — only admin (role_id=1)
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role_id !== 1) {
                router.push('/user');
            }
        }
    }, [user, isLoading, router]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (isLoading || !user || user.role_id !== 1) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <span className="w-8 h-8 border-2 border-tiktok-cyan/30 border-t-tiktok-cyan rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
                    <div>
                        <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-2 text-sm transition-colors">
                            <ChevronLeft size={16} /> Quay lại trang chủ
                        </Link>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Shield className="text-tiktok-cyan" size={28} />
                            Hệ thống Quản Trị (Admin)
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Quản lý tài khoản người dùng — Xin chào, <span className="text-tiktok-cyan font-semibold">{user.name}</span></p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-tiktok-pink hover:border-tiktok-pink/50 transition-all text-sm"
                    >
                        <LogOut size={16} />
                        Đăng xuất
                    </button>
                </div>

                {/* Placeholder — Admin features will be rebuilt here */}
                <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-12 text-center">
                    <User size={48} className="text-gray-600 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-gray-300 mb-2">Trang Admin</h2>
                    <p className="text-gray-500 text-sm">Các tính năng quản lý sẽ được xây dựng tại đây.<br/>Bao gồm: quản lý tài khoản, gói cước, thống kê hệ thống.</p>
                </div>
            </div>
        </div>
    );
}
