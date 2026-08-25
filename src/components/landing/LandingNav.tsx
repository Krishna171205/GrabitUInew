// grabbit/src/components/landing/LandingNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
        {/* KOFIKAFI Style Stadium/Pill Outline Logo Badge */}
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            border: '2.5px solid #FFFFFF',
            borderRadius: 9999,
            padding: '7px 22px',
            color: '#FFFFFF',
            textDecoration: 'none',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
          }}
          className="hover:bg-white/10 active:scale-95"
        >
          <MS name="local_cafe" size={24} color="#FFFFFF" fill />
          <span
            style={{
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-headline), system-ui, sans-serif',
              lineHeight: 1,
            }}
          >
            GRABBIT
          </span>
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
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <MS name={mobileMenuOpen ? 'close' : 'menu'} size={28} color="#FFFFFF" />
        </button>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#0055D4',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
          className="md:hidden"
        >
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: isActive ? '#0055D4' : '#FFFFFF',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  fontWeight: 900,
                  fontSize: 14,
                  letterSpacing: '0.1em',
                  padding: '10px 20px',
                  borderRadius: 9999,
                  textDecoration: 'none',
                  width: 'fit-content',
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/home"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: '#FFFFFF',
              color: '#0055D4',
              fontWeight: 900,
              fontSize: 14,
              letterSpacing: '0.12em',
              padding: '12px 24px',
              borderRadius: 9999,
              textDecoration: 'none',
              textAlign: 'center',
              marginTop: 8,
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}
          >
            ORDER NOW
          </Link>
        </div>
      )}
    </header>
  );
}


