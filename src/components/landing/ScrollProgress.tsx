'use client';

import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useSmoothScroll } from '@/components/SmoothScroll';

export default function ScrollProgress() {
  const { progress, velocity } = useSmoothScroll();

  // Smooth spring for the progress bar to make it liquid-smooth
  const smoothProgress = useSpring(progress, {
    stiffness: 120,
    damping: 24,
    mass: 0.1,
  });

  // Calculate dynamic glow and size based on scrolling velocity
  const absVelocity = Math.min(Math.abs(velocity), 15);
  const glowIntensity = 8 + absVelocity * 2.5;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none h-[3.5px]">
      {/* Background track (Ultra faint) */}
      <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[1px]" />

      {/* Radiant progress line */}
      <motion.div
        className="h-full relative origin-left bg-gradient-to-r from-[#0055D4] via-[#2563EB] to-[#38BDF8]"
        style={{
          scaleX: smoothProgress,
          boxShadow: `0 0 ${glowIntensity}px rgba(56, 189, 248, 0.9), 0 0 ${glowIntensity * 1.8}px rgba(0, 85, 212, 0.6)`,
        }}
      >
        {/* Glowing Head Sparkle */}
        <div 
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white blur-[1px]"
          style={{
            boxShadow: '0 0 12px 3px rgba(255, 255, 255, 0.9), 0 0 20px 6px rgba(56, 189, 248, 0.8)',
          }}
        />
      </motion.div>
    </div>
  );
}
