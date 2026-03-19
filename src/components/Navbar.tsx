import Link from "next/link";
import { Plus, LogOut, Zap, Crown, ChevronDown, Tv2, Radio } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/auth";
import PurchaseModal from "./PurchaseModal";

interface Service {
  id: number;
  name: string;
  max_live_slots: number;
  price_monthly: number;
  description: string | null;
  status: string;
}

export default function Navbar({
  onJoin,
  activeCount = 0,
}: {
  onJoin?: (username: string) => void;
  activeCount?: number;
}) {
  const router = useRouter();
  const { user, plan, logout } = useAuth();
  const [url, setUrl] = useState("");
  const [limitHit, setLimitHit] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [showServices, setShowServices] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch services list on mount
  useEffect(() => {
    fetch(`${API_BASE}/services`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setServices(data.data); })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowServices(false);
      }
    }
    if (showServices) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showServices]);

  const handleJoin = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (plan && plan.maxColumns !== -1 && activeCount >= plan.maxColumns) {
      setLimitHit(true);
      setTimeout(() => setLimitHit(false), 3000);
      return;
    }

    let username = "";
    const match = trimmed.match(/tiktok\.com\/@([a-zA-Z0-9_.]+)/);
    if (match && match[1]) {
      username = match[1];
    } else if (trimmed.startsWith("@")) {
      username = trimmed.slice(1);
    } else {
      username = trimmed;
    }

    if (onJoin && username) {
      onJoin(username);
    }
    setUrl("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleJoin();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const PlanIcon = plan?.tier === "pro" ? Crown : plan?.tier === "plus" ? Zap : null;

  function formatPrice(price: number) {
    if (price === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  }

  return (
    <>
      <header className="h-[70px] border-b border-tiktok-border bg-tiktok-dark flex items-center justify-between px-6 shrink-0 z-10 w-full relative">

      {/* ── Brand ────────────────────── */}
      <div className="flex items-center gap-3 w-[200px] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tiktok-cyan to-tiktok-pink flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(37,244,238,0.2)]">
          TT
        </div>
        <h1 className="text-white font-bold text-lg tracking-tight">
          TikTok <span className="text-tiktok-cyan">Live</span> Monitor
        </h1>
      </div>

      {/* ── Center — Add URL ─────────── */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-2xl px-6 gap-1">
        <div className="flex items-center gap-2 w-full">
          <div className="relative w-full flex-1 group">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Dán link TikTok Live hoặc @username..."
              className="w-full bg-[#1b1b1b] border border-tiktok-border rounded-full py-2.5 px-5 text-sm focus:outline-none focus:border-tiktok-cyan transition-colors text-white placeholder-gray-500 hover:border-[#444]"
            />
          </div>
          <button
            onClick={handleJoin}
            className="bg-tiktok-pink hover:bg-[#e0264c] text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 transition-all shrink-0 shadow-[0_0_10px_rgba(254,44,85,0.3)] hover:shadow-[0_0_20px_rgba(254,44,85,0.6)]"
          >
            <Plus size={17} strokeWidth={2.5} />
            Thêm URL
          </button>
        </div>

        <AnimatePresence>
          {limitHit && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-tiktok-yellow"
            >
              ⚠️ Gói {plan?.label} chỉ hỗ trợ tối đa {plan?.maxColumns} luồng.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right panel ──────────────── */}
      <div className="flex items-center gap-3 w-[280px] shrink-0 justify-end">

        {/* Live count */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-gray-400 text-[10px] flex items-center gap-1">
            <Radio size={10} className="text-tiktok-pink animate-pulse" />
            Đang theo dõi
          </span>
          <span className="text-tiktok-cyan font-bold text-xl leading-none">
            {activeCount}
            <span className="text-gray-500 text-xs font-normal ml-1">phiên</span>
          </span>
        </div>

        {/* Services / Plan dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowServices((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 transition-all hover:scale-105"
              style={{
                color: plan?.color ?? "#9ca3af",
                borderColor: `${plan?.color ?? "#9ca3af"}50`,
                backgroundColor: `${plan?.color ?? "#9ca3af"}15`,
              }}
              title="Xem các gói dịch vụ"
            >
              {PlanIcon && <PlanIcon size={11} />}
              {plan?.badge} {plan?.label ?? "Free"}
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${showServices ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showServices && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[calc(100%+8px)] w-72 bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-50"
                >
                  {/* Dropdown header */}
                  <div className="px-4 py-3 border-b border-[#222] flex items-center gap-2">
                    <Tv2 size={14} className="text-tiktok-cyan" />
                    <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">
                      Gói dịch vụ
                    </span>
                  </div>

                  {/* Service list */}
                  <div className="py-1 max-h-80 overflow-y-auto">
                    {services.filter(s => s.status === 'active').length === 0 && (
                      <p className="text-xs text-gray-500 px-4 py-4 text-center">Đang tải gói dịch vụ...</p>
                    )}
                    {services
                      .filter((s) => s.status === "active")
                      .map((service) => {
                        const isCurrent =
                          plan && service.max_live_slots === plan.maxColumns;
                        return (
                          <div
                            key={service.id}
                            className={`px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-[#1e1e1e] last:border-0 ${
                              isCurrent ? "bg-tiktok-cyan/5" : ""
                            }`}
                            onClick={() => { setShowServices(false); setSelectedService(service); }}
                          >
                            {/* Icon */}
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-black ${
                                service.price_monthly === 0
                                  ? "bg-gray-700 text-gray-300"
                                  : service.price_monthly < 150000
                                  ? "bg-tiktok-cyan/20 text-tiktok-cyan"
                                  : "bg-tiktok-yellow/20 text-tiktok-yellow"
                              }`}
                            >
                              {service.price_monthly === 0 ? "F" : service.price_monthly < 150000 ? "⚡" : "👑"}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white truncate">{service.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-tiktok-cyan/20 text-tiktok-cyan px-1.5 py-0.5 rounded-full font-bold">
                                    HIỆN TẠI
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{service.description}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[11px] text-tiktok-cyan font-bold">
                                  📺 {service.max_live_slots} slot Live
                                </span>
                                <span className="text-[11px] text-gray-500">
                                  {formatPrice(service.price_monthly)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-[#222] px-4 py-2.5">
                    <p className="text-[10px] text-gray-600 text-center">
                      Liên hệ admin để nâng cấp gói
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Login link if not logged in */}
        {!user && (
          <Link
            href="/login"
            className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/85 transition hover:border-tiktok-cyan hover:text-tiktok-cyan"
          >
            Đăng nhập
          </Link>
        )}

        {/* Avatar + Logout */}
        {user && (
          <div className="flex items-center gap-2">
            <img
              src={user.avatar}
              alt={user.name}
              title={user.name}
              className="w-8 h-8 rounded-full border border-[#333] shrink-0"
            />
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="text-gray-500 hover:text-tiktok-pink transition-colors p-1 rounded-md"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>

      {/* Purchase Modal */}
      {selectedService && (
        <PurchaseModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSuccess={() => setSelectedService(null)}
        />
      )}
    </>
  );
}
