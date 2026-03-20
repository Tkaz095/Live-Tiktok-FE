"use client";

import { LayoutDashboard, Monitor, User, LogOut, ChevronDown, Zap, Activity, Settings, UserCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/shared-auth/stores/AuthContext";
import { SUBSCRIPTION_PLANS, SubscriptionTier } from "@/features/shared-auth/types/auth.types";

interface NavbarProps {
  activeCount: number;
}

export default function Navbar({ activeCount }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { plan, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { name: "Monitor", href: "/user/monitor", icon: Monitor },
    { name: "Dịch vụ", href: "/user/services", icon: Zap },
  ];

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[64px] bg-background/80 backdrop-blur-3xl border-b border-tiktok-border flex items-center px-6 gap-6 z-[100] shrink-0 sticky top-0 w-full shadow-lg">
      {/* ── Brand Section ───────────────── */}
      <div className="flex items-center gap-3 shrink-0 relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-tiktok-pink/20 to-tiktok-cyan/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <Link href="/user/dashboard" className="flex items-center gap-2.5 relative z-10 active:scale-95 transition-transform">
          <div className="w-9 h-9 bg-gradient-to-br from-[#ff0050] to-[#00f2ea] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,0,80,0.2)] hover:shadow-[0_0_20px_rgba(37,244,238,0.3)] transition-all duration-500">
            <span className="text-white font-black text-lg tracking-tighter italic select-none">TT</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-base font-bold text-white leading-none tracking-tight group-hover:text-tiktok-cyan transition-colors">TikTok Live</h1>
            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-0.5 opacity-60">PRO MONITOR</p>
          </div>
        </Link>
      </div>

      {/* ── Center — Navigation ─────────── */}
      <nav className="flex-1 flex justify-center">
        <div className="flex items-center bg-tiktok-dark/40 backdrop-blur-md rounded-xl p-1 border border-tiktok-border shadow-inner gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name}
                href={item.href}
                className="relative group focus:outline-none"
              >
                <div className={`
                  relative z-10 px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-500 flex items-center gap-2
                  ${isActive ? "text-black" : "text-gray-500 hover:text-white"}
                `}>
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-black" : "text-gray-600 transition-colors group-hover:text-tiktok-pink"} />
                  <span className="hidden sm:block">{item.name}</span>
                </div>
                
                {isActive && (
                  <motion.div 
                    layoutId="nav-bg-compact-final"
                    className="absolute inset-0 bg-gradient-to-r from-tiktok-cyan to-[#00d1ca] rounded-lg shadow-[0_0_15px_rgba(37,244,238,0.2)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Right panel ──────────────── */}
      <div className="flex items-center gap-6 shrink-0">
        {/* Compact Status */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 bg-tiktok-dark/30 border border-tiktok-border rounded-xl">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Live</span>
              <span className="text-xs font-bold text-white leading-none">{activeCount} <span className="text-[10px] text-gray-600 font-medium">/ {plan?.maxColumns === -1 ? '∞' : plan?.maxColumns || 3}</span></span>
            </div>
            <div className="h-0.5 w-12 bg-black rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(activeCount / (plan?.maxColumns === -1 ? 10 : plan?.maxColumns || 3)) * 100}%` }}
                className="h-full bg-tiktok-cyan"
              />
            </div>
          </div>
        </div>

        {/* User Card with Dropdown */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 pl-6 border-l border-tiktok-border hover:opacity-80 transition-opacity focus:outline-none"
          >
            <div className="flex flex-col items-end hidden md:flex select-none">
              <span className="text-[11px] font-bold text-white/90 truncate max-w-[100px]">{user?.name}</span>
              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  plan?.tier === 'pro' ? "text-tiktok-yellow" : 
                  plan?.tier === 'plus' ? "text-tiktok-cyan" : 
                  "text-gray-500"
                }`}>
                {plan?.label}
              </span>
            </div>
            
            <div className={`h-9 w-9 rounded-xl bg-tiktok-dark border flex items-center justify-center transition-all shadow-inner ${isMenuOpen ? 'border-tiktok-cyan shadow-[0_0_10px_rgba(37,244,238,0.2)]' : 'border-tiktok-border'}`}>
              <User size={16} className={isMenuOpen ? "text-tiktok-cyan" : "text-gray-500"} />
            </div>
            <ChevronDown size={12} className={`text-gray-600 transition-transform duration-300 ${isMenuOpen ? 'rotate-180 text-tiktok-cyan' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute right-0 mt-3 w-48 bg-tiktok-surface border border-tiktok-border rounded-2xl shadow-2xl overflow-hidden py-1.5 z-[200]"
              >
                <div className="px-4 py-2 border-b border-tiktok-border mb-1.5">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">Tài khoản</p>
                  <p className="text-[12px] font-bold text-white mt-1.5 truncate">{user?.email}</p>
                </div>

                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/user/settings'); }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-wider"
                >
                  <Settings size={14} className="opacity-60" />
                  Cài đặt hồ sơ
                </button>

                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/user/services'); }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-400 hover:text-tiktok-cyan hover:bg-tiktok-cyan/5 transition-all text-[11px] font-bold uppercase tracking-wider"
                >
                  <Zap size={14} className="text-tiktok-cyan" />
                  Gói dịch vụ
                </button>

                <div className="h-[1px] bg-tiktok-border my-1.5 mx-2" />

                <button
                  onClick={() => { setIsMenuOpen(false); logout(); }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-500 hover:text-tiktok-pink hover:bg-tiktok-pink/5 transition-all text-[11px] font-bold uppercase tracking-wider"
                >
                  <LogOut size={14} className="opacity-60" />
                  Đăng xuất
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
