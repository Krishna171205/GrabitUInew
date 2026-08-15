'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Premium3DCup() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-[140px] h-[180px]"></div>;

  // Cylinder math
  const numFaces = 32;
  const radius = 50; // px
  // circumference = 2 * PI * R = 314.15
  // faceWidth = circumference / numFaces = 9.8px
  const faceWidth = 10;
  const height = 120;
  const sleeveHeight = 50;

  const faces = Array.from({ length: numFaces }, (_, i) => {
    const angle = i * (360 / numFaces);
    return { id: i, angle };
  });

  return (
    <div className="relative w-[140px] h-[180px] flex items-center justify-center" style={{ perspective: 1200 }}>
      {/* Dynamic Floor Shadow */}
      <motion.div 
        animate={{ scale: [1, 0.9, 1], opacity: [0.3, 0.2, 0.3] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute bottom-[-10px] w-24 h-6 bg-black rounded-[100%] blur-xl"
      />
      <div className="absolute bottom-0 w-20 h-4 bg-black/20 rounded-[100%] blur-md" />

      {/* Rotating 3D Container */}
      <motion.div
        animate={{ rotateY: [0, -360] }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center mt-4"
        style={{ transformStyle: 'preserve-3d', rotateX: -15 }}
      >
        {/* Central Axis for the 3D model */}
        <div className="relative w-0 h-[120px]" style={{ transformStyle: 'preserve-3d' }}>
          
          {/* Cup Body Cylinder */}
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {faces.map((face) => (
              <div
                key={`body-${face.id}`}
                className="absolute top-0 bottom-0 bg-[#E8E2D6]"
                style={{
                  width: `${faceWidth}px`,
                  left: `-${faceWidth / 2}px`,
                  transform: `rotateY(${face.angle}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden',
                  filter: `brightness(${Math.max(0.7, 1 - Math.abs(180 - face.angle) / 360)})`,
                  borderLeft: '1px solid rgba(0,0,0,0.01)',
                  borderRight: '1px solid rgba(0,0,0,0.01)',
                }}
              />
            ))}
          </div>

          {/* Cup Sleeve Cylinder */}
          <div className="absolute inset-0 top-[35px] h-[55px]" style={{ transformStyle: 'preserve-3d' }}>
            {faces.map((face) => {
              const isLogoArea = face.angle < 50 || face.angle > 310;
              return (
                <div
                  key={`sleeve-${face.id}`}
                  className="absolute top-0 bottom-0 bg-[#4A3525] overflow-hidden"
                  style={{
                    width: `${faceWidth}px`,
                    left: `-${faceWidth / 2}px`,
                    transform: `rotateY(${face.angle}deg) translateZ(${radius + 1}px)`,
                    backfaceVisibility: 'hidden',
                    filter: `brightness(${Math.max(0.6, 1 - Math.abs(180 - face.angle) / 300)})`,
                  }}
                >
                  {isLogoArea && (
                    <div 
                      className="absolute h-full flex items-center justify-center pointer-events-none"
                      style={{ 
                        width: `${radius * 2}px`, 
                        left: `-${radius - faceWidth/2}px`,
                        transform: `rotateY(${-face.angle}deg)`, 
                      }}
                    >
                      <span className="text-[#C48464] font-serif italic text-[22px] font-bold tracking-tight">grabbit</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Top Lid Base Cylinder */}
          <div className="absolute inset-0 top-[-15px] h-[15px]" style={{ transformStyle: 'preserve-3d' }}>
            {faces.map((face) => (
              <div
                key={`lid-${face.id}`}
                className="absolute top-0 bottom-0 bg-[#1E1A18]"
                style={{
                  width: `${faceWidth}px`,
                  left: `-${faceWidth / 2}px`,
                  transform: `rotateY(${face.angle}deg) translateZ(${radius + 4}px)`,
                  backfaceVisibility: 'hidden',
                  filter: `brightness(${Math.max(0.5, 1 - Math.abs(180 - face.angle) / 360)})`,
                }}
              />
            ))}
          </div>

          {/* Top Lid Circle */}
          <div 
            className="absolute bg-[#2a2522] rounded-full border border-[#1E1A18] shadow-inner"
            style={{
              width: `${(radius + 4) * 2}px`,
              height: `${(radius + 4) * 2}px`,
              left: `-${radius + 4}px`,
              top: `-15px`,
              transform: `rotateX(90deg) translateZ(${radius + 4}px)`, 
            }}
          >
            {/* Sip hole */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-black rounded-full shadow-inner opacity-90" />
          </div>

          {/* Bottom Cup Base Circle */}
          <div 
            className="absolute bg-[#D5CCBA] rounded-full"
            style={{
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              left: `-${radius}px`,
              bottom: `0px`,
              transform: `rotateX(90deg) translateZ(-${radius}px)`, 
            }}
          />

        </div>
      </motion.div>
    </div>
  );
}
