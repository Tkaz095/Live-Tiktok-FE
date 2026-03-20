"use client";

import { Radio, X, ExternalLink, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Check, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/features/shared-auth/api/authApi";
import { useAuth } from "@/features/shared-auth/stores/AuthContext";

interface Tiktoker {
  id: number;
  tiktok_handle: string;
  nickname: string;
  avatar_url: string | null;
  is_active: boolean;
}

interface SidebarProps {
  activeUsernames: string[]; // From active live sessions
  onSelect: (username: string) => void;
}

export default function Sidebar({ activeUsernames, onSelect }: SidebarProps) {
  const { getToken } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [tiktokers, setTiktokers] = useState<Tiktoker[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add/Edit state
  const [isAdding, setIsAdding] = useState(false);
  const [newHandle, setNewHandle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNickname, setEditNickname] = useState("");

  const fetchTiktokers = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/tiktokers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setTiktokers(data.data);
    } catch (err) {
      console.error("Fetch tiktokers error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiktokers();
  }, []);

  const handleAdd = async () => {
    if (!newHandle.trim()) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/tiktokers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tiktok_handle: newHandle.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setTiktokers([data.data, ...tiktokers]);
        setNewHandle("");
        setIsAdding(false);
      }
    } catch (err) {
      console.error("Add tiktoker error:", err);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/tiktokers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nickname: editNickname })
      });
      const data = await res.json();
      if (data.success) {
        setTiktokers(tiktokers.map(t => t.id === id ? data.data : t));
        setEditingId(null);
      }
    } catch (err) {
      console.error("Update tiktoker error:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn bỏ theo dõi TikToker này?")) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/tiktokers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTiktokers(tiktokers.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error("Delete tiktoker error:", err);
    }
  };

  return (
    <aside
      className={`h-full shrink-0 border-r border-[#1e1e1e] bg-[#0d0d0d] flex flex-col transition-all duration-300 ${
        collapsed ? "w-[52px]" : "w-[300px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-[48px] border-b border-[#1e1e1e] shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-tiktok-pink" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">
              Đang theo dõi
            </span>
            <span className="bg-tiktok-cyan/15 text-tiktok-cyan text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {tiktokers.length}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {!collapsed && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="p-1 rounded-md text-gray-500 hover:text-tiktok-cyan hover:bg-white/5 transition"
              title="Thêm TikToker"
            >
              <UserPlus size={16} />
            </button>
          )}
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="text-gray-500 hover:text-white transition p-1 rounded-md hover:bg-white/5"
            title={collapsed ? "Mở sidebar" : "Thu gọn"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* Add Input */}
      <AnimatePresence>
        {!collapsed && isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 py-2 border-b border-[#1e1e1e] overflow-hidden"
          >
            <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg px-2 py-1.5 border border-[#333] focus-within:border-tiktok-cyan transition-colors">
              <input
                type="text"
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                placeholder="@username..."
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="bg-transparent text-xs text-white focus:outline-none flex-1 placeholder:text-gray-600"
              />
              <button
                onClick={handleAdd}
                className="text-tiktok-cyan hover:scale-110 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
        {collapsed ? (
          /* Collapsed View */
          <div className="flex flex-col items-center gap-1.5 pt-3">
            {tiktokers.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelect(t.tiktok_handle)}
                title={`${t.nickname} (@${t.tiktok_handle})`}
                className="relative group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#222] to-[#111] border border-[#2a2a2a] flex items-center justify-center text-[11px] font-bold text-white/80 hover:border-tiktok-cyan transition-all">
                  {t.nickname.charAt(0).toUpperCase()}
                </div>
                {activeUsernames.includes(t.tiktok_handle) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-tiktok-pink rounded-full border-2 border-black" />
                )}
              </button>
            ))}
          </div>
        ) : (
          /* Expanded View */
          <div className="flex flex-col">
            {loading && <p className="text-center text-xs text-gray-600 py-8">Đang tải...</p>}
            {!loading && tiktokers.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-600 text-xs font-medium">Chưa theo dõi ai.</p>
                <p className="text-gray-700 text-[10px] mt-1">Nhấn biểu tượng cộng để thêm người mới.</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {tiktokers.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`group flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.03] border-b border-[#131313] transition-colors relative ${
                    editingId === t.id ? "bg-tiktok-cyan/5" : ""
                  }`}
                >
                  {/* Status Indicator Bar */}
                  {activeUsernames.includes(t.tiktok_handle) && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-tiktok-pink shadow-[0_0_8px_rgba(254,44,85,0.4)]" />
                  )}

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[11px] font-bold text-white/60 shrink-0 group-hover:border-tiktok-cyan/40 transition-colors">
                    {t.nickname.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0" onClick={() => onSelect(t.tiktok_handle)}>
                    {editingId === t.id ? (
                      <input
                        autoFocus
                        value={editNickname}
                        onChange={(e) => setEditNickname(e.target.value)}
                        onBlur={() => handleUpdate(t.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate(t.id)}
                        className="w-full bg-[#222] text-xs text-white px-1.5 py-1 rounded border border-tiktok-cyan/50 focus:outline-none"
                      />
                    ) : (
                      <>
                        <p className="text-[13px] text-white/90 font-semibold truncate hover:text-tiktok-cyan cursor-pointer transition-colors">
                          {t.nickname}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate leading-none">@{t.tiktok_handle}</p>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId !== t.id && (
                      <>
                        <button
                          onClick={() => { setEditingId(t.id); setEditNickname(t.nickname); }}
                          className="p-1.5 text-gray-600 hover:text-white transition-colors"
                          title="Sửa tên"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-gray-600 hover:text-tiktok-pink transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      {!collapsed && tiktokers.length > 0 && (
        <div className="px-3 py-3 border-t border-[#1e1e1e] bg-[#0a0a0a]">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <span>Danh sách theo dõi</span>
            <span className="text-gray-400">{tiktokers.length} người</span>
          </div>
        </div>
      )}
    </aside>
  );
}
