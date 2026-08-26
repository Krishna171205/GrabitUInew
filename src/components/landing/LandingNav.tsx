// grabbit/src/components/landing/LandingNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MS } from '@/components/gb/kit';

export default function LandingNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/home', label: 'MENU' },
    { href: '#how-it-works', label: 'ABOUT' },
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
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : link.href.startsWith('#')
                ? false
                : pathname === link.href;

            if (isActive) {
              return (
                <Link
                  key={link.label}
                  href={link.href}
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
                className="hover:opacity-100 hover:bg-white/15"
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

      {/* Mobile Drawer Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -15, scaleY: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              position: 'absolute',
              top: 76,
              left: 0,
              right: 0,
              background: '#0055D4',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              padding: '16px 24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '0 12px 30px -5px rgba(0, 85, 212, 0.4)',
              transformOrigin: 'top center',
            }}
            className="md:hidden"
          >
            {navLinks.map((link, i) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname === link.href;
              return (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.04 + 0.05, duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'block',
                      color: isActive ? '#0055D4' : '#FFFFFF',
                      background: isActive ? '#FFFFFF' : 'transparent',
                      fontWeight: 900,
                      fontSize: 15,
                      letterSpacing: '0.1em',
                      padding: '12px 20px',
                      borderRadius: 12,
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                    }}
                    className={isActive ? '' : 'hover:bg-white/10'}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              );
            })}
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: navLinks.length * 0.04 + 0.1, duration: 0.2 }}
            >
              <Link
                href="/home"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  background: '#FFFFFF',
                  color: '#0055D4',
                  fontWeight: 900,
                  fontSize: 15,
                  letterSpacing: '0.12em',
                  padding: '14px 24px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  textAlign: 'center',
                  marginTop: 12,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                className="active:scale-[0.98]"
              >
                ORDER NOW
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


