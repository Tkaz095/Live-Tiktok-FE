"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Pin, PinOff, Trash2, X } from "lucide-react";
import type { ChatItem } from "./types";

interface ChatFeedProps {
  chats: ChatItem[];
  pinnedChat: ChatItem | null;
  connected: boolean;
  onTogglePin: (chat: ChatItem) => void;
  onDeleteChat: (id: string) => void;
  onUnpin: () => void;
}

export default function ChatFeed({
  chats,
  pinnedChat,
  connected,
  onTogglePin,
  onDeleteChat,
  onUnpin,
}: ChatFeedProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#0c0c0c]">
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between text-xs font-semibold text-tiktok-cyan/80 bg-black/40 relative shrink-0">
        <div className="flex items-center gap-1.5">
          <MessageSquare size={14} />
          Chat trực tiếp
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-normal">{chats.length} tin</span>
        </div>
      </div>

      {/* Pinned Comment Banner */}
      <AnimatePresence>
        {pinnedChat && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 mx-2 mt-1.5 mb-0.5 bg-gradient-to-r from-tiktok-cyan/20 to-blue-500/10 border border-tiktok-cyan/40 rounded-lg px-2.5 py-1.5 flex items-start gap-2"
          >
            <Pin size={11} className="text-tiktok-cyan mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-tiktok-cyan font-semibold block leading-none mb-0.5">Đã ghim</span>
              <p className="text-[11px] text-gray-200 break-words leading-snug">
                <span className="font-semibold text-tiktok-cyan/80 mr-1">{pinnedChat.user}:</span>
                {pinnedChat.message}
              </p>
            </div>
            <button
              onClick={onUnpin}
              className="text-gray-500 hover:text-white transition-colors shrink-0 mt-0.5"
              title="Bỏ ghim"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col-reverse gap-1">
        {/* Skeleton while not connected */}
        {!connected && chats.length === 0 && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div
                  className="h-3 rounded bg-[#2a2a2a] animate-pulse"
                  style={{ width: `${40 + i * 10}%` }}
                />
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
              exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
              className={`group/chat relative text-[12px] leading-relaxed break-words py-0.5 rounded px-1 -mx-1 transition-colors hover:bg-white/5 ${
                c.user === "system" ? "text-center text-gray-400 italic" : ""
              } ${
                pinnedChat?.id === c.id ? "bg-tiktok-cyan/5 border-l-2 border-tiktok-cyan/50 pl-2" : ""
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

              {/* Hover actions */}
              {c.user !== "system" && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover/chat:flex items-center gap-0.5 bg-[#1a1a1a] border border-[#333] rounded-md shadow-lg">
                  <button
                    onClick={() => onTogglePin(c)}
                    className={`p-1 rounded-l-md transition-colors ${
                      pinnedChat?.id === c.id
                        ? "text-tiktok-cyan bg-tiktok-cyan/10"
                        : "text-gray-400 hover:text-tiktok-cyan hover:bg-tiktok-cyan/10"
                    }`}
                    title={pinnedChat?.id === c.id ? "Bỏ ghim" : "Ghim tin nhắn"}
                  >
                    {pinnedChat?.id === c.id ? <PinOff size={10} /> : <Pin size={10} />}
                  </button>
                  <div className="w-px h-4 bg-[#333]" />
                  <button
                    onClick={() => onDeleteChat(c.id)}
                    className="p-1 rounded-r-md text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Xoá tin nhắn"
                  >
                    <Trash2 size={10} />
                  </button>
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
