'use client';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Play, Timer, Coffee, CheckCircle2, ArrowRight, MapPin, Zap, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Scroll parallax effects
  const { scrollY } = useScroll();
  const videoScrollY = useTransform(scrollY, [0, 500], [0, 60]);

  // Interactive step state
  const [activeStep, setActiveStep] = useState(3);
  const [, setIsStepperHovered] = useState(false);

  // Auto-progress stepper every 4 seconds unless hovered
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 3) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Typography entrance choreography
  const wordVariants = {
    hidden: { opacity: 0, y: 22, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: "spring", stiffness: 240, damping: 20 } 
    }
  };

  return (
    <section 
      id="hero"
      ref={containerRef}
      className="relative min-h-[100svh] flex flex-col items-start justify-center overflow-x-clip bg-[#F8FAFC]"
    >
      {/* FULL BACKGROUND VIDEO (Clear, no blur, shifted visually to the right) */}
      <motion.div 
        className="absolute inset-0 z-0 overflow-hidden flex justify-end"
        initial={!prefersReducedMotion ? { scale: 0.98 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ y: videoScrollY }}
      >
        <div className="absolute inset-0 bg-[#F8FAFC] -z-10" />
        <div className="w-full lg:w-[65%] h-full relative">
          {/* Fading gradient strictly on the left edge of the video container to eliminate the seam */}
          <div className="absolute inset-y-0 left-0 w-[40%] lg:w-[50%] bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/90 to-transparent z-10 pointer-events-none" />
          
          <video
            src="/grabv1.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center opacity-100"
          />
        </div>
      </motion.div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col items-start justify-center min-h-[100svh] pt-28 sm:pt-32 pb-12 w-full">
        
        {/* LEFT COLUMN: TEXT & CTA */}
        <div className="relative w-full lg:w-[60%] xl:w-[50%] flex flex-col items-start justify-center z-20 mt-6 lg:mt-0">
          
          <div 
            className="z-30 text-left relative pointer-events-none flex flex-col items-start w-full"
          >
            <h1 
              className="text-[12vw] sm:text-[9vw] lg:text-[84px] xl:text-[96px] font-black tracking-normal leading-[0.9] uppercase flex flex-col items-start drop-shadow-sm w-full"
              style={{ fontFamily: 'var(--font-anton)' }}
            >
              <div className="flex flex-row gap-3 sm:gap-4 lg:gap-5 text-[#0F172A]">
                <motion.span 
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.35 }}
                  className="block pointer-events-auto cursor-default hover:text-[#0055D4] transition-colors duration-300"
                >
                  ORDER
                </motion.span>
                <motion.span 
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.45 }}
                  className="block pointer-events-auto cursor-default hover:text-[#0055D4] transition-colors duration-300"
                >
                  AHEAD
                </motion.span>
              </div>
              
              <motion.span 
                className="text-[#0055D4] block drop-shadow-sm pointer-events-auto cursor-default relative origin-left mt-1 lg:mt-2"
                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.015 }}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.55, 
                  type: 'spring', stiffness: 220, damping: 22 
                }}
              >
                WITH GRABBIT.
              </motion.span>
            </h1>
          </div>

          <motion.p 
            className="text-[15px] sm:text-[17px] md:text-[18px] text-[#334155] max-w-[480px] font-medium leading-relaxed text-left mt-6 sm:mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          >
            Grabbit is a 10-minute cafe pickup app. Order ahead at your favorite local spots. Your coffee should be ready when you arrive.
          </motion.p>

          {/* INTERACTIVE STEPPER SYSTEM */}
          <motion.div 
            className="flex items-start justify-start gap-4 sm:gap-10 mt-8 sm:mt-10 z-40 w-full max-w-[420px] relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
            onMouseEnter={() => setIsStepperHovered(true)}
            onMouseLeave={() => setIsStepperHovered(false)}
          >
            {/* Connecting Dashed Line Track */}
            <div className="absolute top-[14px] left-[10%] right-[10%] h-[1px] border-t-2 border-dashed border-[#0055D4]/20 -z-10" />
            
            {[
              { num: 1, label: "First in line" },
              { num: 2, label: "Zero wait" },
              { num: 3, label: "Ready for pickup" }
            ].map((step) => {
              const isActive = activeStep === step.num;
              return (
                <div 
                  key={step.num} 
                  className="flex flex-col items-center gap-2 sm:gap-3 flex-1 cursor-pointer group relative"
                  onClick={() => setActiveStep(step.num)}
                >
                  {/* Sliding indicator dot - now a sibling so it renders BEHIND the white circle */}
                  {isActive && !prefersReducedMotion && (
                    <motion.div 
                      layoutId="stepper-dot"
                      className="absolute top-[13px] sm:top-[15px] w-2 h-2 rounded-full bg-[#0055D4] shadow-[0_0_8px_rgba(0,85,212,0.5)] z-0"
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    />
                  )}

                  <motion.div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center z-10 relative"
                    animate={{
                      scale: isActive ? 1.08 : 1,
                      border: isActive ? '2px solid #0055D4' : '2px solid transparent',
                      boxShadow: isActive ? '0 0 16px rgba(0,85,212,0.3)' : '0 2px 10px rgba(0,0,0,0.05)',
                      color: isActive ? '#0055D4' : '#64748B'
                    }}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 350, damping: 18 }}
                  >
                    <span className="font-black text-[11px] sm:text-xs tracking-tight">0{step.num}</span>
                    {isActive && (
                      <motion.div 
                        className="absolute inset-0 rounded-full border border-[#0055D4]"
                        animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </motion.div>
                  
                  <motion.span 
                    className="text-[10px] sm:text-[13px] font-bold text-center leading-tight transition-all whitespace-nowrap"
                    animate={{
                      y: isActive ? -2 : 0,
                      opacity: isActive ? 1 : 0.6,
                      color: isActive ? '#0F172A' : '#334155'
                    }}
                  >
                    {step.label}
                  </motion.span>
                </div>
              );
            })}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div 
            className="relative z-50 mt-10 sm:mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 sm:gap-5 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
          >
            <motion.div
              animate={{
                y: activeStep === 3 ? -2 : 0,
                scale: activeStep === 3 ? 1.02 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-full sm:w-auto"
            >
              <Link 
                href="/home"
                className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-[#0055D4] text-white rounded-full font-bold text-base sm:text-lg transition-all shadow-[0_8px_30px_rgb(0,85,212,0.3)] flex items-center justify-center group hover:shadow-[0_12px_40px_rgb(0,85,212,0.4)] hover:bg-[#0040A1] active:scale-95 uppercase tracking-wide"
                style={{ color: '#FFFFFF' }}
              >
                ORDER NOW
              </Link>
            </motion.div>

            <motion.div
              animate={{
                y: activeStep === 3 ? -2 : 0,
                scale: activeStep === 3 ? 1.02 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-full sm:w-auto"
            >
              <Link 
                href="/"
                className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-transparent border-[2.5px] border-[#0055D4] rounded-full font-bold text-base sm:text-lg transition-all flex items-center justify-center group hover:bg-[#0055D4] active:scale-95 uppercase tracking-wide !text-[#0055D4] hover:!text-white"
              >
                FIND A CAFE
              </Link>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
