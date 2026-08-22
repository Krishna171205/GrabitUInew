'use client';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Play, Timer, Coffee, CheckCircle2, ArrowRight, MapPin, Zap, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Custom handwriting animation component for the annotation
function AnimatedAnnotation({ delay = 0.15 }: { delay?: number }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div 
      className="relative inline-block z-40 origin-bottom-left"
      animate={!prefersReducedMotion ? { y: [0, -3, 0] } : {}}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={!prefersReducedMotion ? { scale: 1.06, rotate: -2, transition: { type: "spring", stiffness: 300 } } : {}}
    >
      <motion.span 
        className="text-[28px] sm:text-[34px] leading-none text-[#0055D4] block" 
        style={{ fontFamily: 'var(--font-caveat)' }}
      >
        <motion.span
          initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0, y: 6 }}
          animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay, ease: 'easeOut' }}
          className="block"
        >
          skip the wait,
        </motion.span>
      </motion.span>
      {/* Down Right Arrow */}
      <motion.svg 
        width="24" height="24" viewBox="0 0 24 24" fill="none" 
        className="absolute -bottom-4 -right-4 rotate-12"
      >
        <motion.path 
          d="M4 4C4 4 12 6 18 18" stroke="#0055D4" strokeWidth="2" strokeLinecap="round" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: delay + 0.3 }}
        />
        <motion.path 
          d="M18 18L10 20" stroke="#0055D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.2, delay: delay + 0.5 }}
        />
        <motion.path 
          d="M18 18L20 10" stroke="#0055D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.2, delay: delay + 0.5 }}
        />
      </motion.svg>
    </motion.div>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Interactive 3D hover tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for natural weight and responsiveness
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Parallax layers
  const textParallaxX = useTransform(smoothMouseX, [-1, 1], [-8, 8]);
  const textParallaxY = useTransform(smoothMouseY, [-1, 1], [-6, 6]);
  
  const bgParallaxX = useTransform(smoothMouseX, [-1, 1], [4, -4]);
  const bgParallaxY = useTransform(smoothMouseY, [-1, 1], [4, -4]);

  // Scroll parallax effects
  const { scrollY } = useScroll();
  const textScrollY = useTransform(scrollY, [0, 500], [0, 100]);
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

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) * 2 - 1);
    mouseY.set((clientY / innerHeight) * 2 - 1);
  };

  // Typography entrance choreography with spring bounce
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
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-x-clip bg-[#F8FAFC]"
    >
      {/* FULL BACKGROUND ILLUSTRATION */}
      <motion.div 
        className="absolute inset-0 z-0 overflow-hidden"
        initial={!prefersReducedMotion ? { scale: 0.98 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ y: videoScrollY, x: bgParallaxX }}
      >
        <div className="absolute inset-0 bg-[#F8FAFC] -z-10" />
        <motion.div style={{ y: bgParallaxY }} className="w-full h-full">
          <img
            src="/hero-cafe-illustration.jpg"
            alt="Campus Cafe Isometric Illustration"
            className="w-full h-full object-cover object-center opacity-85"
          />
        </motion.div>
        {/* Soft, airy frosted gradient overlay so typography and central elements pop */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/45 to-white/80 pointer-events-none" />
        {/* Subtle top gradient for navbar readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-transparent h-36 pointer-events-none" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[100svh] pt-24 sm:pt-28 pb-12 w-full overflow-hidden">
        
        {/* Inner positioning wrapper for parallax */}
        <div className="relative w-full max-w-4xl flex flex-col items-center justify-center">
          
          {/* Cursive Annotation (Layer 4) */}
          <motion.div 
            className="absolute -top-9 sm:-top-11 md:-top-12 left-[38%] sm:left-[42%] md:left-[44%] -rotate-3 z-40 pointer-events-none scale-95 sm:scale-100 origin-bottom-left"
            style={{ x: textParallaxX, y: textParallaxY }}
          >
            <AnimatedAnnotation delay={0.15} />
          </motion.div>

          {/* MASSIVE TYPOGRAPHY (Layer 3) */}
          <motion.div 
            className="z-30 text-center relative pointer-events-none flex flex-col items-center w-full"
            style={{ y: textScrollY, x: textParallaxX }}
          >
            <h1 
              className="text-[13vw] sm:text-[11vw] lg:text-[112px] xl:text-[124px] font-black tracking-normal leading-[0.88] uppercase flex flex-col items-center drop-shadow-sm w-full"
              style={{ fontFamily: 'var(--font-anton)' }}
            >
              <div className="flex gap-2.5 sm:gap-5 py-0.5 sm:py-1 text-[#0F172A] justify-center">
                <motion.span 
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.35, staggerChildren: 0.1 }}
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
                className="text-[#0055D4] block py-0.5 sm:py-1 drop-shadow-sm text-center pointer-events-auto cursor-default relative group"
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
          </motion.div>

          {/* Description Text */}
          <motion.p 
            className="text-[14px] sm:text-[16px] md:text-[17px] text-[#334155] max-w-[480px] font-medium leading-relaxed text-center mt-5 sm:mt-6 px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            style={{ y: textScrollY, x: textParallaxX }}
          >
            Grabbit is a 10-minute cafe pickup app. Order ahead at your favorite local spots. Your coffee should be ready when you arrive.
          </motion.p>

          {/* INTERACTIVE STEPPER SYSTEM */}
          <motion.div 
            className="flex items-start justify-between sm:justify-center gap-1 sm:gap-6 md:gap-14 mt-7 sm:mt-8 z-40 w-full max-w-[380px] sm:max-w-[480px] relative px-2 sm:px-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
            style={{ y: textScrollY }}
            onMouseEnter={() => setIsStepperHovered(true)}
            onMouseLeave={() => setIsStepperHovered(false)}
          >
            {/* Connecting Dashed Line Track */}
            <div className="absolute top-[14px] left-[14%] right-[14%] sm:left-[15%] sm:right-[15%] h-[1px] border-t-2 border-dashed border-[#0055D4]/20 -z-10" />
            
            {/* Progress Indicator Dot */}
            {!prefersReducedMotion && (
              <motion.div 
                className="absolute top-[10px] w-2 h-2 rounded-full bg-[#0055D4] shadow-[0_0_8px_rgba(0,85,212,0.5)] -z-10"
                animate={{
                  left: activeStep === 1 ? '16%' : activeStep === 2 ? '50%' : '84%',
                  x: '-50%' // center on the tick
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            )}

            {[
              { num: 1, label: "First in line" },
              { num: 2, label: "Zero wait" },
              { num: 3, label: "Ready for pickup" }
            ].map((step) => {
              const isActive = activeStep === step.num;
              return (
                <div 
                  key={step.num} 
                  className="flex flex-col items-center gap-2 sm:gap-3 flex-1 cursor-pointer group"
                  onClick={() => setActiveStep(step.num)}
                >
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

          {/* Bottom CTA with micro-animations */}
          <motion.div 
            className="relative z-50 mt-6 sm:mt-8 flex items-center justify-center gap-4 shrink-0"
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
            >
              <Link 
                href="/home"
                className="px-8 sm:px-9 py-3.5 sm:py-4 bg-[#0055D4] text-white rounded-full font-bold text-base sm:text-lg transition-all shadow-[0_8px_30px_rgb(0,85,212,0.4)] flex items-center justify-center gap-3 group hover:shadow-[0_12px_40px_rgb(0,85,212,0.5)] hover:bg-[#0040A1] active:scale-95"
              >
                <motion.span
                  whileHover={{ y: -1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Order Now
                </motion.span>
                <motion.div
                  animate={!prefersReducedMotion ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ x: 6 }}
                >
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
