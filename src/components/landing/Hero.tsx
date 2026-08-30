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
      className="relative min-h-[100svh] flex flex-col items-center justify-start overflow-x-clip bg-[#EAE9E4] pt-24 sm:pt-28 lg:pt-20 pb-4 sm:pb-6 lg:pb-3"
    >
      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 flex flex-col items-center justify-start h-full gap-1 sm:gap-2 lg:gap-3">

        {/* LAYER 1: TYPOGRAPHY */}
        <div className="z-30 text-center relative pointer-events-none flex flex-col items-center w-full mt-4 lg:mt-2 order-1">
          <h1
            className="text-[14vw] sm:text-[8vw] lg:text-[76px] xl:text-[88px] font-black tracking-normal leading-[0.9] uppercase flex flex-col items-center drop-shadow-sm w-fit"
            style={{ fontFamily: 'var(--font-anton)' }}
          >
            {/* Cursive annotation, stacked in normal flow above the headline so it
                never has to chase the headline's own vw-scaled size across breakpoints. */}
            <div className="-rotate-[3deg] -translate-x-[70%] sm:-translate-x-[90%] lg:-translate-x-[115%] scale-90 lg:scale-100 pointer-events-none whitespace-nowrap normal-case tracking-normal mb-1 lg:mb-2">
              <Annotation
                text="skip the queue"
                arrowDirection="down-right"
                delay={0.1}
                color="#0055D4"
              />
            </div>

            <div className="flex flex-row gap-2 sm:gap-4 lg:gap-5 text-[#0F172A] justify-center relative">
              <motion.span
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
                className="block pointer-events-auto cursor-default hover:text-[#0055D4] transition-colors duration-300 relative"
              >
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
              className="block text-[#1A1C23] font-normal lowercase tracking-normal self-center my-0 sm:my-1 lg:my-1 relative z-10"
              style={{ fontFamily: 'var(--font-caveat)', fontSize: '0.7em', lineHeight: '1' }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
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
                delay: 0.4,
                type: 'spring', stiffness: 220, damping: 22
              }}
            >
              GRABBIT.
            </motion.span>
          </h1>
        </div>

        {/* LAYER 2: VISUAL ARTWORK (Video) */}
        <motion.div
          className="relative z-20 w-full max-w-[1400px] lg:max-w-[560px] h-[26vh] sm:h-[50vh] lg:h-[32vh] flex items-center justify-center mt-2 lg:mt-2 mb-1 sm:mb-2 lg:mb-2 order-3 lg:order-3"
          initial={{ opacity: 0, y: -220, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15, mass: 0.9, delay: 0.45, opacity: { duration: 0.25, delay: 0.45 } }}
          style={{ y: videoScrollY }}
        >
          {/* Subtle ambient shadow behind the artwork */}
          <div className="absolute inset-0 bg-[#0055D4]/10 blur-[80px] rounded-[50%] scale-75 -z-10" />

          <div
            className="w-full h-full relative [mask-image:radial-gradient(ellipse_65%_65%_at_50%_50%,black_20%,transparent_80%)] [-webkit-mask-image:radial-gradient(ellipse_65%_65%_at_50%_50%,black_20%,transparent_80%)] lg:[mask-image:radial-gradient(ellipse_60%_300%_at_50%_50%,black_30%,transparent_95%)] lg:[-webkit-mask-image:radial-gradient(ellipse_60%_300%_at_50%_50%,black_30%,transparent_95%)]"
          >
            {/* Gentle continuous float animation on the video element itself */}
            <motion.video
              src="/grabv1.mp4"
              autoPlay
              loop
              muted
              playsInline
              animate={{
                y: [0, -12, 0],
                scale: [1.02, 1.04, 1.02]
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-full h-full object-cover object-[50%_60%] lg:object-contain lg:object-center absolute inset-0"
            />
          </div>
        </motion.div>

        {/* DESCRIPTION (Mobile: 2, Desktop: 2 — between headline and video) */}
        <motion.p
          className="order-2 lg:order-2 text-[13px] sm:text-[16px] md:text-[18px] text-[#334155] w-full max-w-[280px] lg:max-w-[900px] mx-auto font-medium leading-[1.6] lg:leading-relaxed text-center px-4 lg:px-0 pb-0 mt-3 lg:mt-2 z-30 relative"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
        >
          Any café, any time. Pickup in minutes, or delivered to you.
        </motion.p>

        {/* Flexible spacer: absorbs mobile's leftover viewport space so the CTA
            sits just above the fold instead of leaving a dead gap below it. */}
        <div className="order-4 lg:hidden w-full flex-1" aria-hidden="true" />

        {/* CTA BUTTON (Mobile: 5, Desktop: 3) */}
        <motion.div
          className="order-5 lg:order-4 relative flex items-center justify-center w-full mt-2 pb-6 sm:pb-8 lg:pb-0 z-30"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
        >
          <motion.div
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.96, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-[90%] sm:w-auto"
          >
            <Link
              href="/home"
              className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 lg:py-3 bg-[#0055D4] !text-white rounded-full font-bold text-[15px] sm:text-[16px] transition-colors shadow-[0_8px_20px_rgba(0,85,212,0.25)] flex items-center justify-center uppercase tracking-wide group hover:shadow-[0_16px_40px_rgba(0,85,212,0.4)]"
            >
              ORDER NOW
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
