"use client";

import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { DEMO_ACCOUNTS, SUBSCRIPTION_PLANS } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

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
    <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[linear-gradient(165deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8">
      <div className="mb-7 space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Đăng nhập</h2>
        <p className="text-sm text-white/60">Sử dụng email để đăng nhập vào hệ thống monitor.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/85">Email</label>
          <input
            required
            type="text"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="dien_ten_dang_nhap_vao_day"
            className="w-full rounded-2xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-tiktok-cyan"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/85">Mật khẩu</label>
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-white/15 bg-black/35 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-tiktok-cyan"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 my-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/65 transition hover:bg-white/10 hover:text-white"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-tiktok-pink px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e0264c] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <LoaderCircle size={17} className="animate-spin" /> : <LogIn size={17} />}
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button type="button" onClick={() => { setEmail("admin"); setPassword("12345"); }} className="w-full rounded-xl border border-tiktok-cyan/30 bg-tiktok-cyan/10 py-2 text-xs font-semibold text-tiktok-cyan transition hover:bg-tiktok-cyan hover:text-black">
            Điền nhanh Admin
          </button>
          <button type="button" onClick={() => { setEmail("user"); setPassword("12345"); }} className="w-full rounded-xl border border-tiktok-pink/30 bg-tiktok-pink/10 py-2 text-xs font-semibold text-tiktok-pink transition hover:bg-tiktok-pink hover:text-white">
            Điền nhanh User
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-[10px] uppercase tracking-widest text-white/40 text-center mb-4">Tài khoản demo</p>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => {
            const plan = SUBSCRIPTION_PLANS[acc.subscription];
            return (
              <button
                key={acc.email}
                onClick={() => fillDemo(acc.email, acc.password)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-left group box-border overflow-hidden"
              >
                <img src={acc.avatar} alt={acc.name} className="w-7 h-7 rounded-full border border-white/10 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium truncate">{acc.name}</p>
                </div>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0"
                  style={{ color: plan.color, borderColor: `${plan.color}40`, backgroundColor: `${plan.color}15` }}
                >
                  {plan.badge} {plan.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-white/65">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-tiktok-yellow hover:text-tiktok-cyan underline decoration-tiktok-yellow/30 underline-offset-4">
          Tạo tài khoản mới
        </Link>
      </p>
    </div>
  );
}
