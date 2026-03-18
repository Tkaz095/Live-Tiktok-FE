"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Heart, Coins, Gift, MessageSquare, X, Filter, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence, useAnimation, animate } from "framer-motion";
import { createLiveSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

interface LiveColumnProps {
  username: string;
  onClose: (username: string) => void;
}

interface ChatItem {
  id: string;
  user: string;
  message: string;
}

interface GiftItem {
  id: string;
  user: string;
  giftName: string;
  amount: number;
  value: number;
  icon: string;
  isBigGift: boolean;
}

// Deterministic avatar based on username
function getAvatar(username: string) {
  const seed = encodeURIComponent(username);
  return `https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}&backgroundColor=0d1117`;
}

export default function LiveColumn({ username, onClose }: LiveColumnProps) {
  const [filter, setFilter] = useState<"all" | "gift" | "chat">("all");
  const [connected, setConnected] = useState(false);
  const [isConnectingTiktok, setIsConnectingTiktok] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real stats
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [displayLikes, setDisplayLikes] = useState(0);
  const [coins, setCoins] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);
  const [isLiveEnded, setIsLiveEnded] = useState(false);
  const [hostNickname, setHostNickname] = useState(username);
  const [hostFollowers, setHostFollowers] = useState<number | null>(null);
  const [syncCount, setSyncCount] = useState(0);
  const [reconnectKey, setReconnectKey] = useState(0);

  // Trigger brief sync flash
  const triggerSyncSync = () => {
    setSyncCount((c) => c + 1);
  };

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);

  const columnControls = useAnimation();
  const bigGiftIconControls = useAnimation();
  const [currentBigGift, setCurrentBigGift] = useState<{ icon: string; name: string } | null>(null);

  // Keep a stable ref to the socket for cleanup
  const socketRef = useRef<Socket | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  // Trigger big-gift effects
  const triggerBigGift = (icon: string, name: string) => {
    columnControls.start({
      x: [-8, 8, -6, 6, -4, 4, 0],
      transition: { duration: 0.5, ease: "easeInOut" },
    });
    setCurrentBigGift({ icon, name });
    bigGiftIconControls
      .start({
        scale: [0, 1.8, 1],
        opacity: [0, 1, 0],
        y: [0, -80],
        rotate: [0, 10, -10, 0],
        transition: { duration: 1.8, times: [0, 0.2, 1] },
      })
      .then(() => setCurrentBigGift(null));
  };

  // Socket setup
  useEffect(() => {
    const socket = createLiveSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setIsConnectingTiktok(true);
      setError(null);
      socket.emit("join", { room: `@${username}` });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", () => {
      setConnected(false);
      setError("Mất kết nối tới server Backend.");
    });

    socket.on("error", (msg: string) => {
      setError(msg);
      setIsConnectingTiktok(false);
    });

    socket.on("chat_history", (historyData: any[]) => {
      triggerSyncSync();
      const mappedChats = historyData.map((data) => ({
        id: data.id || Math.random().toString(36).substring(7),
        user: data.user || data.username || "unknown",
        message: data.message || "",
      }));
      setChats(mappedChats.slice(0, 100));
    });

    socket.on("chat", (data) => {
      triggerSyncSync();
      const newChat: ChatItem = {
        id: data.id || Math.random().toString(36).substring(7),
        user: data.username ?? data.user ?? "unknown",
        message: data.message ?? "",
      };
      setChats((prev) => {
        if (prev.some(c => c.id === newChat.id)) return prev;
        return [newChat, ...prev].slice(0, 100);
      });
    });

    socket.on("gift", (data) => {
      triggerSyncSync();
      const count: number = data.count ?? 1;
      const coinVal: number =
        data.diamond_value ?? data.coin_value ?? data.value ?? 0;
      const totalValue = coinVal * count;
      const isBigGift = totalValue >= 500;
      const icon = data.icon ?? "🎁";
      const giftName = data.name ?? data.gift_name ?? "Gift";

      const newGift: GiftItem = {
        id: Math.random().toString(36).substring(7),
        user: data.username ?? data.user ?? data.giver ?? "Someone",
        giftName,
        amount: count,
        value: totalValue,
        icon,
        isBigGift,
      };

      setGifts((prev) => [newGift, ...prev].slice(0, 30));
      setCoins((prev) => prev + totalValue);
      if (isBigGift) triggerBigGift(icon, giftName);
    });

    socket.on("room_info", (data) => {
      setIsConnectingTiktok(false);
      triggerSyncSync();
      if (typeof data.viewerCount === "number") setViewers(data.viewerCount);
      if (typeof data.likeCount === "number") setLikes(data.likeCount);
      if (data.hostNickname) setHostNickname(data.hostNickname);
      if (typeof data.hostFollowers === "number") setHostFollowers(data.hostFollowers);
    });

    socket.on("viewer_count", (data) => {
      triggerSyncSync();
      if (typeof data.viewerCount === "number") setViewers(data.viewerCount);
    });

    socket.on("live_stats", (data) => {
      setIsConnectingTiktok(false);
      triggerSyncSync();
      if (typeof data.followers === "number") setViewers(data.followers);
      if (typeof data.viewer_count === "number") setViewers(data.viewer_count);
      if (typeof data.likes === "number") setLikes(data.likes);
      if (typeof data.like_count === "number") setLikes(data.like_count);
    });

    socket.on("memberCount", (data) => {
      if (typeof data.count === "number") setViewers(data.count);
    });

    socket.on("like", (data) => {
      triggerSyncSync();
      if (typeof data.totalLikeCount === "number" && data.totalLikeCount > 0) {
        setLikes(data.totalLikeCount);
      } else if (typeof data.likeCount === "number") {
        setLikes(prev => prev + data.likeCount);
      }
    });

    socket.on("tiktok_error", (msg) => {
      setError(msg);
      setIsConnectingTiktok(false);
    });

    socket.on("tiktok_disconnected", (msg) => {
      setError(msg);
      setIsConnectingTiktok(false);
    });

    socket.on("stream_end", () => {
      setIsLiveEnded(true);
      const endChat: ChatItem = {
        id: Math.random().toString(36).substring(7),
        user: "system",
        message: `Live của kênh @${username} đã kết thúc`,
      };
      setChats((prev) => [endChat, ...prev].slice(0, 100));
    });

    socket.on("live_end", () => {
      setIsLiveEnded(true);
      const endChat: ChatItem = {
        id: Math.random().toString(36).substring(7),
        user: "system",
        message: `Live của kênh @${username} đã kết thúc`,
      };
      setChats((prev) => [endChat, ...prev].slice(0, 100));
    });

    // Pop-in on mount
    columnControls.start({
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("error");
      socket.off("chat");
      socket.off("gift");
      socket.off("live_stats");
      socket.off("room_info");
      socket.off("viewer_count");
      socket.off("memberCount");
      socket.off("like");
      socket.off("stream_end");
      socket.off("live_end");
      socket.off("tiktok_error");
      socket.off("tiktok_disconnected");
      socket.off("chat_history");
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, reconnectKey]);

  // Animate coins count-up
  useEffect(() => {
    const ctrl = animate(displayCoins, coins, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplayCoins(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [coins]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animate likes count-up
  useEffect(() => {
    const ctrl = animate(displayLikes, likes, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplayLikes(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [likes]); // eslint-disable-line react-hooks/exhaustive-deps

  const avatar = getAvatar(username);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={columnControls}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      layout
      className="w-[320px] shrink-0 h-full flex flex-col bg-tiktok-card rounded-xl border border-tiktok-border overflow-hidden relative group"
    >
      {/* Big Gift Overlay */}
      <AnimatePresence>
        {currentBigGift && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={bigGiftIconControls}
            className="absolute inset-x-0 top-1/3 pointer-events-none flex flex-col items-center justify-center z-50 drop-shadow-2xl"
          >
            <span className="text-8xl filter drop-shadow-[0_0_20px_rgba(252,225,75,0.8)]">
              {currentBigGift.icon}
            </span>
            <span className="mt-2 text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-tiktok-yellow to-tiktok-pink uppercase tracking-widest drop-shadow-md">
              {currentBigGift.name} x1
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-tiktok-border/50 relative z-10 bg-tiktok-card/90">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-tiktok-cyan via-tiktok-pink to-tiktok-yellow">
            <img
              src={avatar}
              alt={username}
              className="w-full h-full rounded-full border-2 border-tiktok-card object-cover bg-[#111]"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5">
              <h3 className="font-bold text-base truncate flex items-center gap-2" title={hostNickname}>
                {hostNickname} {isLiveEnded && <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded ml-1">OFFLINE</span>}
              </h3>
              <div className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse shrink-0" title="LIVE" />
            </div>
            
            <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
              <span className="text-gray-400 truncate w-auto max-w-[120px]">@{username}</span>
              {hostFollowers !== null && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400 whitespace-nowrap">{formatNumber(hostFollowers)} Follower</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
              <Coins size={12} className="text-tiktok-yellow" />
              <span>Tổng xu:</span>
              <span className="text-tiktok-yellow font-medium">{formatNumber(displayCoins)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
              {isLiveEnded ? (
                <>
                  <WifiOff size={10} className="text-red-500" />
                  <span className="text-red-500">phiên LIVE đã kết thúc</span>
                </>
              ) : error ? (
                <>
                  <WifiOff size={10} className="text-red-500" />
                  <span className="text-red-500 truncate max-w-[150px]" title={error}>{error}</span>
                </>
              ) : connected ? (
                <motion.div
                  key={syncCount}
                  initial={{ color: "#ffffff" }}
                  animate={{ color: "#4ade80" }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-1.5"
                >
                  <Wifi size={10} />
                  <span>
                    {isConnectingTiktok ? "LIVE • Đang tải dữ liệu..." : "LIVE • Đã kết nối"}
                  </span>
                </motion.div>
              ) : (
                <>
                  <WifiOff size={10} className="text-gray-500" />
                  <span className="text-gray-500">Đang kết nối tới Live...</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setConnected(false);
              setError(null);
              setIsConnectingTiktok(true);
              setReconnectKey(k => k + 1);
            }}
            className="text-gray-500 hover:text-white p-1 rounded-md transition-colors"
            title="Tải lại kết nối"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => onClose(username)}
            className="text-gray-500 hover:text-white p-1 rounded-md transition-colors"
            title="Đóng thẻ"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Stats Bar — skeleton while not connected */}
      <div className="grid grid-cols-2 divide-x divide-tiktok-border/50 border-b border-tiktok-border p-3 bg-[#181818] relative z-10">
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users size={14} className="text-tiktok-cyan" />
            Người xem
          </div>
          {isConnectingTiktok ? (
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 animate-pulse mt-1">Đang tải...</span>
            </div>
          ) : error ? (
            <span className="text-red-500 text-[10px] text-center px-1 font-medium">-</span>
          ) : connected ? (
            <span className="text-tiktok-cyan font-bold text-lg">{formatNumber(viewers)}</span>
          ) : (
            <div className="w-12 h-5 rounded-md bg-[#333] animate-pulse" />
          )}
        </div>
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Heart size={14} className="text-tiktok-pink" />
            Tim
          </div>
          {isConnectingTiktok ? (
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 animate-pulse mt-1">Đang tải...</span>
            </div>
          ) : error ? (
            <span className="text-red-500 text-[10px] text-center px-1 font-medium">-</span>
          ) : connected ? (
            <span className="text-tiktok-pink font-bold text-lg">{formatNumber(displayLikes)}</span>
          ) : (
            <div className="w-12 h-5 rounded-md bg-[#333] animate-pulse" />
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-tiktok-border/60 bg-[#121212] shrink-0 text-xs mt-1">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 py-2 text-center transition-colors border-b-2 ${filter === "all" ? "border-tiktok-cyan text-tiktok-cyan font-bold bg-white/5" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("chat")}
          className={`flex-1 py-2 text-center transition-colors border-b-2 ${filter === "chat" ? "border-tiktok-cyan text-tiktok-cyan font-bold bg-white/5" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
        >
          Chat
        </button>
        <button
          onClick={() => setFilter("gift")}
          className={`flex-1 py-2 text-center transition-colors border-b-2 ${filter === "gift" ? "border-tiktok-cyan text-tiktok-cyan font-bold bg-white/5" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}
        >
          Quà tặng
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative z-10">
        {/* Gifts Section */}
        {(filter === "all" || filter === "gift") && (
          <div className={`flex flex-col border-b border-tiktok-border bg-gradient-to-b from-[#1a1515] to-transparent ${filter === "gift" ? "flex-1" : "flex-none max-h-[40%] min-h-[120px]"}`}>
            <div className="px-3 py-2 flex items-center text-xs font-semibold text-tiktok-yellow/80 bg-black/20 shrink-0 gap-1.5">
              <Gift size={14} />
              Thông báo quà tặng
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <AnimatePresence>
                {gifts.map((g) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`bg-gradient-to-r ${g.isBigGift
                        ? "from-tiktok-yellow/30 to-tiktok-pink/20 border-tiktok-yellow/50"
                        : "from-tiktok-yellow/10 to-transparent border-tiktok-yellow/20"
                      } border rounded-lg p-2 flex items-center justify-between shadow-sm`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-black/40 shrink-0 flex items-center justify-center text-lg">
                        {g.icon}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-medium text-white max-w-[120px] truncate">{g.user}</span>
                        <span className="text-[10px] text-tiktok-yellow">Đã tặng {g.giftName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-bold text-white text-sm">x{g.amount}</span>
                      {g.isBigGift && (
                        <span className="text-[9px] text-tiktok-pink font-bold">BÙM!</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {gifts.length === 0 && (
                <div className="text-xs text-center text-gray-500 mt-4 italic">
                  {connected ? "Đang chờ quà tặng..." : "Đang kết nối tới Live..."}
                </div>
              )}
            </div>
          </div>
        )}

        {(filter === "all" || filter === "chat") && (
          <>
            {/* Divider (only show if both are visible) */}
            {filter === "all" && (
              <div className="h-1 bg-[#222] flex items-center justify-center shrink-0">
                <div className="w-8 h-[2px] bg-gray-600 rounded-full" />
              </div>
            )}

            {/* Chat Section */}
            <div className="flex flex-col flex-1 min-h-0 bg-[#0c0c0c]">
              <div className="px-3 py-2 flex items-center justify-between text-xs font-semibold text-tiktok-cyan/80 bg-black/40 relative shrink-0">
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  Chat trực tiếp
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-normal">
                    {chats.length} tin
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 flex flex-col-reverse gap-2">
                {/* Skeleton loading while not connected */}
                {!connected && chats.length === 0 && (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <div className={`h-3 rounded bg-[#2a2a2a] animate-pulse`} style={{ width: `${40 + i * 10}%` }} />
                      </div>
                    ))}
                  </div>
                )}
                <AnimatePresence>
                  {chats.map((c, index) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-[12px] leading-relaxed break-words py-0.5 ${c.user === "system" ? "text-center text-gray-400 italic" : ""
                        }`}
                    >
                      {c.user !== "system" && (
                        <span
                          className={`font-semibold mr-1.5 cursor-pointer hover:underline ${index % 2 === 0 ? "text-tiktok-cyan" : "text-blue-400"
                            }`}
                        >
                          {c.user}:
                        </span>
                      )}
                      <span className={c.user === "system" ? "text-tiktok-yellow/80" : "text-gray-200"}>
                        {c.message}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
