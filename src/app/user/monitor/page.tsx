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
import { getSessionDirName, saveHandle, loadHandle } from "@/utils/storage";

interface ActiveStream {
  id: number;
  tiktoker_id: number;
  tiktok_url: string;
  tiktok_handle: string;
  status: string;
  avatar_url?: string;
}

const MONITOR_CACHE_KEY = "monitor_page_cache_v1";

interface MonitorCache {
  activeStreams: ActiveStream[];
  selectedStreamId: number | null;
  liveMetrics: Record<number, { viewers: number, likes: number, coins: number, chats: number }>;
}

function readMonitorCache(): MonitorCache {
  if (typeof window === "undefined") {
    return { activeStreams: [], selectedStreamId: null, liveMetrics: {} };
  }
  try {
    const raw = sessionStorage.getItem(MONITOR_CACHE_KEY);
    if (!raw) return { activeStreams: [], selectedStreamId: null, liveMetrics: {} };
    const parsed = JSON.parse(raw) as Partial<MonitorCache>;
    return {
      activeStreams: Array.isArray(parsed.activeStreams) ? parsed.activeStreams : [],
      selectedStreamId: typeof parsed.selectedStreamId === "number" || parsed.selectedStreamId === null
        ? parsed.selectedStreamId
        : null,
      liveMetrics: parsed.liveMetrics && typeof parsed.liveMetrics === "object" ? parsed.liveMetrics : {},
    };
  } catch {
    return { activeStreams: [], selectedStreamId: null, liveMetrics: {} };
  }
}

export default function MonitorPage() {
  const router = useRouter();
  const { user, plan, isLoading, getToken, downgradeTimer, setDowngradeTimer } = useAuth();
  const mainRef = useRef<HTMLDivElement>(null);

  const [activeStreams, setActiveStreams] = useState<ActiveStream[]>(() => readMonitorCache().activeStreams);
  const [error, setError] = useState<string | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [url, setUrl] = useState("");
  const [limitHit, setLimitHit] = useState(false);
  const [selectedStreamId, setSelectedStreamId] = useState<number | null>(() => readMonitorCache().selectedStreamId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [joiningStreams, setJoiningStreams] = useState<string[]>([]);
  const [directoryHandle, setDirectoryHandle] = useState<any>(null);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [pendingJoinUrl, setPendingJoinUrl] = useState<string | null>(null);

  const [liveMetrics, setLiveMetrics] = useState<Record<number, { viewers: number, likes: number, coins: number, chats: number }>>(
    () => readMonitorCache().liveMetrics
  );

  // Persist monitor state so navigating away and back won't re-render from empty state.
  useEffect(() => {
    const cache: MonitorCache = {
      activeStreams,
      selectedStreamId,
      liveMetrics,
    };
    sessionStorage.setItem(MONITOR_CACHE_KEY, JSON.stringify(cache));
  }, [activeStreams, selectedStreamId, liveMetrics]);

  // Restore handle from IndexedDB on mount
  useEffect(() => {
    const restoreHandle = async () => {
      try {
        const handle = await loadHandle();
        if (handle) {
          // Only restore when permission is truly granted.
          // If permission is prompt/denied, force re-auth to avoid NotAllowedError later.
          const perm = await (handle as any).queryPermission({ mode: 'readwrite' });
          if (perm === 'granted') {
            setDirectoryHandle(handle);
          } else {
            setDirectoryHandle(null);
          }
        }
      } catch (err) {
        console.error("Failed to restore handle:", err);
        setDirectoryHandle(null);
      }
    };
    restoreHandle();
  }, []);

  const handleConfirmStorage = async () => {
    try {
      if (!(window as any).showDirectoryPicker || !window.isSecureContext) {
        setError("Trình duyệt hiện tại không hỗ trợ chọn thư mục local. Hãy dùng Chrome/Edge bản mới qua HTTPS hoặc localhost.");
        return;
      }

      let handle = directoryHandle;
      
      if (!handle) {
        handle = await (window as any).showDirectoryPicker();
      }
      
      // Request permission (triggers browser prompt)
      const currentPerm = await (handle as any).queryPermission({ mode: 'readwrite' });
      if (currentPerm !== 'granted') {
        const requested = await (handle as any).requestPermission({ mode: 'readwrite' });
        if (requested !== 'granted') {
          setError("Bạn cần cấp quyền đọc/ghi thư mục để bật lưu local.");
          setDirectoryHandle(null);
          return;
        }
      }

      // Save to IndexedDB for next time
      await saveHandle(handle);

      // Prime for existing active streams
      for (const stream of activeStreams) {
        try {
          const sessionDirName = getSessionDirName(stream.tiktok_handle, stream.id);
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
      console.warn("User cancelled directory picker or permission:", err);
      setError("Bạn cần chọn thư mục và cấp quyền để tiếp tục.");
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
        sessionStorage.setItem(
          MONITOR_CACHE_KEY,
          JSON.stringify({
            activeStreams: data.streams,
            selectedStreamId,
            liveMetrics,
          } as MonitorCache)
        );
      }
    } catch (err) {
      console.error("Fetch streams error:", err);
    }
  }, [getToken, selectedStreamId, liveMetrics]);

  // Auth guard — only customers (role_id=2) can access
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role_name === 'admin') {
        router.push("/admin");
      } else {
        fetchActiveStreams();
      }
    }
  }, [user, isLoading, router, fetchActiveStreams]);

  // Proactive storage check before monitoring to avoid browser write blocks.
  useEffect(() => {
    if (!isLoading && user && activeStreams.length > 0 && !directoryHandle && !showStorageModal) {
      const timer = setTimeout(() => {
        setShowStorageModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, user, activeStreams, directoryHandle, showStorageModal]);

  const handleJoinAction = async (inputUrl?: string, bypassGate = false) => {
    const targetUrl = inputUrl || url;
    if (!targetUrl.trim()) return;

    if (plan && activeStreams.length >= plan.maxColumns && plan.maxColumns !== -1) {
      setLimitHit(true);
      setError(`Gói ${plan.label} chỉ cho phép theo dõi tối đa ${plan.maxColumns} luồng cùng lúc.`);
      setTimeout(() => {
        setLimitHit(false);
        setError(null);
      }, 3000);
      return;
    }

    const username = targetUrl.includes("tiktok.com/@")
      ? targetUrl.split("@")[1]?.split("/")[0]
      : targetUrl.replace("@", "");

    if (!username) return;

    // Prevent duplicate clicks & show instant UI feedback
    if (joiningStreams.includes(username) || activeStreams.some(s => s.tiktok_handle === username)) {
      setUrl("");
      return;
    }

    setError(null);

    // Require storage permission before joining any stream to avoid local FS write errors.
    if (!bypassGate && !directoryHandle) {
      setPendingJoinUrl(targetUrl);
      setShowStorageModal(true);
      return;
    }

    setJoiningStreams(prev => [...prev, username]);

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
    } finally {
      // Remove from loading state regardless of outcome
      setJoiningStreams(prev => prev.filter(u => u !== username));
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

    // Optimistic update to remove delay
    setActiveStreams(prev => prev.filter(s => s.id !== session.id));

    try {
      const token = getToken();
      await fetch(`${API_BASE}/streams/${session.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Disconnect error:", err);
      // Optional: Re-fetch or re-add stream on failure could be implemented here
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

            <div className="flex flex-col gap-8 w-full items-stretch transition-all">
              {activeStreams.map((stream) => (
                <div
                  key={stream.id}
                  className={`w-full transition-all ${selectedStreamId === stream.id ? 'ring-2 ring-tiktok-cyan ring-offset-4 ring-offset-[#0d1117] rounded-[12px]' : ''}`}
                >
                  <LiveColumn
                    username={stream.tiktok_handle}
                    sessionId={stream.id}
                    initialAvatar={stream.avatar_url}
                    directoryHandle={directoryHandle}
                    onShowStats={() => setSelectedStreamId(stream.id)}
                    onReauthorize={() => setShowStorageModal(true)}
                    onMetricsUpdate={(metrics) => setLiveMetrics(prev => ({ ...prev, [stream.id]: metrics }))}
                    onClose={() => {
                      handleClose(stream.id);
                      if (selectedStreamId === stream.id) setSelectedStreamId(null);
                    }}
                  />
                </div>
              ))}

              {/* Optimistic Skeletons for instant feedback */}
              {joiningStreams.map((username) => (
                <div
                  key={`joining-${username}`}
                  className="w-full h-[300px] flex flex-col items-center justify-center bg-tiktok-card rounded-[12px] border border-tiktok-cyan/30 overflow-hidden shadow-2xl transition-all"
                >
                  <div className="w-16 h-16 border-4 border-tiktok-cyan border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-tiktok-cyan font-bold text-sm uppercase tracking-widest animate-pulse">
                    Đang thiết lập kênh...
                  </p>
                  <p className="text-gray-500 font-bold text-lg mt-2">
                    @{username}
                  </p>
                </div>
              ))}

              {activeStreams.length === 0 && joiningStreams.length === 0 && (
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
                    Hệ thống cần quyền lưu trữ để ghi Log dữ liệu trực tiếp về máy tính của bạn. Bạn có thể <strong>tự do chọn bất kỳ thư mục nào</strong> (ví dụ: ổ D, thư mục Downloads...) để tiến hành lưu trữ an toàn.
                  </p>
                </div>

                <div className="w-full bg-white/5 rounded-2xl p-4 text-left border border-white/5">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-tiktok-cyan/20 flex items-center justify-center text-[10px] font-bold text-tiktok-cyan mt-0.5 shrink-0">1</div>
                    <p className="text-[11px] text-gray-300">Bấm <strong>"Kích hoạt & Chọn thư mục"</strong> bên dưới.</p>
                  </div>
                  <div className="flex items-start gap-3 mt-3">
                    <div className="w-5 h-5 rounded-full bg-tiktok-cyan/20 flex items-center justify-center text-[10px] font-bold text-tiktok-cyan mt-0.5 shrink-0">2</div>
                    <p className="text-[11px] text-gray-300">Tạo hoặc chọn một thư mục bất kỳ trên máy để xác thực cấp quyền.</p>
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
