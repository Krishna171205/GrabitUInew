'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeNavbarProps {
  signedIn?: boolean;
  userName?: string | null;
  userAvatar?: string | null;
}

export default function HomeNavbar({ signedIn = false, userName, userAvatar }: HomeNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === '/home';
  const isExplore = pathname === '/explore';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#EAEFF5] transition-all">
      <div className="max-w-[1240px] mx-auto h-[74px] sm:h-[80px] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Grabbit Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
          <Image
            src="/new-logo.svg"
            alt="Grabbit"
            width={124}
            height={38}
            className="h-8 sm:h-9 w-auto object-contain"
            priority
          />
        </Link>

        {/* Right Desktop Nav: Home, Explore, Log in / Profile */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/home"
            className={`flex items-center gap-1.5 text-[15px] font-bold transition-colors ${
              isHome ? 'text-[#0055D4]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={isHome ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Home</span>
          </Link>

          <Link
            href="/explore"
            className={`flex items-center gap-1.5 text-[15px] font-bold transition-colors ${
              isExplore ? 'text-[#0055D4]' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Explore</span>
          </Link>

          {signedIn ? (
            <Link
              href="/profile"
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-[#0055D4] text-white flex items-center justify-center font-bold text-sm overflow-hidden shadow-xs">
                {userAvatar ? (
                  <Image src={userAvatar} alt="User Avatar" width={36} height={36} className="w-full h-full object-cover" />
                ) : (
                  <span>{(userName?.[0] || 'U').toUpperCase()}</span>
                )}
              </div>
              <span className="text-[14.5px] font-semibold text-[#1E293B]">
                {userName?.split(' ')[0] || 'Account'}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-[#0055D4] hover:bg-[#0040A1] active:scale-95 text-white font-bold text-[14px] px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(0,85,212,0.22)] transition-all"
            >
              <span>Log in</span>
              <span className="text-base leading-none">→</span>
            </Link>
          )}
        </nav>

        {/* Mobile Right: Hamburger ☰ Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-[#0F172A] transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown / Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[#EAEFF5] bg-white px-5 py-5 flex flex-col gap-3 shadow-lg"
          >
            <Link
              href="/home"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl font-bold text-[15.5px] transition-colors ${
                isHome ? 'bg-[#EBF3FF] text-[#0055D4]' : 'text-[#1E293B] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </div>
              <span>→</span>
            </Link>

            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between p-3 rounded-xl font-bold text-[15.5px] transition-colors ${
                isExplore ? 'bg-[#EBF3FF] text-[#0055D4]' : 'text-[#1E293B] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Explore Cafés</span>
              </div>
              <span>→</span>
            </Link>

            <div className="pt-2 border-t border-slate-100">
              {signedIn ? (
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-[#1E293B] font-bold text-[15px]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#0055D4] text-white flex items-center justify-center text-xs">
                      {userAvatar ? (
                        <Image src={userAvatar} alt="Avatar" width={28} height={28} className="rounded-full" />
                      ) : (
                        <span>{(userName?.[0] || 'U').toUpperCase()}</span>
                      )}
                    </div>
                    <span>{userName || 'My Profile'}</span>
                  </div>
                  <span>→</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#0055D4] text-white font-bold text-[15px] py-3 rounded-xl shadow-md"
                >
                  <span>Log in</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
