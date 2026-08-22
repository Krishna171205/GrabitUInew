'use client';

import * as THREE from 'three';
import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, ContactShadows, PerspectiveCamera, Environment, Line } from '@react-three/drei';
import { Timer, Coffee, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Procedural rounded box extrusion for that chunky, physical neo-brutalist feel.
 */
function RoundedBoxExtrusion({ 
  width, 
  height, 
  radius, 
  depth, 
  color, 
  sideColor, 
  children,
  ...props 
}: any) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Center the geometry
    const x = -width / 2;
    const y = -height / 2;

    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + height - radius);
    shape.quadraticCurveTo(x, y + height, x + radius, y + height);
    shape.lineTo(x + width - radius, y + height);
    shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    shape.lineTo(x + width, y + radius);
    shape.quadraticCurveTo(x + width, y, x + width - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    };
    
    // ExtrudeGeometry puts the front/back faces at material index 0, 
    // and the extruded sides at material index 1
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center(); // ensure perfectly centered for rotation
    return geo;
  }, [width, height, radius, depth]);

  return (
    <mesh geometry={geometry} {...props} castShadow receiveShadow>
      <meshStandardMaterial attach="material-0" color="#ffffff" roughness={0.25} metalness={0.05} />
      <meshStandardMaterial attach="material-1" color={sideColor} roughness={0.5} metalness={0.1} />
      {children}
    </mesh>
  );
}

/**
 * Individual physical 3D card instance.
 */
function Floating3DCard({ 
  position, 
  rotation = [0, 0, 0], 
  isLeft, 
  textLines, 
  description,
  icon: IconComponent, 
  iconBg, 
  iconColor, 
  themeColor,
  sideColor,
  hasCheck,
  delay = 0,
  setHoveredCard,
  anchorRef
}: any) {
  const group = useRef<THREE.Group>(null);
  const cardMesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [entered, setEntered] = useState(false);

  const startZ = -2;
  const targetZ = hovered ? 0.3 : 0;
  
  // Base idle rotations - Left card tilted clockwise, Right tilted counter-clockwise
  const baseRotX = rotation[0] ?? 0.02;
  const baseRotY = rotation[1] ?? (isLeft ? 0.08 : -0.08);
  const baseRotZ = rotation[2] ?? (isLeft ? -0.10 : 0.08);

  useFrame((state, delta) => {
    if (!group.current || !cardMesh.current) return;

    // Time-based idle floating (sine waves)
    const t = state.clock.getElapsedTime();
    if (t > delay && !entered) setEntered(true);
    
    if (!entered) {
      group.current.position.z = startZ;
      group.current.position.y = position[1] - 1;
      return;
    }

    const floatY = Math.sin(t * (isLeft ? 1.2 : 1.4) + delay) * 0.12;
    const floatRotX = Math.sin(t * 0.8 + delay) * 0.03;
    const floatRotZ = Math.cos(t * 0.9 + delay) * 0.02;

    // Cursor tracking
    const pointerX = state.pointer.x; // -1 to 1
    const pointerY = state.pointer.y; // -1 to 1

    // Add pointer tilt and hover pop
    const targetRotX = baseRotX + floatRotX + (pointerY * -0.12) + (hovered ? 0.04 : 0);
    const targetRotY = baseRotY + (pointerX * 0.12) + (hovered ? (isLeft ? 0.06 : -0.06) : 0);
    const targetRotZ = baseRotZ + floatRotZ;

    // Smoothly interpolate (lerp) towards targets for physical inertia
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, delta * (hovered ? 6 : 4));
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, delta * (hovered ? 6 : 4));
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRotZ, delta * 4);
    
    // Position lerp (Entrance + Hover pop + Float)
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, delta * 5);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, position[1] + floatY + (hovered ? 0.1 : 0), delta * 5);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, position[0] + (hovered ? (isLeft ? -0.08 : 0.08) : 0), delta * 5);
  });

  // Taller aspect ratio scaled for desktop balance
  const cardWidth = 1.38;
  const cardHeight = 1.90;

  return (
    <group 
      ref={group} 
      position={[position[0], position[1] - 1, startZ]} 
      rotation={[0, 0, 0]}
    >
      <RoundedBoxExtrusion 
        ref={cardMesh}
        width={cardWidth} 
        height={cardHeight} 
        radius={0.18} 
        depth={0.10} 
        color="#ffffff" 
        sideColor={sideColor || "#0F172A"} 
        onPointerOver={() => {
          setHovered(true);
          if (setHoveredCard) setHoveredCard(isLeft ? 'left' : 'right');
        }}
        onPointerOut={() => {
          setHovered(false);
          if (setHoveredCard) setHoveredCard(null);
        }}
      >
        {/* The HTML text overlay that maps perfectly to the 3D surface */}
        <Html 
          transform 
          distanceFactor={4.1} // Calibrated to card geometry
          position={[0, 0, 0.06]} // Just above the front face
          style={{ 
            width: '190px', 
            height: '260px',
            pointerEvents: 'none',
          }}
          className={`flex flex-col items-start p-5 bg-white/95 rounded-[22px] border-2 ${isLeft ? 'border-[#2563EB]' : 'border-[#F59E0B]'} w-full h-full shadow-sm`}
        >
          {/* Top: Icon */}
          <div className={`w-13 h-13 rounded-[16px] ${iconBg} flex items-center justify-center relative shadow-sm`}>
            <IconComponent className={iconColor} size={24} strokeWidth={2.5} />
            {hasCheck && (
              <div className="absolute -bottom-1.5 -right-1.5 bg-[#10B981] rounded-full p-0.5 border-[3px] border-white shadow-md">
                <CheckCircle2 size={13} className="text-white" strokeWidth={3} />
              </div>
            )}
          </div>
          
          {/* Middle: Title & Subtitle */}
          <div className="flex flex-col gap-0.5 w-full text-left mt-3.5">
            <h3 className="font-extrabold text-[#0F172A] text-[17px] leading-[1.15] font-sans tracking-tight">
              {textLines[0]}<br/>{textLines[1]}
            </h3>
            <p className={`text-[9px] ${themeColor} font-bold font-sans tracking-widest uppercase mt-0.5`}>
              {textLines[2]}
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-gray-100 my-2.5" />

          {/* Bottom: Description */}
          <p className="text-[10px] text-gray-500 font-medium leading-[1.4] tracking-tight">
            {description}
          </p>
        </Html>
      </RoundedBoxExtrusion>

      {/* Anchor Node - Positioned on the back-side edge */}
      <group ref={anchorRef} position={[isLeft ? (cardWidth / 2) : -(cardWidth / 2), 0, -0.05]}>
        <mesh>
          <sphereGeometry args={[0.025]} />
          <meshBasicMaterial color={isLeft ? "#0055D4" : "#F59E0B"} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Procedurally animated 3D connection line with energy pulse
 */
function EnergyConnectionLine({ startRef, endRef, isLeft, hovered, colorBase, colorPulse }: any) {
  const baseRef = useRef<any>(null);
  const pulseRef = useRef<any>(null);
  
  // Create dynamic bezier curve updated every frame
  useFrame(({ clock }) => {
    if (!startRef.current || !endRef.current) return;

    const startPos = new THREE.Vector3();
    const endPos = new THREE.Vector3();

    startRef.current.getWorldPosition(startPos);
    endRef.current.getWorldPosition(endPos);

    // Compute midpoint control point with slight sag for physical wire feel
    const midX = (startPos.x + endPos.x) / 2;
    const midY = ((startPos.y + endPos.y) / 2) - 0.4; // Natural gravity dip
    const midZ = Math.min(startPos.z, endPos.z) - 0.2; // Curve behind

    const curve = new THREE.QuadraticBezierCurve3(
      startPos,
      new THREE.Vector3(midX, midY, midZ),
      endPos
    );

    const points = curve.getPoints(30);

    if (baseRef.current) {
      baseRef.current.geometry.setPositions(points.flatMap(p => [p.x, p.y, p.z]));
      baseRef.current.material.opacity = hovered ? 0.9 : 0.55;
    }

    if (pulseRef.current) {
      pulseRef.current.geometry.setPositions(points.flatMap(p => [p.x, p.y, p.z]));
      // Energy pulse traveling along line
      const t = clock.getElapsedTime();
      pulseRef.current.material.dashOffset = -t * (hovered ? 3.5 : 1.5);
      pulseRef.current.material.opacity = hovered ? 1.0 : 0.7;
    }
  });

  const initialPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];

  return (
    <group>
      <Line 
        ref={baseRef} 
        points={initialPoints} 
        color={colorBase} 
        lineWidth={1.5} 
        dashed 
        dashScale={2} 
        dashSize={0.2} 
        gapSize={0.12} 
        transparent 
        depthWrite={false} 
      />
      <Line 
        ref={pulseRef} 
        points={initialPoints} 
        color={colorPulse} 
        lineWidth={2.5} 
        dashed 
        dashScale={1} 
        dashSize={0.4} 
        gapSize={10} 
        transparent 
        depthWrite={false} 
      />
    </group>
  );
}

export function Hero3DScene({ setHoveredCard }: { setHoveredCard?: (card: 'left' | 'right' | null) => void }) {
  const { viewport } = useThree();
  
  // Disable 3D cards on screens < 7.0 units (~960px) to prevent any crowding
  const isSmallScreen = viewport.width < 7.0;
  
  // Track hovered state internally to pass down to lines
  const [internalHover, setInternalHover] = useState<'left' | 'right' | null>(null);
  
  // Anchor refs
  const leftCardAnchor = useRef<THREE.Group>(null);
  const rightCardAnchor = useRef<THREE.Group>(null);
  const leftTarget = useRef<THREE.Group>(null);
  const rightTarget = useRef<THREE.Group>(null);

  if (isSmallScreen) {
    return null; // Keep central text 100% clean and unobstructed
  }

  // Dynamic flanking offset: places card cleanly in the margin between text and screen edge
  const halfWidth = viewport.width / 2;
  const maxOffset = halfWidth - 1.0; // ensures card outer edge has comfortable breathing room
  const offset = Math.min(Math.max(halfWidth * 0.74, 3.2), maxOffset);
  
  const leftPos: [number, number, number] = [-offset, 0.45, 0];
  const rightPos: [number, number, number] = [offset, -0.20, 0];

  const handleHover = (card: 'left' | 'right' | null) => {
    setInternalHover(card);
    if (setHoveredCard) setHoveredCard(card);
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />
      
      {/* Connection Line Targets (Hidden) - Located behind the central typography */}
      <group ref={leftTarget} position={[-1.8, 0.1, -1.0]} />
      <group ref={rightTarget} position={[1.9, -0.3, -1.0]} />
      
      {/* Lighting: Soft ambient + crisp directional to highlight the 3D extrusion */}
      <ambientLight intensity={2.5} color="#ffffff" />
      <directionalLight 
        position={[-5, 5, 5]} 
        intensity={3} 
        color="#ffffff" 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight 
        position={[5, 2, 5]} 
        intensity={1} 
        color="#ffffff" 
      />
      {/* Subtle blue rim light for premium tech feel */}
      <spotLight 
        position={[5, -5, -5]} 
        intensity={3} 
        color="#0055D4" 
        angle={0.5} 
        penumbra={1} 
      />

      {/* Left Card - Tilted clockwise (-0.10) */}
      <Floating3DCard 
        position={leftPos}
        rotation={[0.02, 0.08, -0.10]}
        isLeft={true}
        delay={1.0}
        textLines={["Save upto", "10 mins", "EVERY TIME"]}
        description="Order ahead & skip the queue. More time for what matters."
        icon={Timer}
        iconBg="bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]"
        iconColor="text-white"
        themeColor="text-[#2563EB]"
        sideColor="#2563EB" // Blue side wall
        hasCheck={false}
        anchorRef={leftCardAnchor}
        setHoveredCard={handleHover}
      />

      {/* Right Card - Tilted counter-clockwise (0.08) */}
      <Floating3DCard 
        position={rightPos}
        rotation={[0.02, -0.08, 0.08]}
        isLeft={false}
        delay={1.15}
        textLines={["Fresh.", "On time.", "EVERY TIME."]}
        description="Your order is brewed fresh & ready when you arrive."
        icon={Coffee}
        iconBg="bg-[#FFF7ED] border border-[#FFEDD5]"
        iconColor="text-[#B45309]"
        themeColor="text-[#F59E0B]"
        sideColor="#F59E0B" // Orange side wall
        hasCheck={true}
        anchorRef={rightCardAnchor}
        setHoveredCard={handleHover}
      />

      {/* Energy Connection Lines */}
      <EnergyConnectionLine 
        startRef={leftCardAnchor} 
        endRef={leftTarget} 
        isLeft={true} 
        hovered={internalHover === 'left'}
        colorBase="#0055D4"
        colorPulse="#40C4FF"
      />
      <EnergyConnectionLine 
        startRef={rightCardAnchor} 
        endRef={rightTarget} 
        isLeft={false} 
        hovered={internalHover === 'right'}
        colorBase="#F59E0B"
        colorPulse="#FCD34D"
      />

      {/* Shadow catcher floor (invisible but receives shadows) */}
      <ContactShadows 
        position={[0, -2, 0]} 
        opacity={0.3} 
        scale={20} 
        blur={1.5} 
        far={4.5} 
        resolution={512} 
        color="#0F172A"
      />
    </>
  );
}

export default function Hero3DCards({ setHoveredCard }: { setHoveredCard?: (card: 'left' | 'right' | null) => void }) {
  return (
    <div className="absolute inset-0 z-40 pointer-events-none hidden md:block">
      <Canvas shadows dpr={[1, 2]} className="pointer-events-auto">
        <Hero3DScene setHoveredCard={setHoveredCard} />
      </Canvas>
    </div>
  );
}
