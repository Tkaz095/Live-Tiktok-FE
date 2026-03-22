"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/FollowingSidebar";
import LiveColumn from "@/features/us-live-monitor/components/LiveColumn";
import * as FramerMotion from "framer-motion";
const { motion, AnimatePresence } = FramerMotion;
import { useAuth } from "@/features/shared-auth/stores/AuthContext";
import { API_BASE } from "@/features/shared-auth/api/authApi";
import DowngradeModal from "@/features/us-subscription/components/DowngradeModal";
import { Plus, Search, Layout, Shield } from "lucide-react";
import SessionStatsView from "@/features/us-live-monitor/components/SessionStatsView";
import AddStreamModal from "@/features/us-live-monitor/components/AddStreamModal";

interface ActiveStream {
  id: number;
  tiktoker_id: number;
  tiktok_url: string;
  tiktok_handle: string;
  status: string;
  avatar_url?: string;
}

export default function MonitorPage() {
  const router = useRouter();
  const { user, plan, isLoading, getToken, downgradeTimer, setDowngradeTimer } = useAuth();
  const mainRef = useRef<HTMLDivElement>(null);

  const [activeStreams, setActiveStreams] = useState<ActiveStream[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [url, setUrl] = useState("");
  const [limitHit, setLimitHit] = useState(false);
  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [directoryHandle, setDirectoryHandle] = useState<any>(null);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [pendingJoinUrl, setPendingJoinUrl] = useState<string | null>(null);

  const handleConfirmStorage = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker();
      
      // [FIX] SecurityError: Refresh permission within this user-activated click event
      if (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
        await handle.requestPermission({ mode: 'readwrite' });
      }

      // Prime for existing active streams to ensure they can keep writing
      const dateStr = new Date().toISOString().split('T')[0];
      for (const stream of activeStreams) {
        try {
          const sessionDirName = `${stream.tiktok_handle}_${dateStr}_ID${stream.id}`;
          await handle.getDirectoryHandle(sessionDirName, { create: true });
        } catch (e) {
          console.warn("Failed to prime folder for stream:", stream.id, e);
        }
      }

      setDirectoryHandle(handle);
      setShowStorageModal(false);
      if (pendingJoinUrl) {
        handleJoinAction(pendingJoinUrl, true);
        setPendingJoinUrl(null);
      }
    } catch (err) {
      console.warn("User cancelled directory picker:", err);
      setError("Bạn cần chọn thư mục để tiếp tục (Bản Miễn phí).");
    }
  };

  const fetchActiveStreams = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/streams/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActiveStreams(data.streams);
      }
    } catch (err) {
      console.error("Fetch streams error:", err);
    }
  }, [getToken]);

  // Auth guard — only customers (role_id=2) can access
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role_id === 1) {
        router.push("/admin");
      } else {
        fetchActiveStreams();
      }
    }
  }, [user, isLoading, router, fetchActiveStreams]);

  const handleJoinAction = async (inputUrl?: string, bypassGate = false) => {
    const targetUrl = inputUrl || url;
    if (!targetUrl.trim()) return;

    if (plan && activeStreams.length >= plan.maxColumns && plan.maxColumns !== -1) {
      setLimitHit(true);
      setTimeout(() => setLimitHit(false), 3000);
      return;
    }

    const username = targetUrl.includes("tiktok.com/@")
      ? targetUrl.split("@")[1]?.split("/")[0]
      : targetUrl.replace("@", "");

    if (!username) return;
    setError(null);

    // Each new join action requires a confirmation if on Free plan
    if (user?.subscription === "free" && !bypassGate) {
      setPendingJoinUrl(targetUrl);
      setShowStorageModal(true);
      return;
    }

    try {
      const token = getToken();

      // 1. First, check/add to tiktokers list to get tiktoker_id
      const tiktokersRes = await fetch(`${API_BASE}/tiktokers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tiktokersData = await tiktokersRes.json();

      let tiktoker = tiktokersData.data?.find((t: { id: number; tiktok_handle: string }) => t.tiktok_handle === username);

      if (!tiktoker) {
        const createRes = await fetch(`${API_BASE}/tiktokers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ tiktok_handle: username })
        });
        const createData = await createRes.json();
        if (createData.success) tiktoker = createData.data;
        else throw new Error(createData.error || "Không thể thêm TikToker");
      }

      // 2. Connect stream
      const connectRes = await fetch(`${API_BASE}/streams/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tiktoker_id: tiktoker.id,
          tiktok_url: `https://www.tiktok.com/@${username}/live`
        })
      });

      const connectData = await connectRes.json();

      if (connectRes.status === 403) {
        setError(connectData.error);
        return;
      }

      if (connectData.success) {
        fetchActiveStreams();
        setUrl("");
      } else {
        setError(connectData.error);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi kết nối");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleJoinAction();
  };

  const handleClose = useCallback(async (tiktoker_id_or_handle: string | number) => {
    const session = activeStreams.find(s =>
      s.id === tiktoker_id_or_handle || s.tiktoker_id === tiktoker_id_or_handle || s.tiktok_handle === tiktoker_id_or_handle
    );

    if (!session) {
      setActiveStreams(prev => prev.filter(s => s.tiktok_handle !== tiktoker_id_or_handle));
      return;
    }

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/streams/${session.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActiveStreams(prev => prev.filter(s => s.id !== session.id));
      }
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  }, [activeStreams, getToken]);

  const handleSidebarSelect = (username: string) => {
    const isAlreadyOpen = activeStreams.some(s => s.tiktok_handle === username);
    if (!isAlreadyOpen) {
      handleJoinAction(username);
    } else {
      if (mainRef.current) {
        const el = mainRef.current.querySelector(`[data-username="${username}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      }
    }
  };

  useEffect(() => {
    if (!isLoading && plan && activeStreams.length > plan.maxColumns && plan.maxColumns !== -1) {
      if (downgradeTimer === null) {
        setDowngradeTimer(90);
        setShowDowngradeModal(true);
      }
    } else if (plan && activeStreams.length <= plan.maxColumns) {
      setDowngradeTimer(null);
      setShowDowngradeModal(false);
    }
  }, [plan, activeStreams.length, isLoading, downgradeTimer, setDowngradeTimer]);

  useEffect(() => {
    if (downgradeTimer !== null && downgradeTimer > 0) {
      const t = setInterval(() => {
        setDowngradeTimer(downgradeTimer - 1);
      }, 1000);
      return () => clearInterval(t);
    } else if (downgradeTimer === 0) {
      if (plan && activeStreams.length > plan.maxColumns && plan.maxColumns !== -1) {
        const toClose = activeStreams.slice(plan.maxColumns);
        toClose.forEach(s => handleClose(s.id));
      }
      setDowngradeTimer(null);
    }
  }, [downgradeTimer, plan, activeStreams, setDowngradeTimer, handleClose]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-tiktok-cyan/30 border-t-tiktok-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-black text-white font-sans">
      <Navbar
        activeCount={activeStreams.length}
        directoryHandle={directoryHandle}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeUsernames={activeStreams.map(s => s.tiktok_handle)}
          onSelect={handleSidebarSelect}
          onAddClick={() => setIsAddModalOpen(true)}
        />

        <main ref={mainRef} className="flex-1 overflow-x-hidden md:overflow-x-auto overflow-y-auto md:overflow-y-hidden bg-background relative flex flex-col">
          {/* Main Content Area */}
          <div className="flex-1 overflow-auto p-3">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#fe2c55] border border-white/20 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-[0_10px_40px_rgba(254,44,85,0.4)] backdrop-blur-md flex items-center gap-3"
                >
                  {error}
                  <button onClick={() => setError(null)} className="ml-3 hover:text-white">✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-full flex flex-col md:flex-row gap-4 md:min-w-max items-center md:items-stretch transition-all">
              <AnimatePresence mode="popLayout">
                {activeStreams.map((stream) => (
                  <div
                    key={stream.id}
                    className={`h-full transition-all ${selectedStreamId === stream.id ? 'ring-2 ring-tiktok-cyan ring-offset-4 ring-offset-black rounded-3xl' : ''}`}
                  >
                    <LiveColumn
                      username={stream.tiktok_handle}
                      sessionId={stream.id}
                      initialAvatar={stream.avatar_url}
                      directoryHandle={directoryHandle}
                      onShowStats={() => setSelectedStreamId(stream.id)}
                      onReauthorize={() => setShowStorageModal(true)}
                      onClose={() => {
                        handleClose(stream.id);
                        if (selectedStreamId === stream.id) setSelectedStreamId(null);
                      }}
                    />
                  </div>
                ))}
              </AnimatePresence>

              {activeStreams.length === 0 && (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4 mt-20">
                  <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center border border-[#333]">
                    <span className="text-2xl text-gray-400">+</span>
                  </div>
                  <p>Chưa có luồng Live nào. Hãy dán link và tham gia!</p>
                  {plan && plan.maxColumns !== -1 && (
                    <p className="text-xs text-gray-600">
                      Gói <span style={{ color: plan.color }} className="font-bold">{plan.badge} {plan.label}</span>: tối đa {plan.maxColumns} luồng đồng thời.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Statistics Frame (Bottom) - Conditional Rendering */}
          <AnimatePresence>
            {selectedStreamId && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 230, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-tiktok-border bg-tiktok-surface p-5 shrink-0 overflow-hidden relative shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-tiktok-cyan shadow-[0_0_10px_rgba(37,244,238,0.5)] animate-pulse" />
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] select-none">
                      Thống kê thời gian thực: @{activeStreams.find(s => s.id === selectedStreamId)?.tiktok_handle}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedStreamId(null)}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="h-[200px]">
                  <SessionStatsView
                    sessionId={selectedStreamId}
                    username={activeStreams.find(s => s.id === selectedStreamId)?.tiktok_handle || ""}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AddStreamModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleJoinAction}
      />

      <DowngradeModal
        isOpen={showDowngradeModal}
        onClose={() => setShowDowngradeModal(false)}
        secondsRemaining={downgradeTimer ?? 0}
      />

      {/* Storage Permission Modal */}
      <AnimatePresence>
        {showStorageModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStorageModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-tiktok-card border border-tiktok-border rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tiktok-cyan to-transparent" />
              
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-tiktok-cyan/10 border border-tiktok-cyan/20 flex items-center justify-center text-tiktok-cyan mb-2">
                  <Layout size={40} />
                </div>
                
                <div>
                  <h2 className="text-2xl font-black text-white mb-2 leading-tight">Thiết lập Lưu trữ Cục bộ</h2>
                  <p className="text-gray-400 text-sm leading-relaxed px-4">
                    Để đạt hiệu suất tốt nhất và bảo mật dữ liệu, bạn cần cấp quyền cho hệ thống ghi Log vào thư mục bên dưới:
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[11px] text-tiktok-cyan select-all break-all flex items-center justify-between group">
                      <span>{user?.data_storage_path || 'C:\\Tiktok Monitor'}</span>
                      <Shield size={14} className="text-tiktok-cyan/50" />
                    </div>
                  </div>
                </div>

                <div className="w-full bg-white/5 rounded-2xl p-4 text-left border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-tiktok-cyan/20 flex items-center justify-center text-[10px] font-bold text-tiktok-cyan mt-0.5 shrink-0">1</div>
                    <p className="text-[11px] text-gray-300">Bấm <strong>"Kích hoạt & Chọn thư mục"</strong> bên dưới.</p>
                  </div>
                  <div className="flex items-start gap-3 mt-3">
                    <div className="w-5 h-5 rounded-full bg-tiktok-cyan/20 flex items-center justify-center text-[10px] font-bold text-tiktok-cyan mt-0.5 shrink-0">2</div>
                    <p className="text-[11px] text-gray-300">Chọn đúng thư mục trong bảng điều khiển của Trình duyệt để xác thực.</p>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-3 mt-2">
                  <button
                    onClick={handleConfirmStorage}
                    className="w-full bg-tiktok-cyan text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(37,244,238,0.3)] flex items-center justify-center gap-2"
                  >
                    Kích hoạt & Chọn thư mục
                  </button>
                  <button
                    onClick={() => setShowStorageModal(false)}
                    className="w-full bg-white/5 text-gray-400 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                  >
                    Để sau
                  </button>
                </div>
                
                <div className="flex items-center gap-2 opacity-50">
                  <Shield size={10} className="text-tiktok-cyan" />
                  <p className="text-[9px] text-gray-500 uppercase tracking-tighter">
                    Bảo mật tuyệt đối bởi quyền truy duyệt Sandbox
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
