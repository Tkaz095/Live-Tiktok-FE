"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, UserPlus, X, ArrowLeft } from "lucide-react";
import { API_BASE } from "@/lib/auth";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          full_name: fullName || undefined,
          role_id: 2 // customer
        })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          // Reset states after closing
          setTimeout(() => {
            setSuccess(false);
            setUsername("");
            setFullName("");
            setEmail("");
            setPassword("");
          }, 500);
        }, 1800);
      } else {
        setError(data.error ?? "Đăng ký thất bại.");
      }
    } catch (err) {
      setLoading(false);
      setError("Lỗi kết nối máy chủ.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-8 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-lg bg-[#16161d] border border-white/10 rounded-3xl p-8 shadow-2xl my-auto overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-95"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mb-8 pt-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-white font-black text-lg shadow-[0_0_20px_rgba(37,244,238,0.3)] mb-4">
                TT
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">
                Tạo tài khoản
              </h1>
              <p className="text-gray-500 text-xs mt-1">Bắt đầu theo dõi TikTok Live ngay hôm nay</p>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-10 text-center"
              >
                <CheckCircle2 size={56} className="text-tiktok-cyan" />
                <p className="text-white font-bold text-xl">Đăng ký thành công!</p>
                <p className="text-gray-500 text-sm">Cửa sổ sẽ đóng sau giây lát...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Tên đăng nhập</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="username"
                    className="w-full bg-[#1e1e24] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-tiktok-cyan focus:ring-1 focus:ring-tiktok-cyan/30 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Họ tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A (tuỳ chọn)"
                    className="w-full bg-[#1e1e24] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-tiktok-cyan focus:ring-1 focus:ring-tiktok-cyan/30 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-[#1e1e24] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-tiktok-cyan focus:ring-1 focus:ring-tiktok-cyan/30 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Mật khẩu</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-[#1e1e24] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-tiktok-cyan focus:ring-1 focus:ring-tiktok-cyan/30 transition-all outline-none"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-2"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[.98] transition-all shadow-[0_10px_30px_rgba(37,244,238,0.2)] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                  ) : (
                    <UserPlus size={18} />
                  )}
                  {loading ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
                </button>
              </form>
            )}

            {!success && (
              <div className="mt-6 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                  Bảo mật cấp cao & Mã hóa dữ liệu
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
