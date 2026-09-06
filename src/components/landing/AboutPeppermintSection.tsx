'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';
import Image from 'next/image';
import MeetTheFoundersSection from './MeetTheFoundersSection';

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
      {/* SECTION 01: THE REASON (EDITORIAL HERO)                                   */}
      {/* ========================================================================= */}
      <section ref={sectionRef} className="relative min-h-[900px] lg:min-h-[1020px] pt-28 lg:pt-36 pb-28 lg:pb-36 px-6 bg-white overflow-hidden">
        
        {/* Subtle white noise texture for physical paper feel */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} 
        />

        <div className="relative z-20 max-w-[1280px] mx-auto flex flex-col lg:flex-row lg:justify-between items-start">
          
          {/* Top Typography (Left Aligned always) */}
          <motion.div 
            style={{ y: textY }}
            variants={textContainerVariants}
            initial="hidden"
            animate="show"
            className="w-full lg:max-w-[520px] xl:max-w-[580px] flex flex-col items-start text-left z-20"
          >
            {/* Headline Hierarchy (Editorial scaling) */}
            <h1 className="uppercase tracking-tight leading-[0.9] mb-4 sm:mb-5" style={{ fontFamily: 'var(--font-anton)' }}>
              <motion.span variants={textItemVariants} className="block text-[42px] sm:text-[58px] lg:text-[68px] text-[#020617] mb-1 font-normal">
                Your coffee
              </motion.span>
              <motion.span variants={textItemVariants} className="block text-[52px] sm:text-[72px] lg:text-[84px] text-[#020617] mb-1 font-normal">
                shouldn't take
              </motion.span>
              <motion.span variants={textItemVariants} className="block text-[42px] sm:text-[58px] lg:text-[68px] text-[#0055D4] font-normal">
                your whole break.
              </motion.span>
            </h1>
            
            {/* Cursive Annotation */}
            <motion.div variants={textItemVariants} className="relative inline-block mb-8 sm:mb-10 ml-1 sm:ml-2 -rotate-[3deg]">
              <span className="text-[#0055D4] text-[18px] sm:text-[22px] tracking-wide" style={cursiveStyle}>
                your break, back.
              </span>
              {/* Hand-drawn underline SVG */}
              <svg className="absolute -bottom-0.5 left-0 w-full h-[4px] text-[#0055D4]/60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <motion.path 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.9 }}
                  d="M 2 5 Q 30 8, 60 4 T 98 6" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" 
                />
              </svg>
            </motion.div>

            {/* Supporting Copy */}
            <motion.div variants={textItemVariants} className="flex flex-col gap-2 max-w-[95%] sm:max-w-[420px] border-l-[1.5px] border-[#0055D4]/20 pl-5 sm:pl-6">
              <p className="text-[16px] sm:text-[17px] text-[#020617] font-medium leading-relaxed">
                Between classes, meetings and deadlines, your break should be yours.
              </p>
              <p className="text-[14px] sm:text-[15px] text-slate-500 font-normal leading-relaxed">
                Order ahead. See live prep. Walk straight to pickup.
              </p>
            </motion.div>
          </motion.div>

          {/* Primary Visual: Unified Motion Container (Hand + Phone move together as ONE object) */}
          <div className="w-full lg:w-auto relative flex justify-center lg:block mt-12 sm:mt-16 lg:mt-0">
            <motion.div 
              style={{ y: phoneParallaxY }}
              initial={{ opacity: 0, y: 30, scale: 0.9, rotate: -1 }}
              animate={{ opacity: 1, y: 0, scale: 0.95, rotate: -3 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative lg:absolute lg:-top-4 xl:-top-10 lg:right-4 xl:right-0 w-[310px] sm:w-[340px] md:w-[360px] lg:w-[370px] h-[640px] sm:h-[670px] lg:h-[690px] z-30 perspective-[1200px]"
            >
              <div className="relative w-full h-full">

                {/* 1. LAYER BEHIND PHONE: Realistic Photographic Hand */}
                <div className="absolute -right-[45px] top-[260px] w-[460px] h-[615px] pointer-events-none z-10 overflow-visible select-none">
                  {/* Localized contact shadow on the hand for realism */}
                  <div className="absolute top-[80px] left-[150px] w-[60px] h-[200px] bg-black/10 blur-xl rounded-full" />
                  <Image 
                    src="/about/hand-holding-phone.webp" 
                    alt="Hand casually holding phone" 
                    fill
                    priority
                    sizes="(max-width: 768px) 340px, 460px"
                    className="object-contain object-top-left drop-shadow-lg opacity-100 transition-opacity duration-300"
                  />
                </div>

                {/* 2. LAYER PHONE: Physical Smartphone Construction */}
                <div className="relative w-full h-full z-20">
                  
                  {/* Layered Physical Shadows: Tight contact + soft body + subtle blue ambient */}
                  <div className="absolute inset-2 rounded-[52px] bg-[#0055D4]/5 blur-[24px] pointer-events-none" />
                  <div className="absolute inset-4 rounded-[44px] bg-[#020617]/15 blur-[16px] pointer-events-none" />
                  <div className="absolute -left-6 top-[280px] w-12 h-64 bg-black/15 blur-[12px] rounded-full pointer-events-none mix-blend-multiply" />

                  {/* Smartphone Frame (Graphite metallic chassis) */}
                  <div className="relative w-full h-full rounded-[44px] sm:rounded-[48px] bg-[#2A2B2E] p-[3px] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] border border-[#3A3B3E] overflow-hidden flex flex-col">
                    
                    {/* Metallic Chassis Edge Highlight */}
                    <div className="absolute inset-0 rounded-[42px] sm:rounded-[46px] border border-t-white/10 border-l-white/5 border-b-black/40 border-r-black/20 pointer-events-none z-50" />
                    
                    {/* Hardware Buttons (Minimal) */}
                    <div className="absolute top-28 sm:top-32 -left-[3px] w-[2px] h-8 bg-[#1A1B1E] rounded-l" />
                    <div className="absolute top-40 sm:top-44 -left-[3px] w-[2px] h-12 bg-[#1A1B1E] rounded-l" />
                    <div className="absolute top-40 sm:top-44 -right-[3px] w-[2px] h-14 bg-[#1A1B1E] rounded-r" />

                    {/* Dynamic Island Cutout (Tiny) */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[72px] h-[22px] bg-black rounded-full z-40 shadow-sm" />

                    {/* Realistic Glass Reflection Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] pointer-events-none z-30 rounded-[40px] sm:rounded-[44px]" />

                    {/* ============================================================ */}
                    {/* ACTUAL GRABBIT MOBILE APP SCREEN                             */}
                    {/* ============================================================ */}
                    <div className="flex-1 bg-[#FAFAFA] text-[#020617] w-full rounded-[40px] sm:rounded-[44px] pt-8 pb-4 px-4 flex flex-col justify-between relative overflow-hidden select-none">
                      
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
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-black tracking-tight">GRABBIT</span>
                          <div className="w-1 h-1 bg-[#0055D4] rounded-full" />
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider">DTU</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[9px] font-bold">
                          SS
                        </div>
                      </div>

                      {/* Location & Context */}
                      <div className="flex items-center gap-1.5 mb-5 pl-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0055D4]" />
                        <span className="text-[10px] font-bold text-slate-900 tracking-wide uppercase">DTU MAIN BLOCK</span>
                        <span className="text-[9.5px] text-slate-400">· 150m away</span>
                      </div>

                      {/* Featured Cafe Card (Clean, borderless) */}
                      <div className="flex items-center gap-3 mb-5 pl-1">
                        <div className="relative w-11 h-11 rounded-[10px] overflow-hidden shrink-0 bg-slate-100">
                          <Image 
                            src="/about/raydee-cafe.jpg" 
                            alt="The Raydee Cafe" 
                            fill 
                            sizes="44px"
                            className="object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h4 className="text-[11.5px] font-extrabold text-slate-900 tracking-tight">THE RAYDEE CAFE</h4>
                          <div className="flex items-center gap-1 mt-0.5 text-[9.5px] text-[#0055D4] font-bold">
                            <span className="w-1 h-1 rounded-full bg-[#0055D4] animate-pulse" />
                            5–8 min prep
                          </div>
                        </div>
                      </div>

                      {/* Your Order Card (Typography focused) */}
                      <div className="mb-5 pl-1">
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Your Order</div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-[13px] font-extrabold text-slate-900 leading-tight">Iced Americano</div>
                            <div className="text-[9.5px] text-slate-500 mt-0.5">Double Espresso · Chilled</div>
                          </div>
                          <span className="text-[14px] font-black text-[#0055D4]">₹{customizations.extraShot ? 200 : 180}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {customizations.oatMilk && (
                            <span className="text-[8.5px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">Oat Milk</span>
                          )}
                          {customizations.extraShot && (
                            <span className="text-[8.5px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">+Extra Shot</span>
                          )}
                          {customizations.noSugar ? (
                            <span className="text-[8.5px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">No Sugar</span>
                          ) : (
                            <span className="text-[8.5px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-sm">Standard Sugar</span>
                          )}
                        </div>
                      </div>

                      {/* Thin Progress Indicator (Live Prep) */}
                      <div className="mb-5 pl-1">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Status</div>
                          <span className="text-[9.5px] font-mono font-bold text-[#0055D4]">
                            {formatTimer(secondsLeft)}
                          </span>
                        </div>
                        <div className="relative w-full h-[2px] bg-slate-200 rounded-full mb-2">
                          <div className="absolute left-0 top-0 h-full w-[50%] bg-[#0055D4] rounded-full" />
                          <div className="absolute left-[50%] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#0055D4] rounded-full shadow-[0_0_4px_rgba(0,85,212,0.5)]" />
                        </div>
                        <div className="flex justify-between text-[7.5px] font-bold text-slate-400">
                          <span className="text-slate-900">Placed</span>
                          <span className="text-[#0055D4]">Preparing</span>
                          <span>Pickup</span>
                        </div>
                      </div>

                      {/* Pickup Token Card (Minimal digital ticket) */}
                      <div className="bg-[#0055D4] rounded-xl p-3 flex flex-col items-center justify-center text-white mt-auto mx-1 relative overflow-hidden shadow-sm">
                        <span className="text-[7px] font-bold text-white/70 uppercase tracking-[0.2em] block mb-0.5">PICKUP TOKEN</span>
                        <div className="text-[34px] font-black tracking-tight leading-none mb-1" style={{ fontFamily: 'var(--font-anton)' }}>
                          #GB-408
                        </div>
                        <span className="text-[7.5px] font-bold text-white/90 uppercase tracking-wider">
                          MAIN BLOCK COUNTER
                        </span>
                      </div>

                      {/* Mobile App Bottom Navigation Bar (Ultra clean) */}
                      <div className="pt-3 pb-1 mt-3 flex justify-between items-center px-4 border-t border-slate-100">
                        <div className="flex flex-col items-center gap-0.5 text-[#0055D4]">
                          <MS name="home" size={16} />
                          <span className="text-[6.5px] font-bold tracking-wider">HOME</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 text-slate-300">
                          <MS name="storefront" size={16} />
                          <span className="text-[6.5px] font-bold tracking-wider">CAFÉS</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 text-slate-300">
                          <MS name="receipt_long" size={16} />
                          <span className="text-[6.5px] font-bold tracking-wider">ORDERS</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 text-slate-300">
                          <MS name="person" size={16} />
                          <span className="text-[6.5px] font-bold tracking-wider">PROFILE</span>
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

      <MeetTheFoundersSection />



      {/* Global override to ensure no horizontal scroll bars on mobile from full-width sections */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
