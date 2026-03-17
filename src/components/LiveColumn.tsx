"use client";

import { useState, useEffect } from "react";
import { Users, Heart, Coins, Gift, MessageSquare, X, Filter } from "lucide-react";
import { motion, AnimatePresence, useAnimation, animate } from "framer-motion";

interface LiveColumnProps {
  id: string;
  username: string;
  avatar: string;
  viewers: number;
  likes: number;
  coins: number;
  onClose: (id: string) => void;
}

// Mock Helpers
const MOCK_USERS = ["viewer2024", "nguyen_anh", "heisenberg", "tiktok_star", "love_live", "boss_hcm", "fan_cung2k", "meo_con", "truong_nguyen", "sunflower"];
const MOCK_MESSAGES = ["Chào buổi sáng mọi người! 👋", "Hello idol", "Đỉnh quá!", "Cho xin bài hát đi", "Triệu view", "Haha", "Tặng hoa nè 🌹", "Tuyệt vời", "Xinh quá", "Live vui ghê", "Hát tiếp đi bạn", "Idol nay đẹp trai/xinh gái thế", "Lên xu hướng"];
const MOCK_GIFTS = [
  { name: "Hoa hồng", value: 1, icon: "🌹" },
  { name: "Trà sữa", value: 10, icon: "🧋" },
  { name: "Mũ", value: 99, icon: "🧢" },
  { name: "Pháo hoa", value: 299, icon: "🎆" },
  { name: "Siêu xe", value: 1099, icon: "🏎️" }, // > 500
  { name: "Sư tử", value: 29999, icon: "🦁" }, // > 500
  { name: "Vương miện", value: 999, icon: "👑" }, // > 500
];

export default function LiveColumn({
  id,
  username,
  avatar,
  viewers: initialViewers,
  likes: initialLikes,
  coins: initialCoins,
  onClose,
}: LiveColumnProps) {
  const [filter, setFilter] = useState<"all" | "gift" | "chat">("all");
  const [showFilter, setShowFilter] = useState(false);

  // States
  const [coins, setCoins] = useState(initialCoins);
  const [displayCoins, setDisplayCoins] = useState(initialCoins);
  
  const [chats, setChats] = useState<{ id: string; user: string; message: string }[]>([
    { id: "initial-1", user: "system", message: "Chào mừng đến với buổi live!" }
  ]);
  const [gifts, setGifts] = useState<{ id: string; user: string; giftName: string; amount: number; value: number; icon: string; isBigGift: boolean }[]>([]);

  // Animation Controls
  const columnControls = useAnimation();
  const bigGiftIconControls = useAnimation();
  const [currentBigGift, setCurrentBigGift] = useState<{ icon: string, name: string } | null>(null);

  // Formatting helpers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Simulate Chats (every 2s)
  useEffect(() => {
    const chatInterval = setInterval(() => {
      const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      const message = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
      
      setChats(prev => [
        { id: Math.random().toString(36).substring(7), user, message },
        ...prev
      ].slice(0, 50)); // Keep max 50 recent
    }, 2000);

    return () => clearInterval(chatInterval);
  }, []);

  // Simulate Gifts (random every 3-10s)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const triggerRandomGift = () => {
      const timeToNext = Math.random() * 7000 + 3000; // 3 to 10 seconds
      timeoutId = setTimeout(() => {
        const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
        const giftTemp = MOCK_GIFTS[Math.floor(Math.random() * MOCK_GIFTS.length)];
        const amount = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
        const totalValue = giftTemp.value * amount;
        const isBigGift = totalValue >= 500;

        const newGift = {
          id: Math.random().toString(36).substring(7),
          user,
          giftName: giftTemp.name,
          amount,
          value: totalValue,
          icon: giftTemp.icon,
          isBigGift
        };

        setGifts(prev => [newGift, ...prev].slice(0, 20)); // Keep max 20 gifts
        setCoins(prev => prev + totalValue);

        if (isBigGift) {
          // Trigger shake animation for column
          columnControls.start({
            x: [-8, 8, -6, 6, -4, 4, 0],
            transition: { duration: 0.5, ease: "easeInOut" }
          });
          
          // Trigger big gift icon blast
          setCurrentBigGift({ icon: giftTemp.icon, name: giftTemp.name });
          bigGiftIconControls.start({
            scale: [0, 1.8, 1],
            opacity: [0, 1, 0],
            y: [0, -80],
            rotate: [0, 10, -10, 0],
            transition: { duration: 1.8, times: [0, 0.2, 1] }
          }).then(() => setCurrentBigGift(null));
        }

        triggerRandomGift();
      }, timeToNext);
    };

    // Delay start of gifts slightly
    const startDelay = setTimeout(() => {
      triggerRandomGift();
    }, 2000);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timeoutId);
    };
  }, [columnControls, bigGiftIconControls]);

  // Animate Coins Change (Count up)
  useEffect(() => {
    const controls = animate(displayCoins, coins, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (value) => {
        setDisplayCoins(Math.round(value));
      }
    });

    return () => controls.stop();
  }, [coins]);

  return (
    <motion.div 
      animate={columnControls}
      className="w-[320px] shrink-0 h-full flex flex-col bg-tiktok-card rounded-xl border border-tiktok-border overflow-hidden relative group"
    >
      {/* Big Gift Overlay Animation */}
      <AnimatePresence>
        {currentBigGift && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={bigGiftIconControls}
            className="absolute inset-x-0 top-1/3 pointer-events-none flex flex-col items-center justify-center z-50 drop-shadow-2xl"
          >
            <span className="text-8xl filter drop-shadow-[0_0_20px_rgba(252,225,75,0.8)]">{currentBigGift.icon}</span>
            <span className="mt-2 text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-tiktok-yellow to-tiktok-pink uppercase tracking-widest drop-shadow-md">
              {currentBigGift.name} x1
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-tiktok-border/50 relative z-10 bg-tiktok-card/90">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-tiktok-cyan via-tiktok-pink to-tiktok-yellow">
              <img
                src={avatar}
                alt={username}
                className="w-full h-full rounded-full border-2 border-tiktok-card object-cover"
              />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              @{username}
              <span className="w-2 h-2 rounded-full bg-tiktok-pink animate-pulse" title="LIVE"></span>
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Coins size={12} className="text-tiktok-yellow" />
              <span>Tổng xu:</span>
              <span className="text-tiktok-yellow font-medium">{formatNumber(displayCoins)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tiktok-pink animate-pulse"></span>
              LIVE • Đang kết nối
            </div>
          </div>
        </div>
        <button 
          onClick={() => onClose(id)}
          className="text-gray-500 hover:text-white p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 absolute top-4 right-4"
        >
          <X size={18} />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 divide-x divide-tiktok-border/50 border-b border-tiktok-border p-3 bg-[#181818] relative z-10">
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users size={14} className="text-tiktok-cyan" />
            Theo dõi
          </div>
          <span className="text-tiktok-cyan font-bold text-lg">{formatNumber(initialViewers)}</span>
        </div>
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Heart size={14} className="text-tiktok-pink" />
            Tim
          </div>
          <span className="text-tiktok-pink font-bold text-lg">{formatNumber(initialLikes)}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 relative z-10">
        
        {/* Gifts Section (Auto scroll because we append to top and flex-col, but wait, if it's new items at top, list naturally pushes down) */}
        {(filter === "all" || filter === "gift") && (
          <div className="flex-none max-h-[40%] min-h-[120px] flex flex-col border-b border-tiktok-border bg-gradient-to-b from-[#1a1515] to-transparent">
            <div className="px-3 py-2 flex items-center justify-between text-xs font-semibold text-tiktok-yellow/80 bg-black/20 shrink-0">
              <div className="flex items-center gap-1.5">
                <Gift size={14} />
                Thông báo quà tặng
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 relative">
              <AnimatePresence>
                {gifts.map((g) => (
                  <motion.div 
                    key={g.id}
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`bg-gradient-to-r ${g.isBigGift ? 'from-tiktok-yellow/30 to-tiktok-pink/20 border-tiktok-yellow/50' : 'from-tiktok-yellow/10 to-transparent border-tiktok-yellow/20'} border rounded-lg p-2 flex items-center justify-between shadow-sm`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-black/40 shrink-0 flex items-center justify-center text-lg">{g.icon}</div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-medium text-white max-w-[120px] truncate">{g.user}</span>
                        <span className="text-[10px] text-tiktok-yellow">Đã tặng {g.giftName}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-bold text-white text-sm">x{g.amount}</span>
                      {g.isBigGift && <span className="text-[9px] text-tiktok-pink font-bold max-w-[50px] text-center leading-tight">BÙM!</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {gifts.length === 0 && (
                <div className="text-xs text-center text-gray-500 mt-4 italic">Đang chờ quà tặng...</div>
              )}
            </div>
          </div>
        )}

        {/* Resizer Handle */}
        <div className="h-1 bg-[#222] flex items-center justify-center shrink-0">
          <div className="w-8 h-[2px] bg-gray-600 rounded-full"></div>
        </div>

        {/* Chat Section */}
        <div className={`flex flex-col min-h-0 bg-[#0c0c0c] transition-all duration-300 ${filter === "gift" ? 'h-auto' : 'flex-1'}`}>
          <div className="px-3 py-2 flex items-center justify-between text-xs font-semibold text-tiktok-cyan/80 bg-black/40 relative shrink-0">
            <div className="flex items-center gap-1.5">
              <MessageSquare size={14} />
              Chat trực tiếp
            </div>

            {/* Filter Dropdown Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-normal">
                {filter === "gift" ? "Đã đóng" : `${chats.length} tin`}
              </span>
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`p-1 hover:bg-white/10 rounded transition-colors ${showFilter ? 'text-tiktok-cyan' : 'text-gray-400'}`}
              >
                <Filter size={14} />
              </button>
            </div>

            {/* Filter Menu */}
            <AnimatePresence>
              {showFilter && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-2 top-8 w-36 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl overflow-hidden z-20"
                >
                  <button 
                    onClick={() => { setFilter("all"); setShowFilter(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors ${filter === 'all' ? 'text-tiktok-cyan' : 'text-gray-300'}`}
                  >
                    Tất cả
                  </button>
                  <button 
                    onClick={() => { setFilter("gift"); setShowFilter(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors ${filter === 'gift' ? 'text-tiktok-cyan' : 'text-gray-300'}`}
                  >
                    Chỉ xem quà
                  </button>
                  <button 
                    onClick={() => { setFilter("chat"); setShowFilter(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 transition-colors ${filter === 'chat' ? 'text-tiktok-cyan' : 'text-gray-300'}`}
                  >
                    Chỉ xem tin nhắn
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Chat Messages */}
          {(filter === "all" || filter === "chat") && (
            <div className="flex-1 overflow-y-auto p-3 flex flex-col-reverse gap-2">
              <AnimatePresence>
                {chats.map((c, index) => (
                  <motion.div 
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-[12px] leading-relaxed break-words py-0.5 ${c.user === 'system' ? 'text-center text-gray-400 italic' : ''}`}
                  >
                    {c.user !== 'system' && (
                      <span className={`font-semibold mr-1.5 cursor-pointer hover:underline ${index % 2 === 0 ? 'text-tiktok-cyan' : 'text-blue-400'}`}>
                        {c.user}:
                      </span>
                    )}
                    <span className={c.user === 'system' ? 'text-tiktok-yellow/80' : 'text-gray-200'}>
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
