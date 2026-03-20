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
import { Plus, Search, Layout } from "lucide-react";
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

  const handleJoinAction = async (inputUrl?: string) => {
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
                      onShowStats={() => setSelectedStreamId(stream.id)}
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
    </div>
  );
}
