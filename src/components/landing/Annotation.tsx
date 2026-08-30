import React from 'react';
import { motion } from 'framer-motion';

interface AnnotationProps {
  text: string;
  className?: string;
  arrowDirection?: 'up-left' | 'up-right' | 'down-left' | 'down-right' | 'none';
  delay?: number;
  color?: string;
}

export function Annotation({ text, className = '', arrowDirection = 'none', delay = 0, color = '#0055D4' }: AnnotationProps) {
  // Simple curved arrows to feel hand-drawn
  const arrows = {
    'none': null,
    'up-left': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -top-4 -left-4 -rotate-12">
        <path d="M20 20C20 20 12 18 6 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M6 6L14 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 6L4 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'up-right': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -top-4 -right-4 rotate-12">
        <path d="M4 20C4 20 12 18 18 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M18 6L10 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 6L20 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'down-left': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -bottom-4 -left-4 -rotate-12">
        <path d="M20 4C20 4 12 6 6 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M6 18L14 20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 18L4 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    'down-right': (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -bottom-4 -right-4 rotate-12">
        <path d="M4 4C4 4 12 6 18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M18 18L10 20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 18L20 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`relative inline-block ${className}`}
    >
      <span className="text-[28px] sm:text-[34px] leading-none font-normal" style={{ fontFamily: 'var(--font-caveat)', color }}>
        {text}
      </span>
      {arrows[arrowDirection]}
    </motion.div>
  );
}
