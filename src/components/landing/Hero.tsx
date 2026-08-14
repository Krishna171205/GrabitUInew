'use client';

import { motion } from 'framer-motion';
import { MS } from '@/components/gb/kit';
import { useState } from 'react';
import { HeroPhone, AppState } from './HeroPhone';
import { HeroProductStage } from './HeroProductStage';
import { FloatingStatusCard } from './FloatingStatusCard';

// Stripe-grade SVG connector lines linking floating node cards directly to central product stage
const ConnectorLines = ({ activeCard }: { activeCard: string | null }) => (
  <svg 
    className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block"
    viewBox="0 0 1000 580"
    preserveAspectRatio="xMidYMid meet"
  >
    {/* Top Left Node (Cafés Near You) -> Phone Socket */}
    <path 
      d="M 235 110 C 315 110, 345 170, 385 170" 
      fill="none" 
      stroke={activeCard === 'cafes' ? '#F09819' : 'rgba(240,152,25,0.35)'} 
      strokeWidth={activeCard === 'cafes' ? '2.5' : '1.5'} 
      strokeDasharray={activeCard === 'cafes' ? 'none' : '4 4'}
      className="transition-all duration-300"
    />
    <circle cx="385" cy="170" r="3.5" fill={activeCard === 'cafes' ? '#F09819' : 'rgba(240,152,25,0.5)'} />

    {/* Bottom Left Node (Time Saved) -> Phone Socket (Moved Upward to 52%) */}
    <path 
      d="M 235 340 C 315 340, 345 310, 385 310" 
      fill="none" 
      stroke={activeCard === 'time' ? '#F09819' : 'rgba(240,152,25,0.35)'} 
      strokeWidth={activeCard === 'time' ? '2.5' : '1.5'} 
      strokeDasharray={activeCard === 'time' ? 'none' : '4 4'}
      className="transition-all duration-300"
    />
    <circle cx="385" cy="310" r="3.5" fill={activeCard === 'time' ? '#F09819' : 'rgba(240,152,25,0.5)'} />

    {/* Top Right Node (Order Ready) -> Phone Socket */}
    <path 
      d="M 765 120 C 685 120, 655 180, 615 180" 
      fill="none" 
      stroke={activeCard === 'ready' ? '#F09819' : 'rgba(240,152,25,0.35)'} 
      strokeWidth={activeCard === 'ready' ? '2.5' : '1.5'} 
      strokeDasharray={activeCard === 'ready' ? 'none' : '4 4'}
      className="transition-all duration-300"
    />
    <circle cx="615" cy="180" r="3.5" fill={activeCard === 'ready' ? '#F09819' : 'rgba(240,152,25,0.5)'} />

    {/* Bottom Right Node (Rated By You) -> Phone Socket (Moved Upward to 54%) */}
    <path 
      d="M 765 350 C 685 350, 655 320, 615 320" 
      fill="none" 
      stroke={activeCard === 'rated' ? '#F09819' : 'rgba(240,152,25,0.35)'} 
      strokeWidth={activeCard === 'rated' ? '2.5' : '1.5'} 
      strokeDasharray={activeCard === 'rated' ? 'none' : '4 4'}
      className="transition-all duration-300"
    />
    <circle cx="615" cy="320" r="3.5" fill={activeCard === 'rated' ? '#F09819' : 'rgba(240,152,25,0.5)'} />

    {/* Sparkle Nodes */}
    <path d="M 285 95 L 286.5 91 L 288 95 L 292 96.5 L 288 98 L 286.5 102 L 285 98 L 281 96.5 Z" fill="#F09819" opacity="0.7" />
    <path d="M 715 360 L 716.5 356 L 718 360 L 722 361.5 L 718 363 L 716.5 367 L 715 363 L 711 361.5 Z" fill="#F09819" opacity="0.7" />
  </svg>
);

export default function Hero() {
  const [phoneState, setPhoneState] = useState<AppState>('HOME');
  const [activeCard, setActiveCard] = useState<string | null>('cafes');

  const handleCardClick = (cardId: string, targetState: AppState) => {
    setActiveCard(cardId);
    setPhoneState(targetState);
  };

  return (
    <section className="relative w-full min-h-screen bg-[#FDFBF7] font-sans pt-[80px] sm:pt-[92px] pb-12 flex flex-col items-center justify-start overflow-visible">
      
      {/* ========================================= */}
      {/* 1. CINEMATIC CAFÉ BACKGROUND SYSTEM */}
      {/* ========================================= */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover saturate-[0.85] opacity-80"
          src="/hero-cafe.mp4"
        />
        
        {/* Soft cream radial wash */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(253, 251, 247, 0.65) 0%, rgba(253, 251, 247, 0.86) 70%, rgba(253, 251, 247, 0.94) 100%)'
          }}
        />

        {/* Warm center glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-[#F09819]/10 rounded-full blur-[100px]" />
      </div>

      {/* ========================================= */}
      {/* 2. ZONE 1: HERO COPY (COMPACT & TIGHT) */}
      {/* ========================================= */}
      <div className="max-w-[1000px] mx-auto px-4 relative z-10 w-full flex flex-col items-center text-center pt-2 sm:pt-4 shrink-0">
        
        {/* BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-[#FDFBF7]/90 backdrop-blur-md border border-[#EBE4D8] shadow-xs rounded-full px-3 py-1 mb-2.5 cursor-default"
        >
          <div className="w-2 h-2 rounded-full bg-[#F09819] animate-pulse" />
          <span className="text-[10px] font-bold text-[#1A1311] tracking-[0.16em] uppercase">Now In Delhi</span>
        </motion.div>

        {/* HEADLINE */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-[36px] sm:text-[54px] lg:text-[68px] xl:text-[74px] font-black tracking-tighter text-[#1A1311] leading-[0.92] mb-1.5 max-w-[920px]"
        >
          ORDER AHEAD WITH <br />
          <span className="text-[#F09819]">GRABBIT.</span>
        </motion.h1>

        {/* TAGLINE */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-[22px] sm:text-[28px] lg:text-[32px] font-serif italic text-[#1A1311] leading-none mb-2"
        >
          Skip the queue.
        </motion.h2>

        {/* DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-[13px] sm:text-[15px] font-medium text-[#8A7A6B] max-w-[400px] leading-relaxed mb-3.5"
        >
          Pre-order coffee & snacks from cafés near you.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex items-center justify-center gap-3 mb-3 z-20"
        >
          <div 
            onClick={() => handleCardClick('cafes', 'EXPLORE')}
            className="group flex items-center justify-center gap-2 bg-[#1A1311] text-white px-5.5 py-2 rounded-full font-bold text-[13.5px] cursor-pointer hover:bg-[#F09819] transition-colors shadow-xs active:scale-95"
          >
            Browse cafés <MS name="arrow_forward" size={15} className="transition-transform group-hover:translate-x-1" />
          </div>
          <div className="flex items-center justify-center gap-2 bg-[#FDFBF7] border border-[#EBE4D8] text-[#1A1311] px-5.5 py-2 rounded-full font-bold text-[13.5px] cursor-pointer hover:bg-gray-50 transition-colors shadow-xs active:scale-95">
            Partner with us
          </div>
        </motion.div>

      </div>

      {/* ========================================= */}
      {/* 3. ZONE 2: PRODUCT STAGE WITH 3D MOBILE EMERGENCE */}
      {/* ========================================= */}
      <div className="w-full relative flex-1 flex items-start justify-center min-h-[580px] lg:min-h-[620px] pb-10 overflow-visible">
        
        <HeroProductStage>
          
          <div className="relative w-full max-w-[1000px] h-[580px] lg:h-[600px] flex justify-center items-start pt-2">
            
            <ConnectorLines activeCard={activeCard} />

            {/* CENTER PHONE WITH SHARED STATE & REALISTIC HARDWARE */}
            <div className="relative z-10">
              <HeroPhone 
                activeState={phoneState} 
                onStateChange={(st) => {
                  setPhoneState(st);
                  if (st === 'HOME' || st === 'EXPLORE') setActiveCard('cafes');
                  else if (st === 'CART') setActiveCard('time');
                  else if (st === 'READY') setActiveCard('ready');
                  else if (st === 'CAFE') setActiveCard('rated');
                }} 
              />
            </div>

            {/* --- STRIPE-GRADE FLOATING NODES (REFINED VERTICAL POSITIONS) --- */}
            {/* Top Left: Cafés Near You Node */}
            <FloatingStatusCard 
              type="grid"
              label="Cafés Near You"
              value="4 nearby"
              active={activeCard === 'cafes'}
              onClick={() => handleCardClick('cafes', 'HOME')}
              delay={0.5}
              duration={4.5}
              floatDirection="vertical"
              socketPosition="right"
              className="top-[7%] left-[10px] xl:left-[30px] hidden lg:flex"
            />

            {/* Bottom Left: Time Saved Node (MOVED UPWARD TO 52%) */}
            <FloatingStatusCard 
              type="graph"
              label="Time Saved"
              badge="Zero-Wait"
              value="14 min"
              active={activeCard === 'time'}
              onClick={() => handleCardClick('time', 'CART')}
              detail="On average per order"
              icon={<MS name="schedule" size={20} />}
              delay={0.7}
              duration={5.2}
              floatDirection="horizontal"
              socketPosition="right"
              className="top-[52%] left-[20px] xl:left-[40px] hidden lg:flex"
            />

            {/* Top Right: Order Ready Node */}
            <FloatingStatusCard 
              label="Order Ready"
              badge="POS Sync"
              value="Pick up now"
              active={activeCard === 'ready'}
              onClick={() => handleCardClick('ready', 'READY')}
              detail="Barista KDS Alerted"
              icon={<MS name="local_cafe" size={20} />}
              delay={0.6}
              duration={5.7}
              floatDirection="vertical"
              socketPosition="left"
              className="top-[9%] right-[10px] xl:right-[30px] hidden lg:flex"
            />

            {/* Bottom Right: Rated By You Node (MOVED UPWARD TO 54%) */}
            <FloatingStatusCard 
              type="rating"
              label="Rated By You"
              badge="4.9 ★"
              value="4.9 / 5.0"
              active={activeCard === 'rated'}
              onClick={() => handleCardClick('rated', 'CAFE')}
              detail="Loved by coffee lovers"
              icon={<MS name="star" size={20} />}
              delay={0.8}
              duration={6.0}
              floatDirection="pulse"
              socketPosition="left"
              className="top-[54%] right-[20px] xl:right-[40px] hidden lg:flex"
            />

          </div>

        </HeroProductStage>

      </div>

      {/* ========================================= */}
      {/* 4. BOTTOM TICKER MARQUEE */}
      {/* ========================================= */}
      <div className="w-full bg-gradient-to-t from-[#EBE4D8]/90 via-[#FDFBF7]/80 to-transparent text-[#1A1311] py-3 overflow-hidden relative z-30 border-t border-white/70 backdrop-blur-xs shrink-0 mt-6">
        <motion.div
          className="flex items-center gap-8 shrink-0 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, duration: 45, ease: 'linear' }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-[10px] font-bold tracking-[0.2em] uppercase">
              <span>Coffee</span> <span className="text-[#F09819]">✦</span>
              <span>Croissants</span> <span className="text-[#F09819]">✦</span>
              <span>Cold Brew</span> <span className="text-[#F09819]">✦</span>
              <span>Matcha</span> <span className="text-[#F09819]">✦</span>
              <span>Sandwiches</span> <span className="text-[#F09819]">✦</span>
              <span>Desserts</span> <span className="text-[#F09819]">✦</span>
              <span>Quick Pickup</span> <span className="text-[#F09819]">✦</span>
              <span>No Wait</span> <span className="text-[#F09819]">✦</span>
              <span>More time for you</span> <span className="text-[#F09819]">✦</span>
            </div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
