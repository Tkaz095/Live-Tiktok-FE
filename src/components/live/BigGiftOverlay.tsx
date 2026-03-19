"use client";

import { motion, AnimatePresence, useAnimation } from "framer-motion";

interface BigGiftOverlayProps {
  currentBigGift: { icon: string; name: string } | null;
  controls: ReturnType<typeof useAnimation>;
}

export default function BigGiftOverlay({ currentBigGift, controls }: BigGiftOverlayProps) {
  return (
    <AnimatePresence>
      {currentBigGift && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={controls}
          className="absolute inset-x-0 top-1/3 pointer-events-none flex flex-col items-center justify-center z-50 drop-shadow-2xl"
        >
          <div className="w-32 h-32 flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(252,225,75,0.8)]">
            {currentBigGift.icon.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentBigGift.icon} alt={currentBigGift.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-8xl">{currentBigGift.icon}</span>
            )}
          </div>
          <span className="mt-2 text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-tiktok-yellow to-tiktok-pink uppercase tracking-widest drop-shadow-md">
            {currentBigGift.name} x1
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
