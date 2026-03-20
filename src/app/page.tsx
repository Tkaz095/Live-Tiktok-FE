"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/shared-auth/stores/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
    } else if (user.role_id === 1) {
      router.replace("/admin");
    } else {
      router.replace("/user");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <span className="w-8 h-8 border-2 border-tiktok-cyan/30 border-t-tiktok-cyan rounded-full animate-spin" />
    </div>
  );
}
