"use client";
import React, { useState, useEffect } from 'react';
import { Shield, Edit, Save, Trash2, CheckCircle2, User, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [editPackage, setEditPackage] = useState('Basic');
    const router = useRouter();

    // Authentication Guard
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const API_URL = "http://localhost:4000/api/v1/admin/users";

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Lấy token từ localStorage (hoặc dùng key bypass tạm nếu dev mode chưa đăng nhập)
            const token = localStorage.getItem('token');
            const apiKey = localStorage.getItem('api_key') || "MASTER_API_KEY"; 

            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'x-api-key': apiKey
                }
            });
            const data = await response.json();
            if (data.success) {
                // Controller của chúng ta trả về data.data
                setUsers(data.data || []);
            }
        } catch (error) {
            console.error("Lỗi fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChangePackage = async (userId: number) => {
        try {
            const token = localStorage.getItem('token');
            const apiKey = localStorage.getItem('api_key') || "MASTER_API_KEY";
            
            const req = await fetch(`${API_URL}/${userId}/package`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                    'x-api-key': apiKey
                },
                body: JSON.stringify({ package_type: editPackage })
            });

            const res = await req.json();
            if (res.success) {
                setEditingUserId(null);
                fetchUsers(); // Reload table
            } else {
                alert(res.error || "Lỗi cập nhật server");
            }
        } catch (err) {
            alert("Lỗi mất kết nối máy chủ");
        }
    };

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
                        <p className="text-gray-400 text-sm mt-1">Quản lý tài khoản và gói cước người dùng</p>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#242424] text-xs uppercase text-gray-400 font-semibold border-b border-gray-800">
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Người dùng</th>
                                    <th className="px-6 py-4">Gói cước</th>
                                    <th className="px-6 py-4">Tham gia lúc</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            <div className="w-6 h-6 border-2 border-tiktok-cyan border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                )}
                                {!loading && users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            Không có user nào trong hệ thống.
                                        </td>
                                    </tr>
                                )}
                                {!loading && users.map((u) => (
                                    <tr key={u.id} className="border-b border-gray-800/50 hover:bg-[#242424]/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-400">#{u.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-tiktok-pink to-tiktok-cyan flex items-center justify-center">
                                                    <User size={16} className="text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold">{u.username}</div>
                                                    <div className="text-xs text-gray-500">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingUserId === u.id ? (
                                                <select 
                                                    value={editPackage}
                                                    onChange={(e) => setEditPackage(e.target.value)}
                                                    className="bg-[#333] border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-tiktok-cyan"
                                                >
                                                    <option value="Basic">Basic</option>
                                                    <option value="Pro">Pro</option>
                                                    <option value="VIP">VIP</option>
                                                </select>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    u.package_type === 'VIP' ? 'bg-amber-500/20 text-amber-500' :
                                                    u.package_type === 'Pro' ? 'bg-tiktok-cyan/20 text-tiktok-cyan' :
                                                    'bg-gray-700 text-gray-300'
                                                }`}>
                                                    {u.package_type || 'Basic'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-xs">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingUserId === u.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleChangePackage(u.id)}
                                                        className="p-1.5 text-green-500 hover:bg-green-500/20 rounded-md transition-colors"
                                                        title="Lưu"
                                                    >
                                                        <Save size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingUserId(null)}
                                                        className="p-1.5 text-gray-400 hover:bg-gray-800 rounded-md transition-colors"
                                                        title="Hủy"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => {
                                                        setEditingUserId(u.id);
                                                        setEditPackage(u.package_type || 'Basic');
                                                    }}
                                                    className="p-1.5 text-blue-400 hover:bg-blue-400/20 rounded-md transition-colors"
                                                    title="Chỉnh sửa gói"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
