"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Search, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useState } from "react";

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string) => Promise<void>;
}

export default function AddStreamModal({ isOpen, onClose, onAdd }: AddStreamModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!url.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      await onAdd(url);
      setUrl("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Không thể kết nối luồng Live.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#fe2c55]/10 flex items-center justify-center text-[#fe2c55]">
                    <Plus size={20} strokeWidth={3} />
                  </div>
                  Thêm URL Live
                </h2>
                <p className="text-xs text-gray-500 mt-1">Dán link TikTok Live hoặc @username để bắt đầu.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Link hoặc Username</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#fe2c55] transition-colors">
                    <LinkIcon size={18} />
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://tiktok.com/@user/live"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-[#fe2c55]/50 transition-all text-white placeholder-gray-700"
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-xs flex items-center gap-3"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-sm transition-all border border-white/5"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="flex-[2] py-3.5 bg-[#fe2c55] hover:bg-[#e0264c] disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-bold text-sm transition-all shadow-[0_10px_30px_rgba(254,44,85,0.2)] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus size={18} strokeWidth={3} />
                      Bắt đầu Giám sát
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
