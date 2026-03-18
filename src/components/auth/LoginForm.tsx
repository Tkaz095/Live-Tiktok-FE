"use client";

import Link from "next/link";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    setIsSubmitting(true);

    // Demo only: UI state for login flow before API integration.
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsSubmitting(false);
    setNotice("Đăng nhập demo thành công. Có thể gắn API thật vào hàm handleSubmit.");
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[linear-gradient(165deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8">
      <div className="mb-7 space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Sign in</h2>
        <p className="text-sm text-white/60">Sử dụng email để đăng nhập vào hệ thống monitor.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/85">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-2xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-tiktok-cyan"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-white/85">Password</span>
          <div className="relative">
            <input
              required
              minLength={8}
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
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between gap-4 pt-1 text-sm">
          <label className="inline-flex items-center gap-2 text-white/75">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/35 text-tiktok-cyan focus:ring-tiktok-cyan"
            />
            Ghi nhớ đăng nhập
          </label>
          <Link href="#" className="text-tiktok-cyan transition hover:text-tiktok-yellow">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-tiktok-pink px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e0264c] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <LoaderCircle size={17} className="animate-spin" /> : null}
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      {notice ? (
        <p className="mt-4 rounded-xl border border-tiktok-cyan/30 bg-tiktok-cyan/10 px-3 py-2 text-sm text-tiktok-cyan">
          {notice}
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-white/65">
        Chưa có tài khoản?{" "}
        <Link href="#" className="font-medium text-tiktok-yellow hover:text-tiktok-cyan">
          Tạo tài khoản mới
        </Link>
      </p>
    </div>
  );
}
