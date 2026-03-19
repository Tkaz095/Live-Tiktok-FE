"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LiveColumn from "@/components/LiveColumn";
import * as FramerMotion from "framer-motion";
const { motion, AnimatePresence } = FramerMotion;
import { useAuth } from "@/lib/AuthContext";
import { API_BASE } from "@/lib/auth";
import DowngradeModal from "@/components/DowngradeModal";

interface ActiveStream {
  id: number;
  tiktoker_id: number;
  tiktok_url: string;
  tiktok_handle: string;
  status: string;
}

export default function CustomerPage() {
  const router = useRouter();
  const { user, plan, isLoading, getToken, downgradeTimer, setDowngradeTimer } = useAuth();
  const mainRef = useRef<HTMLDivElement>(null);
  
  const [activeStreams, setActiveStreams] = useState<ActiveStream[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

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
  }, [user, isLoading, router]);

  const fetchActiveStreams = async () => {
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
  };

  const handleJoin = async (username: string) => {
    if (!username) return;
    setError(null);

    try {
      const token = getToken();
      
      // 1. First, check/add to tiktokers list to get tiktoker_id
      // For simplicity, we fetch the list to check if exists, otherwise create
      const tiktokersRes = await fetch(`${API_BASE}/tiktokers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tiktokersData = await tiktokersRes.json();
      
      let tiktoker = tiktokersData.data?.find((t: any) => t.tiktok_handle === username);
      
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
        // Refresh active streams
        fetchActiveStreams();
      } else {
        setError(connectData.error);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối");
    }
  };

  const handleClose = async (tiktoker_id_or_handle: string | number) => {
    // Determine the session ID to close
    const session = activeStreams.find(s => 
      s.id === tiktoker_id_or_handle || s.tiktoker_id === tiktoker_id_or_handle || s.tiktok_handle === tiktoker_id_or_handle
    );
    
    if (!session) {
      // Just filter out from UI if not found on backend (fallback)
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
  };

  const handleSidebarSelect = (username: string) => {
    const isAlreadyOpen = activeStreams.some(s => s.tiktok_handle === username);
    if (!isAlreadyOpen) {
      handleJoin(username);
    } else {
      if (mainRef.current) {
        const el = mainRef.current.querySelector(`[data-username="${username}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      }
    }
  };

  // --- Downgrade Logic ---
  useEffect(() => {
    if (!isLoading && plan && activeStreams.length > plan.maxColumns && plan.maxColumns !== -1) {
      if (downgradeTimer === null) {
        setDowngradeTimer(90); // 1p30s
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
      // Auto close excess streams
      if (plan && activeStreams.length > plan.maxColumns && plan.maxColumns !== -1) {
        const toClose = activeStreams.slice(plan.maxColumns);
        toClose.forEach(s => handleClose(s.id));
      }
      setDowngradeTimer(null);
    }
  }, [downgradeTimer, plan, activeStreams, setDowngradeTimer]);

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
        onJoin={handleJoin}
        activeCount={activeStreams.length}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeUsernames={activeStreams.map(s => s.tiktok_handle)}
          onSelect={handleSidebarSelect}
        />

        {/* Main content */}
        <main ref={mainRef} className="flex-1 overflow-x-hidden md:overflow-x-auto overflow-y-auto md:overflow-y-hidden bg-[#0a0a0a] relative">
          
          {/* Error Toast */}
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

          <div className="h-full p-4 flex flex-col md:flex-row gap-4 md:min-w-max items-center md:items-start">
            <AnimatePresence mode="popLayout">
              {activeStreams.map((stream) => (
                <LiveColumn
                  key={stream.id}
                  username={stream.tiktok_handle}
                  sessionId={stream.id}
                  onClose={() => handleClose(stream.id)}
                />
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
        </main>
      </div>
      
      <DowngradeModal 
        isOpen={showDowngradeModal} 
        onClose={() => setShowDowngradeModal(false)}
        secondsRemaining={downgradeTimer ?? 0}
      />
    </div>
  );
}
