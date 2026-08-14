'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useEffect } from 'react';

export function HeroProductStage({ children }: { children: ReactNode }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for fluid, premium parallax (Stripe/Linear style)
  // Ensure the damping is high enough so it doesn't bounce, just glides smoothly
  const springConfig = { damping: 40, stiffness: 120, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Extremely subtle 3D rotation (Max 1-2 degrees to feel completely grounded and premium)
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [1.5, -1.5]); 
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-2, 2]);

  // Extremely subtle translation for parallax depth (Max 5-8px total)
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position from -0.5 to 0.5 relative to viewport center
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        perspective: 2000, // Very deep perspective to keep distortion minimal
      }}
      className="relative flex items-center justify-center w-full max-w-[1200px]"
    >
      {/* 
        This is the main physical "Stage". 
        The phone and cards sit inside it and will rotate together perfectly. 
      */}
      <motion.div
        initial={{ y: 90, rotateX: 8, scale: 0.95 }}
        animate={{ y: 0, rotateX: 0, scale: 1 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1], // Apple/Stripe-style dynamic spring curve
          delay: 0.1
        }}
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          transformStyle: "preserve-3d"
        }}
        className="relative w-full h-full flex justify-center items-center"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
