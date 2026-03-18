"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { register } from "@/lib/auth";
import { SUBSCRIPTION_PLANS, SubscriptionTier } from "@/lib/auth";
import { CheckCircle2, UserPlus } from "lucide-react";

const PLAN_ORDER: SubscriptionTier[] = ["free", "plus", "pro"];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("free");
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
    const result = register(name, email, password, selectedTier);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Đăng ký thất bại.");
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1800);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-12">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-tiktok-cyan/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-tiktok-pink/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-white font-black text-xl shadow-[0_0_30px_rgba(37,244,238,0.3)] mb-4">
            TT
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Tạo tài khoản
          </h1>
          <p className="text-gray-500 text-sm mt-1">Bắt đầu theo dõi TikTok Live ngay hôm nay</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl"
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-8 text-center"
            >
              <CheckCircle2 size={48} className="text-tiktok-cyan" />
              <p className="text-white font-bold text-lg">Đăng ký thành công!</p>
              <p className="text-gray-500 text-sm">Đang chuyển hướng đến trang đăng nhập...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Plan Selection */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 block">Chọn gói</label>
                <div className="grid grid-cols-3 gap-2">
                  {PLAN_ORDER.map((tier) => {
                    const plan = SUBSCRIPTION_PLANS[tier];
                    const isSelected = selectedTier === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? "border-current bg-current/10"
                            : "border-[#2a2a2a] hover:border-[#3a3a3a] bg-transparent"
                        }`}
                        style={isSelected ? { borderColor: plan.color, backgroundColor: `${plan.color}15`, color: plan.color } : { color: "#6b7280" }}
                      >
                        <span className="text-xl">{plan.badge || "🆓"}</span>
                        <span className="text-xs font-bold">{plan.label}</span>
                        <span className="text-[10px] opacity-70">
                          {plan.maxColumns === -1 ? "Unlimited" : `${plan.maxColumns} luồng`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 bg-[#1a1a1a] rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-semibold mb-1.5">Tính năng bao gồm:</p>
                  <ul className="space-y-1">
                    {SUBSCRIPTION_PLANS[selectedTier].features.map((f) => (
                      <li key={f} className="text-xs text-gray-300 flex items-center gap-1.5">
                        <CheckCircle2 size={10} className="text-tiktok-cyan shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Họ tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-tiktok-cyan transition-colors"
                />
              </div>
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
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-tiktok-cyan transition-colors"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[.98] transition-all shadow-[0_0_20px_rgba(37,244,238,0.2)] disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                ) : (
                  <UserPlus size={16} />
                )}
                {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
              </button>
            </form>
          )}
        </motion.div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-tiktok-pink hover:underline font-medium">Đăng nhập</a>
        </p>
      </div>
    </div>
  );
}
