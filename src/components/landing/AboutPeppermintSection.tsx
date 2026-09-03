'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';
import Image from 'next/image';

export default function AboutPeppermintSection() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Smooth, unified scroll parallax that avoids hydration mismatches
  const textY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, -35]);
  const phoneParallaxY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [15, -25]);

  // Interactive micro-states connecting cards and phone UI
  const [customizations, setCustomizations] = useState({
    oatMilk: true,
    extraShot: true,
    noSugar: false,
  });

  // Live ticking prep timer (counts down 04:12 smoothly)
  const [secondsLeft, setSecondsLeft] = useState(252);
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 60 ? prev - 1 : 252));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Framer motion variants for sequenced editorial text entrance
  const textContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.09, delayChildren: 0.1 }
    }
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 18 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const cursiveStyle = {
    fontFamily: "'Cedarville Cursive', 'Caveat', 'Dancing Script', 'Brush Script MT', cursive",
    fontStyle: "italic"
  };

  return (
    <div className="w-full bg-white text-[#020617] selection:bg-[#0055D4] selection:text-white font-sans overflow-hidden">
      
      {/* ========================================================================= */}
      {/* SECTION 01: THE REASON (WHITE PAPER + BLUE TYPOGRAPHY)                    */}
      {/* ========================================================================= */}
      <section ref={sectionRef} className="relative min-h-[900px] lg:min-h-[1020px] pt-28 lg:pt-36 pb-28 lg:pb-36 px-6 bg-white overflow-hidden border-b border-[#F0F5FF]">
        
        {/* Subtle white noise texture for physical paper feel */}
        <div 
          className="absolute inset-0 opacity-[0.025] pointer-events-none" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} 
        />

        {/* The Continuous Blue Ribbon connecting sections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden lg:block" preserveAspectRatio="none" viewBox="0 0 1440 1200">
           <motion.path 
             initial={{ pathLength: 0, opacity: 0 }} 
             animate={{ pathLength: 1, opacity: 1 }} 
             transition={{ duration: 1.8, ease: "easeInOut", delay: 0.3 }}
             d="M 120 220 C 380 220, 680 280, 960 620 C 1080 780, 1020 980, 720 1120 C 450 1250, 0 1050, 120 1220" 
             stroke="#EFF6FF" strokeWidth="2.5" fill="none" 
           />
        </svg>

        <div className="relative z-20 max-w-[1280px] mx-auto flex flex-col lg:flex-row lg:justify-between items-start">
          
          {/* Top Typography (Left Aligned always) */}
          <motion.div 
            style={{ y: textY }}
            variants={textContainerVariants}
            initial="hidden"
            animate="show"
            className="w-full lg:max-w-[560px] xl:max-w-[620px] flex flex-col items-start text-left z-20"
          >
            {/* Eyebrow with Chapter Indicator removed for cleaner editorial typography */}
            {/* Headline Hierarchy (Editorial scaling with central typographic punch) */}
            <h1 className="font-black uppercase tracking-tight leading-[0.88] mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-anton)' }}>
              <motion.span variants={textItemVariants} className="block text-[42px] sm:text-[58px] lg:text-[68px] text-[#0055D4] mb-1">
                Your coffee
              </motion.span>
              <motion.span variants={textItemVariants} className="block text-[52px] sm:text-[72px] lg:text-[84px] text-[#020617] mb-1">
                shouldn't take
              </motion.span>
              <motion.span variants={textItemVariants} className="block text-[42px] sm:text-[58px] lg:text-[68px] text-[#0055D4]">
                your whole break.
              </motion.span>
            </h1>
            
            {/* Cursive Annotation */}
            <motion.div variants={textItemVariants} className="relative inline-block mb-8 sm:mb-10 ml-2 sm:ml-6 -rotate-2">
              <span className="text-[#0055D4] text-[22px] sm:text-[26px] tracking-wide" style={cursiveStyle}>
                your break, back.
              </span>
              {/* Hand-drawn underline SVG */}
              <svg className="absolute -bottom-1 left-0 w-full h-[6px] text-[#0055D4]" viewBox="0 0 100 10" preserveAspectRatio="none">
                <motion.path 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.9 }}
                  d="M 2 5 Q 30 8, 60 4 T 98 6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" 
                />
              </svg>
            </motion.div>

            {/* Supporting Copy */}
            <motion.div variants={textItemVariants} className="flex flex-col gap-3 max-w-[92%] sm:max-w-md border-l-2 border-[#DBEAFE] pl-5 sm:pl-6">
              <p className="text-[17px] sm:text-[18px] text-[#020617] font-semibold leading-relaxed">
                Between classes, meetings and deadlines, your break should be yours.
              </p>
              <p className="text-[14px] sm:text-[15px] text-slate-500 font-medium leading-relaxed">
                Order ahead. See live prep. Walk straight to pickup.
              </p>
            </motion.div>
          </motion.div>

          {/* Primary Visual: Unified Motion Container (Hand + Phone move together as ONE object) */}
          <div className="w-full lg:w-auto relative flex justify-center lg:block mt-16 sm:mt-24 lg:mt-0">
            <motion.div 
              style={{ y: phoneParallaxY }}
              initial={{ opacity: 0, y: 45, scale: 0.8, rotate: -3 }}
              animate={{ opacity: 1, y: 0, scale: 0.85, rotate: -6 }}
              whileHover={{ rotate: -4, scale: 0.86 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative lg:absolute lg:-top-4 xl:-top-10 lg:right-4 xl:right-0 w-[310px] sm:w-[340px] md:w-[360px] lg:w-[370px] h-[640px] sm:h-[670px] lg:h-[690px] z-30 perspective-[1200px]"
            >
              <div className="relative w-full h-full">

                {/* 1. LAYER BEHIND PHONE: Realistic Photographic Hand Supporting Base and Rear */}
                <div className="absolute -right-[50px] top-[270px] w-[460px] h-[615px] pointer-events-none z-10 overflow-visible select-none">
                  <Image 
                    src="/about/hand-holding-phone.webp" 
                    alt="Hand casually holding phone" 
                    fill
                    priority
                    sizes="(max-width: 768px) 340px, 460px"
                    className="object-contain object-top-left drop-shadow-xl opacity-95 transition-opacity duration-300"
                  />
                </div>

                {/* 2. LAYER PHONE: Physical Smartphone Construction */}
                <div className="relative w-full h-full z-20">
                  
                  {/* Layered Physical Shadows: Tight contact + soft body + blue ambient bounce */}
                  <div className="absolute -inset-1 rounded-[52px] bg-[#0055D4]/10 blur-[32px] pointer-events-none" />
                  <div className="absolute inset-4 rounded-[44px] bg-[#020617]/20 blur-[20px] pointer-events-none" />

                  {/* Smartphone Frame (Graphite metallic chassis with dual-tone edge highlight) */}
                  <div className="relative w-full h-full rounded-[48px] sm:rounded-[54px] bg-[#141923] p-[3.5px] sm:p-[4px] shadow-[0_25px_60px_-15px_rgba(0,35,90,0.22),0_12px_24px_-8px_rgba(2,6,23,0.18)] border border-[#2a364a] overflow-hidden flex flex-col">
                    
                    {/* Metallic Chassis Edge Highlight (Brighter on light-facing side, darker opposite) */}
                    <div className="absolute inset-0 rounded-[46px] sm:rounded-[52px] border border-t-[#55698a]/60 border-l-[#445570]/40 border-b-[#111620] border-r-[#151c28] pointer-events-none z-50" />
                    
                    {/* Hardware Buttons */}
                    <div className="absolute top-28 sm:top-36 -left-[4px] w-[2px] h-9 bg-[#2e3b52] rounded-l border-y border-l border-[#445570]/50" />
                    <div className="absolute top-40 sm:top-48 -left-[4px] w-[2px] h-12 bg-[#2e3b52] rounded-l border-y border-l border-[#445570]/50" />
                    <div className="absolute top-40 sm:top-48 -right-[4px] w-[2px] h-16 bg-[#2e3b52] rounded-r border-y border-r border-[#445570]/50" />

                    {/* Dynamic Island Cutout */}
                    <div className="absolute top-3 sm:top-3.5 left-1/2 -translate-x-1/2 w-[84px] sm:w-[96px] h-[24px] sm:h-[28px] bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-md">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0d1017] shadow-inner border border-white/5" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#080a0f] shadow-inner flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0055D4]/70" />
                      </div>
                    </div>

                    {/* Realistic Glass Reflection Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] pointer-events-none z-30 rounded-[44px] sm:rounded-[50px]" />

                    {/* ============================================================ */}
                    {/* ACTUAL GRABBIT MOBILE APP SCREEN                             */}
                    {/* ============================================================ */}
                    <div className="flex-1 bg-[#FAFCFF] text-[#020617] w-full rounded-[44px] sm:rounded-[50px] pt-9 sm:pt-10 pb-4 sm:pb-5 px-3.5 sm:px-4 flex flex-col justify-between relative overflow-hidden select-none">
                      
                      {/* Top Status Bar */}
                      <div className="flex justify-between items-center px-2 pt-0.5 mb-2">
                        <span className="text-[11px] font-semibold text-slate-800 tracking-tight">9:41</span>
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <MS name="signal_cellular_4_bar" size={12} />
                          <MS name="wifi" size={12} />
                          <MS name="battery_full" size={14} />
                        </div>
                      </div>

                      {/* App Header */}
                      <div className="flex items-center justify-between px-1 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#0055D4] flex items-center justify-center text-white shadow-sm font-black text-[13px]">
                            G
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[11px] font-black text-[#0055D4] tracking-wider uppercase leading-none">DTU CAMPUS</span>
                            <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">Good afternoon, Shriyansh</span>
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#0055D4] text-[10px] font-bold">
                          SS
                        </div>
                      </div>

                      {/* Campus Location Context */}
                      <div className="bg-[#EFF6FF]/70 rounded-xl px-2.5 py-1.5 flex items-center justify-between border border-[#DBEAFE]/80 mb-2">
                        <div className="flex items-center gap-1.5 text-left">
                          <MS name="location_on" size={13} className="text-[#0055D4]" />
                          <span className="text-[11px] font-bold text-slate-900">DTU MAIN BLOCK</span>
                          <span className="text-[10px] text-slate-500 font-medium">· 150m away</span>
                        </div>
                        <MS name="keyboard_arrow_right" size={14} className="text-slate-400" />
                      </div>

                      {/* Featured Cafe Card (Real authentic photo) */}
                      <div className="bg-white rounded-2xl p-2.5 border border-[#E2EDFB] shadow-[0_2px_8px_rgba(0,85,212,0.04)] mb-2 flex items-center gap-2.5 text-left">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                          <Image 
                            src="/about/raydee-cafe.jpg" 
                            alt="The Raydee Cafe" 
                            fill 
                            sizes="48px"
                            className="object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[12px] font-bold text-slate-900 truncate">THE RAYDEE CAFE</h4>
                            <span className="text-[9px] font-extrabold text-[#0055D4] bg-[#EFF6FF] px-1.5 py-0.5 rounded">OPEN</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">DTU Main Block · 150m</p>
                          <div className="flex items-center gap-1 mt-0.5 text-[9px] text-[#0055D4] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0055D4] animate-pulse" />
                            5–8 min prep
                          </div>
                        </div>
                      </div>

                      {/* Your Order Card (Reflects live customizations) */}
                      <div className="bg-white rounded-2xl p-2.5 border border-[#E2EDFB] shadow-[0_2px_8px_rgba(0,85,212,0.04)] mb-2 text-left">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">YOUR ORDER</span>
                          <span className="text-[13.5px] font-black text-slate-900">₹{customizations.extraShot ? 200 : 180}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="text-[13.5px] font-extrabold text-slate-900 leading-snug">Iced Americano</div>
                            <div className="text-[10px] text-slate-500 font-medium">Double Espresso · Chilled</div>
                          </div>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          {customizations.oatMilk && (
                            <span className="text-[9px] font-semibold text-[#0055D4] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#DBEAFE]/60">Oat Milk</span>
                          )}
                          {customizations.extraShot && (
                            <span className="text-[9px] font-semibold text-[#0055D4] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#DBEAFE]/60">+Extra Shot</span>
                          )}
                          {customizations.noSugar ? (
                            <span className="text-[9px] font-semibold text-[#0055D4] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-[#DBEAFE]/60">No Sugar</span>
                          ) : (
                            <span className="text-[9px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">Standard Sugar</span>
                          )}
                        </div>
                      </div>

                      {/* Live Prep Micro UI */}
                      <div className="bg-white rounded-2xl p-2.5 border border-[#E2EDFB] shadow-[0_2px_12px_rgba(0,85,212,0.06)] mb-2 text-left relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#0055D4]/5 blur-xl rounded-full pointer-events-none" />
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">ORDER #GB-408</span>
                            <span className="text-[9px] font-extrabold text-[#0055D4] uppercase tracking-wider bg-[#0055D4]/10 px-1.5 py-0.5 rounded animate-pulse">PREPARING</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[#020617] bg-slate-100/80 px-1.5 py-0.5 rounded shadow-inner">
                            {formatTimer(secondsLeft)}
                          </span>
                        </div>
                        
                        {/* 6px Progress Bar */}
                        <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden mb-1.5 relative shadow-inner">
                          <div className="w-[65%] h-full bg-[#0055D4] rounded-full relative shadow-[0_0_8px_rgba(0,85,212,0.5)]">
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite]" />
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-[7.5px] font-bold text-slate-400 px-0.5">
                          <span className="text-[#0055D4]">Placed</span>
                          <span className="text-[#0055D4]">Preparing</span>
                          <span>Pickup</span>
                        </div>
                      </div>

                      {/* Pickup Token Card (Digital Ticket Style) */}
                      <div className="bg-gradient-to-br from-[#0055D4] to-[#003EA1] rounded-2xl p-2.5 shadow-[0_8px_20px_rgba(0,85,212,0.25)] text-center relative overflow-hidden text-white mt-1 z-10">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />
                        
                        {/* Ticket perforated edges */}
                        <div className="absolute top-[22px] left-[-4px] w-2 h-2 rounded-full bg-[#FAFCFF] shadow-inner" />
                        <div className="absolute top-[22px] right-[-4px] w-2 h-2 rounded-full bg-[#FAFCFF] shadow-inner" />
                        <div className="absolute top-[26px] left-2 right-2 border-t-[1.5px] border-dashed border-white/25" />
                        
                        <span className="text-[7.5px] font-bold text-white/80 uppercase tracking-[0.2em] block mb-1">PICKUP TOKEN</span>
                        <div className="text-[32px] sm:text-[36px] font-black tracking-tight leading-none mb-1 drop-shadow-sm mt-3" style={{ fontFamily: 'var(--font-anton)' }}>
                          #GB-408
                        </div>
                        <span className="text-[7.5px] font-bold text-white/90 uppercase tracking-widest bg-black/10 inline-block px-2 py-0.5 rounded-full mt-1 shadow-sm">
                          PICK UP AT MAIN BLOCK COUNTER
                        </span>
                      </div>

                      {/* Mobile App Bottom Navigation Bar */}
                      <div className="pt-2 border-t border-slate-100/80 bg-white/90 backdrop-blur-md flex justify-around items-center px-1 pb-1 mt-1">
                        <div className="flex flex-col items-center gap-0.5 text-[#0055D4]">
                          <MS name="home" size={16} />
                          <span className="text-[7.5px] font-bold tracking-wide">HOME</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 text-slate-300 hover:text-slate-400 transition-colors">
                          <MS name="storefront" size={16} />
                          <span className="text-[7.5px] font-bold tracking-wide">CAFÉS</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 text-slate-300 hover:text-slate-400 transition-colors">
                          <MS name="receipt_long" size={16} />
                          <span className="text-[7.5px] font-bold tracking-wide">ORDERS</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 text-slate-300 hover:text-slate-400 transition-colors">
                          <MS name="person" size={16} />
                          <span className="text-[7.5px] font-bold tracking-wide">PROFILE</span>
                        </div>
                      </div>

                      {/* Home Indicator */}
                      <div className="w-20 h-1 bg-slate-900/40 rounded-full mx-auto mt-0.5" />
                    </div>
                  </div>
                </div>

                {/* 3. LAYER FOREGROUND: Natural Thumb Overlap on the Phone Edge */}
                {/* (Removed for cleaner UI presentation) */}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 02: THE GRABBIT DIFFERENCE (WHITE - SIMPLIFIED)                    */}
      {/* ========================================================================= */}
      <section className="relative pt-24 lg:pt-32 pb-32 lg:pb-40 px-6 bg-white overflow-hidden">
        <div className="max-w-[1280px] mx-auto text-center relative z-10 flex flex-col items-center">
          
          <motion.div
            variants={textContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col items-center w-full"
          >
            {/* Chapter Indicator removed */}
            <div className="relative inline-block mb-6">
              <h2 className="font-black uppercase tracking-tight leading-[0.85]" style={{ fontFamily: 'var(--font-anton)' }}>
                <motion.span variants={textItemVariants} className="text-[#020617] block text-[64px] sm:text-[88px] lg:text-[96px] mb-1">
                  LESS WAIT.
                </motion.span>
                <motion.span variants={textItemVariants} className="text-[#0055D4] block text-[70px] sm:text-[98px] lg:text-[112px]">
                  MORE DAY.
                </motion.span>
              </h2>
              
              {/* Off-axis cursive annotation (Placed cleanly in upper-right space without colliding with text) */}
              <motion.span 
                variants={textItemVariants} 
                className="absolute -top-3 sm:-top-5 -right-6 sm:-right-16 lg:-right-24 rotate-[6deg] text-[#0055D4] text-[19px] sm:text-[25px] tracking-wide whitespace-nowrap select-none" 
                style={cursiveStyle}
              >
                more time for you.
              </motion.span>
            </div>

            {/* Simplified Supporting text without duplication */}
            <motion.div variants={textItemVariants} className="mb-14 lg:mb-20 flex flex-col items-center gap-1 text-slate-500 font-medium">
              <p className="text-[16px] sm:text-[17px]">More time for class.</p>
              <p className="text-[16px] sm:text-[17px]">More time with friends.</p>
              <p className="text-[16px] sm:text-[17px] text-[#0055D4] font-bold">Your break stays a break.</p>
            </motion.div>
          </motion.div>

          {/* THREE COMPACT EDITORIAL CARDS (Simplified content, subtle rotation) */}
          <div className="flex flex-row lg:items-stretch justify-start lg:justify-center gap-4 lg:gap-5 lg:-mx-12 xl:-mx-20 overflow-x-auto lg:overflow-visible pb-12 lg:pb-0 px-6 lg:px-0 snap-x snap-mandatory hide-scrollbar -mx-6 w-[calc(100%+48px)] lg:w-auto">
            
            {/* Card 01: Zero Line Waiting */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4, rotate: 0 }}
              className="group relative flex-none w-[260px] sm:w-[280px] bg-white rounded-2xl border border-[#EFF6FF] shadow-[0_4px_20px_rgba(0,85,212,0.06)] p-6 flex flex-col text-left lg:-rotate-[2deg] transition-all duration-200 snap-center hover:shadow-[0_12px_28px_rgba(0,85,212,0.1)]"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-[18px] font-black text-[#0055D4]" style={{ fontFamily: 'var(--font-anton)' }}>01</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Queue Bypass</span>
              </div>
              
              <div className="w-full bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-3 mb-5 shadow-sm overflow-hidden h-[86px] flex flex-col justify-center">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Queue</span>
                   <span className="text-[10px] font-bold text-slate-400">12 Waiting</span>
                 </div>
                 <div className="bg-white rounded-lg border border-[#DBEAFE] p-1.5 px-2.5 flex justify-between items-center shadow-xs">
                   <div className="flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#0055D4] animate-ping" />
                     <span className="text-[9.5px] font-bold text-[#020617]">Your Order</span>
                   </div>
                   <span className="text-[8.5px] font-extrabold bg-[#EFF6FF] text-[#0055D4] px-1.5 py-0.5 rounded">READY</span>
                 </div>
              </div>

              <h3 className="text-[20px] font-black uppercase tracking-tight text-[#020617] leading-none mb-2" style={{ fontFamily: 'var(--font-anton)' }}>Zero Line Waiting</h3>
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-5">Skip the queue and walk straight to pickup.</p>
              
              <div className="mt-auto text-[10px] font-extrabold text-[#0055D4] uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                See How <MS name="arrow_forward" size={14} />
              </div>
            </motion.div>

            {/* Card 02: Live Prep Status (Real Ticking Timer) */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4, rotate: 0 }}
              className="group relative flex-none w-[260px] sm:w-[280px] bg-white rounded-2xl border border-[#EFF6FF] shadow-[0_4px_20px_rgba(0,85,212,0.06)] p-6 flex flex-col text-left lg:rotate-[0deg] z-20 transition-all duration-200 snap-center hover:shadow-[0_12px_28px_rgba(0,85,212,0.1)]"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-[18px] font-black text-[#0055D4]" style={{ fontFamily: 'var(--font-anton)' }}>02</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#0055D4] bg-[#EFF6FF] px-1.5 py-0.5 rounded">Live Timer</span>
              </div>
              
              <div className="w-full bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-3 mb-5 shadow-sm overflow-hidden h-[86px] flex flex-col justify-center">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-bold text-[#0055D4] uppercase tracking-wider flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-[#0055D4] animate-pulse" />
                     Preparing
                   </span>
                   <span className="text-[10.5px] font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-xs">
                     {formatTimer(secondsLeft)}
                   </span>
                 </div>
                 <div className="w-full h-1.5 bg-[#E2EDFB] rounded-full overflow-hidden relative">
                   <div className="w-[65%] h-full bg-[#0055D4] rounded-full relative">
                     <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                   </div>
                 </div>
              </div>

              <h3 className="text-[20px] font-black uppercase tracking-tight text-[#020617] leading-none mb-2" style={{ fontFamily: 'var(--font-anton)' }}>Live Prep Status</h3>
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-5">Know exactly when your order is ready.</p>
              
              <div className="mt-auto text-[10px] font-extrabold text-[#0055D4] uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                See How <MS name="arrow_forward" size={14} />
              </div>
            </motion.div>

            {/* Card 03: Customize Your Order (Interactive Toggles) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4, rotate: 0 }}
              className="group relative flex-none w-[260px] sm:w-[280px] bg-white rounded-2xl border border-[#EFF6FF] shadow-[0_4px_20px_rgba(0,85,212,0.06)] p-6 flex flex-col text-left lg:rotate-[2deg] transition-all duration-200 snap-center hover:shadow-[0_12px_28px_rgba(0,85,212,0.1)]"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-[18px] font-black text-[#0055D4]" style={{ fontFamily: 'var(--font-anton)' }}>03</span>
                <span className="text-[8.5px] font-bold text-slate-400">Interactive</span>
              </div>
              
              {/* Interactive toggle switch cluster */}
              <div className="w-full bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-2.5 mb-5 shadow-sm overflow-hidden h-[86px] flex flex-col justify-center gap-1.5">
                 {/* Oat Milk Toggle */}
                 <div 
                   onClick={() => setCustomizations(prev => ({ ...prev, oatMilk: !prev.oatMilk }))}
                   className="flex justify-between items-center cursor-pointer hover:bg-white/80 p-0.5 rounded transition-colors"
                 >
                   <span className="text-[9.5px] font-bold text-slate-800">Oat Milk</span>
                   <div className={`w-6 h-3.5 rounded-full transition-colors relative flex items-center px-0.5 ${customizations.oatMilk ? 'bg-[#0055D4]' : 'bg-slate-300'}`}>
                     <motion.div 
                       layout 
                       className={`w-2.5 h-2.5 bg-white rounded-full shadow-xs ${customizations.oatMilk ? 'ml-auto' : 'mr-auto'}`} 
                     />
                   </div>
                 </div>

                 {/* Extra Shot Toggle */}
                 <div 
                   onClick={() => setCustomizations(prev => ({ ...prev, extraShot: !prev.extraShot }))}
                   className="flex justify-between items-center cursor-pointer hover:bg-white/80 p-0.5 rounded transition-colors"
                 >
                   <span className="text-[9.5px] font-bold text-slate-800">Extra Shot</span>
                   <div className={`w-6 h-3.5 rounded-full transition-colors relative flex items-center px-0.5 ${customizations.extraShot ? 'bg-[#0055D4]' : 'bg-slate-300'}`}>
                     <motion.div 
                       layout 
                       className={`w-2.5 h-2.5 bg-white rounded-full shadow-xs ${customizations.extraShot ? 'ml-auto' : 'mr-auto'}`} 
                     />
                   </div>
                 </div>
              </div>

              <h3 className="text-[20px] font-black uppercase tracking-tight text-[#020617] leading-none mb-2" style={{ fontFamily: 'var(--font-anton)' }}>Customize Your Order</h3>
              <p className="text-[12px] text-slate-500 font-medium leading-relaxed mb-5">Tap toggles to see the phone screen update live.</p>
              
              <div className="mt-auto text-[10px] font-extrabold text-[#0055D4] uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                See How <MS name="arrow_forward" size={14} />
              </div>
            </motion.div>
            
            {/* Spacer for mobile scroll boundary */}
            <div className="w-2 flex-none lg:hidden" />

          </div>

          {/* SIMPLIFIED FINAL CTA */}
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 lg:mt-28 flex flex-col items-center bg-white"
          >
            <div className="text-[11px] font-bold text-[#0055D4] tracking-widest uppercase mb-3">Ready?</div>
            <h3 className="text-[32px] sm:text-[38px] font-black uppercase tracking-tight text-[#020617] mb-3" style={{ fontFamily: 'var(--font-anton)' }}>
              Ready to Grab It?
            </h3>
            <p className="text-[14px] sm:text-[15px] text-slate-500 font-medium mb-8">
              Find your café. Order ahead. Skip the wait.
            </p>
            <Link 
              href="/cafes" 
              className="group inline-flex items-center justify-center gap-2 bg-[#0055D4] text-white rounded-full text-[12px] font-extrabold uppercase tracking-widest hover:bg-[#0047B3] transition-all shadow-[0_4px_14px_rgba(0,85,212,0.25)] hover:shadow-[0_6px_20px_rgba(0,85,212,0.35)] active:scale-98 w-[160px] sm:w-[176px] h-[48px] sm:h-[52px] hover:-translate-y-0.5"
            >
              Explore Cafés <MS name="arrow_forward" size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Global override to ensure no horizontal scroll bars on mobile from full-width sections */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
