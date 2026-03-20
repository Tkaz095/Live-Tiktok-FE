"use client";

import { Check, Zap, Crown, Star, ShieldCheck, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { SUBSCRIPTION_PLANS } from "@/features/shared-auth/types/auth.types";
import { useAuth } from "@/features/shared-auth/stores/AuthContext";

export default function ServicesPage() {
  const { user } = useAuth();
  const currentTier = user?.subscription || "free";

  const plans = [
    {
      ...SUBSCRIPTION_PLANS.free,
      price: "0",
      description: "Phù hợp cho người mới bắt đầu tìm hiểu.",
      icon: Star,
      buttonText: "Đang sử dụng",
      popular: false,
    },
    {
      ...SUBSCRIPTION_PLANS.plus,
      price: "199.000",
      description: "Dành cho các nhà sáng tạo nội dung chuyên nghiệp.",
      icon: Zap,
      buttonText: "Nâng cấp ngay",
      popular: true,
    },
    {
      ...SUBSCRIPTION_PLANS.pro,
      price: "499.000",
      description: "Giải pháp tối ưu cho các Agency và Team lớn.",
      icon: Crown,
      buttonText: "Liên hệ ngay",
      popular: false,
    },
  ];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      <Navbar activeCount={0} />

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiktok-pink/10 border border-tiktok-pink/20"
            >
              <Rocket size={16} className="text-tiktok-pink" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-tiktok-pink">Bảng giá gói dịch vụ</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black tracking-tight"
            >
              Chọn gói phù hợp với <span className="text-transparent bg-clip-text bg-gradient-to-r from-tiktok-cyan to-tiktok-pink">nhu cầu của bạn</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 max-w-2xl mx-auto font-medium"
            >
              Nâng tầm khả năng quản lý TikTok Live với các công cụ phân tích thời gian thực mạnh mẽ nhất.
            </motion.p>
          </div>

          {/* Core Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { title: "Thời gian thực", desc: "Dữ liệu cập nhật liên tục từng giây", icon: Zap },
              { title: "Bảo mật tuyệt đối", desc: "Thông tin của bạn luôn được bảo vệ", icon: ShieldCheck },
              { title: "Hỗ trợ 24/7", desc: "Luôn có mặt khi bạn gặp khó khăn", icon: Users },
            ].map((f, i) => (
              <div key={i} className="bg-tiktok-surface border border-tiktok-border rounded-2xl p-6 flex items-start gap-4">
                <div className="p-3 bg-tiktok-dark border border-tiktok-border rounded-xl">
                  <f.icon className="text-tiktok-cyan" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`relative group bg-tiktok-surface border ${
                  plan.popular ? "border-tiktok-cyan shadow-[0_20px_60px_rgba(37,244,238,0.15)]" : "border-tiktok-border shadow-2xl"
                } rounded-[32px] p-8 flex flex-col transition-all hover:-translate-y-2`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-tiktok-cyan text-black px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Phổ biến nhất
                  </div>
                )}

                <div className="flex items-center justify-between mb-8">
                  <div className={`p-4 rounded-2xl ${plan.popular ? 'bg-tiktok-cyan/10' : 'bg-tiktok-dark'} border border-tiktok-border`}>
                    <plan.icon size={28} style={{ color: plan.color }} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{plan.label}</p>
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-3xl font-black tracking-tight">{plan.price}đ</span>
                      <span className="text-xs text-gray-600 font-bold">/tháng</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-8 font-medium italic min-h-[40px]">
                  "{plan.description}"
                </p>

                <div className="space-y-4 flex-1 mb-10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Tính năng nổi bật:</p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-tiktok-cyan" strokeWidth={3} />
                      </div>
                      <span className="text-xs font-semibold text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  disabled={currentTier === plan.tier}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                    currentTier === plan.tier
                      ? "bg-tiktok-border text-gray-500 cursor-not-allowed"
                      : plan.popular
                      ? "bg-tiktok-cyan text-black hover:bg-[#00d1ca] shadow-[0_0_20px_rgba(37,244,238,0.3)] hover:scale-105"
                      : "bg-tiktok-dark border border-tiktok-border hover:bg-white/5 hover:scale-105"
                  } active:scale-95`}
                >
                  {currentTier === plan.tier ? "Đang sử dụng" : plan.buttonText}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-20 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest space-y-4">
            <p>Giá trên đã bao gồm thuế VAT. Hỗ trợ thanh toán qua MoMo, Chuyển khoản ngân hàng.</p>
            <div className="flex items-center justify-center gap-8">
              <span className="hover:text-gray-400 cursor-pointer transition-colors">Điều khoản dịch vụ</span>
              <span className="hover:text-gray-400 cursor-pointer transition-colors">Chính sách bảo mật</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Added missing icon for features overview
function Users({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
