"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAnimation, animate } from "framer-motion";
import { createLiveSocket } from "@/features/us-live-monitor/api/socket";
import type { Socket } from "socket.io-client";

import BigGiftOverlay from "./BigGiftOverlay";
import LiveColumnHeader from "./LiveColumnHeader";
import GiftFeed from "./GiftFeed";
import ChatFeed from "./ChatFeed";
import { getCoinValue } from "../types/giftCoins.types";
import type {
  ChatItem,
  GiftItem,
  TikTokChatData,
  TikTokGiftData,
  RoomInfoData,
  LiveStatsData,
  MemberCountData,
  LikeData,
} from "../types/live.types";

interface LiveColumnProps {
  username: string;
  sessionId?: number;
  initialAvatar?: string;
  onClose: (username: string) => void;
  onShowStats?: () => void;
  directoryHandle?: any;
}

function getAvatar(username: string) {
  const seed = encodeURIComponent(username);
  return `https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}&backgroundColor=0d1117`;
}

function formatNumber(num: number) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

export default function LiveColumn({ username, sessionId, initialAvatar, onClose, onShowStats, directoryHandle }: LiveColumnProps) {
  const [filter, setFilter] = useState<"all" | "gift" | "chat">("all");
  const [connected, setConnected] = useState(false);
  const [isConnectingTiktok, setIsConnectingTiktok] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [displayLikes, setDisplayLikes] = useState(0);
  const [coins, setCoins] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [isLiveEnded, setIsLiveEnded] = useState(false);
  const [hostNickname, setHostNickname] = useState(username);
  const [hostAvatar, setHostAvatar] = useState<string | null>(initialAvatar || null);
  const [hostFollowers, setHostFollowers] = useState<number | null>(null);
  const [syncCount, setSyncCount] = useState(0);
  const [reconnectKey, setReconnectKey] = useState(0);

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [pinnedChat, setPinnedChat] = useState<ChatItem | null>(null);

  const columnControls = useAnimation();
  const bigGiftIconControls = useAnimation();
  const [currentBigGift, setCurrentBigGift] = useState<{ icon: string; name: string } | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const triggerSyncSync = () => setSyncCount((c) => c + 1);

  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    setPinnedChat((prev) => (prev?.id === id ? null : prev));
  };

  const togglePin = (chat: ChatItem) =>
    setPinnedChat((prev) => (prev?.id === chat.id ? null : chat));

  const triggerBigGift = (icon: string, name: string) => {
    // columnControls.start({
    //   x: [-8, 8, -6, 6, -4, 4, 0],
    //   transition: { duration: 0.5, ease: "easeInOut" },
    // });
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

  const saveToLocalFile = async (type: "chat" | "gift", data: any) => {
    const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
    if (!directoryHandle || !sessionId || isLocalhost) return;
    try {
      const sessionDirName = `session_${sessionId}`;
      const sessionDir = await directoryHandle.getDirectoryHandle(sessionDirName, { create: true });
      const fileName = type === "chat" ? "comments.json" : "gifts.json";
      const fileHandle = await sessionDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable({ keepExistingData: true });
      const timestamp = new Date().toISOString();
      let logEntry;
      if (type === "chat") {
        logEntry = {
          timestamp,
          user: data.username || data.user,
          comment: data.comment || data.message
        };
      } else {
        logEntry = {
          timestamp,
          user: data.username || data.user,
          gift: data.gift_name || data.name,
          quantity: data.count || data.repeatCount || 1,
          coins: data.diamond_value || data.diamondCount || 0
        };
      }
      const file = await fileHandle.getFile();
      await writable.write({ type: "write", position: file.size, data: JSON.stringify(logEntry) + "\n" });
      await writable.close();
    } catch (err) {
      console.error("[LocalSave Error]", err);
    }
  };

  // ── Socket ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = createLiveSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setIsConnectingTiktok(true);
      setError(null);
      socket.emit("join", { room: username, sessionId });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("connect_error", () => {
      setConnected(false);
      setError("Mất kết nối tới server Backend.");
    });

    socket.on("error", (msg: string) => {
      setError(msg);
      setIsConnectingTiktok(false);
    });

    socket.on("chat_history", (historyData: TikTokChatData[]) => {
      triggerSyncSync();
      const mapped = historyData.map((d) => ({
        id: d.id || Math.random().toString(36).substring(7),
        user: d.user || d.username || "unknown",
        message: d.message || "",
        avatar: d.avatar,
      }));
      setChats(mapped.slice(0, 100));
    });

    socket.on("chat", (data: TikTokChatData) => {
      triggerSyncSync();
      const newChat: ChatItem = {
        id: data.id || Math.random().toString(36).substring(7),
        user: data.username ?? data.user ?? "unknown",
        message: data.message ?? "",
        avatar: data.avatar,
      };
      if (typeof data.chatCount === "number") {
        setTotalChats(data.chatCount);
      } else {
        setTotalChats((prev) => prev + 1);
      }
      setChats((prev) => {
        if (prev.some((c) => c.id === newChat.id)) return prev;
        return [newChat, ...prev].slice(0, 100);
      });
      // Save to local file if on Free plan
      if (directoryHandle) saveToLocalFile("chat", data);
    });

    socket.on("gift", (data: TikTokGiftData) => {
      triggerSyncSync();
      const count: number = data.count ?? 1;
      const giftName = data.name ?? data.gift_name ?? "Gift";
      const mappedCoin = getCoinValue(giftName);
      const coinVal = mappedCoin ?? data.diamond_value ?? data.coin_value ?? data.value ?? 0;
      const totalValue = coinVal * count;
      const isBigGift = totalValue >= 500;
      const icon = data.icon ?? "🎁";

      const newGift: GiftItem = {
        id: Math.random().toString(36).substring(7),
        user: data.username ?? data.user ?? data.giver ?? "Someone",
        giftName,
        amount: count,
        value: totalValue,
        icon,
        isBigGift,
      };

      setGifts((prev) => {
        // Find if this user already sent this gift recently
        const existingIndex = prev.findIndex(
          (g) => g.user === newGift.user && g.giftName === newGift.giftName
        );

        if (existingIndex !== -1) {
          const updatedGifts = [...prev];
          const existing = updatedGifts[existingIndex];

          // TikTok's repeatCount is a running total for the current streak.
          // If the new count is 1, it's likely a new streak, so we add it.
          // If it's > 1, it's a continuation, so we take the max of existing and new.
          let newAmount = existing.amount;
          if (count === 1) {
            newAmount += 1;
          } else {
            newAmount = Math.max(existing.amount, count);
          }

          const newTotalValue = coinVal * newAmount;

          updatedGifts[existingIndex] = {
            ...existing,
            amount: newAmount,
            value: newTotalValue,
            isBigGift: newTotalValue >= 500
          };

          // Move to top
          const moved = updatedGifts.splice(existingIndex, 1)[0];
          return [moved, ...updatedGifts].slice(0, 200);
        }

        return [newGift, ...prev].slice(0, 200);
      });
      if (typeof data.totalCoins === "number") {
        setCoins(data.totalCoins);
      } else {
        setCoins((prev) => prev + totalValue);
      }
      if (isBigGift) triggerBigGift(icon, giftName);

      // Save to local file if on Free plan
      if (directoryHandle) saveToLocalFile("gift", data);
    });

    socket.on("room_info", (data: RoomInfoData) => {
      setIsConnectingTiktok(false);
      triggerSyncSync();
      if (typeof data.viewerCount === "number") setViewers(data.viewerCount);
      if (typeof data.likeCount === "number") setLikes(data.likeCount);
      if (typeof data.totalCoins === "number") setCoins(data.totalCoins);
      if (typeof data.chatCount === "number") setTotalChats(data.chatCount);
      if (data.hostNickname) setHostNickname(data.hostNickname);
      if (data.hostAvatar) setHostAvatar(data.hostAvatar);
      if (typeof data.hostFollowers === "number") setHostFollowers(data.hostFollowers);
    });

    socket.on("viewer_count", (data: RoomInfoData) => {
      triggerSyncSync();
      if (typeof data.viewerCount === "number") setViewers(data.viewerCount);
    });

    socket.on("live_stats", (data: LiveStatsData) => {
      setIsConnectingTiktok(false);
      triggerSyncSync();
      if (typeof data.followers === "number") setViewers(data.followers);
      if (typeof data.viewer_count === "number") setViewers(data.viewer_count);
      if (typeof data.likes === "number") setLikes(data.likes);
      if (typeof data.like_count === "number") setLikes(data.like_count);
    });

    socket.on("memberCount", (data: MemberCountData) => {
      if (typeof data.count === "number") setViewers(data.count);
    });

    socket.on("like", (data: LikeData) => {
      triggerSyncSync();
      if (typeof data.totalLikeCount === "number" && data.totalLikeCount > 0) {
        setLikes(data.totalLikeCount);
      } else if (typeof data.likeCount === "number") {
        setLikes((prev) => prev + data.likeCount!);
      }
    });

    socket.on("tiktok_error", (msg: string) => {
      setError(msg);
      setIsConnectingTiktok(false);
    });

    socket.on("tiktok_disconnected", (msg: string) => {
      setError(msg);
      setIsConnectingTiktok(false);
    });

    const addEndChat = () => {
      setIsLiveEnded(true);
      const endChat: ChatItem = {
        id: Math.random().toString(36).substring(7),
        user: "system",
        message: `Live của kênh @${username} đã kết thúc`,
      };
      setChats((prev) => [endChat, ...prev].slice(0, 100));
    };

    socket.on("stream_end", addEndChat);
    socket.on("live_end", addEndChat);

    columnControls.start({
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    });

    return () => {
      [
        "connect", "disconnect", "connect_error", "error", "chat", "chat_history",
        "gift", "live_stats", "room_info", "viewer_count", "memberCount", "like",
        "stream_end", "live_end", "tiktok_error", "tiktok_disconnected",
      ].forEach((e) => socket.off(e));
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, reconnectKey]);

  // ── Count-up animations ──────────────────────────────────────────────────
  useEffect(() => {
    const ctrl = animate(displayCoins, coins, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplayCoins(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [coins]); // eslint-disable-line react-hooks/exhaustive-deps

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
      data-username={username}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={columnControls}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      layout
      className="w-[380px] shrink-0 h-full flex flex-col bg-tiktok-card rounded-[12px] border border-tiktok-border overflow-hidden relative group shadow-2xl transition-all hover:border-tiktok-cyan/20"
    >
      <BigGiftOverlay currentBigGift={currentBigGift} controls={bigGiftIconControls} />

      <LiveColumnHeader
        username={username}
        hostNickname={hostNickname}
        hostFollowers={hostFollowers}
        isLiveEnded={isLiveEnded}
        connected={connected}
        isConnectingTiktok={isConnectingTiktok}
        error={error}
        syncCount={syncCount}
        displayCoins={displayCoins}
        avatar={hostAvatar || getAvatar(username)}
        formatNumber={formatNumber}
        onReconnect={() => {
          setConnected(false);
          setError(null);
          setIsConnectingTiktok(true);
          setReconnectKey((k) => k + 1);
        }}
        onShowStats={onShowStats || (() => { })}
        onClose={() => onClose(username)}
        viewers={viewers}
        displayLikes={displayLikes}
      />


      {/* Tabs */}
      <div className="flex border-b border-tiktok-border bg-tiktok-surface shrink-0 text-xs font-black uppercase tracking-widest px-1 py-2">
        {(["all", "chat", "gift"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-2 text-center transition-all rounded-xl ${filter === tab
                ? "bg-tiktok-cyan text-black shadow-[0_0_15px_rgba(37,244,238,0.3)]"
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
          >
            {tab === "all" ? "Tất cả" : tab === "chat" ? "Chat" : "Quà tặng"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative z-10">
        {(filter === "all" || filter === "gift") && (
          <GiftFeed gifts={gifts} connected={connected} flex1={filter === "gift"} />
        )}

        {(filter === "all" || filter === "chat") && (
          <>
            {filter === "all" && (
              <div className="h-1 bg-[#222] flex items-center justify-center shrink-0">
                <div className="w-8 h-[2px] bg-gray-600 rounded-full" />
              </div>
            )}
            <ChatFeed
              chats={chats}
              totalChats={totalChats}
              pinnedChat={pinnedChat}
              connected={connected}
              onTogglePin={togglePin}
              onDeleteChat={deleteChat}
              onUnpin={() => setPinnedChat(null)}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
