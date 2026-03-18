"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { DEMO_ACCOUNTS, SUBSCRIPTION_PLANS } from "@/lib/auth";
import { Wifi, Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      router.push("/");
    } else {
      setError(res.error ?? "Đăng nhập thất bại.");
    }
  };

  const fillDemo = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-tiktok-pink/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-tiktok-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-white font-black text-xl shadow-[0_0_30px_rgba(254,44,85,0.4)] mb-4">
            TT
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            TikTok <span className="text-tiktok-cyan">Live</span> Monitor
          </h1>
          <p className="text-gray-500 text-sm mt-1">Đăng nhập để bắt đầu theo dõi</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-tiktok-cyan transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-tiktok-cyan transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-tiktok-pink to-tiktok-cyan text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[.98] transition-all shadow-[0_0_20px_rgba(254,44,85,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#222]">
            <p className="text-xs text-gray-500 text-center mb-4">Tài khoản demo — click để điền tự động</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const plan = SUBSCRIPTION_PLANS[acc.subscription];
                return (
                  <button
                    key={acc.email}
                    onClick={() => fillDemo(acc.email, acc.password)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors text-left group"
                  >
                    <img src={acc.avatar} alt={acc.name} className="w-8 h-8 rounded-full border border-[#333]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{acc.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{acc.email}</p>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full border shrink-0"
                      style={{ color: plan.color, borderColor: `${plan.color}40`, backgroundColor: `${plan.color}15` }}
                    >
                      {plan.badge} {plan.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-tiktok-cyan hover:underline font-medium">Đăng ký miễn phí</a>
        </p>
      </div>
    </div>
  );
}
