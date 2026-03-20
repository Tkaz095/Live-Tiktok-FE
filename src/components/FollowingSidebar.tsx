"use client";

import { Radio, X, ExternalLink, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Check, UserPlus, Search } from "lucide-react";
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
  onAddClick?: () => void;
}

export default function Sidebar({ activeUsernames, onSelect, onAddClick }: SidebarProps) {
  const { getToken } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [tiktokers, setTiktokers] = useState<Tiktoker[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add/Edit state
  const [isAdding, setIsAdding] = useState(false);
  const [newHandle, setNewHandle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNickname, setEditNickname] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredTiktokers = tiktokers.filter(t => 
    t.tiktok_handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside 
      className={`h-full bg-tiktok-surface border-r border-tiktok-border relative transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col z-10 ${
        collapsed ? 'w-[72px]' : 'w-[280px]'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-tiktok-border flex items-center justify-between min-h-[64px]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Radio className="text-tiktok-pink animate-pulse" size={16} />
            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Đang theo dõi</h2>
            <span className="bg-tiktok-pink/10 text-tiktok-pink text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {tiktokers.length}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          {!collapsed && (
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="p-1 px-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-md transition-all"
              title="Thêm TikToker"
            >
              <UserPlus size={16} />
            </button>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title={collapsed ? "Mở sidebar" : "Thu gọn"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      {/* NEW: Add URL Button for Monitor Page */}
      {!collapsed && onAddClick && (
        <div className="px-4 py-3 border-b border-tiktok-border">
          <button 
            onClick={onAddClick}
            className="w-full bg-[#fe2c55] hover:bg-[#e0264c] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(254,44,85,0.2)] hover:shadow-[0_0_20px_rgba(254,44,85,0.4)] active:scale-[0.98]"
          >
            <Plus size={16} strokeWidth={3} />
            THÊM URL
          </button>
        </div>
      )}

      {/* Search Section */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-tiktok-border bg-black/20">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-tiktok-cyan" size={14} />
            <input
              type="text"
              placeholder="Tìm kiếm TikToker..."
              className="w-full bg-tiktok-dark border border-tiktok-border rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-tiktok-cyan/40 transition-all text-white placeholder-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Add Section */}
      <AnimatePresence>
        {!collapsed && isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-tiktok-border bg-tiktok-pink/5"
          >
            <div className="p-3">
              <div className="flex items-center gap-2 bg-tiktok-dark border border-tiktok-pink/20 focus-within:border-tiktok-pink/50 rounded-xl px-3 py-2 transition-all shadow-inner">
                <input
                  type="text"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  placeholder="@username mới..."
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="bg-transparent text-[11px] text-white focus:outline-none flex-1 placeholder:text-gray-700 font-medium"
                />
                <button
                  onClick={handleAdd}
                  className="text-tiktok-pink hover:scale-110 active:scale-95 transition"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
        {collapsed ? (
          /* Collapsed View */
          <div className="flex flex-col items-center gap-1.5 pt-3">
            {filteredTiktokers.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelect(t.tiktok_handle)}
                title={`${t.nickname} (@${t.tiktok_handle})`}
                className="relative group"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-tiktok-dark to-black border border-tiktok-border flex items-center justify-center text-[11px] font-black text-white/50 hover:border-tiktok-cyan group-hover:bg-tiktok-cyan/5 transition-all overflow-hidden">
                  {t.avatar_url ? (
                    <img src={t.avatar_url} alt={t.nickname} className="w-full h-full object-cover" />
                  ) : (
                    t.nickname.charAt(0).toUpperCase()
                  )}
                </div>
                {activeUsernames.includes(t.tiktok_handle) && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-tiktok-pink rounded-full border-2 border-tiktok-surface shadow-[0_0_5px_rgba(254,44,85,0.5)]" />
                )}
              </button>
            ))}
          </div>
        ) : (
          /* Expanded View */
          <div className="flex flex-col">
            {loading && <p className="text-center text-[10px] text-gray-600 py-10 uppercase tracking-widest font-black animate-pulse">Đang tải...</p>}
            {!loading && filteredTiktokers.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-600 text-xs font-medium italic opacity-60">Không tìm thấy kết quả.</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {filteredTiktokers.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`group flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] border-b border-tiktok-border transition-colors relative ${
                    editingId === t.id ? "bg-tiktok-cyan/5" : ""
                  }`}
                >
                  {/* Status Indicator Bar */}
                  {activeUsernames.includes(t.tiktok_handle) && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-tiktok-pink shadow-[0_0_12px_rgba(254,44,85,0.3)]" />
                  )}

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-2xl bg-tiktok-dark border border-tiktok-border flex items-center justify-center text-[12px] font-black text-white/40 shrink-0 group-hover:border-tiktok-cyan/30 transition-colors shadow-inner overflow-hidden">
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.nickname} className="w-full h-full object-cover" />
                    ) : (
                      t.nickname.charAt(0).toUpperCase()
                    )}
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
                        className="w-full bg-[#1a1a1a] text-xs text-white px-2 py-1.5 rounded-lg border border-tiktok-cyan/50 focus:outline-none"
                      />
                    ) : (
                      <div className="space-y-0.5 select-none cursor-pointer">
                        <p className="text-[14px] text-white/90 font-black truncate group-hover:text-tiktok-cyan transition-colors">
                          {t.nickname}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold tracking-tight truncate opacity-80 leading-none">@{t.tiktok_handle}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                    {editingId !== t.id && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingId(t.id); setEditNickname(t.nickname); }}
                          className="p-1.5 text-gray-600 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                          title="Sửa tên"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                          className="p-1.5 text-gray-600 hover:text-[#fe2c55] transition-colors rounded-lg hover:bg-[#ff0050]/10"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
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

      {/* Sidebar Footer */}
      {!collapsed && tiktokers.length > 0 && (
        <div className="px-4 py-3 border-t border-tiktok-border bg-tiktok-dark/20">
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span>Danh sách</span>
            <span className="text-gray-400">{tiktokers.length} Account</span>
          </div>
        </div>
      )}
    </aside>
  );
}
