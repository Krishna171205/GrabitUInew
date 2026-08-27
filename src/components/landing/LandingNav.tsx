// grabbit/src/components/landing/LandingNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MS } from '@/components/gb/kit';
import { useSmoothScroll } from '@/components/SmoothScroll';

export default function LandingNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollTo } = useSmoothScroll();

  const navLinks = [
    { href: '/', targetId: '#hero', label: 'HOME' },
    { href: '#preview', targetId: '#preview', label: 'MENU' },
    { href: '#how-it-works', targetId: '#how-it-works', label: 'ABOUT' },
    { href: '/partner', label: 'FOR CAFÉS' },
    { href: '/faq', label: 'CONTACT' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: '#0055D4',
        boxShadow: '0 4px 20px -2px rgba(0, 85, 212, 0.4)',
      }}
    >
      <nav
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          height: 76,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* NEW GRABBIT LOGO */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            transition: 'transform 0.2s ease',
          }}
          className="hover:opacity-90 active:scale-95"
        >
          <Image 
            src="/new-logo.svg" 
            alt="Grabbit Logo" 
            width={120} 
            height={40} 
            className="object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </Link>

        {/* Right Navigation Links (Desktop) */}
        <div
          style={{
            alignItems: 'center',
            gap: 12,
          }}
          className="hidden md:flex"
        >
          {navLinks.map((link) => {
            const isHash = link.href.startsWith('#');
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : isHash
                ? false
                : pathname === link.href;

            const handleClick = (e: React.MouseEvent) => {
              if (pathname === '/') {
                if (link.href === '/') {
                  e.preventDefault();
                  scrollTo(0, { duration: 1.3 });
                } else if (isHash) {
                  e.preventDefault();
                  scrollTo(link.href, { offset: -76, duration: 1.3 });
                }
              }
            };

            if (isActive) {
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={handleClick}
                  style={{
                    background: '#FFFFFF',
                    color: '#0055D4',
                    fontWeight: 900,
                    fontSize: 13,
                    letterSpacing: '0.1em',
                    padding: '9px 24px',
                    borderRadius: 9999,
                    textDecoration: 'none',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {link.label}
                </Link>
              );
            }

            return (
              <a
                key={link.label}
                href={link.href}
                onClick={handleClick}
                style={{
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: '0.1em',
                  padding: '9px 20px',
                  borderRadius: 9999,
                  textDecoration: 'none',
                  opacity: 0.95,
                  transition: 'all 0.2s ease',
                }}
                className="hover:opacity-100 hover:bg-white/15 cursor-pointer"
              >
                {link.label}
              </a>
            );
          })}

          {/* ORDER NOW CTA button */}
          <Link
            href="/home"
            style={{
              border: '2px solid #FFFFFF',
              background: '#FFFFFF',
              color: '#0055D4',
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: '0.12em',
              padding: '9px 24px',
              borderRadius: 9999,
              textDecoration: 'none',
              marginLeft: 8,
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              transition: 'transform 0.15s ease, background 0.15s ease',
            }}
            className="hover:scale-[1.04] active:scale-95"
          >
            ORDER NOW
          </Link>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden relative z-50 focus:outline-none"
          aria-label="Toggle menu"
          style={{
            background: 'transparent',
            border: 'none',
            width: 40,
            height: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <motion.div
            animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ width: 24, height: 2, background: '#FFFFFF', borderRadius: 999, transformOrigin: 'center' }}
          />
          <motion.div
            animate={mobileMenuOpen ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{ width: 24, height: 2, background: '#FFFFFF', borderRadius: 999, transformOrigin: 'center' }}
          />
          <motion.div
            animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ width: 24, height: 2, background: '#FFFFFF', borderRadius: 999, transformOrigin: 'center' }}
          />
        </button>
      </nav>

      {/* Full-Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#0055D4',
              zIndex: 40, // Below header which is 50
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '80px 24px 40px', // padding top to clear header
            }}
            className="md:hidden overflow-y-auto"
          >
            <div className="flex flex-col items-center gap-6 w-full max-w-sm">
              {navLinks.map((link, i) => {
                const isHash = link.href.startsWith('#');
                const isActive = link.href === '/' ? pathname === '/' : isHash ? false : pathname === link.href;

                const handleMobileClick = (e: React.MouseEvent) => {
                  setMobileMenuOpen(false);
                  if (pathname === '/') {
                    if (link.href === '/') {
                      e.preventDefault();
                      scrollTo(0, { duration: 1.2 });
                    } else if (isHash) {
                      e.preventDefault();
                      scrollTo(link.href, { offset: -76, duration: 1.2 });
                    }
                  }
                };

                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    className="w-full text-center"
                  >
                    <Link
                      href={link.href}
                      onClick={handleMobileClick}
                      style={{
                        display: 'block',
                        color: isActive ? '#0055D4' : '#FFFFFF',
                        background: isActive ? '#FFFFFF' : 'transparent',
                        fontWeight: 900,
                        fontSize: 24, // Larger for full-screen
                        letterSpacing: '0.1em',
                        padding: '16px 20px',
                        borderRadius: 16,
                        textDecoration: 'none',
                        transition: 'background 0.2s, color 0.2s',
                      }}
                      className={isActive ? '' : 'hover:bg-white/10 active:bg-white/20'}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: navLinks.length * 0.08 + 0.1, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="w-full mt-4"
              >
                <Link
                  href="/home"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    background: '#FFFFFF',
                    color: '#0055D4',
                    fontWeight: 900,
                    fontSize: 20,
                    letterSpacing: '0.12em',
                    padding: '18px 24px',
                    borderRadius: 16,
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  className="active:scale-[0.96]"
                >
                  ORDER NOW
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


