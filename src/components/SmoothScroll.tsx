'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollY: number;
  progress: number;
  velocity: number;
  direction: number;
  activeSection: string;
  scrollTo: (target: string | HTMLElement | number, options?: { offset?: number; duration?: number; immediate?: boolean }) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollY: 0,
  progress: 0,
  velocity: 0,
  direction: 0,
  activeSection: 'hero',
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [direction, setDirection] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');

  const scrollTo = useCallback((target: string | HTMLElement | number, options?: { offset?: number; duration?: number; immediate?: boolean }) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        offset: options?.offset ?? -76,
        duration: options?.duration ?? 1.4,
        immediate: options?.immediate ?? false,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-grade exponential deceleration
      });
    } else if (typeof window !== 'undefined') {
      if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Connect Lenis to RAF
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Track scroll events
    let lastSectionCheck = 0;
    const handleScroll = (e: { scroll: number; limit: number; velocity: number; direction: number; progress: number }) => {
      setScrollY(e.scroll);
      setProgress(e.progress);
      setVelocity(e.velocity);
      setDirection(e.direction);

      // Throttled section detector for active section navigation indicator
      const now = performance.now();
      if (now - lastSectionCheck > 100) {
        lastSectionCheck = now;
        const sections = ['hero', 'how-it-works', 'showcase', 'preview', 'partners', 'download'];
        const scrollMiddle = e.scroll + window.innerHeight * 0.35;

        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i]);
          if (el) {
            const rect = el.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            if (scrollMiddle >= top) {
              setActiveSection(sections[i]);
              break;
            }
          }
        }
      }
    };

    lenis.on('scroll', handleScroll);

    // Global anchor click listener for buttery smooth gliding to hashes
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const destination = document.querySelector(href);
        if (destination) {
          e.preventDefault();
          scrollTo(href, { offset: -76, duration: 1.4 });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [scrollTo]);

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisRef.current,
        scrollY,
        progress,
        velocity,
        direction,
        activeSection,
        scrollTo,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
