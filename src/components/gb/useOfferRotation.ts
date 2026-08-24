'use client';
/**
 * Vertical carousel timing for the offer strips (cafe page and cart). Shared so both
 * rotate at the same pace and land the wrap-around the same way.
 */
import { useEffect, useState } from 'react';

/** How long each offer holds before the strip advances, and how long the slide runs. */
export const OFFER_HOLD_MS = 2000;
export const OFFER_SLIDE_MS = 420;

/**
 * Drives a track that renders `count` rows plus a copy of the first at the end: the
 * last-to-first step slides forward like every other one, then snaps back to 0 with
 * the transition off, which is invisible since it's the same pixels either way.
 * Rotation stops for a single offer, while `paused` is set, and under reduced motion.
 */
export function useOfferRotation(count: number, paused = false) {
  const [index, setIndex] = useState(0);
  const [sliding, setSliding] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reducedMotion) return;
    const timer = setInterval(() => setIndex((i) => i + 1), OFFER_HOLD_MS + OFFER_SLIDE_MS);
    return () => clearInterval(timer);
  }, [count, paused, reducedMotion]);

  useEffect(() => {
    if (index !== count) return;
    const timer = setTimeout(() => { setSliding(false); setIndex(0); }, OFFER_SLIDE_MS);
    return () => clearTimeout(timer);
  }, [index, count]);

  useEffect(() => {
    if (sliding) return;
    const raf = requestAnimationFrame(() => setSliding(true));
    return () => cancelAnimationFrame(raf);
  }, [sliding]);

  // The list can shrink under us (an offer expires mid-rotation), which would leave
  // the track scrolled past its end.
  return { index: index > count ? 0 : index, sliding };
}
