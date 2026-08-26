'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MS } from '@/components/gb/kit';
import { useState, useEffect } from 'react';
import { HeroPhone, AppState } from './HeroPhone';
import { HeroProductStage } from './HeroProductStage';
import { FloatingStatusCard } from './FloatingStatusCard';
import { Annotation } from './Annotation';
import { Sticker } from './Sticker';

// Subtle, organic curved SVG connector lines linking floating cards directly to the central phone
const ConnectorLines = ({
  activeEnergyCard
}: {
  activeEnergyCard: string | null
}) => {
  // SVG Paths
  const paths = {
    cafes: "M 120 80 C 220 80, 220 180, 380 180", // Top Left
    time: "M 135 335 C 235 335, 235 320, 380 320", // Bottom Left
    ready: "M 880 80 C 780 80, 780 180, 620 180", // Top Right
    rated: "M 865 335 C 765 335, 765 320, 620 320"  // Bottom Right
  };

  // Helper to get the correct path. Energy flows Phone -> Card.
  const getPath = (id: string) => {
    // Top Left (cafes): Card node is at x=198, y=36
    if (id === 'cafes') return "M 360 140 C 280 140, 240 36, 198 36";
    // Bottom Left (time): Card node is at x=213, y=295
    if (id === 'time') return "M 360 260 C 280 260, 245 295, 213 295";

    // Top Right (ready): Card node is at x=802, y=36
    if (id === 'ready') return "M 640 140 C 720 140, 760 36, 802 36";
    // Bottom Right (rated): Card node is at x=787, y=295
    if (id === 'rated') return "M 640 260 C 720 260, 755 295, 787 295";

    return "";
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block"
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="activePulse" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0055D4" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#0055D4" stopOpacity="1" />
          <stop offset="100%" stopColor="#0055D4" stopOpacity="0.8" />
        </linearGradient>
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {['cafes', 'time', 'ready', 'rated'].map((cardId) => {
        const isActive = activeEnergyCard === cardId;
        const d = getPath(cardId);

        return (
          <g key={cardId}>
            {/* Base idle dotted line (Highly visible & warm) */}
            <path
              d={d}
              fill="none"
              stroke="rgba(0, 85, 212,0.65)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="4 8"
            />

            {/* Active drawing line (Vivid, ultra-bright glowing dots) */}
            {isActive && (
              <motion.path
                d={d}
                fill="none"
                stroke="#0055D4"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="4 8"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255, 177, 0, 0.9))' }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            )}

            {/* Moving glowing particle (GPU Accelerated, Ultra-Smooth 60fps) */}
            {isActive && (
              <motion.path
                d={d}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(255,177,0,1)) drop-shadow(0 0 4px rgba(255,255,255,0.9))',
                  willChange: 'transform, opacity'
                }}
                initial={{ pathLength: 0.01, pathSpacing: 1, pathOffset: 0, opacity: 0 }}
                animate={{
                  pathOffset: [0, 1],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  pathOffset: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.55, times: [0, 0.1, 0.9, 1] }
                }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default function AppShowcase() {
  const [phoneState, setPhoneState] = useState<AppState>('HOME');

  // Animation Orchestration State
  const [activeEnergyCard, setActiveEnergyCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // To trigger the micro-reactions on the card, we track when energy ARRIVES.
  // We use a separate state to briefly set isReceivingEnergy to true.
  const [receivingCard, setReceivingCard] = useState<string | null>(null);

  // The automatic storytelling loop (Fast & Energetic)
  useEffect(() => {
    // If a card is being hovered, PAUSE the loop entirely.
    if (hoveredCard) {
      return;
    }

    const cycle = ['cafes', 'ready', 'time', 'rated'];
    let currentIndex = 0;

    const runCycle = () => {
      const cardId = cycle[currentIndex];

      // 1. Start the energy flow (triggers fast SVG animation phone -> card)
      setActiveEnergyCard(cardId);

      // 2. Exactly when particle hits (550ms), trigger the card reaction
      const hitTimer = setTimeout(() => {
        setReceivingCard(cardId);
      }, 550);

      // 3. Clear the card reaction
      const clearReactionTimer = setTimeout(() => {
        setReceivingCard(null);
      }, 950);

      currentIndex = (currentIndex + 1) % cycle.length;

      return () => {
        clearTimeout(hitTimer);
        clearTimeout(clearReactionTimer);
      };
    };

    // Initial run immediately
    let cleanups = runCycle();

    // Fast 1.4 second cycle interval
    const interval = setInterval(() => {
      if (cleanups) cleanups();
      cleanups = runCycle();
    }, 1400);

    return () => {
      clearInterval(interval);
      if (cleanups) cleanups();
    };
  }, [hoveredCard]);

  // Handle manual interaction (hover override)
  useEffect(() => {
    if (hoveredCard) {
      setActiveEnergyCard(hoveredCard);

      const hitTimer = setTimeout(() => {
        setReceivingCard(hoveredCard);
      }, 400);

      return () => clearTimeout(hitTimer);
    } else {
      setReceivingCard(null);
    }
  }, [hoveredCard]);

  const handleCardClick = (cardId: string, targetState: AppState) => {
    setHoveredCard(cardId); // lock it as active momentarily
    setPhoneState(targetState);
  };

  return (
    <section className="relative w-full min-h-[95vh] bg-[#F8FAFC] font-sans pt-[80px] sm:pt-[92px] pb-12 flex flex-col items-center justify-start overflow-hidden">

      {/* ========================================= */}
      {/* 1. CINEMATIC BACKGROUND SYSTEM */}
      {/* ========================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[#0F172A]">
        {/* Soft radial wash - editorial deep blue vibe */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(0, 85, 212, 0.15) 0%, rgba(15, 23, 42, 1) 70%)'
          }}
        />

        {/* Diagonal noise/texture strip to break up background */}
        <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-black/20 to-transparent pointer-events-none mix-blend-overlay" />
      </div>

      {/* ========================================= */}
      {/* 2. ZONE 1: EDITORIAL COPY */}
      {/* ========================================= */}
      <div className="max-w-[1200px] mx-auto px-4 relative z-10 w-full flex flex-col items-center text-center pt-10 sm:pt-16 shrink-0 pointer-events-auto">

        {/* BADGE / Cursive Annotation */}
        <div className="relative mb-3 sm:mb-5">
          <Annotation text="the magic inside" delay={0.1} color="#60A5FA" />
        </div>

        {/* HEADLINE */}
        <h2 
          className="text-[32px] sm:text-[54px] lg:text-[78px] font-black tracking-normal leading-[1.08] sm:leading-[1.0] text-white uppercase max-w-4xl" 
          style={{ fontFamily: 'var(--font-anton)' }}
        >
          INTELLIGENCE BECOMES <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[#3B82F6] via-[#60A5FA] to-[#93C5FD] bg-clip-text text-transparent block sm:inline mt-1 sm:mt-0">
            A SIMPLE EXPERIENCE.
          </span>
        </h2>

        {/* TAGLINE */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-sm sm:text-base md:text-lg font-normal text-slate-300 max-w-[540px] leading-relaxed mt-4 sm:mt-6 mb-6 sm:mb-8 px-4"
        >
          Our live POS-sync engine and zero-wait algorithms do the heavy lifting, so you only have to tap once.
        </motion.p>

      </div>

      {/* ========================================= */}
      {/* 3. ZONE 2: PRODUCT STAGE WITH 3D PARALLAX */}
      {/* ========================================= */}
      <div className="w-full relative flex-1 flex items-start justify-center min-h-[580px] lg:min-h-[620px] pb-10 overflow-visible mt-12 pointer-events-none">
        
        {/* Stickers adding editorial context */}

        <Sticker text="REAL RESULTS" rotation={-10} color="cream" className="hidden lg:flex bottom-20 right-[15%]" delay={1.4} />

        {/* We enable pointer events on the stage wrapper so the phone/cards are clickable */}
        <HeroProductStage>

          {/* Connector SVG Background (Layer 1 - Behihnd phone!) */}
          <div
            className="absolute inset-0 mx-auto flex justify-center w-full max-w-[1000px] h-[600px] pointer-events-none z-[5]"
            style={{ transform: 'translateZ(-40px)' }}
          >
            <ConnectorLines activeEnergyCard={activeEnergyCard} />
          </div>

          {/* CENTER PHONE (Layer 3 - Sharpest, Top) */}
          <div className="relative z-[20] flex justify-center items-start pt-2 pointer-events-auto">
            <HeroPhone
              activeState={phoneState}
              activeEnergyCard={activeEnergyCard}
              onStateChange={(st) => {
                setPhoneState(st);
              }}
            />

            {/* --- FLOATING PRODUCT INSIGHT CARDS (Layer 2) --- */}

            {/* Top Left: Cafés Near You Node */}
            <FloatingStatusCard
              type="cafes"
              label="Cafés Near You"
              value="4 nearby"
              active={hoveredCard === 'cafes'}
              isReceivingEnergy={receivingCard === 'cafes'}
              onClick={() => handleCardClick('cafes', 'HOME')}
              onHoverStart={() => setHoveredCard('cafes')}
              onHoverEnd={() => setHoveredCard(null)}
              icon={<MS name="location_on" size={24} />}
              delay={0.15}
              entranceDirection="right" // Appears from right (behind phone) sliding left
              className="hidden lg:flex z-[10]"
              style={{ position: 'absolute', top: '-40px', left: '-380px' }}
            />

            {/* Top Right: Order Ready Node */}
            <FloatingStatusCard
              type="ready"
              label="Order Ready"
              badge="POS Sync"
              value="☕ Pick up now"
              detail="Barista KDS Alerted"
              active={hoveredCard === 'ready'}
              isReceivingEnergy={receivingCard === 'ready'}
              onClick={() => handleCardClick('ready', 'READY')}
              onHoverStart={() => setHoveredCard('ready')}
              onHoverEnd={() => setHoveredCard(null)}
              icon={<MS name="coffee" size={24} />}
              delay={0.25}
              entranceDirection="left" // Appears from left sliding right
              className="hidden lg:flex z-[10]"
              style={{ position: 'absolute', top: '-30px', right: '-380px' }}
            />

            {/* Bottom Left: Time Saved Node */}
            <FloatingStatusCard
              type="time"
              label="Time Saved"
              badge="Zero-Wait"
              value="14 min"
              detail="On average"
              active={hoveredCard === 'time'}
              isReceivingEnergy={receivingCard === 'time'}
              onClick={() => handleCardClick('time', 'CART')}
              onHoverStart={() => setHoveredCard('time')}
              onHoverEnd={() => setHoveredCard(null)}
              icon={<MS name="schedule" size={24} />}
              delay={0.35}
              entranceDirection="right"
              className="hidden lg:flex z-[10]"
              style={{ position: 'absolute', top: '220px', left: '-365px' }}
            />

            {/* Bottom Right: Rated By You Node */}
            <FloatingStatusCard
              type="rating"
              label="Rated By You"
              badge="Top Rated"
              value="4.9 / 5.0"
              detail="Loved by coffee people"
              active={hoveredCard === 'rated'}
              isReceivingEnergy={receivingCard === 'rated'}
              onClick={() => handleCardClick('rated', 'CAFE')}
              onHoverStart={() => setHoveredCard('rated')}
              onHoverEnd={() => setHoveredCard(null)}
              icon={<MS name="star" size={24} />}
              delay={0.45}
              entranceDirection="left"
              className="hidden lg:flex z-[10]"
              style={{ position: 'absolute', top: '220px', right: '-365px' }}
            />
          </div>

        </HeroProductStage>

      </div>

    </section>
  );
}
