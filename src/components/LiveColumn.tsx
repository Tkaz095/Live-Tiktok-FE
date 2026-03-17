"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Heart, Coins, Gift, MessageSquare, X, Filter, Wifi, WifiOff } from "lucide-react";
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
  const [showFilter, setShowFilter] = useState(false);
  const [connected, setConnected] = useState(false);

  // Real stats
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [displayLikes, setDisplayLikes] = useState(0);
  const [coins, setCoins] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);
  const [isLiveEnded, setIsLiveEnded] = useState(false);

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
      socket.emit("join", { room: `@${username}` });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", () => {
      setConnected(false);
    });

    socket.on("chat", (data) => {
      const newChat: ChatItem = {
        id: Math.random().toString(36).substring(7),
        user: data.username ?? data.user ?? "unknown",
        message: data.message ?? "",
      };
      setChats((prev) => [newChat, ...prev].slice(0, 100));
    });

    socket.on("gift", (data) => {
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

    socket.on("live_stats", (data) => {
      if (typeof data.followers === "number") setViewers(data.followers);
      if (typeof data.viewer_count === "number") setViewers(data.viewer_count);
      if (typeof data.likes === "number") setLikes(data.likes);
      if (typeof data.like_count === "number") setLikes(data.like_count);
    });

    socket.on("memberCount", (data) => {
      if (typeof data.count === "number") setViewers(data.count);
    });

    socket.on("like", (data) => {
      if (typeof data.likeCount === "number") setLikes(data.likeCount);
      else if (typeof data.totalLikeCount === "number") setLikes(data.totalLikeCount);
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
      socket.off("chat");
      socket.off("gift");
      socket.off("live_stats");
      socket.off("memberCount");
      socket.off("like");
      socket.off("stream_end");
      socket.off("live_end");
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Animate coins count-up
  useEffect(() => {
    const ctrl = animate(displayCoins, coins, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplayCoins(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [coins]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animate likes count-up
  useEffect(() => {
    const ctrl = animate(displayLikes, likes, {
      duration: 1.5,
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
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              @{username}
              <span className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse" title="LIVE" />
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
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
              ) : connected ? (
                <>
                  <Wifi size={10} className="text-green-400" />
                  <span className="text-green-400">LIVE • Đang kết nối</span>
                </>
              ) : (
                <>
                  <WifiOff size={10} className="text-gray-500" />
                  <span className="text-gray-500">Đang kết nối tới Live...</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onClose(username)}
          className="text-gray-500 hover:text-white p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 absolute top-4 right-4"
        >
          <X size={18} />
        </button>
      </div>

      {/* Stats Bar — skeleton while not connected */}
      <div className="grid grid-cols-2 divide-x divide-tiktok-border/50 border-b border-tiktok-border p-3 bg-[#181818] relative z-10">
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users size={14} className="text-tiktok-cyan" />
            Người xem
          </div>
          {connected ? (
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
          {connected ? (
            <span className="text-tiktok-pink font-bold text-lg">{formatNumber(displayLikes)}</span>
          ) : (
            <div className="w-12 h-5 rounded-md bg-[#333] animate-pulse" />
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative z-10">
        {/* Gifts Section */}
        {(filter === "all" || filter === "gift") && (
          <div className="flex-none max-h-[40%] min-h-[120px] flex flex-col border-b border-tiktok-border bg-gradient-to-b from-[#1a1515] to-transparent">
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
                    className={`bg-gradient-to-r ${
                      g.isBigGift
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

        {/* Divider */}
        <div className="h-1 bg-[#222] flex items-center justify-center shrink-0">
          <div className="w-8 h-[2px] bg-gray-600 rounded-full" />
        </div>

        {/* Chat Section */}
        <div className={`flex flex-col min-h-0 bg-[#0c0c0c] ${filter === "gift" ? "h-auto" : "flex-1"}`}>
          <div className="px-3 py-2 flex items-center justify-between text-xs font-semibold text-tiktok-cyan/80 bg-black/40 relative shrink-0">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={14} />
              Chat trực tiếp
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-normal">
                {filter === "gift" ? "Đã đóng" : `${chats.length} tin`}
              </span>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`p-1 hover:bg-white/10 rounded transition-colors ${
                  showFilter ? "text-tiktok-cyan" : "text-gray-400"
                }`}
              >
                <Filter size={14} />
              </button>
            </div>
            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-2 top-8 w-36 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl overflow-hidden z-20"
                >
                  {(["all", "gift", "chat"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => { setFilter(v); setShowFilter(false); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors ${
                        filter === v ? "text-tiktok-cyan" : "text-gray-300"
                      }`}
                    >
                      {v === "all" ? "Tất cả" : v === "gift" ? "Chỉ xem quà" : "Chỉ xem tin nhắn"}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {(filter === "all" || filter === "chat") && (
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
                    className={`text-[12px] leading-relaxed break-words py-0.5 ${
                      c.user === "system" ? "text-center text-gray-400 italic" : ""
                    }`}
                  >
                    {c.user !== "system" && (
                      <span
                        className={`font-semibold mr-1.5 cursor-pointer hover:underline ${
                          index % 2 === 0 ? "text-tiktok-cyan" : "text-blue-400"
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
          )}
        </div>
      </div>
    </motion.div>
  );
}
