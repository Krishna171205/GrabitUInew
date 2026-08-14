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
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  active?: boolean;
  type?: 'cafes' | 'time' | 'ready' | 'rating';
  entranceDirection?: 'left' | 'right';
  isReceivingEnergy?: boolean;
}

export function FloatingStatusCard({ 
  label, 
  badge,
  value, 
  detail, 
  icon, 
  delay = 0, 
  className = '', 
  style = {},
  onClick,
  onHoverStart,
  onHoverEnd,
  active = false,
  type = 'cafes',
  entranceDirection = 'left',
  isReceivingEnergy = false
}: FloatingProductCardProps) {

  const [isHovered, setIsHovered] = useState(false);
  const [hasHoveredTime, setHasHoveredTime] = useState(false);
  const [timeValue, setTimeValue] = useState('14 min');

  // Time Saved Count-Up Animation (Runs when hovered OR when receiving energy from phone)
  useEffect(() => {
    if ((isHovered || isReceivingEnergy) && type === 'time') {
      let step = 0;
      const sequence = ['0 min', '5 min', '10 min', '14 min'];
      const interval = setInterval(() => {
        if (step < sequence.length) {
          setTimeValue(sequence[step]);
          step++;
        } else {
          clearInterval(interval);
        }
      }, 60);
      return () => clearInterval(interval);
    }
  }, [isHovered, isReceivingEnergy, type]);

  // Entrance start positions
  const startX = entranceDirection === 'left' ? 20 : -20;
  
  // Is this card actively highlighted or receiving energy?
  const isEngaged = active || isHovered || isReceivingEnergy;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, x: startX, y: 0 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: "easeOut"
      }}
      className={`absolute cursor-pointer select-none z-10 flex items-center group ${
        entranceDirection === 'left' ? 'flex-row' : 'flex-row-reverse'
      } ${className}`}
      style={style}
      onClick={onClick}
      onHoverStart={() => {
        setIsHovered(true);
        if (onHoverStart) onHoverStart();
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        if (onHoverEnd) onHoverEnd();
      }}
    >
      
      {/* 
        The Tiny Connection Node (Faces the phone)
      */}
      <div className={`relative flex items-center justify-center ${entranceDirection === 'left' ? 'mr-[-1px] z-0' : 'ml-[-1px] z-0'}`}>
        <motion.div 
          animate={isReceivingEnergy ? { 
            scale: 1.4, 
            boxShadow: '0 0 12px rgba(240,152,25,0.7)',
            background: 'linear-gradient(to bottom right, #F09819, #F09819)'
          } : isHovered ? { 
            scale: 1.2, 
            boxShadow: '0 0 8px rgba(240,152,25,0.4)',
            background: 'linear-gradient(to bottom right, #F09819, #D46C20)'
          } : { 
            scale: 1, 
            boxShadow: '0 2px 4px rgba(30,20,10,0.1)',
            background: 'linear-gradient(to bottom right, #F09819, #D46C20)'
          }}
          transition={{ duration: 0.25 }}
          className="w-[8px] h-[8px] rounded-full flex items-center justify-center relative z-20 border border-[rgba(255,255,255,0.6)] shadow-sm"
        >
          {/* Inner white dot */}
          <motion.div 
            animate={{ opacity: isReceivingEnergy ? 1 : 0.8 }}
            className="w-[3px] h-[3px] rounded-full bg-white shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]" 
          />
        </motion.div>
      </div>

      <motion.div
        animate={isReceivingEnergy ? { 
          scale: 1.03,
          y: -4,
          boxShadow: '0 20px 50px rgba(240,152,25,0.25), 0 8px 20px rgba(240,152,25,0.12)',
          borderColor: 'rgba(240,152,25,0.8)'
        } : active ? { 
          scale: 1.015,
          y: -2,
          boxShadow: '0 14px 36px rgba(240,152,25,0.18), 0 4px 12px rgba(30,20,10,0.06)',
          borderColor: 'rgba(240,152,25,0.4)'
        } : { 
          scale: 1,
          y: 0,
          boxShadow: '0 8px 24px rgba(30,20,10,0.06), 0 2px 6px rgba(30,20,10,0.03)',
          borderColor: 'rgba(255,255,255,0.8)'
        }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: 'transform, opacity, box-shadow' }}
        whileHover={{ 
          y: -4, 
          scale: 1.025, 
          boxShadow: '0 18px 48px rgba(240,152,25,0.2), 0 6px 16px rgba(30,20,10,0.06)' 
        }}
        whileTap={{ scale: 0.99 }}
        className={`relative bg-[#FFFDF8] border rounded-[22px] w-[230px] p-[20px] pr-[24px] transition-all duration-300 z-10 overflow-hidden ${
          entranceDirection === 'left' ? 'order-1' : 'order-1'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay" />

        {/* TYPE 1: CAFÉS NEAR YOU */}
        {type === 'cafes' && (
          <div className="flex flex-col text-left relative z-10">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[9px] font-extrabold tracking-[0.14em] text-[#8A7A6B] uppercase">
                {label}
              </span>
              <motion.div 
                animate={isReceivingEnergy ? { backgroundColor: 'rgba(16,185,129,0.2)' } : { backgroundColor: 'rgba(16,185,129,0.1)' }}
                className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full border border-[#10B981]/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] transition-colors"
              >
                <motion.span 
                  animate={isReceivingEnergy ? { boxShadow: '0 0 10px rgba(16,185,129,1)' } : {}}
                  className="w-[5px] h-[5px] rounded-full bg-[#10B981] shadow-[0_0_5px_rgba(16,185,129,0.8)] animate-[pulse_2s_ease-in-out_infinite]" 
                />
                <span className="text-[8px] font-bold text-[#10B981] uppercase tracking-wider">LIVE</span>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-3.5 mb-3.5">
              <motion.div 
                animate={{ 
                  scale: isReceivingEnergy ? [1, 1.25, 1] : isHovered ? 1.05 : 1, 
                  rotate: isReceivingEnergy ? [-8, 8, 0] : isHovered ? -5 : 0 
                }}
                transition={{ duration: 0.35, type: "spring", stiffness: 300, damping: 15 }}
                className="w-[42px] h-[42px] rounded-[12px] bg-gradient-to-br from-[#FFF3DC] to-[#FFE7B0] flex items-center justify-center text-[#F09819] shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_8px_rgba(240,152,25,0.15)] border border-white"
              >
                <div className="scale-90">{icon}</div>
              </motion.div>
              <div className="flex flex-col">
                <motion.div 
                  animate={{ 
                    scale: isReceivingEnergy ? [1, 1.12, 1] : 1,
                    color: isReceivingEnergy ? ['#1A1311', '#F09819', '#1A1311'] : '#1A1311'
                  }}
                  transition={{ duration: 0.35 }}
                  className="text-[20px] font-black leading-none mb-1 tracking-tight origin-left"
                >
                  {value}
                </motion.div>
                <div className="flex -space-x-2 pt-1">
                  {[1, 2, 3].map((i) => (
                    <motion.div 
                      key={i} 
                      animate={isHovered || isReceivingEnergy ? { x: (i - 1) * 3, scale: isReceivingEnergy ? 1.1 : 1 } : { x: 0, scale: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className="relative rounded-full border-[1.5px] border-[#FDFBF7] shadow-sm z-[3] hover:z-[10] transition-transform"
                      style={{ zIndex: 3 - i }}
                    >
                      <img src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-[20px] h-[20px] rounded-full object-cover" alt="User" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[10px] font-bold text-[#8A7A6B] pt-2.5 flex justify-between items-center relative">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8A7A6B]/15 to-transparent" />
              <span>120+ Outlets</span>
            </div>
          </div>
        )}

        {/* TYPE 2: TIME SAVED */}
        {type === 'time' && (
          <div className="flex flex-col text-left relative z-10">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[9px] font-extrabold tracking-[0.14em] text-[#8A7A6B] uppercase">
                {label}
              </span>
              <motion.span 
                animate={isReceivingEnergy ? { scale: [1, 1.15, 1], backgroundColor: '#F09819', color: '#FFF' } : { scale: 1, backgroundColor: 'rgba(240,152,25,0.1)', color: '#F09819' }}
                transition={{ duration: 0.3 }}
                className="text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-[1px] rounded-sm transition-colors"
              >
                {badge}
              </motion.span>
            </div>
            
            <div className="flex items-center gap-3.5 mb-2.5">
              <motion.div 
                animate={{ 
                  scale: isReceivingEnergy ? [1, 1.25, 1] : isHovered ? 1.05 : 1, 
                  rotate: isReceivingEnergy ? [0, 15, 0] : isHovered ? 10 : 0 
                }}
                transition={{ duration: 0.35, type: "spring", stiffness: 300 }}
                className="w-[42px] h-[42px] rounded-[12px] bg-gradient-to-br from-[#FFF3DC] to-[#FFE7B0] flex items-center justify-center text-[#F09819] shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_8px_rgba(240,152,25,0.15)] border border-white"
              >
                <div className="scale-90">{icon}</div>
              </motion.div>
              <div className="flex flex-col">
                <motion.div 
                  animate={isReceivingEnergy ? { scale: [1, 1.12, 1], color: ['#1A1311', '#F09819', '#1A1311'] } : { scale: 1, color: '#1A1311' }}
                  transition={{ duration: 0.35 }}
                  className="text-[20px] font-black leading-none mb-1 tracking-tight origin-left"
                >
                  {timeValue}
                </motion.div>
                <div className="text-[11px] font-bold text-[#8A7A6B]">
                  {detail}
                </div>
              </div>
            </div>

            <div className="w-full mt-2.5 relative h-[20px]">
              <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
                <motion.path 
                  d="M 0 20 Q 25 15, 50 18 T 100 4" 
                  fill="none" 
                  stroke="rgba(240,152,25,0.3)" 
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="blur-sm"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: isEngaged ? 1 : 0.3 }}
                  transition={{ pathLength: { duration: 1.5, delay, ease: "easeOut" }, opacity: { duration: 0.4 } }}
                />
                <motion.path 
                  d="M 0 20 Q 25 15, 50 18 T 100 4" 
                  fill="none" 
                  stroke="#F09819" 
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.3 }}
                  animate={{ pathLength: 1, opacity: isEngaged ? 1 : 0.5 }}
                  transition={{ pathLength: { duration: 1.5, delay, ease: "easeOut" }, opacity: { duration: 0.4 } }}
                />
              </svg>
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={isReceivingEnergy ? { opacity: 1, scale: 1.6, boxShadow: '0 0 14px rgba(240,152,25,1)' } : { opacity: isEngaged ? 1 : 0.5, scale: 1, boxShadow: '0 0 8px rgba(240,152,25,0.8)' }}
                transition={{ duration: 0.25 }}
                className="absolute right-0 top-0 w-[5px] h-[5px] bg-white rounded-full border-2 border-[#F09819]"
              />
            </div>
          </div>
        )}

        {/* TYPE 3: ORDER READY */}
        {type === 'ready' && (
          <div className="flex flex-col text-left relative z-10">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[9px] font-extrabold tracking-[0.14em] text-[#8A7A6B] uppercase">
                {label}
              </span>
              <motion.span 
                animate={isReceivingEnergy ? { scale: [1, 1.15, 1], backgroundColor: '#F09819', color: '#FFF' } : { scale: 1, backgroundColor: 'rgba(240,152,25,0.1)', color: '#F09819' }}
                transition={{ duration: 0.3 }}
                className="text-[8px] font-extrabold uppercase px-1.5 py-[1px] rounded-sm transition-colors"
              >
                {badge}
              </motion.span>
            </div>
            
            <div className="flex items-center gap-3.5 mb-3.5">
              <motion.div 
                animate={{ 
                  y: isReceivingEnergy ? [-2, -8, 0] : isHovered ? -3 : 0, 
                  scale: isReceivingEnergy ? [1, 1.25, 1] : isHovered ? 1.05 : 1 
                }}
                transition={{ duration: 0.35, type: "spring", stiffness: 300, damping: 15 }}
                className="w-[42px] h-[42px] rounded-[12px] bg-gradient-to-br from-[#FFF3DC] to-[#FFE7B0] flex items-center justify-center text-[#F09819] shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_8px_rgba(240,152,25,0.15)] border border-white"
              >
                <div className="scale-90">{icon}</div>
              </motion.div>
              <div className="flex flex-col">
                <motion.div 
                  animate={{ 
                    scale: isReceivingEnergy ? [1, 1.08, 1] : 1,
                    color: isReceivingEnergy ? ['#1A1311', '#F09819', '#1A1311'] : '#1A1311'
                  }}
                  transition={{ duration: 0.35 }}
                  className="text-[18px] font-black leading-none mb-1 whitespace-nowrap tracking-tight origin-left"
                >
                  {value}
                </motion.div>
                <div className="text-[11px] font-bold text-[#8A7A6B]">
                  {detail}
                </div>
              </div>
            </div>

            <motion.div 
              animate={isReceivingEnergy ? { backgroundColor: 'rgba(16,185,129,0.25)', scale: [1, 1.05, 1] } : { backgroundColor: 'rgba(16,185,129,0.1)', scale: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full border border-[#10B981]/20 w-fit shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] transition-colors"
            >
              <motion.span 
                animate={isReceivingEnergy ? { boxShadow: '0 0 12px rgba(16,185,129,1)', scale: 1.3 } : { scale: 1 }}
                className="w-[5px] h-[5px] rounded-full bg-[#10B981] shadow-[0_0_5px_rgba(16,185,129,0.8)] animate-[pulse_2s_ease-in-out_infinite]" 
              />
              <span className="text-[8px] font-bold text-[#10B981] uppercase tracking-wider">LIVE</span>
            </motion.div>
          </div>
        )}

        {/* TYPE 4: RATED BY YOU */}
        {type === 'rating' && (
          <div className="flex flex-col text-left relative z-10">
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[9px] font-extrabold tracking-[0.14em] text-[#8A7A6B] uppercase">
                {label}
              </span>
              <motion.span 
                animate={isReceivingEnergy ? { scale: [1, 1.15, 1], backgroundColor: '#F09819', color: '#FFF' } : { scale: 1, backgroundColor: 'rgba(240,152,25,0.1)', color: '#F09819' }}
                transition={{ duration: 0.3 }}
                className="text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-[1px] rounded-sm transition-colors"
              >
                {badge}
              </motion.span>
            </div>
            
            <div className="flex items-center gap-3.5 mb-3.5">
              <motion.div 
                animate={{ 
                  scale: isReceivingEnergy ? [1, 1.25, 1] : isHovered ? 1.05 : 1, 
                  rotate: isReceivingEnergy ? [0, 15, 0] : isHovered ? 15 : 0 
                }}
                transition={{ duration: 0.35, type: "spring", stiffness: 300 }}
                className="w-[42px] h-[42px] rounded-[12px] bg-gradient-to-br from-[#FFF3DC] to-[#FFE7B0] flex items-center justify-center text-[#F09819] shrink-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_8px_rgba(240,152,25,0.15)] border border-white"
              >
                <div className="scale-90">{icon}</div>
              </motion.div>
              <div className="flex flex-col">
                <motion.div 
                  animate={{ 
                    scale: isReceivingEnergy ? [1, 1.12, 1] : 1,
                    color: isReceivingEnergy ? ['#1A1311', '#F09819', '#1A1311'] : '#1A1311'
                  }}
                  transition={{ duration: 0.35 }}
                  className="text-[20px] font-black leading-none mb-1 tracking-tight origin-left"
                >
                  {value}
                </motion.div>
                <div className="text-[11px] font-bold text-[#8A7A6B]">
                  {detail}
                </div>
              </div>
            </div>
            
            <div className="pt-1">
              <div className="flex gap-1 text-[#F09819] text-[15px]">
                {[...Array(5)].map((_, i) => (
                  <motion.span 
                    key={i}
                    animate={{ 
                      opacity: 1, 
                      scale: isReceivingEnergy ? [1, 1.4, 1] : isHovered ? [1, 1.2, 1] : 1, 
                      textShadow: isReceivingEnergy ? '0 0 16px rgba(240,152,25,1)' : isHovered ? '0 0 10px rgba(240,152,25,0.6)' : '0 2px 3px rgba(240,152,25,0.2)' 
                    }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="drop-shadow-sm"
                  >
                    ★
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}
