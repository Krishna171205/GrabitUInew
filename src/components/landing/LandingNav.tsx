'use client';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MS } from '@/components/gb/kit';

export default function LandingNav() {
  const { scrollY } = useScroll();

  // Lowered navbar margin for better spacing on mobile & desktop
  const margin = useTransform(scrollY, [0, 100], ['18px auto 0', '10px auto 0']);
  const width = useTransform(scrollY, [0, 100], ['calc(100% - 24px)', 'calc(100% - 32px)']);
  const boxShadow = useTransform(
    scrollY,
    [0, 100],
    ['0 8px 24px rgba(0,0,0,0.12)', '0 12px 32px rgba(0,0,0,0.22)']
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <motion.nav
        style={{
          maxWidth: 1120,
          width,
          margin,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow,
          borderRadius: 999,
          pointerEvents: 'auto',
          border: '1px solid rgba(15, 23, 42, 0.1)',
        }}
        className="h-14 sm:h-16 px-3.5 sm:px-5 flex items-center justify-between transition-all duration-300"
      >
        {/* Left: Brand Logo with micro-interaction */}
        <Link href="/" className="flex items-center shrink-0">
          <motion.img 
            src="/new-logo.svg" 
            alt="Grabbit." 
            className="h-7 sm:h-9 w-auto block object-contain"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          />
        </Link>

        {/* Right: Actions with micro-animations */}
        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          <motion.button
            type="button"
            aria-label="Toggle theme"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/[0.04] border border-slate-900/10 flex items-center justify-center text-[#0F172A] cursor-pointer hover:bg-slate-100 transition-colors shrink-0"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9, rotate: -15 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <MS name="dark_mode" size={16} />
          </motion.button>
          
          <motion.div
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link
              href="/home"
              className="bg-[#0055D4] hover:bg-[#0040A1] text-white text-xs sm:text-sm font-bold px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full transition-colors shadow-sm hover:shadow active:scale-95 whitespace-nowrap block"
            >
              Browse Cafés
            </Link>
          </motion.div>
        </div>
      </motion.nav>
    </motion.header>
  );
}
