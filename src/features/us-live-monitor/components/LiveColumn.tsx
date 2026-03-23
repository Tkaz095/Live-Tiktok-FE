"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useAnimation, animate } from "framer-motion";
import { Shield, TrendingUp } from "lucide-react";
import { createLiveSocket } from "@/features/us-live-monitor/api/socket";
import type { Socket } from "socket.io-client";

import BigGiftOverlay from "./BigGiftOverlay";
import LiveColumnHeader from "./LiveColumnHeader";
import GiftFeed from "./GiftFeed";
import ChatFeed from "./ChatFeed";
import { getCoinValue } from "../types/giftCoins.types";
import { getSessionDirName } from "@/utils/storage";
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

interface MemberItem {
  id: string;
  user: string;
  avatar?: string;
}

interface LiveColumnProps {
  username: string;
  sessionId?: number;
  initialAvatar?: string;
  onClose: (username: string) => void;
  onShowStats?: () => void;
  directoryHandle?: any;
  onReauthorize?: () => void;
  onMetricsUpdate?: (metrics: { viewers: number, likes: number, coins: number, chats: number }) => void;
}

interface LiveColumnCache {
  chats: ChatItem[];
  gifts: GiftItem[];
  members: MemberItem[];
  viewers: number;
  likes: number;
  coins: number;
  totalChats: number;
  hostNickname: string;
  hostAvatar: string | null;
  hostFollowers: number | null;
  isLiveEnded: boolean;
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

export default function LiveColumn({ username, sessionId, initialAvatar, onClose, onShowStats, directoryHandle, onReauthorize, onMetricsUpdate }: LiveColumnProps) {
  const [connected, setConnected] = useState(false);
  const [isConnectingTiktok, setIsConnectingTiktok] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

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
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [pinnedChat, setPinnedChat] = useState<ChatItem | null>(null);

  const bigGiftIconControls = useAnimation();
  const [currentBigGift, setCurrentBigGift] = useState<{ icon: string; name: string } | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Storage Write Queue to prevent .crswap buildup
  const writeQueue = useRef<(() => Promise<void>)[]>([]);
  const isProcessingQueue = useRef(false);

  const triggerSyncSync = () => setSyncCount((c) => c + 1);
  const liveCacheKey = `live_column_cache_v1:${username}:${sessionId ?? "nosession"}`;

  // Restore live column state instantly when returning to monitor page.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(liveCacheKey);
      if (!raw) return;
      const cache = JSON.parse(raw) as Partial<LiveColumnCache>;

      if (Array.isArray(cache.chats)) setChats(cache.chats.slice(0, 100));
      if (Array.isArray(cache.gifts)) setGifts(cache.gifts.slice(0, 200));
      if (Array.isArray(cache.members)) setMembers(cache.members.slice(0, 50));

      if (typeof cache.viewers === "number") setViewers(cache.viewers);
      if (typeof cache.likes === "number") {
        setLikes(cache.likes);
        setDisplayLikes(cache.likes);
      }
      if (typeof cache.coins === "number") {
        setCoins(cache.coins);
        setDisplayCoins(cache.coins);
      }
      if (typeof cache.totalChats === "number") setTotalChats(cache.totalChats);
      if (typeof cache.hostNickname === "string") setHostNickname(cache.hostNickname);
      if (typeof cache.hostAvatar === "string" || cache.hostAvatar === null) setHostAvatar(cache.hostAvatar ?? null);
      if (typeof cache.hostFollowers === "number" || cache.hostFollowers === null) setHostFollowers(cache.hostFollowers ?? null);
      if (typeof cache.isLiveEnded === "boolean") setIsLiveEnded(cache.isLiveEnded);
    } catch {
      // Ignore invalid cache
    }
  }, [liveCacheKey]);

  // Persist live column state (throttled) so route switches can restore instantly.
  useEffect(() => {
    const timer = setTimeout(() => {
      const cache: LiveColumnCache = {
        chats: chats.slice(0, 100),
        gifts: gifts.slice(0, 200),
        members: members.slice(0, 50),
        viewers,
        likes,
        coins,
        totalChats,
        hostNickname,
        hostAvatar,
        hostFollowers,
        isLiveEnded,
      };
      sessionStorage.setItem(liveCacheKey, JSON.stringify(cache));
    }, 800);

    return () => clearTimeout(timer);
  }, [
    liveCacheKey,
    chats,
    gifts,
    members,
    viewers,
    likes,
    coins,
    totalChats,
    hostNickname,
    hostAvatar,
    hostFollowers,
    isLiveEnded,
  ]);

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

  const processQueue = async () => {
    if (isProcessingQueue.current || writeQueue.current.length === 0) return;
    isProcessingQueue.current = true;
    while (writeQueue.current.length > 0) {
      const task = writeQueue.current.shift();
      if (task) await task();
    }
    isProcessingQueue.current = false;
  };

  // Auto-clear permission errors when a folder is selected
  useEffect(() => {
    if (directoryHandle && syncError) {
      setSyncError(null);
    }
  }, [directoryHandle, syncError]);

  const loadLocalData = useCallback(async () => {
    if (!directoryHandle || !sessionId) return;
    try {
      const sessionDirName = getSessionDirName(username, sessionId);
      const sessionDir = await directoryHandle.getDirectoryHandle(sessionDirName, { create: true });
      
      // Load Chats
      try {
        const chatFileHandle = await sessionDir.getFileHandle("comments.json");
        const chatFile = await chatFileHandle.getFile();
        const chatText = await chatFile.text();
        const lines = chatText.split("\n").filter((l: string) => l.trim());
        const loadedChats: ChatItem[] = lines.map((l: string) => {
          try {
            const data = JSON.parse(l);
            const avatar = data.avatar || data.profilePictureUrl || data.profile_picture_url;
            return {
              id: Math.random().toString(36).substring(7),
              user: data.user || data.username || data.nickname || "unknown",
              message: data.comment || data.message || "",
              avatar: typeof avatar === "string" ? avatar : undefined,
            };
          } catch (e) { return null; }
        }).filter((c: ChatItem | null): c is ChatItem => c !== null);
        setChats(prev => {
          const keys = new Set(
            prev.map((c: ChatItem) => `${c.user}::${c.message}::${c.avatar || ""}`)
          );
          const uniqueNew = loadedChats.filter((c: ChatItem) => {
            const key = `${c.user}::${c.message}::${c.avatar || ""}`;
            if (keys.has(key)) return false;
            keys.add(key);
            return true;
          });
          return [...uniqueNew, ...prev].slice(0, 100);
        });
        setTotalChats(lines.length);
      } catch (e) { /* file might not exist */ }

      // Load Gifts
      try {
        const giftFileHandle = await sessionDir.getFileHandle("gifts.json");
        const giftFile = await giftFileHandle.getFile();
        const giftText = await giftFile.text();
        const lines = giftText.split("\n").filter((l: string) => l.trim());
        let totalVal = 0;
        const loadedGifts: GiftItem[] = lines.map((l: string) => {
          try {
            const data = JSON.parse(l);
            totalVal += (data.coins || 0);
            const savedIcon = data.icon || data.giftPictureUrl || data.gift_picture_url || data.image || "🎁";
            return {
              id: Math.random().toString(36).substring(7),
              user: data.user || "unknown",
              giftName: data.gift || "Unknown Gift",
              amount: data.quantity || 1,
              value: data.coins || 0,
              icon: typeof savedIcon === "string" ? savedIcon : "🎁",
              isBigGift: (data.coins || 0) >= 500
            };
          } catch (e) { return null; }
        }).filter((g: GiftItem | null): g is GiftItem => g !== null);
        setGifts(prev => {
          const combined = [...loadedGifts.reverse(), ...prev];
          return combined.slice(0, 100);
        });
        setCoins(totalVal);
      } catch (e) { /* file might not exist */ }

      // Load Members
      try {
        const memberFileHandle = await sessionDir.getFileHandle("members.json");
        const memberFile = await memberFileHandle.getFile();
        const memberText = await memberFile.text();
        const lines = memberText.split("\n").filter((l: string) => l.trim());
        const loadedMembers: MemberItem[] = lines.map((l: string) => {
          try {
            const data = JSON.parse(l);
            const avatar = data.avatar || data.profilePictureUrl || data.profile_picture_url;
            return {
              id: Math.random().toString(36).substring(7),
              user: data.user || data.username || data.nickname || "unknown",
              avatar: typeof avatar === "string" ? avatar : undefined,
            };
          } catch (e) { return null; }
        }).filter((m: MemberItem | null): m is MemberItem => m !== null);

        setMembers((prev) => {
          const seen = new Set<string>();
          const merged = [...loadedMembers.reverse(), ...prev].filter((m) => {
            const key = `${m.user}::${m.avatar || ""}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          return merged.slice(0, 50);
        });
      } catch (e) { /* file might not exist */ }

    } catch (err) {
      console.error("Error loading local data:", err);
    }
  }, [directoryHandle, sessionId, username]);

  // Trigger load when handle is ready
  useEffect(() => {
    if (directoryHandle && sessionId) {
      loadLocalData();
    }
  }, [directoryHandle, sessionId, loadLocalData]);

  const saveToLocalFile = async (type: "chat" | "gift" | "member", data: any) => {
    // If no handle, we can't write, but we want to show an error state if possible
    if (!directoryHandle) {
      if (!syncError) setSyncError("Thiếu quyền truy cập thư mục lưu trữ.");
      return;
    }
    if (sessionId === undefined || sessionId === null) return;
    
    // Push the write task to the queue
    writeQueue.current.push(async () => {
      try {
        const sessionDirName = getSessionDirName(username, sessionId);
        const sessionDir = await directoryHandle.getDirectoryHandle(sessionDirName, { create: true });
        const fileName = type === "chat" ? "comments.json" : type === "gift" ? "gifts.json" : "members.json";
        const fileHandle = await sessionDir.getFileHandle(fileName, { create: true });

        let writableToClose: FileSystemWritableFileStream | null = null;
        const file = await fileHandle.getFile();
        const offset = file.size;
        
        let logEntry;
        const timestamp = new Date().toISOString();
        if (type === "chat") {
          const avatar = data.avatar || data.profilePictureUrl || data.profile_picture_url;
          logEntry = {
            timestamp,
            user: data.username || data.user || data.nickname || "unknown",
            comment: data.comment || data.message || "",
            avatar: typeof avatar === "string" ? avatar : undefined
          };
        } else if (type === "gift") {
          const icon = data.icon || data.giftPictureUrl || data.gift_picture_url || data.image || "🎁";
          logEntry = {
            timestamp,
            user: data.nickname || data.username || data.user || "unknown",
            gift: data.giftName || data.gift_name || data.name || "Unknown Gift",
            quantity: data.count || data.repeatCount || 1,
            coins: data.diamond_value || data.diamondCount || 0,
            icon
          };
        } else {
          const avatar = data.avatar || data.profilePictureUrl || data.profile_picture_url;
          logEntry = {
            timestamp,
            user: data.user || data.username || data.nickname || "unknown",
            avatar: typeof avatar === "string" ? avatar : undefined
          };
        }
        
        try {
          const writable = await fileHandle.createWritable({ keepExistingData: true });
          writableToClose = writable;
          await writable.write({ type: "write", position: offset, data: JSON.stringify(logEntry) + "\n" });
        } finally {
          if (writableToClose) {
            await writableToClose.close();
          }
        }
        if (syncError) setSyncError(null);
      } catch (err: any) {
        console.error("[LocalSave Error]", err);
        if (err.name === 'SecurityError' || err.name === 'NotAllowedError') {
          setSyncError("Hệ thống mất quyền truy cập thư mục. Vui lòng cấp lại.");
        } else {
          setSyncError(err.message || "Lỗi ghi file local");
        }
      }
    });

    processQueue();
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
      // Save to local file
      saveToLocalFile("chat", data);
    });

    socket.on("gift", (data: TikTokGiftData) => {
      triggerSyncSync();
      const count: number = data.count ?? 1;
      const giftName = data.name ?? data.gift_name ?? "Gift";
      const mappedCoin = getCoinValue(giftName);
      const coinVal = mappedCoin ?? data.diamond_value ?? data.coin_value ?? data.value ?? 0;
      const totalValue = coinVal * count;
      const isBigGift = totalValue >= 500;
      const rawIcon = data.icon ?? data.giftPictureUrl ?? data.image ?? "🎁";
      const icon = typeof rawIcon === "string" && rawIcon.startsWith("//") ? `https:${rawIcon}` : rawIcon;

      const newGift: GiftItem = {
        id: Math.random().toString(36).substring(7),
        user: data.username ?? data.user ?? data.giver ?? "Someone",
        giftName,
        amount: count,
        value: totalValue,
        icon: typeof icon === "string" ? icon : "🎁",
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

      // Save to local file
      saveToLocalFile("gift", data);
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

    socket.on("viewer_join", (data: { user: string; avatar?: string }) => {
      triggerSyncSync();
      setMembers((prev) => {
        const newMember = { id: Math.random().toString(36).substring(7), user: data.user, avatar: data.avatar };
        // Giữ lại khoảng 50 member mới nhất để tránh tràn RAM
        return [newMember, ...prev].slice(0, 50);
      });
      saveToLocalFile("member", data);
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

    return () => {
      [
        "connect", "disconnect", "connect_error", "error", "chat", "chat_history",
        "gift", "live_stats", "room_info", "viewer_count", "memberCount", "viewer_join", "like",
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

  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate({ viewers, likes, coins, chats: totalChats });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewers, likes, coins, totalChats]);

  // Computing Top Gifters
  const topGifters = useMemo(() => {
    const userMap: Record<string, { user: string, value: number, avatar?: string }> = {};
    gifts.forEach(g => {
      if (!userMap[g.user]) userMap[g.user] = { user: g.user, value: 0 };
      userMap[g.user].value += g.value;
    });
    return Object.values(userMap).sort((a, b) => b.value - a.value).slice(0, 5); // Show top 5
  }, [gifts]);

  return (
    <div
      data-username={username}
      className="w-full shrink-0 h-[72vh] min-h-[560px] max-h-[860px] flex flex-col bg-[#0c0c0c] rounded-2xl border border-white/10 overflow-hidden relative group transition-all"
    >
      <BigGiftOverlay currentBigGift={currentBigGift} controls={bigGiftIconControls} />

      <AnimatePresence>
        {syncError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 bg-tiktok-magenta/20 rounded-full flex items-center justify-center mb-4 border border-tiktok-magenta/30 animate-pulse">
              <Shield size={32} className="text-tiktok-magenta" />
            </div>
            <h3 className="text-white font-black text-lg mb-2 uppercase tracking-tight italic leading-tight">Lỗi Đồng bộ Local</h3>
            <p className="text-gray-400 text-[10px] mb-6 px-4 leading-relaxed">
              {typeof syncError === 'string' ? syncError : "Trình duyệt đã ngắt kết nối với thư mục ổ đĩa. Cần cấp lại quyền để tiếp tục lưu Log."}
            </p>
            <button
              onClick={onReauthorize}
              className="px-6 py-3 bg-tiktok-cyan text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(37,244,238,0.3)]"
            >
              Cấp lại quyền ngay
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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


      {/* Bottom Content Row */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 relative z-10 w-full overflow-hidden">

        {/* Panel 1: Danh sách user */}
        <div className="lg:col-span-3 min-h-[180px] lg:min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 group-hover:border-tiktok-cyan/10 transition-colors">
          <div className="px-3 py-2.5 flex items-center justify-between bg-black/40 shrink-0 border-b border-white/5">
            <h4 className="flex items-center text-xs font-black text-white/90 gap-2 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-tiktok-cyan animate-pulse"></span>
              THÀNH VIÊN VÀO ({members.length})
            </h4>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col">

            {/* Top Gifters Section */}
            {topGifters.length > 0 && (
              <div className="p-3 border-b border-white/5 bg-gradient-to-b from-tiktok-yellow/5 to-transparent shrink-0">
                <h5 className="text-[10px] font-bold text-tiktok-yellow uppercase mb-2 flex items-center gap-1.5">
                  <TrendingUp size={12}/> Đại gia của phiên
                </h5>
                <div className="flex flex-col gap-1.5">
                  {topGifters.map((g, i) => (
                    <div key={g.user} className="flex items-center justify-between text-xs bg-black/40 rounded p-1.5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-gray-500 w-3 text-center">{i+1}</span>
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-800 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={getAvatar(g.user)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-gray-200 truncate max-w-[100px]">{g.user}</span>
                      </div>
                      <span className="font-bold text-tiktok-yellow text-[10px]">{g.value} xu</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members Section */}
            <div className="p-3 flex flex-wrap gap-2 content-start">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-2.5 py-1.5 hover:bg-white/10 transition-colors w-fit h-fit">
                  <div className="w-5 h-5 rounded-full bg-gray-700 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.avatar || getAvatar(m.user)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getAvatar(m.user);
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-200 line-clamp-1 max-w-[110px]">{m.user}</span>
                </div>
              ))}
              {members.length === 0 && topGifters.length === 0 && (
                <div className="w-full h-full flex items-center justify-center flex-col gap-2 text-gray-500 opacity-50 py-10">
                  <div className="w-12 h-12 rounded-full border border-dashed border-gray-600 flex items-center justify-center">?</div>
                  <span className="text-xs">Chưa có ai vào</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel 2: Quà tặng */}
        <div className="lg:col-span-4 min-h-[220px] lg:min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-gradient-to-b from-black/20 to-transparent relative overflow-hidden">
          <GiftFeed gifts={gifts} connected={connected} flex1={true} />
        </div>

        {/* Panel 3: Bình luận */}
        <div className="lg:col-span-5 min-h-[220px] lg:min-h-0 flex flex-col bg-gradient-to-b from-black/40 to-[#0a0a0a] relative overflow-hidden">
          <ChatFeed
            chats={chats}
            totalChats={totalChats}
            pinnedChat={pinnedChat}
            connected={connected}
            onTogglePin={togglePin}
            onDeleteChat={deleteChat}
            onUnpin={() => setPinnedChat(null)}
          />
        </div>
      </div>
    </div>
  );
}

