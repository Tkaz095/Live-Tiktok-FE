"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HardDrive, X, Check, Save } from "lucide-react";
import { API_BASE } from "@/features/shared-auth/api/authApi";

interface DriveInfo {
  caption: string;
  freeSpace: number;
  size: number;
}

interface FolderPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  initialPath?: string;
  token: string | null;
}

export default function FolderPickerModal({ isOpen, onClose, onSelect, initialPath, token }: FolderPickerModalProps) {
  const [drives, setDrives] = useState<DriveInfo[]>([]);
  const [selectedPath, setSelectedPath] = useState(initialPath || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDrives();
    }
  }, [isOpen]);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/system/drives`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDrives(data.drives);
      }
    } catch (err) {
      console.error("Error fetching drives:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 GB";
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-tiktok-surface border border-tiktok-border rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-tiktok-border flex items-center justify-between bg-tiktok-dark/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-tiktok-cyan/10 rounded-xl">
                <Save className="text-tiktok-cyan" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Thay đổi vị trí lưu trữ</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Chọn ổ đĩa để lưu Cache & Logs</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Drive List Area */}
          <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-tiktok-cyan border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {drives.map((drive) => {
                  const isSelected = selectedPath === drive.caption;
                  const percentUsed = drive.size > 0 ? ((drive.size - drive.freeSpace) / drive.size) * 100 : 0;
                  
                  return (
                    <button
                      key={drive.caption}
                      onClick={() => setSelectedPath(drive.caption + "Tiktok Monitor")}
                      className={`w-full group p-5 rounded-2xl border transition-all text-left relative overflow-hidden ${
                        isSelected 
                        ? "bg-tiktok-cyan/5 border-tiktok-cyan ring-1 ring-tiktok-cyan/20" 
                        : "bg-tiktok-dark/40 border-tiktok-border hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <HardDrive className={isSelected ? "text-tiktok-cyan" : "text-gray-500 group-hover:text-gray-400"} size={22} />
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-widest">{drive.caption}</span>
                            <span className="text-[10px] text-gray-500 font-bold">{formatSize(drive.freeSpace)} trống / {formatSize(drive.size)}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-tiktok-cyan rounded-full flex items-center justify-center">
                            <Check size={12} className="text-black" />
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentUsed}%` }}
                          className={`h-full ${percentUsed > 90 ? "bg-tiktok-pink" : "bg-tiktok-cyan"}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-tiktok-border bg-tiktok-dark/30 flex items-center justify-between gap-4">
            <div className="flex-1 truncate">
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest mr-2">Vị trí mới:</span>
              <span className="text-[10px] font-bold text-tiktok-cyan truncate">{selectedPath || "Chưa chọn"}</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
              >
                Hủy
              </button>
              <button 
                disabled={!selectedPath || loading}
                onClick={() => onSelect(selectedPath)}
                className="px-8 py-2.5 bg-tiktok-cyan text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-tiktok-cyan/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
              >
                <Check size={14} />
                Xác nhận
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
