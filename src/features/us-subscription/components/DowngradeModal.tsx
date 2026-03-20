"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, ShieldAlert, X } from "lucide-react";

interface DowngradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  secondsRemaining: number;
}

export default function DowngradeModal({ isOpen, onClose, secondsRemaining }: DowngradeModalProps) {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-[#1a1a1a] border border-tiktok-pink/30 rounded-[32px] w-full max-w-md overflow-hidden relative shadow-[0_32px_64px_rgba(254,44,85,0.2)]"
          >
            {/* Header / Icon */}
            <div className="bg-gradient-to-b from-tiktok-pink/10 to-transparent pt-10 pb-6 flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-tiktok-pink/10 flex items-center justify-center relative mb-4">
                <AlertTriangle size={40} className="text-tiktok-pink" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-tiktok-pink/20 rounded-3xl -z-10"
                />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Cảnh báo giới hạn</h2>
            </div>

            {/* Content */}
            <div className="px-8 pb-10 text-center space-y-6">
              <p className="text-gray-400 text-sm leading-relaxed">
                Gói dịch vụ của bạn đã thay đổi. Bạn đang sử dụng nhiều hơn <span className="text-white font-bold">3 luồng Live</span> (giới hạn của gói Free).
              </p>

              <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-tiktok-yellow">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Tự động đóng sau</p>
                    <p className="text-xl font-black text-white tabular-nums">{timerText}</p>
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Sẽ còn lại</p>
                  <p className="text-lg font-bold text-tiktok-cyan">3 Luồng</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
                >
                  Tôi đã hiểu
                </button>
                <p className="text-[10px] text-gray-600">
                  Vui lòng nâng cấp lại gói Pro để duy trì tất cả các luồng Live hiện tại.
                </p>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-600 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
