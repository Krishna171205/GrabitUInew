'use client';
import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, ContactShadows, PresentationControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function Model({ mouseX, mouseY }: { mouseX: React.MutableRefObject<number>, mouseY: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/grabit-coffee-cup.glb');
  
  // Load cleaned texture featuring exact mapped colors (#F2EBDD cream body, #3B2118 sleeve, #111111 lid) and crisp GRABBIT logo
  const baseTexture = useTexture('/models/cleaned_basecolor.jpg');
  baseTexture.flipY = false;
  baseTexture.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.map = baseTexture;
            mat.roughness = 0.75;
            mat.metalness = 0.02;
            mat.needsUpdate = true;
          }
        }
      });
    }
  }, [scene, baseTexture]);

  // Idle rotation: 1 complete turn every 22 seconds
  const rotationSpeed = (2 * Math.PI) / 22;
  
  useFrame((_, delta) => {
    if (!group.current) return;
    
    // 1. Smooth idle rotation
    group.current.rotation.y += rotationSpeed * delta;
    
    // 2. Mouse response (Max 8 degrees = ~0.14 radians)
    const targetX = mouseY.current * 0.14;
    const targetZ = -mouseX.current * 0.14;
    
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.05);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetZ, 0.05);
  });

  return (
    <group ref={group} dispose={null}>
      {/* Subtle floating effect - Perfectly centered to prevent top or bottom cutoff */}
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.2} floatingRange={[-0.03, 0.03]}>
        <primitive 
          object={scene} 
          scale={1.3} 
          position={[0, 0, 0]} 
        />
      </Float>
    </group>
  );
}

if (typeof window !== 'undefined') {
  useGLTF.preload('/models/grabit-coffee-cup.glb');
  useTexture.preload('/models/cleaned_basecolor.jpg');
}

export default function CoffeeCup3D() {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { rootMargin: '150px' }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 2 - 1;
    const y = -((e.clientY - top) / height) * 2 + 1;
    mouseX.current = x;
    mouseY.current = y;
  };

  const handleMouseLeave = () => {
    mouseX.current = 0;
    mouseY.current = 0;
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[180px] sm:min-h-[220px] md:min-h-[240px] lg:min-h-[260px] flex items-center justify-center relative pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {inView && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <Canvas
            shadows
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 6.2], fov: 30 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            style={{ background: 'transparent' }}
          >
            {/* Studio Lighting Setup */}
            <ambientLight intensity={0.55} />
            <hemisphereLight color="#ffffff" groundColor="#3B2118" intensity={0.35} />
            <directionalLight 
              position={[4, 5, 4]} 
              intensity={1.35} 
              castShadow 
              shadow-mapSize={[512, 512]} 
            />
            <directionalLight position={[-4, 2, 3]} intensity={0.55} />
            <directionalLight position={[0, 4, -4]} intensity={0.65} />

            <PresentationControls
              global
              speed={1.2}
              zoom={1}
              rotation={[0, 0, 0]}
              polar={[-Math.PI / 5, Math.PI / 5]}
              azimuth={[-Math.PI / 2, Math.PI / 2]}
            >
              <Model mouseX={mouseX} mouseY={mouseY} />
            </PresentationControls>

            {/* Soft, natural contact shadow beneath cup base */}
            <ContactShadows 
              position={[0, -1.0, 0]} 
              opacity={0.2} 
              scale={3.5} 
              blur={2.5} 
              far={4} 
              resolution={256} 
              color="#111111"
            />
          </Canvas>
        </motion.div>
      )}
    </div>
  );
}
