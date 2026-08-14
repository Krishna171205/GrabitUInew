'use client';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MS } from '@/components/gb/kit';

export default function LandingNav() {
  const { scrollY } = useScroll();

  const margin = useTransform(scrollY, [0, 100], ['20px auto 0', '12px auto 0']);
  const width = useTransform(scrollY, [0, 100], ['92%', 'calc(100% - 32px)']);
  const boxShadow = useTransform(
    scrollY,
    [0, 100],
    ['0 8px 24px rgba(0,0,0,0.12)', '0 12px 32px rgba(0,0,0,0.22)']
  );

  return (
    <motion.header
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
          background: '#1A1311',
          boxShadow,
          borderRadius: 999,
          height: 64,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'auto',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Left: Brand Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/transparent-image.svg" alt="Grabbit." style={{ height: 38, width: 'auto', display: 'block' }} />
        </Link>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            aria-label="Toggle theme"
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FDFBF7',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            className="hover:bg-white/10"
          >
            <MS name="dark_mode" size={18} />
          </button>
          
          <Link
            href="/home"
            style={{
              background: '#F09819',
              color: '#1A1311',
              fontSize: 14,
              fontWeight: 700,
              padding: '10px 20px',
              borderRadius: 999,
              transition: 'background 0.2s',
            }}
            className="hover:bg-[#FFB100]"
          >
            Browse Cafés
          </Link>
        </div>
      </motion.nav>
    </motion.header>
  );
}
