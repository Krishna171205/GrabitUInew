// grabbit/src/components/landing/FinalCTA.tsx
'use client';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { useSmoothScroll } from '../SmoothScroll';

export default function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Interactive micro-depth mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Subtle parallax shift for physical collage layers
  const layerShiftX = useTransform(smoothMouseX, [-1, 1], [-8, 8]);
  const layerShiftY = useTransform(smoothMouseY, [-1, 1], [-8, 8]);
  const phoneShiftX = useTransform(smoothMouseX, [-1, 1], [15, -15]);
  const phoneShiftY = useTransform(smoothMouseY, [-1, 1], [15, -15]);
  const phoneRotateX = useTransform(smoothMouseY, [-1, 1], [4, -4]);
  const phoneRotateY = useTransform(smoothMouseX, [-1, 1], [-4, 4]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Natural scroll-linked depth
  const phoneScrollY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) * 2 - 1);
    mouseY.set((clientY / innerHeight) * 2 - 1);
  };

  return (
    <section 
      id="download"
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      className="py-16 sm:py-24 md:py-32 bg-[#EBEAE5] relative flex justify-center px-4 sm:px-6 lg:px-12 select-none overflow-hidden perspective-[1200px]"
    >
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SVG FILTERS FOR PROCEDURAL TORN PAPER EDGES
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <svg className="w-0 h-0 absolute hidden">
        <defs>
          <filter id="torn-paper-edge" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="0.5" result="softened" />
            <feComposite operator="in" in="SourceGraphic" in2="softened" />
          </filter>
        </defs>
      </svg>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO / CTA CONTAINER: PHYSICAL POSTER COLLAGE ARCHITECTURE
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="w-full max-w-[1500px] mx-auto bg-[#E6E2D9] rounded-[24px] sm:rounded-[32px] md:rounded-[40px] border-[3px] border-[#0A0A0D]/10 relative overflow-hidden flex flex-col md:flex-row shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] min-h-[460px] md:min-h-[500px] lg:min-h-[540px]">
        
        {/* Subtle natural paper fiber texture over the cream base */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            BLACK TORN-PAPER OVERLAYS (Collage depth revealing background)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        
        {/* 1. TOP-RIGHT TORN BLACK PAPER INTRUSION */}
        <motion.div 
          style={{ x: layerShiftX, y: layerShiftY }}
          className="absolute -top-[20px] -right-[20px] w-[50%] sm:w-[40%] md:w-[35%] lg:w-[400px] h-[300px] md:h-[400px] z-10 pointer-events-none"
        >
          <svg className="w-full h-full text-[#0F1116] drop-shadow-[-8px_12px_15px_rgba(0,0,0,0.4)]" preserveAspectRatio="none" viewBox="0 0 400 400" fill="currentColor">
            <path filter="url(#torn-paper-edge)" d="M420,-20 L420,380 L350,370 L280,310 L220,280 L160,200 L120,130 L60,80 L-20,-20 Z" />
          </svg>
        </motion.div>

        {/* 2. BOTTOM-LEFT TORN BLACK PAPER OVERLAY */}
        <motion.div 
          style={{ x: layerShiftX, y: layerShiftY }}
          className="absolute -bottom-[20px] -left-[20px] w-[45%] sm:w-[35%] md:w-[30%] lg:w-[350px] h-[250px] md:h-[300px] z-10 pointer-events-none"
        >
          <svg className="w-full h-full text-[#0F1116] drop-shadow-[8px_-10px_15px_rgba(0,0,0,0.4)]" preserveAspectRatio="none" viewBox="0 0 350 300" fill="currentColor">
            <path filter="url(#torn-paper-edge)" d="M-20,320 L330,320 L310,250 L260,200 L200,160 L140,110 L80,50 L-20,-20 Z" />
          </svg>
        </motion.div>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            LEFT COLUMN: EDITORIAL BRUTALIST TYPOGRAPHY & CALL TO ACTION
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-full md:w-[60%] lg:w-[63%] flex flex-col justify-center z-20 px-6 sm:px-10 lg:pl-[9%] lg:pr-10 pt-12 pb-10 md:py-10 text-left relative">
          
          {/* Subtle Accent Detail */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-6"
          >
            <Image 
              src="/new-logo.svg" 
              alt="Grabbit Logo" 
              width={90} 
              height={28} 
              className="object-contain w-[80px] sm:w-[96px]"
              style={{ mixBlendMode: 'multiply' }}
            />
          </motion.div>

          {/* Headline: 3 Lines, highly editorial scale */}
          <h2 
            className="text-[52px] sm:text-[72px] md:text-[84px] lg:text-[105px] leading-[1.05] tracking-[0.03em] font-black uppercase flex flex-col mb-6 md:mb-8 text-[#1A1C23]" 
            style={{ fontFamily: 'var(--font-anton)' }}
          >
            <motion.span 
              initial={{ opacity: 0, y: 30, rotate: 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              ALL YOUR DAY
            </motion.span>
            
            <motion.span 
              initial={{ opacity: 0, y: 30, rotate: 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="block mt-2 sm:mt-3"
            >
              WITH FRESH COFFEE,
            </motion.span>
            
            <motion.span 
              initial={{ opacity: 0, y: 30, rotate: 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-[#0055D4] block mt-2 sm:mt-3"
            >
              NOT LONG LINES.
            </motion.span>
          </h2>
          
          {/* Supporting Copy */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
            className="text-[#3A3D46] text-[16px] sm:text-[17px] lg:text-[19px] font-medium leading-[1.45] max-w-[480px] mb-10 sm:mb-12 font-sans"
          >
            Students using Grabbit save 20+ minutes daily with zero line waiting. See how instant pre-orders can fill your day.
          </motion.p>
          
          {/* Editorial Blue CTA Button */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
            className="self-start"
          >
            <Link 
              href="/home" 
              className="group relative inline-flex items-center justify-center bg-[#0055D4] text-white px-8 sm:px-12 h-[52px] sm:h-[58px] rounded-[10px] sm:rounded-[12px] font-normal uppercase text-[15px] sm:text-[17px] tracking-[0.1em] transition-transform duration-300 active:scale-95 z-20"
              style={{ fontFamily: 'var(--font-anton)' }}
            >
              <div className="absolute inset-0 rounded-[inherit] bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)]" />
              <div className="absolute inset-0 rounded-[inherit] shadow-[0_12px_24px_-6px_rgba(0,85,212,0.4)] group-hover:shadow-[0_16px_32px_-6px_rgba(0,85,212,0.5)] transition-shadow duration-300" />
              <span className="relative z-10 translate-y-[-1px] text-white">DOWNLOAD THE APP</span>
            </Link>
          </motion.div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            RIGHT COLUMN: REALISTIC SMARTPHONE MOCKUP
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="w-full md:w-[40%] lg:w-[37%] relative flex justify-center md:justify-end items-end md:items-end pt-8 pb-0 md:py-0 px-6 sm:px-12 md:px-0 md:pr-12 lg:pr-20 z-20 pointer-events-none">
            
            <motion.div 
              style={{ 
                x: phoneShiftX, 
                y: phoneScrollY,
                rotateX: phoneRotateX,
                rotateY: phoneRotateY
              }}
              className="relative w-[280px] sm:w-[320px] md:w-[300px] lg:w-[340px] transform-style-3d origin-center translate-y-20 md:translate-y-32 lg:translate-y-48"
            >
              {/* Idle floating animation container */}
              <motion.div
                animate={{ 
                  y: [-3, 3, -3],
                  rotateZ: [5, 4.5, 5]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-full aspect-[428/926]"
              >
                {/* 1. Ultra-realistic Cast Shadow & Ambient Light */}
                <div className="absolute -inset-6 bg-black/40 rounded-[60px] blur-2xl translate-x-8 translate-y-12 mix-blend-multiply opacity-80" />
                <div className="absolute -inset-2 bg-[#0055D4]/10 rounded-[60px] blur-xl translate-x-4 translate-y-8" />
                <div className="absolute bottom-[-20px] left-[20px] right-[-10px] h-[40px] bg-black/50 rounded-full blur-xl mix-blend-multiply rotate-[-5deg]" />

                {/* 2. Hardware Bezel (Dark Titanium) */}
                <div className="absolute inset-0 bg-[#161719] rounded-[48px] sm:rounded-[54px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),_inset_0_-2px_4px_rgba(0,0,0,0.5),_0_0_0_2px_#313338] border border-[#484B52]/50 p-[12px] transform-style-3d overflow-visible">
                   
                   {/* Reflection Glare on Bezel Edge */}
                   <div className="absolute top-0 right-0 w-[50%] h-[20%] bg-gradient-to-br from-white/10 to-transparent rounded-tr-[42px] pointer-events-none" />

                   {/* Left Side Buttons */}
                   <div className="absolute -left-[3px] top-[100px] w-[3px] h-[22px] bg-[#2A2B30] rounded-l-[2px] shadow-[-1px_0_2px_rgba(0,0,0,0.5)]" />
                   <div className="absolute -left-[3px] top-[145px] w-[3px] h-[46px] bg-[#2A2B30] rounded-l-[2px] shadow-[-1px_0_2px_rgba(0,0,0,0.5)]" />
                   <div className="absolute -left-[3px] top-[205px] w-[3px] h-[46px] bg-[#2A2B30] rounded-l-[2px] shadow-[-1px_0_2px_rgba(0,0,0,0.5)]" />

                   {/* Right Side Power Button */}
                   <div className="absolute -right-[3px] top-[160px] w-[3px] h-[72px] bg-[#2A2B30] rounded-r-[2px] shadow-[1px_0_2px_rgba(0,0,0,0.5)]" />

                   {/* 3. Screen Glass & Display */}
                   <div className="relative w-full h-full bg-[#EAE6DF] rounded-[36px] sm:rounded-[42px] overflow-hidden shadow-[inset_0_0_0_1px_rgba(0,0,0,0.2)] flex flex-col items-center">
                      
                      {/* Dynamic Island / Notch */}
                      <div className="absolute top-[8px] sm:top-[12px] z-30 w-[95px] sm:w-[110px] h-[26px] sm:h-[30px] bg-black rounded-full flex items-center px-3 justify-between shadow-lg">
                        <div className="w-[12px] sm:w-[14px] h-[12px] sm:h-[14px] rounded-full bg-[#080808] border-[1.5px] border-[#1A1A1A] flex items-center justify-center">
                          <div className="w-[4px] h-[4px] bg-[#0055D4]/40 rounded-full" />
                        </div>
                        <div className="w-[6px] sm:w-[8px] h-[6px] sm:h-[8px] rounded-full bg-[#092B0E]" />
                      </div>

                      {/* Screen Content - Replicating Grabbit UI exactly */}
                      <div className="w-full h-full pt-16 sm:pt-20 pb-8 px-5 sm:px-7 flex flex-col bg-[#FAFAFA] text-center relative overflow-hidden">
                         
                         {/* Subtle screen UI background texture */}
                         <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                         {/* Logo */}
                         <div className="flex items-center justify-center mb-6">
                            <Image 
                              src="/new-logo.svg" 
                              alt="Grabbit Logo" 
                              width={110} 
                              height={34} 
                              className="object-contain w-[100px] sm:w-[120px]"
                              style={{ mixBlendMode: 'multiply' }}
                            />
                         </div>
                         
                         {/* Headline inside Phone */}
                         <h3 
                           className="text-[20px] sm:text-[24px] font-black text-center leading-[1.05] text-[#111317] tracking-tight mb-2 uppercase" 
                           style={{ fontFamily: 'var(--font-anton)' }}
                         >
                            The new way to win<br />
                            <span className="text-[#0055D4]">jobs</span>
                         </h3>
                         
                         <p className="text-[11px] sm:text-[12px] text-center text-[#555760] font-medium mb-6 px-1 leading-snug">
                            Put Grabbit to work for you.<br/>No credit card required.
                         </p>
                         
                         {/* Form Inputs (Visual Mockups) */}
                         <div className="space-y-3 sm:space-y-4 w-full flex-1">
                           <div className="w-full bg-white border border-[#E0DCD3] rounded-[10px] px-4 py-3 sm:py-3.5 flex items-center shadow-sm">
                             <span className="text-[12px] sm:text-[13px] font-medium text-[#A0A2AB]">Email Address</span>
                           </div>
                           
                           <div className="w-full bg-white border border-[#E0DCD3] rounded-[10px] px-4 py-3 sm:py-3.5 flex items-center shadow-sm">
                             <span className="text-[12px] sm:text-[13px] font-medium text-[#A0A2AB]">Add a Password</span>
                           </div>

                           <div className="flex items-start gap-2.5 mt-4 sm:mt-5 px-1 text-left">
                             <div className="mt-0.5 w-[14px] h-[14px] rounded-[3px] bg-[#0055D4] flex items-center justify-center shrink-0 shadow-sm">
                               <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M2.75 5.5L0 2.75L0.8875 1.8625L2.75 3.7125L7.1125 0L8 0.8875L2.75 5.5Z" fill="white"/>
                               </svg>
                             </div>
                             <span className="text-[9px] sm:text-[10px] text-[#5C5E68] font-medium leading-[1.4]">
                               Receive marketing email, SMS, news and resources from Grabbit.
                             </span>
                           </div>
                         </div>
                         
                         {/* Create Account Button */}
                         <div className="w-full bg-[#0055D4] text-white font-black rounded-[10px] py-3.5 sm:py-4 text-[13px] sm:text-[14px] uppercase tracking-wider shadow-[0_4px_12px_rgba(0,85,212,0.3)] mt-auto mb-2">
                           Create account
                         </div>

                         {/* iOS Home Indicator Bar */}
                         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[35%] h-[4px] bg-[#111317]/30 rounded-full" />
                         
                         {/* Inner Screen Glare (Glass effect) */}
                         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
                      </div>
                   </div>
                </div>
              </motion.div>
            </motion.div>

        </div>

      </div>
    </section>
  );
}
