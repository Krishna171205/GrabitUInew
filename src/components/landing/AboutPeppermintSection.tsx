'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { MS } from '@/components/gb/kit';
import MeetTheFoundersSection from './MeetTheFoundersSection';

const STEPS = [
  {
    id: 'order',
    title: 'ORDER AHEAD',
    desc: 'Skip the counter queue. Browse live menus from your campus cafes, customize your drink with oat milk or extra shots, and pay securely online before you even leave class.',
  },
  {
    id: 'prep',
    title: 'LIVE PREP COUNTDOWN',
    desc: "No guessing, no waiting awkwardly around the counter. Watch your barista's live kitchen timeline tick down in real-time as your drink is being crafted.",
  },
  {
    id: 'pickup',
    title: 'WALK IN & PICK UP',
    desc: 'Flash your digital token at the pickup window, grab your steaming cup or cold brew from the counter, and get right back to your break with zero friction.',
  },
];

const AUTOPLAY_INTERVAL = 4000; // 4.0s per tab, matching PartnerPitch

export default function AboutPeppermintSection() {
  const [activeTab, setActiveTab] = useState(0);

  // Live ticking prep timer for realistic mobile UI
  const [secondsLeft, setSecondsLeft] = useState(168);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 10 ? prev - 1 : 168));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Autoplay functionality matching PartnerPitch
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % STEPS.length);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  // 3D Mouse Parallax Tilt for the phone stage
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 45, stiffness: 85 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateY = useTransform(smoothX, [-1, 1], [-7, 7]);
  const rotateX = useTransform(smoothY, [-1, 1], [7, -7]);
  const stageX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const stageY = useTransform(smoothY, [-1, 1], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) * 2 - 1);
    mouseY.set((clientY / innerHeight) * 2 - 1);
  };

  return (
    <div className="w-full bg-[#FAFAF7] text-[#111317] font-sans selection:bg-[#0757D5] selection:text-white">

      {/* ========================================================================= */}
      {/* SECTION 01: EDITORIAL STORYTELLING & INTERACTIVE PHONE STAGE             */}
      {/* Exactly structured like FAQSection and PartnerPitch                      */}
      {/* ========================================================================= */}
      <section
        id="about-story"
        className="pt-8 pb-20 md:pt-14 md:pb-28 bg-[#FAFAF7] relative overflow-hidden text-[#111317] border-b border-slate-200/60"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          mouseX.set(0);
          mouseY.set(0);
        }}
      >
        {/* Subtle background paper texture */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none z-0"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          }}
        />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:pl-12 lg:pr-12 relative z-10 flex flex-col lg:flex-row items-center min-h-[720px] lg:min-h-[850px]">

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              LEFT COLUMN: EDITORIAL FEATURE SELECTOR
              Identical hierarchy, typography & alignment as FAQ / Partner
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="w-full lg:w-[42%] flex flex-col z-20 py-8 lg:py-0 pr-0 lg:pr-12">

            {/* Main Section Headline */}
            <h2
              className="text-[14vw] min-[380px]:text-[64px] sm:text-[76px] lg:text-[88px] xl:text-[96px] leading-[1.05] tracking-[0.02em] font-normal uppercase text-[#111317] mb-6 lg:mb-8"
              style={{ fontFamily: 'var(--font-anton)' }}
            >
              BUILT FOR <br />
              <span className="text-[#0757D5]">THE BREAK.</span>
            </h2>

            {/* Editorial Subtitle with left blue border accent (matching FAQ) */}
            <p className="text-[16px] lg:text-[17px] text-[#4A4E58] font-medium leading-[1.6] max-w-[420px] border-l-2 border-[#0757D5]/30 pl-4 mb-8 lg:mb-10">
              Between classes, sprints, and meetings, your 15-minute break shouldn&apos;t be lost to a 14-minute queue. Pre-order ahead, track live kitchen prep, and grab your tray on your terms.
            </p>

            {/* Step Selection Tabs (01, 02, 03 - exactly matching PartnerPitch) */}
            <div className="flex flex-col gap-5 lg:gap-7">
              {STEPS.map((step, index) => {
                const isActive = activeTab === index;
                return (
                  <button
                    key={step.id}
                    onClick={() => handleTabClick(index)}
                    className="group flex flex-col text-left focus:outline-none relative py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-5 mb-2">
                      {/* The number (01, 02, 03) */}
                      <span
                        className={`text-[18px] font-normal transition-colors duration-300 ${
                          isActive ? 'text-[#111317]' : 'text-gray-300 group-hover:text-gray-400'
                        }`}
                        style={{ fontFamily: 'var(--font-anton)' }}
                      >
                        0{index + 1}
                      </span>

                      {/* Animated Progress Indicator Bar */}
                      <div
                        className={`relative w-12 h-[2px] overflow-hidden shrink-0 transition-colors duration-300 ${
                          isActive ? 'bg-blue-100' : 'bg-transparent'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            className="absolute top-0 left-0 h-full bg-[#0757D5]"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{
                              duration: AUTOPLAY_INTERVAL / 1000,
                              ease: 'linear',
                            }}
                          />
                        )}
                      </div>

                      {/* Step Title */}
                      <h3
                        className={`text-[20px] sm:text-[22px] lg:text-[24px] font-normal uppercase tracking-wide transition-all duration-300 ${
                          isActive ? 'text-[#111317] translate-x-1' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                        style={{ fontFamily: 'var(--font-anton)' }}
                      >
                        {step.title}
                      </h3>
                    </div>

                    {/* Expandable Accordion Description */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: isActive ? 'auto' : 0,
                        opacity: isActive ? 1 : 0,
                        marginTop: isActive ? 8 : 0,
                      }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden pl-[84px]"
                    >
                      <p className="text-[16px] lg:text-[17px] text-[#4A4E58] font-medium leading-[1.6] max-w-[420px]">
                        {step.desc}
                      </p>
                    </motion.div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              RIGHT COLUMN: CREATIVE AESTHETIC PHONE MOCKUP STAGE
              Photorealistic hand, 3D parallax, ambient lighting, floating chips
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="w-full lg:w-[58%] flex items-center justify-center relative mt-12 lg:mt-0">

            {/* 1. Atmospheric Lighting & Depth Backdrops */}
            <div className="absolute w-[460px] sm:w-[560px] h-[460px] sm:h-[560px] bg-radial from-[#0757D5]/12 via-[#0757D5]/3 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Concentric Technical Accent Orbit Rings */}
            <div className="absolute w-[440px] h-[440px] sm:w-[500px] sm:h-[500px] rounded-full border border-[#0757D5]/10 pointer-events-none -z-10" />
            <div className="absolute w-[540px] h-[540px] sm:w-[600px] sm:h-[600px] rounded-full border border-[#0757D5]/5 border-dashed pointer-events-none -z-10 animate-[spin_120s_linear_infinite]" />

            {/* Floating Glassmorphic Context Chips (Positioned intentionally to bridge layout) */}
            {/* Top-Left Floating Badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 sm:-top-4 left-0 sm:left-4 z-40 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.9)] border border-slate-200/60 flex items-center gap-3 pointer-events-none select-none -rotate-2"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <MS name="bolt" size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-tight">0 MIN QUEUE</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">DTU Express Pre-Order</p>
              </div>
            </motion.div>

            {/* Top-Right Mini Badge */}
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              className="absolute top-10 -right-2 sm:right-4 z-40 bg-white/90 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-[0_12px_24px_-6px_rgba(7,87,213,0.12),0_0_0_1px_rgba(255,255,255,0.9)] border border-blue-100 flex items-center gap-2 pointer-events-none select-none rotate-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#0757D5]" />
              <span className="text-[10px] font-bold text-slate-800 tracking-tight">100% UPI Prepaid</span>
            </motion.div>

            {/* Bottom-Right Floating Badge */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="absolute -bottom-4 sm:bottom-4 right-0 sm:right-8 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-[0_20px_40px_-10px_rgba(7,87,213,0.18),0_0_0_1px_rgba(255,255,255,0.9)] border border-blue-100 flex items-center gap-3 pointer-events-none select-none rotate-1"
            >
              <div className="w-8 h-8 rounded-xl bg-[#0757D5]/10 border border-[#0757D5]/20 flex items-center justify-center text-[#0757D5]">
                <MS name="local_cafe" size={18} />
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-[#0757D5] uppercase tracking-tight">TOKEN #GB-408</div>
                <p className="text-[10px] text-slate-600 font-bold">Counter 02 · Pick Up Tray</p>
              </div>
            </motion.div>

            {/* 2. Main 3D Parallax Tilt Container */}
            <motion.div
              style={{
                x: stageX,
                y: stageY,
                rotateY,
                rotateX,
                transformPerspective: 1000,
              }}
              className="relative w-full max-w-[420px] sm:max-w-[460px] aspect-[896/1200] flex items-center justify-center"
            >

              {/* LAYER 1: Realistic Hand In Background */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <Image
                  src="/about/hand-holding-phone.webp"
                  alt="Hand holding phone"
                  fill
                  className="object-contain object-center drop-shadow-2xl"
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>

              {/* LAYER 2: Phone Device & Interactive Screen */}
              <div className="relative z-10 w-[216px] sm:w-[236px] h-[465px] sm:h-[508px] rounded-[34px] bg-[#0F172A] p-1.5 sm:p-2 shadow-[0_28px_65px_-15px_rgba(0,0,0,0.35),0_12px_28px_-6px_rgba(7,87,213,0.16)] rotate-[-3.5deg] translate-x-[-22px] translate-y-[-14px] flex flex-col border border-slate-700/70 ring-1 ring-white/20">

                {/* iPhone Dynamic Island */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[66px] h-[18px] bg-[#020617] rounded-full z-40 shadow-inner flex items-center justify-between px-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-black shadow-inner" />
                  {activeTab === 1 && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0757D5] animate-pulse" />
                    </div>
                  )}
                  <div className="w-2 h-2 rounded-full bg-[#1E293B] border border-black/40" />
                </div>

                {/* Glass Glare Reflection Sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] pointer-events-none z-30 rounded-[30px]" />

                {/* --- PHONE INNER APP SCREEN --- */}
                <div className="flex-1 bg-[#FAFAF7] text-[#020617] w-full rounded-[26px] pt-6 sm:pt-7 pb-2.5 sm:pb-3 px-3 flex flex-col justify-between relative overflow-hidden select-none">

                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-2 pt-0.5 mb-1.5 z-10">
                    <span className="text-[9px] font-bold text-slate-800 tracking-tight">9:41</span>
                    <div className="flex items-center gap-1 text-slate-800">
                      <MS name="signal_cellular_4_bar" size={10} />
                      <MS name="wifi" size={10} />
                      <MS name="battery_full" size={11} />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="flex items-center justify-between px-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-black tracking-tight text-slate-900">GRABBIT</span>
                      <div className="w-1 h-1 bg-[#0757D5] rounded-full" />
                      <span className="text-[8px] font-extrabold text-slate-400 tracking-wider">CAMPUS</span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-[#0757D5]/10 border border-[#0757D5]/20 flex items-center justify-center text-[#0757D5] text-[8px] font-bold shadow-xs">
                      SS
                    </div>
                  </div>

                  {/* Location Chip */}
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0757D5] shadow-[0_0_6px_rgba(7,87,213,0.6)]" />
                    <span className="text-[8.5px] font-extrabold text-slate-900 tracking-wide uppercase">DTU MAIN BLOCK</span>
                    <span className="text-[7.5px] text-slate-400 font-medium">· 150m</span>
                  </div>

                  {/* Dynamic App Body (Smooth transitions based on activeTab) */}
                  <div className="flex-1 flex flex-col gap-2.5 px-0.5 overflow-hidden">
                    <AnimatePresence mode="wait">

                      {/* STATE 01: ORDER AHEAD VIEW */}
                      {activeTab === 0 && (
                        <motion.div
                          key="state-0"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col gap-2 flex-1"
                        >
                          {/* Cafe Showcase Card */}
                          <div className="bg-white rounded-[14px] p-2 flex items-center gap-2 border border-[#0757D5]/30 shadow-[0_4px_12px_rgba(7,87,213,0.06)]">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200/50">
                              <Image
                                src="/about/raydee-cafe.jpg"
                                alt="The Raydee Cafe"
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-[9.5px] font-extrabold text-slate-900 tracking-tight truncate">THE RAYDEE CAFE</h4>
                                <span className="text-[6.5px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">OPEN</span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5 text-[7.5px] text-[#0757D5] font-bold">
                                <span className="w-1 h-1 rounded-full bg-[#0757D5] animate-pulse" />
                                5–7 min prep
                              </div>
                            </div>
                          </div>

                          {/* Order Details Card */}
                          <div className="bg-white rounded-[14px] p-2.5 border border-slate-100 shadow-xs">
                            <div className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Order</div>
                            <div className="flex justify-between items-start mb-1.5">
                              <div>
                                <div className="text-[11px] font-extrabold text-slate-900 leading-tight">Iced Americano</div>
                                <div className="text-[8px] text-slate-500 mt-0.5">Double Shot · Cold Brew</div>
                              </div>
                              <span className="text-[11.5px] font-black text-[#0757D5]">₹200</span>
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[7px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">Oat Milk</span>
                              <span className="text-[7px] font-bold text-[#0757D5] bg-[#0757D5]/10 px-1.5 py-0.5 rounded">+Shot</span>
                              <span className="text-[7px] font-bold text-slate-500 bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded">Less Ice</span>
                            </div>
                          </div>

                          {/* Quick Confirmation Banner */}
                          <div className="mt-auto bg-blue-50 border border-blue-200/60 rounded-[12px] p-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <MS name="check_circle" size={13} className="text-[#0757D5]" />
                              <span className="text-[8px] font-extrabold text-[#0757D5] uppercase tracking-tight">Order Placed</span>
                            </div>
                            <span className="text-[7.5px] font-bold text-slate-600">UPI Prepaid</span>
                          </div>
                        </motion.div>
                      )}

                      {/* STATE 02: LIVE PREP COUNTDOWN VIEW */}
                      {activeTab === 1 && (
                        <motion.div
                          key="state-1"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col gap-2 flex-1"
                        >
                          {/* Live Prep Status Hero */}
                          <div className="bg-white rounded-[14px] p-2.5 border border-[#0757D5]/40 shadow-[0_4px_16px_rgba(7,87,213,0.08)] flex flex-col items-center text-center">
                            <div className="flex items-center gap-1 text-[7.5px] font-bold text-[#0757D5] uppercase tracking-wider mb-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0757D5] animate-ping" />
                              Kitchen Live Sync
                            </div>

                            {/* Huge Countdown Display */}
                            <div
                              className="text-[34px] font-normal tracking-tight leading-none text-[#111317] my-1 font-mono"
                              style={{ fontFamily: 'var(--font-anton)' }}
                            >
                              {formatTimer(secondsLeft)}
                            </div>

                            <p className="text-[7.5px] text-slate-500 font-medium">
                              Barista is brewing your espresso
                            </p>

                            {/* Progress bar */}
                            <div className="w-full h-[3px] bg-slate-100 rounded-full mt-2 overflow-hidden">
                              <motion.div
                                animate={{ width: '68%' }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-[#0757D5] rounded-full"
                              />
                            </div>
                          </div>

                          {/* Live Kitchen Steps Tracker */}
                          <div className="bg-white rounded-[14px] p-2 border border-slate-100 shadow-xs flex flex-col gap-1 mt-auto">
                            <div className="flex justify-between items-center text-[7.5px] font-bold">
                              <span className="text-emerald-600 flex items-center gap-1">
                                <MS name="check" size={9} /> Confirmed
                              </span>
                              <span className="text-[#0757D5] font-extrabold flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-[#0757D5] animate-pulse" /> Prepping
                              </span>
                              <span className="text-slate-300">Ready</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* STATE 03: DIGITAL TOKEN & PICKUP VIEW */}
                      {activeTab === 2 && (
                        <motion.div
                          key="state-2"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col gap-2 flex-1"
                        >
                          {/* Ready Banner */}
                          <div className="bg-emerald-50 border border-emerald-200/80 rounded-[12px] p-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              <span className="text-[8.5px] font-black text-emerald-700 uppercase tracking-tight">READY FOR PICKUP</span>
                            </div>
                            <span className="text-[7.5px] font-extrabold text-emerald-600">TRAY #02</span>
                          </div>

                          {/* Bold Pickup Token Pass */}
                          <div className="rounded-[16px] bg-gradient-to-b from-[#0757D5] to-[#0047B8] p-3 text-white flex flex-col items-center justify-center shadow-lg relative overflow-hidden my-auto">
                            <div className="text-[7px] font-bold text-white/75 uppercase tracking-[0.25em] mb-0.5">
                              FLASH AT WINDOW
                            </div>
                            <div
                              className="text-[32px] font-normal tracking-tight leading-none text-white my-1"
                              style={{ fontFamily: 'var(--font-anton)' }}
                            >
                              #GB-408
                            </div>
                            <span className="text-[7.5px] font-black text-white uppercase tracking-wider bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20 mt-0.5">
                              COUNTER 02 · RAYDEE
                            </span>
                          </div>

                          {/* Micro Directions Tip */}
                          <div className="bg-white rounded-[12px] p-2 border border-slate-100 flex items-center gap-2">
                            <MS name="qr_code" size={15} className="text-slate-600 shrink-0" />
                            <p className="text-[7.5px] text-slate-600 font-medium leading-tight">
                              Show token on pickup window. Zero queue wait.
                            </p>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* App Bottom Navigation Bar */}
                  <div className="pt-2 pb-0.5 mt-1.5 flex justify-between items-center px-3 border-t border-slate-100">
                    <div className="flex flex-col items-center gap-0.5 text-slate-300">
                      <MS name="home" size={13} />
                      <span className="text-[5.5px] font-bold tracking-wider">HOME</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-slate-300">
                      <MS name="storefront" size={13} />
                      <span className="text-[5.5px] font-bold tracking-wider">CAFÉS</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-[#0757D5]">
                      <div className="relative">
                        <MS name="receipt_long" size={13} />
                        <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-red-500" />
                      </div>
                      <span className="text-[5.5px] font-bold tracking-wider">ORDERS</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-slate-300">
                      <MS name="person" size={13} />
                      <span className="text-[5.5px] font-bold tracking-wider">PROFILE</span>
                    </div>
                  </div>

                  {/* iOS Home Indicator */}
                  <div className="w-16 h-[3px] bg-slate-900/30 rounded-full mx-auto mt-1" />

                </div>
              </div>

              {/* LAYER 3: Photorealistic Thumb Overlay (Registers smoothly over right bezel) */}
              <div className="absolute inset-0 z-30 pointer-events-none">
                <Image
                  src="/about/thumb-overlay.webp"
                  alt="Thumb holding phone"
                  fill
                  className="object-contain object-center"
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>

            </motion.div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 02: MEET THE FOUNDERS SECTION (SEAMLESS CONTINUATION)            */}
      {/* ========================================================================= */}
      <div className="relative z-20 border-t border-slate-200/60 bg-white">
        <MeetTheFoundersSection />
      </div>

    </div>
  );
}
