'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const SEARCH_SUGGESTIONS = [
  'Search "rolls"',
  'Search "momo"',
  'Search "coffee"',
  'Search "burgers"',
  'Search "sandwiches"',
  'Search "cold brew"',
  'Search "shakes"',
  'Search "pizza"',
  'Search "maggi"',
  'Search "waffles"',
  'Search cafés, dishes, drinks',
];

export interface HomeHeroProps {
  me?: {
    name: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null;
  address?: {
    label: string;
    shortText: string;
  } | null;
}

export default function HomeHero({ me, address }: HomeHeroProps) {
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const firstName = me?.name?.trim()?.split(' ')[0] || null;
  const locationLabel = address?.label || 'DTU, Delhi';

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetingText = firstName ? `${timeGreeting}, ${firstName}` : 'Welcome To Grabbit';

  return (
    <section className="w-full flex flex-col gap-3.5">
      {/* ========================================================================= */}
      {/* MOBILE HERO LAYOUT (< md): Faithful to Image 1 Structure + Image 2 Content */}
      {/* ========================================================================= */}
      <div className="md:hidden flex flex-col gap-3 w-full">
        {/* Mobile Header: Blue colored like navbar */}
        <div className="-mx-4 -mt-3 px-4 pt-3.5 pb-3.5 bg-[#0055D4] text-white shadow-[0_4px_20px_-2px_rgba(0,85,212,0.4)] flex items-center justify-between sticky top-0 z-30">
          <div className="flex flex-col">
            {/* Location selector from Image 2 */}
            <Link
              href="/location"
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white/90 hover:text-white transition-opacity"
            >
              <svg className="w-4 h-4 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="text-white font-extrabold">{locationLabel}</span>
              <span className="text-[10px] text-white/70 font-bold ml-0.5">▼</span>
            </Link>

            {/* Greeting from Image 1 & 2 */}
            <h1 className="text-[19px] font-black text-white tracking-tight mt-0.5 leading-snug">
              {greetingText}
            </h1>
          </div>

          {/* User Avatar from Image 2 */}
          <Link
            href={me ? '/profile' : '/login'}
            className="relative w-10.5 h-10.5 rounded-full border-2 border-white shadow-[0_2px_10px_rgba(0,0,0,0.15)] bg-gradient-to-br from-[#FFE4E6] to-[#FECDD3] flex items-center justify-center overflow-hidden shrink-0 active:scale-95 transition-transform"
            aria-label="Profile"
          >
            {me?.avatar_url ? (
              <Image
                src={me.avatar_url}
                alt="Profile"
                fill
                sizes="44px"
                className="object-cover"
              />
            ) : (
              <span className="text-[22px] select-none">😊</span>
            )}
          </Link>
        </div>

        {/* Search Bar placed just below the blue nav bar */}
        <Link
          href="/explore"
          className="w-full bg-white rounded-[18px] px-4 py-3.5 flex items-center gap-3 border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] active:scale-[0.99] transition-all group"
        >
          <svg
            className="w-5 h-5 text-slate-400 group-hover:text-[#0055D4] transition-colors shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <div className="relative h-5 overflow-hidden flex-1 flex items-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={suggestionIndex}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="text-[14.5px] text-slate-400 font-medium truncate block absolute left-0"
              >
                {SEARCH_SUGGESTIONS[suggestionIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </Link>

        {/* The Signature Light-Blue Rounded Hero Card from Image 1 */}
        <div
          className="relative w-full rounded-[28px] overflow-hidden px-4 pt-5 pb-4 flex flex-col items-center shadow-[0_8px_25px_rgba(0,85,212,0.08)]"
          style={{
            background: 'linear-gradient(180deg, #D7E7FE 0%, #C6DFFE 100%)',
          }}
        >
          {/* Creative Anton Headline: Explore Cafe's */}
          <div className="flex items-center justify-center gap-2 select-none mb-1">
            <span
              className="text-[38px] leading-none tracking-tight text-[#0F172A]"
              style={{ fontFamily: 'var(--font-anton)' }}
            >
              Explore
            </span>
            <span
              className="text-[38px] leading-none tracking-tight text-[#0055D4]"
              style={{ fontFamily: 'var(--font-anton)' }}
            >
              Cafe&apos;s
            </span>
          </div>

          {/* Cafe Kiosk Doodle Illustration centered */}
          <div className="relative w-full h-[185px] max-w-[310px] my-1 flex items-end justify-center">
            <Image
              src="/raydee doodle/ae15515d-b09a-46df-9ec3-3dc9f30ca1f0.png"
              alt="Explore Cafes"
              fill
              priority
              unoptimized
              sizes="340px"
              className="object-contain object-bottom mix-blend-multiply drop-shadow-xs pointer-events-none select-none"
            />
          </div>

          {/* Blue Sign-In / Pass Pill at bottom of hero card */}
          <Link
            href={me ? '/profile' : '/login'}
            className="w-full bg-[#0055D4] hover:bg-[#0047B3] text-white rounded-[20px] p-2.5 px-3.5 flex items-center gap-3 shadow-[0_6px_18px_rgba(0,85,212,0.28)] active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0055D4] shrink-0 shadow-xs">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[13.5px] font-extrabold text-white truncate leading-tight">
                {me ? `Grabbit Pass · ${firstName || 'Account'}` : 'Sign in to unlock your Grabbit'}
              </span>
              <span className="text-[11px] text-white/85 font-medium truncate mt-0.5">
                Reorder, save favourites &amp; track pickups
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP HERO LAYOUT (>= md): Editorial 38/62 Split with Mobile Vibe */}
      {/* ========================================================================= */}
      <div className="hidden md:block w-full">
        <div
          className="relative w-full rounded-[32px] lg:rounded-[36px] overflow-hidden px-8 lg:px-12 py-8 lg:py-10 border border-[#BED8FE]/80 shadow-[0_16px_40px_-10px_rgba(0,85,212,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]"
          style={{
            background: 'linear-gradient(135deg, #D7E7FE 0%, #C6DFFE 50%, #E2EEFE 100%)',
          }}
        >
          <div className="relative z-10 grid grid-cols-12 gap-6 items-center min-h-[380px] lg:min-h-[410px]">
            {/* Left Typography, Search & Pass Pill */}
            <div className="col-span-6 xl:col-span-5 flex flex-col justify-center items-start pl-2 lg:pl-4">
              {/* Handwritten Greeting Accent */}
              <span
                className="inline-block text-[#0055D4] text-[23px] lg:text-[26px] font-bold -rotate-[3.5deg] origin-bottom-left select-none mb-1 drop-shadow-xs"
                style={{ fontFamily: 'var(--font-caveat)' }}
              >
                order ahead &amp; skip the queue
              </span>

              {/* Bold Anton Headline */}
              <h1
                className="text-[64px] lg:text-[78px] xl:text-[86px] leading-[0.92] tracking-tight select-none flex flex-wrap gap-x-4 mb-5"
                style={{ fontFamily: 'var(--font-anton)' }}
              >
                <span className="text-[#0F172A] block">Explore</span>
                <span className="text-[#0055D4] block">Cafe&apos;s</span>
              </h1>

              {/* Animated Rotating Search Bar */}
              <Link
                href="/explore"
                className="w-full max-w-[430px] bg-white rounded-[20px] px-4.5 py-3.5 flex items-center gap-3 border border-slate-200/90 shadow-[0_4px_18px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_24px_rgba(0,85,212,0.14)] hover:border-[#0055D4]/40 active:scale-[0.99] transition-all group"
              >
                <svg
                  className="w-5 h-5 text-slate-400 group-hover:text-[#0055D4] transition-colors shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <div className="relative h-5 overflow-hidden flex-1 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={suggestionIndex}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="text-[14.5px] text-slate-400 font-medium truncate block absolute left-0"
                    >
                      {SEARCH_SUGGESTIONS[suggestionIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                  Search
                </span>
              </Link>

              {/* Signature Grabbit Pass Pill (Matching Mobile Card) */}
              <Link
                href={me ? '/profile' : '/login'}
                className="w-full max-w-[430px] mt-4 bg-[#0055D4] hover:bg-[#0047B3] text-white rounded-[20px] p-2.5 px-3.5 flex items-center gap-3 shadow-[0_6px_20px_rgba(0,85,212,0.28)] hover:shadow-[0_8px_25px_rgba(0,85,212,0.36)] active:scale-[0.98] transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0055D4] shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[13.5px] font-extrabold text-white truncate leading-tight">
                    {me ? `Grabbit Pass · ${firstName || 'Account'}` : 'Sign in to unlock your Grabbit'}
                  </span>
                  <span className="text-[11px] text-white/85 font-medium truncate mt-0.5">
                    Reorder, save favourites &amp; track pickups
                  </span>
                </div>
                <span className="ml-auto text-white/80 group-hover:translate-x-1 transition-transform text-base pr-1">→</span>
              </Link>
            </div>

            {/* Right Illustration */}
            <div className="col-span-6 xl:col-span-7 relative w-full flex items-end justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="relative w-full aspect-[16/10] lg:aspect-[16/9.5] flex items-end justify-center"
              >
                <Image
                  src="/raydee doodle/ae15515d-b09a-46df-9ec3-3dc9f30ca1f0.png"
                  alt="Grabbit Cafe Discovery Illustration"
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1200px) 55vw, 750px"
                  className="object-contain object-bottom mix-blend-multiply filter drop-shadow-xs select-none pointer-events-none"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
