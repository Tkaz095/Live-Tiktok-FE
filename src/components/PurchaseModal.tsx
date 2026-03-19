"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, QrCode, ShieldCheck, Zap, Crown } from "lucide-react";
import { API_BASE } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";

interface Service {
  id: number;
  name: string;
  max_live_slots: number;
  price_monthly: number;
  description: string | null;
  status: string;
}

interface PurchaseModalProps {
  service: Service | null;
  onClose: () => void;
  onSuccess: (service: Service) => void;
}

function formatPrice(price: number) {
  if (price === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function ServiceIcon({ price }: { price: number }) {
  if (price === 0) return <span className="text-3xl">🆓</span>;
  if (price < 150000) return <Zap size={28} className="text-tiktok-cyan" />;
  return <Crown size={28} className="text-tiktok-yellow" />;
}

export default function PurchaseModal({ service, onClose, onSuccess }: PurchaseModalProps) {
  const { getToken, updateSubscription } = useAuth();
  const [step, setStep] = useState<"confirm" | "buying" | "success">("confirm");
  const [error, setError] = useState<string | null>(null);

  if (!service) return null;

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 31 * 24 * 60 * 60 * 1000);

  const handleBuy = async () => {
    setError(null);
    setStep("buying");

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          service_id: service.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })
      });

      const data = await res.json();

      if (data.success) {
        // Update local subscription plan
        updateSubscription(service.max_live_slots);
        setStep("success");
        setTimeout(() => {
          onSuccess(service);
          onClose();
        }, 2000);
      } else {
        setError(data.error ?? "Đăng ký thất bại. Vui lòng thử lại.");
        setStep("confirm");
      }
    } catch {
      setError("Lỗi kết nối máy chủ.");
      setStep("confirm");
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget && step !== "buying") onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md mx-4 bg-[#141414] border border-[#2a2a2a] rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden"
        >
          {/* Close button */}
          {step !== "buying" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
          )}

          {/* ── Success state ── */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-16 px-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CheckCircle2 size={56} className="text-tiktok-cyan" />
              </motion.div>
              <h2 className="text-xl font-bold text-white">Đăng ký thành công!</h2>
              <p className="text-gray-400 text-sm">
                Bạn đã kích hoạt <span className="text-tiktok-cyan font-semibold">{service.name}</span>.<br />
                Hiệu lực đến: <span className="text-white font-medium">{endDate.toLocaleDateString("vi-VN")}</span>
              </p>
            </div>
          )}

          {/* ── Main (confirm / buying) ── */}
          {step !== "success" && (
            <>
              {/* Header */}
              <div className="bg-gradient-to-br from-tiktok-cyan/10 to-tiktok-pink/10 px-6 py-5 border-b border-[#2a2a2a]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1e1e1e] border border-[#333] flex items-center justify-center shrink-0">
                    <ServiceIcon price={service.price_monthly} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Đăng ký gói</p>
                    <h2 className="text-lg font-bold text-white">{service.name}</h2>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {/* Info */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1a1a1a] rounded-xl px-3 py-2.5 text-center border border-[#282828]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Live Slots</p>
                    <p className="text-tiktok-cyan font-bold text-lg leading-none">{service.max_live_slots}</p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl px-3 py-2.5 text-center border border-[#282828]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Thời hạn</p>
                    <p className="text-white font-bold text-lg leading-none">31</p>
                    <p className="text-gray-500 text-[10px]">ngày</p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-xl px-3 py-2.5 text-center border border-[#282828]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Giá</p>
                    <p className="text-tiktok-pink font-bold text-sm leading-none mt-1">{formatPrice(service.price_monthly)}</p>
                  </div>
                </div>

                {service.description && (
                  <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-tiktok-cyan/40 pl-3">
                    {service.description}
                  </p>
                )}

                {/* Fake QR */}
                <div className="flex flex-col items-center gap-3 bg-[#1a1a1a] border border-[#282828] rounded-2xl p-5">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <QrCode size={14} />
                    Quét mã QR để thanh toán
                  </div>

                  {/* Fake QR pattern */}
                  <div className="w-36 h-36 bg-white rounded-xl p-2 relative overflow-hidden">
                    <div className="w-full h-full grid grid-cols-9 gap-px">
                      {Array.from({ length: 81 }, (_, i) => {
                        const pattern = [
                          0,0,0,0,0,0,0,0,0,
                          0,1,1,1,0,1,1,1,0,
                          0,1,0,1,0,1,0,1,0,
                          0,1,1,1,0,1,1,1,0,
                          0,0,0,0,1,0,0,0,0,
                          0,1,0,0,1,1,0,1,0,
                          0,0,1,0,1,0,1,0,0,
                          0,1,0,1,0,1,0,1,0,
                          0,0,0,0,0,0,0,0,0,
                        ];
                        const pseudo = pattern[i] ?? ((i * 7 + 13) % 3 === 0 ? 1 : 0);
                        return (
                          <div
                            key={i}
                            className={`rounded-sm ${pseudo ? "bg-black" : "bg-white"}`}
                          />
                        );
                      })}
                    </div>
                    {/* Overlay badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-lg bg-tiktok-pink flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-black">TT</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-600 text-center">
                    Demo — ấn nút bên dưới để kích hoạt ngay<br />
                    <span className="text-gray-700">(Sandbox payment sẽ tích hợp sau)</span>
                  </p>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                {/* CTA Button */}
                <button
                  onClick={handleBuy}
                  disabled={step === "buying"}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-tiktok-cyan to-tiktok-pink text-white hover:opacity-90 active:scale-[.98] shadow-[0_0_20px_rgba(37,244,238,0.25)] disabled:opacity-50"
                >
                  {step === "buying" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Xác nhận mua — {formatPrice(service.price_monthly)}
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-gray-600">
                  Bằng cách xác nhận, bạn đồng ý với điều khoản sử dụng dịch vụ.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
