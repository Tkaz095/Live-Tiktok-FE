"use client";

import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "@/features/shared-auth/stores/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginForm({ onOpenRegister }: { onOpenRegister: () => void }) {
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
      // Redirect based on role
      if (res.role_id === 1) {
        router.push("/admin");
      } else {
        router.push("/user");
      }
    } else {
      setError(res.error ?? "Đăng nhập thất bại.");
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/20 bg-[linear-gradient(165deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-8">
      <div className="mb-7 space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Đăng nhập</h2>
        <p className="text-sm text-white/60">Sử dụng tài khoản để đăng nhập vào hệ thống monitor.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/85">Tên đăng nhập</label>
          <input
            required
            type="text"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Nhập tên đăng nhập..."
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
          <button type="button" onClick={() => { setEmail("admin"); setPassword("123456"); }} className="w-full rounded-xl border border-tiktok-cyan/30 bg-tiktok-cyan/10 py-2 text-xs font-semibold text-tiktok-cyan transition hover:bg-tiktok-cyan hover:text-black">
            Điền nhanh Admin
          </button>
          <button type="button" onClick={() => { setEmail("user"); setPassword("123456"); }} className="w-full rounded-xl border border-tiktok-pink/30 bg-tiktok-pink/10 py-2 text-xs font-semibold text-tiktok-pink transition hover:bg-tiktok-pink hover:text-white">
            Điền nhanh User
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-white/65">
        Chưa có tài khoản?{" "}
        <button
          onClick={onOpenRegister}
          className="font-medium text-tiktok-yellow hover:text-tiktok-cyan underline decoration-tiktok-yellow/30 underline-offset-4 transition-colors"
        >
          Tạo tài khoản mới
        </button>
      </p>
    </div>
  );
}
