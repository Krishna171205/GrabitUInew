// grabbit/src/components/landing/FinalCTA.tsx
'use client';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';

export default function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Interactive micro-depth mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 200 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Subtle 2-5px parallax shift for physical collage layers
  const layerShiftX = useTransform(smoothMouseX, [-1, 1], [-4, 4]);
  const layerShiftY = useTransform(smoothMouseY, [-1, 1], [-3, 3]);
  const phoneShiftX = useTransform(smoothMouseX, [-1, 1], [3, -3]);
  const phoneShiftY = useTransform(smoothMouseY, [-1, 1], [4, -4]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Natural scroll-linked depth
  const phoneY = useTransform(scrollYProgress, [0, 1], [12, -12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) * 2 - 1);
    mouseY.set((clientY / innerHeight) * 2 - 1);
  };

  return (
    <section 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      className="py-16 sm:py-24 bg-[#EBEAE5] relative flex justify-center px-4 sm:px-6 lg:px-8 select-none overflow-hidden"
    >
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO / CTA CONTAINER: PHYSICAL POSTER COLLAGE ARCHITECTURE
          Layer 1: Deep Black Paper Background (#111116)
          Layer 2: Large Cream Editorial Paper Sheet (#E6E2D9) with Organic Tears
          Layer 3: Torn Black Paper Overlays (Top-Right Intrusion & Lower Edge)
          Layer 4: Editorial Content (Headline, Description, CTA)
          Layer 5: Realistic Smartphone Mockup anchored to Bottom-Right
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="w-full max-w-[1280px] bg-[#111116] rounded-[28px] sm:rounded-[44px] border-[3.5px] sm:border-[4px] border-[#0A0A0D] relative overflow-hidden flex flex-col justify-between shadow-[0_30px_70px_-15px_rgba(0,0,0,0.55)] min-h-[560px] md:min-h-[600px] lg:min-h-[640px]">
        
        {/* TOP BLACK EXPOSURE (Moody photo studio gradient & lighting) */}
        <div className="h-[48px] sm:h-[75px] md:h-[88px] w-full shrink-0 relative bg-gradient-to-r from-[#171920] via-[#0E1014] to-[#1C1E26]">
          <div className="absolute inset-0 opacity-30 bg-[url('/noise.png')] mix-blend-overlay pointer-events-none" />
          <div className="absolute top-0 right-14 w-96 h-36 bg-white/[0.04] blur-3xl pointer-events-none" />
        </div>
        
        {/* TOP TORN PAPER EDGE - Organic, non-repeating rip with white fiber fringe */}
        <div className="relative w-full shrink-0 z-10 -mt-[1px]">
          {/* Layer 1: White fibrous torn pulp fringe highlight */}
          <svg className="w-full h-[24px] sm:h-[40px] text-white/80 absolute top-[-3px] left-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1200 45" fill="currentColor">
            <path d="M0,45 L0,22 L45,26 L80,14 L135,28 L190,12 L245,29 L310,16 L380,31 L450,12 L520,29 L590,14 L665,32 L735,16 L810,30 L875,12 L945,27 L1010,14 L1075,30 L1140,15 L1200,25 L1200,45 Z" />
          </svg>
          
          {/* Layer 2: Main Cream Paper Sheet Body with Deep Shadow */}
          <svg className="w-full h-[24px] sm:h-[40px] text-[#E6E2D9] drop-shadow-[0_-8px_12px_rgba(0,0,0,0.7)] relative block" preserveAspectRatio="none" viewBox="0 0 1200 45" fill="currentColor">
            <path d="M0,45 L0,24 L50,28 L85,16 L140,30 L195,14 L250,31 L315,18 L385,33 L455,14 L525,31 L595,16 L670,34 L740,18 L815,32 L880,14 L950,29 L1015,16 L1080,32 L1145,17 L1200,27 L1200,45 Z" />
          </svg>
        </div>

        {/* MAIN EDITORIAL CREAM PAPER BODY */}
        <div className="bg-[#E6E2D9] w-full flex-1 px-6 sm:px-12 lg:px-18 py-8 sm:py-12 md:py-16 relative flex flex-col md:flex-row items-center justify-between">
          
          {/* Subtle natural paper fiber texture */}
          <div className="absolute inset-0 opacity-[0.05] bg-[url('/noise.png')] mix-blend-multiply pointer-events-none" />

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              BLACK TORN-PAPER OVERLAYS (Collage depth)
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          
          {/* 1. TOP-RIGHT TORN BLACK PAPER INTRUSION (Curved organic tear overlapping cream paper) */}
          <motion.div 
            style={{ x: layerShiftX, y: layerShiftY }}
            className="absolute -top-[50px] sm:-top-[75px] md:-top-[90px] right-0 w-[48%] sm:w-[40%] md:w-[34%] lg:w-[28%] h-[150px] sm:h-[190px] md:h-[230px] z-30 pointer-events-none"
          >
            {/* Black Torn Paper Shape with Deep Shadow onto Cream Paper */}
            <svg className="w-full h-full text-[#111116] drop-shadow-[-10px_12px_18px_rgba(0,0,0,0.65)] absolute top-0 right-0" preserveAspectRatio="none" viewBox="0 0 350 220" fill="currentColor">
              <path d="M0,0 L350,0 L350,220 L270,210 L230,175 L180,190 L145,150 L95,155 L65,105 L30,90 L12,40 L0,0 Z" />
            </svg>
            {/* White frayed paper edge highlight along the tear */}
            <svg className="w-full h-full text-white/60 absolute top-[-1px] right-[-1px] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 350 220" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M0,0 L12,40 L30,90 L65,105 L95,155 L145,150 L180,190 L230,175 L270,210 L350,220" />
            </svg>
          </motion.div>

          {/* 2. BOTTOM-LEFT TORN BLACK PAPER OVERLAY */}
          <motion.div 
            style={{ x: layerShiftX, y: layerShiftY }}
            className="absolute -bottom-[20px] left-0 w-[38%] sm:w-[30%] md:w-[24%] h-[100px] sm:h-[130px] z-30 pointer-events-none"
          >
            <svg className="w-full h-full text-[#111116] drop-shadow-[10px_-10px_18px_rgba(0,0,0,0.65)] absolute bottom-0 left-0" preserveAspectRatio="none" viewBox="0 0 300 130" fill="currentColor">
              <path d="M0,130 L0,0 L45,28 L80,18 L125,58 L170,42 L215,90 L265,72 L300,130 Z" />
            </svg>
            <svg className="w-full h-full text-white/60 absolute bottom-[-1px] left-[-1px] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 300 130" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M0,0 L45,28 L80,18 L125,58 L170,42 L215,90 L265,72 L300,130" />
            </svg>
          </motion.div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              LEFT COLUMN: EDITORIAL BRUTALIST TYPOGRAPHY & CALL TO ACTION
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="w-full md:w-[56%] lg:w-[58%] flex flex-col z-20 text-left">
            
            {/* Headline: FILL YOUR DAY (Black) -> WITH FRESH (Blue) -> BITES (Blue) */}
            <h2 
              className="text-[44px] sm:text-[62px] md:text-[74px] lg:text-[88px] xl:text-[98px] leading-[0.88] tracking-[-0.02em] font-black uppercase text-left flex flex-col mb-4 sm:mb-6" 
              style={{ fontFamily: 'var(--font-anton)' }}
            >
              <motion.span 
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-[#111116] block"
              >
                FILL YOUR DAY
              </motion.span>
              
              <motion.span 
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="text-[#0055D4] block mt-1 sm:mt-2"
              >
                WITH FRESH
              </motion.span>
              
              <motion.span 
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                className="text-[#0055D4] block"
              >
                BITES
              </motion.span>
            </h2>
            
            {/* Supporting Copy */}
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="text-[#2B2E35] text-[15px] sm:text-[17px] lg:text-[18px] font-semibold leading-[1.4] max-w-[490px] mb-6 sm:mb-8 font-sans"
            >
              Students and campus food lovers using Grabbit save 20+ minutes every day with zero line waiting. See how instant pre-orders and express pickup can fill your day.
            </motion.p>
            
            {/* Editorial Blue CTA Button */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="self-start mb-6 md:mb-0"
            >
              <Link 
                href="/home" 
                className="inline-flex items-center justify-center bg-[#0055D4] hover:bg-[#0042A6] text-white px-8 sm:px-10 py-4 sm:py-[18px] rounded-[10px] sm:rounded-[12px] font-black uppercase text-[15px] sm:text-[17px] tracking-[0.1em] sm:tracking-[0.12em] transition-all shadow-[0_10px_25px_rgba(0,85,212,0.35)] hover:shadow-[0_14px_30px_rgba(0,85,212,0.45)] hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ fontFamily: 'var(--font-anton)' }}
              >
                DOWNLOAD THE APP
              </Link>
            </motion.div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              RIGHT COLUMN: REALISTIC SMARTPHONE MOCKUP (Anchored Bottom-Right)
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="w-full md:w-[42%] lg:w-[40%] flex justify-center md:justify-end md:absolute md:right-8 lg:right-16 md:bottom-0 z-20">
             
             {/* Smartphone Container with 3D Shadow & Bleed */}
             <motion.div 
               style={{ y: phoneY, x: phoneShiftX }}
               className="relative w-full max-w-[290px] sm:max-w-[315px] lg:max-w-[335px] md:translate-y-2 lg:translate-y-4"
             >
                {/* Directional Cast Shadow to the Right & Bottom */}
                <div className="absolute -inset-1 bg-black/35 rounded-[44px] sm:rounded-[48px] blur-xl translate-x-5 translate-y-4 pointer-events-none" />

                {/* Smartphone Hardware Frame (Dark Titanium Bezel) */}
                <div className="relative w-full bg-[#18191E] rounded-t-[40px] sm:rounded-t-[46px] rounded-b-[20px] md:rounded-b-none p-[8px] sm:p-[10px] pb-0 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.08)] border-t border-x border-[#2D2F36]">
                   
                   {/* Left Side Buttons */}
                   <div className="absolute -left-[3px] top-[80px] w-[3px] h-[18px] bg-[#363842] rounded-l-sm shadow-sm" />
                   <div className="absolute -left-[3px] top-[115px] w-[3px] h-[38px] bg-[#363842] rounded-l-sm shadow-sm" />
                   <div className="absolute -left-[3px] top-[162px] w-[3px] h-[38px] bg-[#363842] rounded-l-sm shadow-sm" />

                   {/* Right Side Power Button */}
                   <div className="absolute -right-[3px] top-[125px] w-[3px] h-[58px] bg-[#363842] rounded-r-sm shadow-sm" />

                   {/* Screen Display Container */}
                   <div className="relative w-full bg-[#EAE6DF] rounded-t-[32px] sm:rounded-t-[38px] rounded-b-[14px] md:rounded-b-none overflow-hidden border border-black/10 shadow-inner flex flex-col items-center">
                      
                      {/* Realistic iPhone Top Notch / Dynamic Island */}
                      <div className="w-[110px] sm:w-[124px] h-[22px] sm:h-[25px] bg-[#18191E] rounded-b-[16px] absolute top-0 z-30 flex items-center justify-center gap-2 px-3 shadow-md">
                         <div className="w-[36px] h-[3px] bg-[#2E303A] rounded-full" />
                         <div className="w-[6.5px] h-[6.5px] bg-[#0A0B0E] border border-[#3A3D4A] rounded-full relative flex items-center justify-center">
                            <div className="w-[2px] h-[2px] bg-[#38BDF8]/60 rounded-full" />
                         </div>
                      </div>

                      {/* Screen Content */}
                      <div className="w-full pt-10 sm:pt-12 pb-6 sm:pb-8 px-5 sm:px-6 flex flex-col h-full bg-[#EAE6DF] text-center">
                         
                         {/* Official Grabbit Logo */}
                         <div className="flex items-center justify-center mb-3 sm:mb-4">
                            <Image 
                              src="/new-logo.svg" 
                              alt="Grabbit Logo" 
                              width={125} 
                              height={38} 
                              className="object-contain"
                              style={{ mixBlendMode: 'multiply' }}
                              priority
                            />
                         </div>
                         
                         {/* Headline inside Phone */}
                         <h3 
                           className="text-[19px] sm:text-[22px] font-black text-center leading-[1.08] text-[#111317] tracking-wide mb-1.5" 
                           style={{ fontFamily: 'var(--font-anton)' }}
                         >
                            The new way to win<br />
                            <span className="text-[#0055D4]">jobs</span>
                         </h3>
                         
                         {/* Subtext */}
                         <p className="text-[10px] sm:text-[10.5px] text-center text-[#555760] font-bold mb-3.5 sm:mb-4 px-1 leading-snug tracking-normal">
                            Put Grabbit to work for you. No credit card required
                         </p>
                         
                         {/* Form Inputs */}
                         <div className="space-y-2.5 sm:space-y-3 w-full">
                           <div className="relative">
                             <input 
                               type="email" 
                               placeholder="Email Adress" 
                               defaultValue=""
                               className="w-full bg-white border border-[#D5D0C6] rounded-[8px] sm:rounded-[9px] px-3.5 py-2.5 sm:py-3 text-[11.5px] sm:text-[12px] font-bold text-[#111317] placeholder:text-[#8C8F98] shadow-[0_1px_3px_rgba(0,0,0,0.04)] outline-none focus:border-[#0055D4] focus:ring-1 focus:ring-[#0055D4] transition-all" 
                             />
                           </div>
                           
                           <div className="relative">
                             <input 
                               type="password" 
                               placeholder="Add a Password" 
                               defaultValue=""
                               className="w-full bg-white border border-[#D5D0C6] rounded-[8px] sm:rounded-[9px] px-3.5 py-2.5 sm:py-3 text-[11.5px] sm:text-[12px] font-bold text-[#111317] placeholder:text-[#8C8F98] shadow-[0_1px_3px_rgba(0,0,0,0.04)] outline-none focus:border-[#0055D4] focus:ring-1 focus:ring-[#0055D4] transition-all" 
                             />
                           </div>
                         </div>
                         
                         {/* Checkbox & Terms */}
                         <div className="flex items-start gap-2 mt-2.5 mb-3.5 sm:mb-4 px-0.5 text-left">
                           <input 
                             type="checkbox" 
                             id="phone-terms"
                             defaultChecked 
                             className="mt-[2px] w-[13px] h-[13px] accent-[#0055D4] rounded-[2.5px] border-[#C4BFAF] cursor-pointer shrink-0" 
                           />
                           <label htmlFor="phone-terms" className="text-[8px] sm:text-[8.5px] text-[#5C5E68] font-bold leading-[1.3] cursor-pointer">
                             Receive marketing email, SMS, news and resources from Grabbit. You can unsubscribe at any time.
                           </label>
                         </div>
                         
                         {/* Solid Blue Create Account Button */}
                         <button 
                           type="button"
                           className="w-full bg-[#0055D4] hover:bg-[#0042A6] text-white font-bold rounded-[8px] sm:rounded-[9px] py-2.5 sm:py-3 text-[12px] sm:text-[12.5px] shadow-[0_4px_12px_rgba(0,85,212,0.3)] transition-all tracking-[0.04em] active:scale-[0.98]"
                         >
                           Create account
                         </button>

                         {/* iOS Home Indicator Bar */}
                         <div className="w-[100px] h-[3.5px] bg-[#111317]/20 rounded-full mx-auto mt-3 sm:mt-4" />

                      </div>
                   </div>

                </div>
             </motion.div>
          </div>

        </div>

        {/* BOTTOM TORN PAPER EDGE - Natural aggressive rip exposing black layer */}
        <div className="relative w-full shrink-0 z-10 -mb-[1px]">
          {/* Layer 1: Main Cream Paper Sheet Body with Deep Shadow */}
          <svg className="w-full h-[24px] sm:h-[40px] text-[#E6E2D9] drop-shadow-[0_8px_12px_rgba(0,0,0,0.7)] relative block" preserveAspectRatio="none" viewBox="0 0 1200 45" fill="currentColor">
            <path d="M0,0 L0,16 L45,25 L105,10 L160,25 L220,10 L275,23 L335,8 L390,25 L450,10 L505,23 L565,8 L625,25 L685,10 L745,25 L805,12 L865,27 L925,10 L980,23 L1040,8 L1095,25 L1155,10 L1200,16 L1200,0 Z" />
          </svg>

          {/* Layer 2: White fibrous torn pulp fringe highlight */}
          <svg className="w-full h-[24px] sm:h-[40px] text-white/80 absolute bottom-[-3px] left-0 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1200 45" fill="currentColor">
            <path d="M0,0 L0,18 L45,27 L105,12 L160,27 L220,12 L275,25 L335,10 L390,27 L450,12 L505,25 L565,10 L625,27 L685,12 L745,27 L805,14 L865,29 L925,12 L980,25 L1040,10 L1095,27 L1155,12 L1200,18 L1200,0 Z" />
          </svg>
        </div>
        
        {/* BOTTOM DARK EXPOSURE */}
        <div className="h-[48px] sm:h-[75px] md:h-[88px] w-full shrink-0 relative bg-gradient-to-r from-[#111216] via-[#16181F] to-[#0E1014]">
          <div className="absolute inset-0 opacity-30 bg-[url('/noise.png')] mix-blend-overlay pointer-events-none" />
          <div className="absolute bottom-0 left-14 w-96 h-36 bg-white/[0.04] blur-3xl pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
