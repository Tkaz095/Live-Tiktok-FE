"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Shield, Moon, Sun, Monitor, HardDrive, Mail, Lock, Save, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/features/shared-auth/stores/AuthContext";
import { useTheme } from "@/features/shared-theme/ThemeContext";
import { API_BASE } from "@/features/shared-auth/api/authApi";

export default function SettingsPage() {
  const { user, getToken, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [saveLocation, setSaveLocation] = useState(user?.data_storage_path || "C:/Users/TikTok-Monitor/Data");
  const [isSaving, setIsSaving] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeSection, setActiveSection] = useState("appearance");

  // Sync saveLocation when user data is loaded (Fix F5 loss)
  useEffect(() => {
    if (user?.data_storage_path) {
      setSaveLocation(user.data_storage_path);
    }
  }, [user?.data_storage_path]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectDirectory = async () => {
    if (isSelecting) return;
    setIsSelecting(true);
    
    // Show status message via button text
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/system/select-directory`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.path) {
        setSaveLocation(data.path);
      } else if (data.success === false && data.message) {
        console.log("Directory selection info:", data.message);
      }
    } catch (error: any) {
      alert(`Lỗi: ${error.message || "Không thể mở hộp thoại chọn thư mục."}`);
    } finally {
      setIsSelecting(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/auth/update-user/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          data_storage_path: saveLocation
        })
      });

      const data = await res.json();
      if (data.success) {
        updateUser({ data_storage_path: saveLocation });
        alert("Cài đặt đã được lưu thành công!");
      } else {
        alert(data.error || "Gặp lỗi khi lưu cài đặt.");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground font-sans">
      <Navbar activeCount={0} />

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-tiktok-border pb-6">
            <div className="p-3 bg-tiktok-surface border border-tiktok-border rounded-2xl">
              <Settings className="text-tiktok-cyan" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Cài đặt hệ thống</h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Quản lý tài khoản & Tùy chỉnh trải nghiệm</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar Navigation */}
            <div className="space-y-1">
              {[
                { id: "appearance", label: "Giao diện", icon: Moon },
                { id: "account", label: "Tài khoản", icon: Mail },
                { id: "security", label: "Bảo mật", icon: Shield },
                { id: "storage", label: "Lưu trữ", icon: HardDrive },
                { id: "language", label: "Ngôn ngữ", icon: Globe },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    activeSection === item.id ? "bg-tiktok-cyan text-black" : "text-gray-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="md:col-span-2 space-y-8 max-h-[calc(100vh-250px)] overflow-y-auto pr-4 custom-scrollbar pb-20">
              {/* Theme Section */}
              <section id="appearance" className="bg-tiktok-surface border border-tiktok-border rounded-3xl p-6 space-y-6 shadow-xl scroll-mt-6">
                <div className="flex items-center gap-2 border-b border-tiktok-border pb-4">
                  <Monitor size={16} className="text-tiktok-pink" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Chế độ hiển thị</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                      theme === "dark" ? "bg-tiktok-dark border-tiktok-cyan" : "bg-gray-200/50 border-transparent text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                        theme === "dark" ? "bg-black border-tiktok-border" : "bg-gray-300/50 border-gray-400/20"
                    }`}>
                      <Moon size={20} className={theme === "dark" ? "text-tiktok-cyan" : "text-gray-500"} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Tối (Mặc định)</span>
                  </button>

                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                      theme === "light" ? "bg-white text-black border-tiktok-cyan shadow-sm" : "bg-black/20 border-tiktok-border hover:border-gray-700"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                         theme === "light" ? "bg-white border-tiktok-pink/20" : "bg-gray-100 border-gray-200"
                    }`}>
                      <Sun size={20} className={theme === "light" ? "text-tiktok-pink" : "text-gray-400"} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Sáng (Beta)</span>
                  </button>
                </div>
              </section>

              {/* Account Section */}
              <section id="account" className="bg-tiktok-surface border border-tiktok-border rounded-3xl p-6 space-y-6 shadow-xl scroll-mt-6">
                <div className="flex items-center gap-2 border-b border-tiktok-border pb-4">
                  <Mail size={16} className="text-tiktok-cyan" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Thông tin tài khoản</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Địa chỉ Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full bg-tiktok-dark border border-tiktok-border rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:outline-none focus:border-tiktok-cyan transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Security Section */}
              <section id="security" className="bg-tiktok-surface border border-tiktok-border rounded-3xl p-6 space-y-6 shadow-xl scroll-mt-6">
                <div className="flex items-center gap-2 border-b border-tiktok-border pb-4">
                  <Lock size={16} className="text-tiktok-yellow" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Bảo mật tài khoản</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Mật khẩu hiện tại</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-tiktok-dark border border-tiktok-border rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:outline-none focus:border-tiktok-cyan transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 bg-tiktok-dark border border-tiktok-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                  Đổi mật khẩu
                </button>
              </section>

              {/* Storage Section */}
              <section id="storage" className="bg-tiktok-surface border border-tiktok-border rounded-3xl p-6 space-y-6 shadow-xl scroll-mt-6">
                <div className="flex items-center gap-2 border-b border-tiktok-border pb-4">
                  <HardDrive size={16} className="text-tiktok-cyan" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Lưu trữ dữ liệu</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Thư mục lưu Cache Chat & Gifts</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={saveLocation}
                      onChange={(e) => setSaveLocation(e.target.value)}
                      className="flex-1 bg-tiktok-dark border border-tiktok-border rounded-xl py-3 px-4 text-xs font-bold focus:outline-none focus:border-tiktok-cyan transition-all"
                    />
                    <button 
                      onClick={handleSelectDirectory}
                      disabled={isSelecting}
                      className="px-4 bg-tiktok-dark border border-tiktok-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSelecting ? "Đang mở..." : "Chọn"}
                    </button>
                  </div>
                </div>
              </section>

              {/* Language Section */}
              <section id="language" className="bg-tiktok-surface border border-tiktok-border rounded-3xl p-6 space-y-6 shadow-xl scroll-mt-6 mb-10">
                <div className="flex items-center gap-2 border-b border-tiktok-border pb-4">
                  <Globe size={16} className="text-tiktok-pink" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Ngôn ngữ & Vùng</h3>
                </div>

                <div className="flex items-center justify-between p-4 bg-tiktok-dark border border-tiktok-border rounded-2xl">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold">Tiếng Việt (Việt Nam)</span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Mặc định hệ thống</span>
                    </div>
                    <button className="px-4 py-2 bg-white/5 border border-tiktok-border rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        Thay đổi
                    </button>
                </div>
              </section>
            </div>

            {/* Action Bar (Now Outside Scrollable Area) */}
            <div className="md:col-start-2 md:col-span-2 pt-6 border-t border-tiktok-border flex items-center justify-end gap-3 bg-background/95 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.1)] py-4 px-6 rounded-b-3xl">
              <button className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-tiktok-cyan text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-tiktok-cyan/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
              >
                <Save size={14} className={isSaving ? "animate-spin" : ""} />
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
