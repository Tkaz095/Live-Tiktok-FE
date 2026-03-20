"use client";

import LoginForm from "@/components/auth/LoginForm";
import RegisterModal from "@/components/auth/RegisterModal";
import { useState } from "react";

export default function LoginPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070707] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(37,244,238,0.25)_0%,_rgba(37,244,238,0)_70%)]" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,_rgba(254,44,85,0.24)_0%,_rgba(254,44,85,0)_70%)]" />
        <div className="absolute bottom-[-160px] left-1/4 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(252,225,75,0.18)_0%,_rgba(252,225,75,0)_72%)]" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-stretch justify-center gap-12 px-6 py-14 lg:flex-row lg:items-center lg:gap-16">
        <div className="w-full max-w-xl space-y-7">

          <div className="space-y-4">
            <p className="inline-flex rounded-full border border-tiktok-cyan/40 bg-tiktok-cyan/10 px-3 py-1 text-xs font-medium tracking-[0.16em] text-tiktok-cyan uppercase">
              Welcome back
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
              Đăng nhập để quản lý phiên theo dõi TikTok Live tập trung
            </h1>
            <p className="max-w-lg text-base text-white/70 md:text-lg">
              Truy cập nhanh danh sách tài khoản đã theo dõi, lịch sử thao tác và đồng
              bộ thiết bị theo thời gian thực.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.14em] text-white/55">Live Sync</p>
              <p className="mt-2 text-lg font-semibold text-tiktok-cyan">Realtime</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.14em] text-white/55">Workspace</p>
              <p className="mt-2 text-lg font-semibold text-tiktok-pink">Team Ready</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.14em] text-white/55">Alert</p>
              <p className="mt-2 text-lg font-semibold text-tiktok-yellow">Smart Filter</p>
            </div>
          </div>
        </div>

        <LoginForm onOpenRegister={() => setIsRegisterOpen(true)} />
      </section>

      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />
    </main>
  );
}
