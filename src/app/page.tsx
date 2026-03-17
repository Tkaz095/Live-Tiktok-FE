"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import LiveColumn from "@/components/LiveColumn";
import { AnimatePresence } from "framer-motion";

// Mock data based on Figma requirements
const MOCK_LIVES = [
  { id: "1", username: "linh_nguyen", avatar: "https://i.pravatar.cc/150?u=1", viewers: 957, likes: 5100, coins: 0 },
  { id: "2", username: "duc_tran", avatar: "https://i.pravatar.cc/150?u=2", viewers: 1204, likes: 2900, coins: 118 },
  { id: "3", username: "my_pham", avatar: "https://i.pravatar.cc/150?u=3", viewers: 1473, likes: 2900, coins: 1170 },
  { id: "4", username: "hong_anh", avatar: "https://i.pravatar.cc/150?u=4", viewers: 1102, likes: 1900, coins: 0 },
  { id: "5", username: "minh_khoa", avatar: "https://i.pravatar.cc/150?u=5", viewers: 693, likes: 1600, coins: 24500 },
];

export default function Home() {
  const [activeLives, setActiveLives] = useState(MOCK_LIVES);

  const handleClose = (id: string) => {
    setActiveLives(prev => prev.filter(live => live.id !== id));
  };

  const handleJoinLive = (username: string) => {
    const newLive = {
      id: Math.random().toString(36).substring(7),
      username,
      avatar: `https://i.pravatar.cc/150?u=${Math.random().toString(36).substring(7)}`,
      viewers: 0,
      likes: 0,
      coins: 0
    };
    setActiveLives(prev => [newLive, ...prev]);
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-black text-white font-sans">
      <Navbar onJoin={handleJoinLive} activeCount={activeLives.length} />
      
      {/* Main Container */}
      <main className="flex-1 overflow-x-hidden md:overflow-x-auto overflow-y-auto md:overflow-y-hidden bg-[#0a0a0a]">
        <div className="h-full p-4 flex flex-col md:flex-row gap-4 md:min-w-max items-center md:items-start">
          <AnimatePresence mode="popLayout">
            {activeLives.map((live) => (
              <LiveColumn 
                key={live.id}
                {...live}
                onClose={handleClose}
              />
            ))}
          </AnimatePresence>
          
          {/* Empty State / Add New Placeholder */}
          {activeLives.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-4 mt-20">
              <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center border border-[#333]">
                <span className="text-2xl text-gray-400">+</span>
              </div>
              <p>Chưa có luồng Live nào. Hãy dán link và tham gia!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
