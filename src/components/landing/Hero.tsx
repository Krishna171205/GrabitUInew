'use client';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { Annotation } from './Annotation';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Scroll parallax effects
  const { scrollY } = useScroll();
  const videoScrollY = useTransform(scrollY, [0, 500], [0, 60]);

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
      className="relative min-h-[100svh] flex flex-col items-center lg:items-start justify-center overflow-x-clip bg-[#EAE9E4] pt-24 sm:pt-32 pb-8 sm:pb-12"
    >
      {/* DESKTOP BACKGROUND VIDEO */}
      <motion.div 
        className="absolute inset-0 z-0 overflow-hidden hidden lg:flex justify-center"
        initial={!prefersReducedMotion ? { scale: 0.98 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ y: videoScrollY }}
      >
        <div className="absolute inset-0 bg-[#EAE9E4] -z-10" />
        <div className="w-full lg:w-[85%] h-full relative">
          <div className="absolute inset-y-0 left-0 w-[40%] bg-gradient-to-r from-[#EAE9E4] via-[#EAE9E4]/95 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-[40%] bg-gradient-to-l from-[#EAE9E4] via-[#EAE9E4]/95 to-transparent z-10 pointer-events-none" />
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

      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-col items-center justify-center h-full pt-4 lg:pt-0">
        
        {/* LEFT COLUMN: TEXT & CTA */}
        <div className="relative w-full flex flex-col items-center justify-center z-20 flex-1">
          
          <div className="z-30 text-center relative pointer-events-none flex flex-col items-center w-full mt-2 lg:mt-0">
            <h1 
              className="text-[14vw] sm:text-[9vw] lg:text-[84px] xl:text-[96px] font-black tracking-normal leading-[0.9] uppercase flex flex-col items-center drop-shadow-sm w-fit"
              style={{ fontFamily: 'var(--font-anton)' }}
            >
              <div className="flex flex-row gap-2 sm:gap-4 lg:gap-5 text-[#0F172A] justify-center">
                <motion.span 
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.1 }}
                  className="block pointer-events-auto cursor-default hover:text-[#0055D4] transition-colors duration-300 relative"
                >
                  {/* Cursive Annotation anchored to ORDER */}
                  <div className="absolute -top-[70px] sm:-top-[90px] lg:-top-[110px] xl:-top-[130px] -left-2 sm:left-2 lg:left-6 z-50 -rotate-[8deg] scale-75 sm:scale-90 lg:scale-100 pointer-events-none whitespace-nowrap normal-case tracking-normal">
                    <Annotation 
                      text="skip the queue" 
                      arrowDirection="down-right" 
                      delay={0.5}
                      color="#0055D4"
                    />
                  </div>
                  ORDER
                </motion.span>
                <motion.span 
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                  className="block pointer-events-auto cursor-default hover:text-[#0055D4] transition-colors duration-300"
                >
                  AHEAD
                </motion.span>
              </div>
              
              <motion.span 
                className="block text-[#1A1C23] font-normal lowercase tracking-normal self-center my-1 sm:my-3 lg:my-5"
                style={{ fontFamily: 'var(--font-caveat)', fontSize: '0.7em', lineHeight: '1' }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
              >
                with
              </motion.span>

              <motion.span 
                className="text-[#0055D4] block drop-shadow-sm pointer-events-auto cursor-default relative origin-center self-center"
                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.015 }}
                transition={{ 
                  duration: 0.7, 
                  delay: 0.3, 
                  type: 'spring', stiffness: 220, damping: 22 
                }}
              >
                GRABBIT.
              </motion.span>
            </h1>
          </div>

          <motion.p 
            className="text-[14px] sm:text-[17px] md:text-[18px] text-[#334155] max-w-[480px] font-medium leading-relaxed text-center mt-2 sm:mt-8 px-4 lg:px-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            Grabbit is a 10-minute cafe pickup app. Order ahead at your favorite local spots. Your coffee should be ready when you arrive.
          </motion.p>

          {/* MOBILE INLINE VIDEO */}
          <motion.div 
            className="w-full flex lg:hidden items-center justify-center my-2 relative z-10 flex-1 min-h-[140px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          >
            <div 
              className="w-full max-w-[450px] aspect-[4/5] relative"
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 50%, transparent 100%)',
                maskImage: 'radial-gradient(ellipse 75% 75% at 50% 50%, black 50%, transparent 100%)'
              }}
            >
               <video 
                 src="/grabv1.mp4" 
                 autoPlay 
                 loop 
                 muted 
                 playsInline 
                 className="w-full h-full object-cover absolute inset-0"
               />
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div 
            className="relative z-50 mt-2 lg:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full pb-4 lg:pb-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-[90%] sm:w-auto"
            >
              <Link 
                href="/home"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-4 bg-[#0055D4] text-white rounded-full font-bold text-[15px] sm:text-lg transition-all shadow-[0_8px_30px_rgb(0,85,212,0.3)] flex items-center justify-center group hover:shadow-[0_12px_40px_rgb(0,85,212,0.4)] hover:bg-[#0040A1] active:scale-95 uppercase tracking-wide"
                style={{ color: '#FFFFFF' }}
              >
                ORDER NOW
              </Link>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
