'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MS } from '@/components/gb/kit';
import MeetTheFoundersSection from './MeetTheFoundersSection';

const steps = [
  { 
    num: '01', 
    title: 'ORDER AHEAD', 
    short: '01 Order',
    desc: "Skip the counter queue. Browse the menu, customise with oat milk or extra shots, and place your order before you even leave class." 
  },
  { 
    num: '02', 
    title: 'LIVE PREP', 
    short: '02 Live Prep',
    desc: "No guessing, no standing awkwardly at the counter. Watch your barista's live kitchen timeline count down in real-time." 
  },
  { 
    num: '03', 
    title: 'WALK. PICK UP. GO.', 
    short: '03 Pickup',
    desc: "Flash your digital token at the pickup window, grab your tray, and get right back to your break." 
  }
];

export default function AboutPeppermintSection() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live ticking prep timer for realistic mobile UI
  const [secondsLeft, setSecondsLeft] = useState(168);
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 10 ? prev - 1 : 168));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Track scroll progress for the desktop sticky layout
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Smooth transitions across the 3 step thresholds
    if (latest < 0.35) {
      setActiveStep(0);
    } else if (latest < 0.70) {
      setActiveStep(1);
    } else {
      setActiveStep(2);
    }
  });

  const handleStepClick = (idx: number) => {
    setActiveStep(idx);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const containerTop = scrollTop + rect.top;
      const scrollableDistance = rect.height - window.innerHeight;
      if (scrollableDistance > 0) {
        // Target 15%, 50%, or 85% of scroll distance to hit the center of each step
        const targetMultiplier = idx === 0 ? 0.15 : idx === 1 ? 0.50 : 0.85;
        const targetY = containerTop + targetMultiplier * scrollableDistance;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full bg-[#FAFAF7] text-[#020617] font-sans selection:bg-[#0757D5] selection:text-white">
      
      {/* ========================================================================= */}
      {/* SECTION 01: EDITORIAL PRODUCT STORYTELLING (STICKY SCROLL ON DESKTOP)    */}
      {/* ========================================================================= */}
      <div ref={containerRef} className="relative w-full lg:h-[250vh]">
        
        {/* Subtle physical paper texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none z-0" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} 
        />

        {/* Sticky Desktop Viewport Container */}
        <div className="lg:sticky lg:top-0 min-h-screen w-full flex items-center justify-center py-20 lg:py-0 relative z-10">
          <div className="max-w-[1280px] w-full mx-auto px-6 sm:px-10 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            
            {/* ------------------------------------------------------------- */}
            {/* LEFT COLUMN: HERO EDITORIAL HEADLINE & STORY NAV              */}
            {/* ------------------------------------------------------------- */}
            <div className="w-full lg:w-[48%] flex flex-col justify-center text-left">
              
              {/* Eyebrow & Headline */}
              <div className="mb-8 lg:mb-12">
                <div className="inline-flex items-center gap-2 mb-3">
                  <span 
                    className="text-[#0757D5] text-2xl sm:text-3xl tracking-wide inline-block -rotate-2 origin-left font-bold" 
                    style={{ fontFamily: 'var(--font-caveat), cursive' }}
                  >
                    why grabbit?
                  </span>
                  <div className="w-2 h-2 rounded-full bg-[#0757D5]/40 animate-ping" />
                </div>
                
                <h1 
                  className="text-[52px] sm:text-[72px] lg:text-[84px] xl:text-[96px] leading-[0.88] tracking-tight uppercase text-[#020617] mb-6" 
                  style={{ fontFamily: 'var(--font-anton)' }}
                >
                  BUILT FOR THE<br />
                  <span className="text-[#0757D5]">BREAK.</span>
                </h1>
                
                <p className="text-[16px] sm:text-[18px] text-slate-600 font-medium max-w-[480px] leading-relaxed border-l-2 border-[#0757D5]/30 pl-4">
                  Between classes, meetings, and sprint deadlines, your 15-minute break shouldn't be spent standing in a 14-minute queue. Order ahead, track live prep, and grab your tray on your terms.
                </p>

                {/* Quick campus context pills */}
                <div className="flex flex-wrap items-center gap-2 mt-5">
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
                    ⚡ 0 Min Queue Time
                  </span>
                  <span className="text-[11px] font-bold text-[#0757D5] bg-[#0757D5]/10 px-3 py-1 rounded-full border border-[#0757D5]/20">
                    📍 DTU Main Block
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
                    ⏱ Live Kitchen Sync
                  </span>
                </div>
              </div>

              {/* Mobile Quick Tab Switcher (Visible on small screens) */}
              <div className="flex lg:hidden items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 mb-6 w-full max-w-sm">
                {steps.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
                      activeStep === idx 
                        ? 'bg-[#0757D5] text-white shadow-md' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s.short}
                  </button>
                ))}
              </div>

              {/* Desktop Feature Navigation (Interactive 01 / 02 / 03) */}
              <div className="hidden lg:flex flex-col gap-6 w-full max-w-md relative z-20">
                {steps.map((step, idx) => {
                  const isActive = activeStep === idx;
                  return (
                    <div 
                      key={idx}
                      onClick={() => handleStepClick(idx)}
                      className="group cursor-pointer flex flex-col select-none"
                    >
                      <div className={`flex items-center gap-4 transition-all duration-300 ${isActive ? 'opacity-100 translate-x-2' : 'opacity-40 group-hover:opacity-75'}`}>
                        <span className="font-bold text-[14px] tracking-widest font-mono text-slate-500">
                          {step.num}
                        </span>
                        
                        {/* Dynamic Line Indicator */}
                        <div className={`h-[2px] transition-all duration-500 ease-out ${isActive ? 'w-16 bg-[#0757D5]' : 'w-8 bg-slate-300 group-hover:w-10'}`} />
                        
                        <span 
                          className={`text-[24px] xl:text-[28px] tracking-wider uppercase transition-colors duration-300 ${isActive ? 'text-[#0757D5]' : 'text-slate-900'}`} 
                          style={{ fontFamily: 'var(--font-anton)' }}
                        >
                          {step.title}
                        </span>

                        {isActive && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#0757D5] ml-1 shadow-[0_0_10px_rgba(7,87,213,0.8)] animate-pulse" />
                        )}
                      </div>

                      {/* Expandable step description */}
                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="pl-[94px] overflow-hidden" 
                          >
                            <p className="text-slate-600 text-[15px] leading-relaxed font-medium max-w-sm">
                              {step.desc}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Scroll guidance hint on desktop */}
              <div className="hidden lg:flex items-center gap-2 mt-10 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <MS name="mouse" size={14} className="text-[#0757D5]" />
                <span>Scroll or click steps to explore</span>
              </div>

            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT COLUMN: HIGH-FIDELITY FLOATING PHONE MOCKUP             */}
            {/* ------------------------------------------------------------- */}
            <div className="w-full lg:w-[48%] flex justify-center relative perspective-[1200px]">
              
              {/* Phone Physical Shell */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative w-[310px] sm:w-[340px] md:w-[360px] lg:w-[365px] h-[640px] sm:h-[680px] lg:h-[700px] rounded-[48px] sm:rounded-[52px] bg-[#1E293B] p-[3px] shadow-[0_20px_40px_-15px_rgba(0,10,30,0.15),0_0_0_1px_rgba(255,255,255,0.1)_inset] border border-[#334155] overflow-hidden flex flex-col z-10"
              >
                
                {/* Metallic Edge Highlight */}
                <div className="absolute inset-0 rounded-[46px] sm:rounded-[50px] border border-t-white/20 border-l-white/10 border-b-black/40 border-r-black/20 pointer-events-none z-50" />

                {/* Dynamic Island Cutout */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[84px] h-[24px] bg-[#0F172A] rounded-full z-40 shadow-sm flex items-center justify-between px-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-black shadow-inner" />
                  {activeStep === 1 ? (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0757D5] animate-pulse" />
                      <span className="text-[7.5px] font-mono text-white/90 font-bold">2m</span>
                    </div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
                  )}
                </div>

                {/* Glass Reflection Sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.07] pointer-events-none z-30 rounded-[44px] sm:rounded-[48px]" />

                {/* --------------------------------------------------------- */}
                {/* PHONE INNER SCREEN                                        */}
                {/* --------------------------------------------------------- */}
                <div className="flex-1 bg-[#FAFAF7] text-[#020617] w-full rounded-[44px] sm:rounded-[48px] pt-8 pb-4 px-4 flex flex-col justify-between relative overflow-hidden select-none">
                  
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-3 pt-1 mb-2 z-10">
                    <span className="text-[11px] font-bold text-slate-800 tracking-tight">9:41</span>
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <MS name="signal_cellular_4_bar" size={12} />
                      <MS name="wifi" size={12} />
                      <MS name="battery_full" size={14} />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between px-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-black tracking-tight text-slate-900">GRABBIT</span>
                      <div className="w-1 h-1 bg-[#0757D5] rounded-full" />
                      <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">DTU</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-slate-200 border border-white flex items-center justify-center text-slate-700 text-[9px] font-bold shadow-xs">
                      SS
                    </div>
                  </div>

                  {/* Location Chip */}
                  <div className="flex items-center gap-1.5 mb-3 px-2">
                    <div className="w-2 h-2 rounded-full bg-[#0757D5] shadow-[0_0_6px_rgba(7,87,213,0.6)]" />
                    <span className="text-[10px] font-extrabold text-slate-900 tracking-wide uppercase">DTU MAIN BLOCK</span>
                    <span className="text-[9.5px] text-slate-400 font-medium">· 150m away</span>
                  </div>

                  {/* Scrollable / Interactive Cards Section */}
                  <div className="flex-1 flex flex-col gap-3 px-1 overflow-hidden">
                    
                    {/* CARD 01: CAFE SHOWCASE (Highlights in Step 0) */}
                    <motion.div 
                      animate={{ 
                        borderColor: activeStep === 0 ? 'rgba(7, 87, 213, 0.4)' : '#F1F5F9',
                        boxShadow: activeStep === 0 ? '0 4px 12px rgba(7, 87, 213, 0.05)' : 'none'
                      }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl p-3 flex items-center gap-3 border transition-colors"
                    >
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/50">
                        <Image 
                          src="/about/raydee-cafe.jpg" 
                          alt="The Raydee Cafe" 
                          fill 
                          sizes="44px"
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[12px] font-extrabold text-slate-900 tracking-tight truncate">THE RAYDEE CAFE</h4>
                          <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">OPEN</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-[9.5px] text-[#0757D5] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0757D5] animate-pulse" />
                          5–8 min prep time
                        </div>
                      </div>
                    </motion.div>

                    {/* CARD 02: YOUR ORDER & CUSTOMISATIONS */}
                    <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Order</div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-[13px] font-extrabold text-slate-900 leading-tight">Iced Americano</div>
                          <div className="text-[9.5px] text-slate-500 mt-0.5">Double Espresso · Chilled</div>
                        </div>
                        <span className="text-[14px] font-black text-[#0757D5]">₹200</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[8.5px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Oat Milk</span>
                        <span className="text-[8.5px] font-bold text-[#0757D5] bg-[#0757D5]/10 px-2 py-0.5 rounded">+Extra Shot</span>
                        <span className="text-[8.5px] font-bold text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded">Std Sugar</span>
                      </div>
                    </div>

                    {/* CARD 03: LIVE PREP STATUS (Highlights in Step 1) */}
                    <motion.div 
                      animate={{ 
                        borderColor: activeStep === 1 ? 'rgba(7, 87, 213, 0.5)' : '#F1F5F9',
                        boxShadow: activeStep === 1 ? '0 4px 12px rgba(7, 87, 213, 0.05)' : 'none'
                      }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl p-3 border transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Status</div>
                        <span className="text-[10px] font-mono font-bold text-[#0757D5] flex items-center gap-1">
                          {activeStep === 1 && <span className="w-1.5 h-1.5 rounded-full bg-[#0757D5] animate-pulse" />}
                          {activeStep === 2 ? '00:00' : formatTimer(secondsLeft)}
                        </span>
                      </div>

                      {/* Dynamic Progress Bar */}
                      <div className="relative w-full h-[3px] bg-slate-100 rounded-full mb-2 overflow-hidden">
                        <motion.div 
                          animate={{ 
                            width: activeStep === 0 ? '25%' : activeStep === 1 ? '68%' : '100%' 
                          }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className="absolute left-0 top-0 h-full bg-[#0757D5] rounded-full" 
                        />
                      </div>

                      <div className="flex justify-between text-[8px] font-bold">
                        <span className={activeStep >= 0 ? "text-slate-900" : "text-slate-300"}>Placed</span>
                        <span className={activeStep === 1 ? "text-[#0757D5] font-extrabold" : activeStep > 1 ? "text-slate-900" : "text-slate-300"}>
                          Preparing
                        </span>
                        <span className={activeStep === 2 ? "text-[#0757D5] font-extrabold" : "text-slate-300"}>Ready</span>
                      </div>
                    </motion.div>

                    {/* CARD 04: PICKUP TOKEN (Expands in Step 2) */}
                    <motion.div 
                      animate={{ 
                        backgroundColor: activeStep === 2 ? '#0757D5' : '#0F172A',
                      }}
                      transition={{ duration: 0.3 }}
                      className="rounded-2xl p-3.5 flex flex-col items-center justify-center text-white relative overflow-hidden mt-auto"
                    >
                      <span className="text-[7.5px] font-bold text-white/70 uppercase tracking-[0.2em] block mb-0.5">
                        {activeStep === 2 ? 'READY FOR COLLECTION' : 'PICKUP TOKEN'}
                      </span>
                      <div 
                        className="text-[36px] font-normal tracking-tight leading-none mb-1 text-white" 
                        style={{ fontFamily: 'var(--font-anton)' }}
                      >
                        #GB-408
                      </div>
                      <span className="text-[8px] font-bold text-white/90 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                        MAIN BLOCK COUNTER 02
                      </span>
                    </motion.div>

                  </div>

                  {/* App Bottom Navigation Bar */}
                  <div className="pt-2.5 pb-0.5 mt-2 flex justify-between items-center px-4 border-t border-slate-100">
                    <div className="flex flex-col items-center gap-0.5 text-slate-300">
                      <MS name="home" size={16} />
                      <span className="text-[6.5px] font-bold tracking-wider">HOME</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-slate-300">
                      <MS name="storefront" size={16} />
                      <span className="text-[6.5px] font-bold tracking-wider">CAFÉS</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-[#0757D5]">
                      <div className="relative">
                        <MS name="receipt_long" size={16} />
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                      </div>
                      <span className="text-[6.5px] font-bold tracking-wider">ORDERS</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-slate-300">
                      <MS name="person" size={16} />
                      <span className="text-[6.5px] font-bold tracking-wider">PROFILE</span>
                    </div>
                  </div>

                  {/* iOS Home Indicator */}
                  <div className="w-20 h-1 bg-slate-900/30 rounded-full mx-auto mt-1" />

                </div>
              </motion.div>

            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SECTION 02: MEET THE FOUNDERS SECTION (RESTORED & POLISHED)               */}
      {/* ========================================================================= */}
      <div className="relative z-20 border-t border-slate-200/60 bg-white">
        <MeetTheFoundersSection />
      </div>

    </div>
  );
}
