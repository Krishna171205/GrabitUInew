'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HomeHero() {
  return (
    <section className="w-full">
      {/* Glassmorphic card without any borders using exact #B8D5FF swatch */}
      <div
        className="relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden px-6 sm:px-10 lg:px-14 py-6 sm:py-8 lg:py-10"
        style={{
          background: 'linear-gradient(135deg, rgba(184, 213, 255, 0.95) 0%, rgba(202, 226, 255, 0.82) 50%, rgba(184, 213, 255, 0.92) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 20px 45px -15px rgba(184, 213, 255, 0.65), 0 8px 25px -6px rgba(0, 85, 212, 0.08)',
          border: 'none',
        }}
      >
        {/* Subtle, restrained ambient sparks */}
        <div className="absolute top-6 left-1/3 text-[#0055D4]/20 pointer-events-none select-none text-xs">
          ✦
        </div>
        <div className="absolute bottom-8 left-1/4 text-[#0055D4]/15 pointer-events-none select-none text-xs">
          ★
        </div>

        {/* Content Layout: 38/62 Split between Typography and Illustration */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center min-h-[320px] sm:min-h-[360px] lg:min-h-[390px]">
          
          {/* Left Side: Minimal, Creative Editorial Typography */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-center items-start pl-1 sm:pl-2 lg:pl-4">
            {/* White Handwritten Cursive Accent */}
            <span
              className="text-white text-[32px] sm:text-[42px] lg:text-[48px] font-bold -rotate-2 select-none mb-1 sm:mb-2 drop-shadow-xs"
              style={{ fontFamily: 'var(--font-caveat)' }}
            >
              Home
            </span>

            {/* Confident 2-Line Headline in Title Case Anton */}
            <h1
              className="text-[60px] sm:text-[76px] lg:text-[88px] xl:text-[98px] leading-[0.9] tracking-tight select-none flex flex-col"
              style={{ fontFamily: 'var(--font-anton)' }}
            >
              <span className="text-[#0F172A] block">Explore</span>
              <span className="text-[#0055D4] block">Cafe&apos;s</span>
            </h1>
          </div>

          {/* Right Side: Cafe Doodle illustration grounded and filling the remaining space */}
          <div className="lg:col-span-7 xl:col-span-8 relative w-full flex items-end justify-center lg:justify-end mt-2 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative w-full max-w-[620px] lg:max-w-none aspect-[16/9.5] sm:aspect-[16/9] lg:aspect-[16/8.8] flex items-end justify-center"
            >
              <Image
                src="/raydee doodle/ae15515d-b09a-46df-9ec3-3dc9f30ca1f0.png"
                alt="Grabbit Cafe Discovery Illustration"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 850px"
                className="object-contain object-bottom mix-blend-multiply filter drop-shadow-xs select-none pointer-events-none"
              />
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}
