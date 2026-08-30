'use client';

import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function ScrollParallaxBackground() {
  const { scrollY } = useScroll();

  // Smooth springs for buttery depth
  const smoothScroll = useSpring(scrollY, {
    stiffness: 80,
    damping: 25,
    mass: 0.1,
  });

  // Layered parallax transformations at different speeds
  const yLayer1 = useTransform(smoothScroll, [0, 4000], [0, -400]);
  const yLayer2 = useTransform(smoothScroll, [0, 4000], [0, 600]);
  const yLayer3 = useTransform(smoothScroll, [0, 4000], [0, -750]);
  const yLayer4 = useTransform(smoothScroll, [0, 4000], [0, 300]);
  const rotateLayer = useTransform(smoothScroll, [0, 4000], [0, 180]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep Atmospheric Gradient Glow 1 (Top Left) */}
      <motion.div
        style={{ y: yLayer1 }}
        className="absolute -top-[10%] -left-[10%] w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full bg-gradient-to-br from-blue-500/10 via-cyan-400/5 to-transparent blur-[120px] will-change-transform"
      />

      {/* Floating Orbital Glow 2 (Mid Right) */}
      <motion.div
        style={{ y: yLayer2, rotate: rotateLayer }}
        className="absolute top-[28%] -right-[15%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full bg-gradient-to-bl from-indigo-500/10 via-blue-600/5 to-transparent blur-[140px] will-change-transform"
      />

      {/* Radiant Spotlight Glow 3 (Lower Left) */}
      <motion.div
        style={{ y: yLayer3 }}
        className="absolute top-[60%] -left-[10%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-sky-400/10 via-blue-500/5 to-transparent blur-[130px] will-change-transform"
      />

      {/* Deep Bottom Ambient Glow 4 (Bottom Center) */}
      <motion.div
        style={{ y: yLayer4 }}
        className="absolute top-[85%] left-[20%] w-[800px] h-[600px] rounded-full bg-gradient-to-t from-blue-600/10 via-cyan-500/5 to-transparent blur-[160px] will-change-transform"
      />

      {/* Subtle Floating Geometrics */}
      <motion.div
        style={{ y: yLayer2, rotate: rotateLayer }}
        className="absolute top-[35%] left-[8%] w-24 h-24 rounded-3xl border border-blue-500/15 backdrop-blur-[2px] hidden lg:block"
      />
      <motion.div
        style={{ y: yLayer3 }}
        className="absolute top-[72%] right-[10%] w-32 h-32 rounded-full border border-cyan-400/20 backdrop-blur-[2px] hidden lg:block"
      />
    </div>
  );
}
