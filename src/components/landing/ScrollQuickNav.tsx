'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmoothScroll } from '@/components/SmoothScroll';
import { 
  ArrowUp, 
  Layers, 
  Sparkles, 
  Smartphone, 
  Coffee, 
  Store, 
  ChevronUp,
  Compass
} from 'lucide-react';

const SECTIONS = [
  { id: 'hero', label: 'Top', icon: Sparkles },
  { id: 'how-it-works', label: 'How It Works', icon: Layers },
  { id: 'showcase', label: 'App Showcase', icon: Smartphone },
  { id: 'preview', label: 'Menu Preview', icon: Coffee },
  { id: 'partners', label: 'For Cafés', icon: Store },
];

export default function ScrollQuickNav() {
  const { scrollY, progress, activeSection, scrollTo } = useSmoothScroll();
  const [isExpanded, setIsExpanded] = useState(false);

  // Show only after scrolling down a bit
  const isVisible = scrollY > 260;

  // Percentage for progress ring (0 to 100)
  const percent = Math.round(progress * 100);
  const strokeDashoffset = 100 - percent;

  const currentSectionMeta = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];
  const CurrentIcon = currentSectionMeta.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto"
        >
          {/* Expanded Quick Navigation Dock */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 12 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl shadow-blue-950/40 flex flex-col gap-1 min-w-[180px] mb-1"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-blue-400/90 uppercase border-b border-white/10 flex items-center justify-between">
                  <span>Fast Navigation</span>
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                </div>

                {SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        scrollTo(`#${sec.id}`, { offset: -76, duration: 1.2 });
                        setIsExpanded(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                        isActive
                          ? 'bg-[#0055D4] text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{sec.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-300"
                        />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Floating Capsule Button */}
          <div className="flex items-center gap-1.5 bg-slate-950/85 hover:bg-slate-950 backdrop-blur-xl border border-white/15 rounded-full p-1.5 shadow-xl shadow-blue-950/30 transition-all group">
            {/* Section Indicator Capsule (Click to open quick nav) */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors cursor-pointer"
              title="Jump to section"
            >
              <CurrentIcon className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="hidden sm:inline font-medium text-slate-200 tracking-wide">
                {currentSectionMeta.label}
              </span>
              <ChevronUp
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Scroll-to-top with Circular Progress Gauge */}
            <button
              onClick={() => scrollTo(0, { duration: 1.4 })}
              className="relative w-9 h-9 rounded-full bg-[#0055D4] hover:bg-[#0040A1] active:scale-95 text-white flex items-center justify-center transition-all shadow-md shadow-blue-600/40 cursor-pointer"
              title="Scroll to Top"
            >
              {/* Circular SVG Gauge */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-0.5" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-300 transition-all duration-150"
                  strokeDasharray="100, 100"
                  strokeDashoffset={strokeDashoffset}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <ArrowUp className="w-4 h-4 text-white relative z-10 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
