'use client';

import { motion } from 'framer-motion';
import { ReactNode, useState, useEffect } from 'react';

export interface FloatingProductCardProps {
  label: string;
  badge?: string;
  value?: string | ReactNode;
  detail?: string | ReactNode;
  icon?: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  floatDirection?: 'vertical' | 'horizontal' | 'pulse' | 'rotate';
  onClick?: () => void;
  active?: boolean;
  type?: 'standard' | 'grid' | 'graph' | 'rating';
  brands?: string[];
  socketPosition?: 'top' | 'right' | 'left' | 'bottom';
}

export function FloatingStatusCard({ 
  label, 
  badge,
  value, 
  detail, 
  icon, 
  delay = 0, 
  duration = 5,
  className = '', 
  style = {},
  floatDirection = 'vertical',
  onClick,
  active = false,
  type = 'standard',
  brands,
  socketPosition = 'right'
}: FloatingProductCardProps) {

  const [isHovered, setIsHovered] = useState(false);
  const [animatedValue, setAnimatedValue] = useState<string | ReactNode>(value);
  const [starCount, setStarCount] = useState(5);

  // Counter micro-animation on hover for Time Saved
  useEffect(() => {
    if (isHovered && label.toLowerCase().includes('time')) {
      let step = 0;
      const sequence = ['0 min', '4 min', '8 min', '12 min', '14 min'];
      const interval = setInterval(() => {
        if (step < sequence.length) {
          setAnimatedValue(sequence[step]);
          step++;
        } else {
          clearInterval(interval);
        }
      }, 70);
      return () => clearInterval(interval);
    } else {
      setAnimatedValue(value);
    }
  }, [isHovered, label, value]);

  // Star micro-animation on hover for Ratings
  useEffect(() => {
    if (isHovered && label.toLowerCase().includes('rated')) {
      let count = 1;
      const interval = setInterval(() => {
        if (count <= 5) {
          setStarCount(count);
          count++;
        } else {
          clearInterval(interval);
        }
      }, 80);
      return () => clearInterval(interval);
    }
  }, [isHovered, label]);

  // Floating animation definition
  const getFloatAnimation = () => {
    switch (floatDirection) {
      case 'horizontal': return { x: [0, 5, 0] };
      case 'pulse': return { scale: [1, 1.015, 1] };
      case 'rotate': return { rotate: [0, 1, -1, 0] };
      case 'vertical':
      default: return { y: [0, -4, 0] };
    }
  };

  // Connection Socket Positioning
  const getSocketClasses = () => {
    switch (socketPosition) {
      case 'left': return '-left-2 top-1/2 -translate-y-1/2';
      case 'top': return '-top-2 left-1/2 -translate-x-1/2';
      case 'bottom': return '-bottom-2 left-1/2 -translate-x-1/2';
      case 'right':
      default: return '-right-2 top-1/2 -translate-y-1/2';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        opacity: { delay, duration: 0.5, ease: "easeOut" },
        scale: { delay, type: 'spring', stiffness: 120, damping: 18 }
      }}
      className={`absolute cursor-pointer select-none z-30 ${className}`}
      style={style}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        animate={getFloatAnimation()}
        transition={{
          repeat: Infinity,
          duration: duration,
          ease: "easeInOut",
          delay: delay + 0.3
        }}
        whileHover={{ y: -4, scale: 1.025, boxShadow: '0 20px 40px rgba(240,152,25,0.2)' }}
        whileTap={{ scale: 0.97 }}
        className={`relative bg-[#FDFBF7]/92 backdrop-blur-xl border ${
          active || isHovered 
            ? 'border-[#F09819] ring-2 ring-[#F09819]/50 shadow-[0_16px_36px_rgba(240,152,25,0.18)]' 
            : 'border-[#EBE4D8] shadow-[0_12px_32px_rgba(26,19,17,0.07)]'
        } rounded-[22px] transition-all duration-300 ${
          type === 'grid' ? 'p-3.5 w-[205px]' : 'px-4 py-3 w-[200px]'
        }`}
      >
        {/* Uniform Connection Socket Dot */}
        <div className={`absolute ${getSocketClasses()} w-3 h-3 rounded-full border-2 border-white transition-all duration-300 z-20 ${
          active || isHovered 
            ? 'bg-[#F09819] shadow-[0_0_10px_#F09819] scale-125' 
            : 'bg-[#F09819] shadow-[0_0_5px_rgba(240,152,25,0.4)]'
        }`} />

        {/* TYPE 1: CAFÉS NEAR YOU GRID NODE */}
        {type === 'grid' && (
          <div className="flex flex-col text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-extrabold tracking-[0.14em] text-[#8A7A6B] uppercase">{label}</span>
              <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-[#F09819] bg-[#F09819]/10 px-1.5 py-0.2 rounded-full border border-[#F09819]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                LIVE
              </span>
            </div>
            
            <div className="text-[14.5px] font-black text-[#1A1311] leading-tight mb-1">
              {value || '4 nearby'}
            </div>

            <div className="flex -space-x-1.5 mb-2">
              {[1, 2, 3, 4].map((i) => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i+12}`} className="w-4.5 h-4.5 rounded-full border border-white" alt="User" />
              ))}
            </div>

            <div className="text-[10px] font-bold text-[#1A1311] flex items-center justify-between pt-1 border-t border-[#EBE4D8]/60">
              <span className="text-[#8A7A6B]">120+ Outlets</span>
              <span className="text-[#F09819] font-mono">100% Sync ↗</span>
            </div>
          </div>
        )}

        {/* TYPE 2: TIME SAVED WITH SPARKLINE GRAPH */}
        {type === 'graph' && (
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`flex items-center justify-center w-9.5 h-9.5 rounded-full border ${
                active || isHovered ? 'bg-[#F09819] text-white border-[#F09819]' : 'border-[#FFE7B0] bg-[#FFF3DC] text-[#F09819]'
              } shrink-0 transition-colors`}>
                {icon}
              </div>
            )}
            
            <div className="flex flex-col text-left flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[8.5px] font-extrabold tracking-[0.14em] text-[#8A7A6B] uppercase">{label}</span>
                {badge && (
                  <span className="text-[7.5px] font-bold text-[#F09819] bg-[#F09819]/10 px-1 py-0.2 rounded font-mono">
                    {badge}
                  </span>
                )}
              </div>

              <div className="text-[15px] font-black text-[#1A1311] leading-tight mb-0.5">
                {animatedValue}
              </div>

              {/* Sparkline mini line graph */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-[#8A7A6B]">{detail || 'On average'}</span>
                <svg className="w-10 h-3 overflow-visible" viewBox="0 0 40 12">
                  <path d="M 0 10 Q 10 2, 20 8 T 40 2" fill="none" stroke="#F09819" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* TYPE 3: RATING NODE WITH STAGGERED STARS */}
        {type === 'rating' && (
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`flex items-center justify-center w-9.5 h-9.5 rounded-full border ${
                active || isHovered ? 'bg-[#F09819] text-white border-[#F09819]' : 'border-[#FFE7B0] bg-[#FFF3DC] text-[#F09819]'
              } shrink-0 transition-colors`}>
                {icon}
              </div>
            )}
            
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[8.5px] font-extrabold tracking-[0.14em] text-[#8A7A6B] uppercase">{label}</span>
                {badge && (
                  <span className="text-[7.5px] font-bold text-[#F09819] bg-[#F09819]/10 px-1 py-0.2 rounded font-mono">
                    {badge}
                  </span>
                )}
              </div>

              <div className="text-[15px] font-black text-[#1A1311] leading-tight mb-0.5">
                {value}
              </div>

              <div className="text-[9.5px] font-semibold text-[#8A7A6B] flex items-center gap-1">
                <span className="text-[#F09819]">{'★'.repeat(starCount)}</span>
                <span>2.4k+ reviews</span>
              </div>
            </div>
          </div>
        )}

        {/* TYPE 4: STANDARD / METRIC STATUS NODE */}
        {type === 'standard' && (
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`flex items-center justify-center w-9.5 h-9.5 rounded-full border ${
                active || isHovered 
                  ? 'bg-[#F09819] text-white border-[#F09819] shadow-md scale-105' 
                  : 'border-[#FFE7B0] bg-[#FFF3DC] text-[#F09819]'
              } shrink-0 transition-all duration-300`}>
                {icon}
              </div>
            )}
            
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[8.5px] font-extrabold tracking-[0.14em] text-[#8A7A6B] uppercase">{label}</span>
                {badge && (
                  <span className="text-[7.5px] font-bold text-[#F09819] bg-[#F09819]/10 px-1 py-0.2 rounded-full border border-[#F09819]/20 font-mono">
                    {badge}
                  </span>
                )}
              </div>

              {value && (
                <div className="text-[15px] font-black text-[#1A1311] leading-tight mb-0.5">
                  {animatedValue}
                </div>
              )}
              {detail && <div className="text-[10px] font-semibold text-[#8A7A6B] leading-none">{detail}</div>}
            </div>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}
