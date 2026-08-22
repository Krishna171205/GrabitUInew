import React from 'react';
import { motion } from 'framer-motion';

interface StickerProps {
  text: string;
  className?: string;
  rotation?: number;
  color?: 'blue' | 'cream' | 'navy';
  delay?: number;
}

export function Sticker({ text, className = '', rotation = -5, color = 'blue', delay = 0 }: StickerProps) {
  const colors = {
    blue: 'bg-[#0055D4] text-white',
    cream: 'bg-[#F8FAFC] text-[#0F172A]',
    navy: 'bg-[#0F172A] text-white'
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: rotation }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
      className={`absolute z-20 flex items-center justify-center font-black uppercase tracking-widest text-[10px] sm:text-xs px-3 sm:px-4 py-2 sm:py-3 rounded-full border-2 border-[#0F172A] shadow-[4px_4px_0px_#0F172A] transform-gpu ${colors[color]} ${className}`}
      style={{ fontFamily: 'var(--font-ui)' }}
    >
      {text}
    </motion.div>
  );
}
