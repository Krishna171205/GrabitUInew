'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Annotation } from './Annotation';
import { Sticker } from './Sticker';

export default function TimeSaved() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center']
  });

  // Animate the widths of the bars based on scroll
  const grabbitWidth = useTransform(scrollYProgress, [0, 0.45], ['0%', '24%']);
  const traditionalWidth = useTransform(scrollYProgress, [0, 0.45], ['0%', '88%']);
  
  // Opacity for the payoff text
  const payoffOpacity = useTransform(scrollYProgress, [0.35, 0.55], [0, 1]);
  const payoffY = useTransform(scrollYProgress, [0.35, 0.55], [20, 0]);

  return (
    <section 
      ref={containerRef} 
      className="py-20 sm:py-28 md:py-32 bg-gradient-to-b from-[#0047B3] via-[#0055D4] to-[#003D99] text-[#F8FAFC] relative overflow-hidden border-b-2 border-[#0F172A]"
    >
      {/* Background radial glows & texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 25%, rgba(96, 165, 250, 0.35) 0%, transparent 45%),
            radial-gradient(circle at 85% 75%, rgba(15, 23, 42, 0.6) 0%, transparent 50%)
          `
        }}
      />
      <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
        
        {/* Left: The Math */}
        <div className="w-full md:w-1/2 relative flex flex-col items-center md:items-start text-center md:text-left">
          
          <div className="relative inline-block mb-3">
            <div className="absolute -top-9 -left-4 sm:-left-6 rotate-[-5deg]">
              <Annotation text="we did the math" arrowDirection="down-right" delay={0.2} color="#93C5FD" />
            </div>
          </div>

          <h2 
            className="text-[48px] sm:text-[68px] md:text-[80px] font-black tracking-normal leading-[0.9] mb-8 uppercase text-white drop-shadow-md" 
            style={{ fontFamily: 'var(--font-anton)' }}
          >
            TIME IS <br/> MONEY.
          </h2>
          
          <div className="space-y-6 w-full max-w-[420px]">
            {/* TRADITIONAL CAFE */}
            <div className="relative">
              <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-[12px] sm:text-[13px] font-bold text-white/75 tracking-widest uppercase">
                  Without Grabbit
                </span>
                <span className="text-[18px] sm:text-[20px] font-black text-white/80 tracking-tight" style={{ fontFamily: 'var(--font-anton)' }}>
                  17 MIN
                </span>
              </div>
              <div className="w-full h-9 sm:h-10 bg-black/25 rounded-2xl p-1 border border-white/10 shadow-inner backdrop-blur-sm overflow-hidden">
                <motion.div 
                  style={{ width: traditionalWidth }}
                  className="h-full rounded-xl bg-gradient-to-r from-slate-400/30 to-slate-300/50 border border-white/20 relative flex items-center justify-end pr-3"
                >
                  <span className="text-[9px] font-bold text-white/70 tracking-widest uppercase hidden sm:inline">
                    Long Queue
                  </span>
                </motion.div>
              </div>
            </div>

            {/* WITH GRABBIT */}
            <div className="relative pt-2">
              <Sticker text="⚡ 5X FASTER" color="cream" rotation={8} className="absolute -top-4 right-0 sm:-right-2 z-20 shadow-md scale-90 sm:scale-100" />
              <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-[13px] sm:text-[14px] font-extrabold text-white tracking-widest uppercase flex items-center gap-1.5">
                  With Grabbit
                </span>
                <span className="text-[22px] sm:text-[26px] font-black text-[#FDE047] drop-shadow-sm tracking-tight" style={{ fontFamily: 'var(--font-anton)' }}>
                  03 MIN
                </span>
              </div>
              <div className="w-full h-11 sm:h-12 bg-black/35 rounded-2xl p-1 border-2 border-white/25 shadow-lg backdrop-blur-md overflow-hidden">
                <motion.div 
                  style={{ width: grabbitWidth }}
                  className="h-full rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] shadow-[0_0_20px_rgba(16,185,129,0.6)] border border-emerald-200 relative flex items-center px-3 min-w-[90px]"
                >
                  <div className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-white uppercase flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Pickup
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: PAYOFF METRIC */}
        <div className="w-full md:w-1/2 flex items-center justify-center pt-4 md:pt-0">
          <motion.div 
            style={{ opacity: payoffOpacity, y: payoffY }}
            className="text-center relative bg-white/95 backdrop-blur-2xl border-[3px] sm:border-4 border-[#0F172A] p-8 sm:p-12 md:p-14 rounded-[36px] sm:rounded-[44px] shadow-[12px_12px_0px_#0F172A] hover:shadow-[16px_16px_0px_#0F172A] rotate-[1.5deg] hover:rotate-0 transition-all duration-500 w-full max-w-[360px] sm:max-w-[420px]"
          >
            <div className="absolute -top-7 -right-4 sm:-top-8 sm:-right-8 rotate-[12deg]">
              <Annotation text="every single day" arrowDirection="down-left" delay={0.4} color="#0055D4" />
            </div>
            <div className="text-[12px] sm:text-[14px] font-extrabold text-[#64748B] tracking-widest uppercase mb-1">
              You just reclaimed
            </div>
            <div 
              className="text-[84px] sm:text-[110px] md:text-[130px] font-black tracking-[-0.04em] leading-[0.8] text-[#0055D4] uppercase" 
              style={{ fontFamily: 'var(--font-anton)' }}
            >
              14
              <span className="text-[32px] sm:text-[44px] md:text-[52px] block text-[#0F172A] tracking-tight leading-none mt-1">
                MINS
              </span>
            </div>
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] sm:text-[12px] text-[#64748B] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>That&apos;s ~85 hours saved / year</span>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
