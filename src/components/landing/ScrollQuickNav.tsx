'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmoothScroll } from '@/components/SmoothScroll';
import { ArrowUp } from 'lucide-react';

export default function ScrollQuickNav() {
  const { scrollY, scrollTo } = useSmoothScroll();

  // Show only after scrolling down a bit
  const isVisible = scrollY > 260;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        >
          <button
            onClick={() => scrollTo(0, { duration: 1.4 })}
            className="flex items-center gap-3 bg-slate-950/85 hover:bg-slate-950 backdrop-blur-xl border border-white/15 rounded-full p-2 pr-5 shadow-xl shadow-blue-950/30 transition-all group active:scale-95 cursor-pointer"
            title="Scroll to Top"
          >
            <div className="relative w-9 h-9 rounded-full bg-[#0055D4] group-hover:bg-[#0040A1] text-white flex items-center justify-center transition-colors shadow-md shadow-blue-600/40">
              <ArrowUp className="w-4 h-4 text-white relative z-10 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <span className="font-medium text-slate-200 tracking-wide text-[13px]">
              Back to top
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
