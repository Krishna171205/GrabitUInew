'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useEffect } from 'react';

export function HeroProductStage({ children }: { children: ReactNode }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out mouse movement
  const springConfig = { damping: 30, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Map mouse position to subtle rotation (-5 to 5 degrees)
  const mouseRotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const mouseRotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

  useEffect(() => {
    // Only apply interaction on desktop
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX / innerWidth - 0.5);
      mouseY.set(e.clientY / innerHeight - 0.5);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center"
      style={{ perspective: 1400 }}
    >
      {/* Warm Background Stage Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] pointer-events-none -z-10 rounded-full" 
        style={{ 
          background: 'radial-gradient(circle, rgba(240, 152, 25, 0.15) 0%, rgba(255, 177, 0, 0.06) 35%, transparent 70%)',
          filter: 'blur(70px)'
        }}
      />
      
      {/* 3D Mobile Emergence Transition Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 90, scale: 0.88, rotateX: 14 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        transition={{ 
          duration: 1.1, 
          ease: [0.16, 1, 0.3, 1], // Apple/Stripe dynamic spring curve
          delay: 0.2 
        }}
        style={{ 
          rotateX: mouseRotateX, 
          rotateY: mouseRotateY, 
          transformStyle: 'preserve-3d' 
        }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
