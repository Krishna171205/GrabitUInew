'use client';
import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows, Environment, Lightformer, Float } from '@react-three/drei';
import * as THREE from 'three';
import { CUP_MODEL_URL, type CupVariant, VARIANTS } from './config';

/**
 * The heavy half of the cup: three.js + the GLB. Only ever reached through
 * GrabbitCup3D, which dynamic()-imports it, so none of this lands in a bundle
 * for a page that never scrolls the cup into view.
 */

function Cup({
  variant,
  pointer,
  still,
}: {
  variant: CupVariant;
  pointer: React.RefObject<{ x: number; y: number }>;
  still: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  // useDraco / useMeshopt both off: the cup is plain uncompressed glTF, and drei's
  // defaults would otherwise (a) point a DRACOLoader at gstatic.com and (b) compile
  // the meshopt WASM blob - both blocked by this app's CSP, the second loudly.
  const { scene } = useGLTF(CUP_MODEL_URL, false, false);
  const cfg = VARIANTS[variant];

  // One GLB, several placements on screen at once (footer + cart) - sharing the
  // cached scene graph would make them yank each other's transforms around, so
  // each mount gets its own clone. Materials stay shared, which is what we want.
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat) return;
      // scripts/build-cup-model.js authors the roughness/metalness map, so the
      // only thing left to set is how hard the procedural env below reflects in
      // it - matte card wants noticeably less than the drei default of 1.
      mat.envMapIntensity = 0.72;
      mat.needsUpdate = true;
    });
  }, [model]);

  const spin = (2 * Math.PI) / cfg.secondsPerTurn;

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    if (!still) g.rotation.y += spin * delta;
    // Pointer parallax, capped at cfg.tilt radians so the cup never swings far
    // enough to show the unmapped underside of the lid.
    const targetX = pointer.current.y * cfg.tilt;
    const targetZ = -pointer.current.x * cfg.tilt;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, 0.06);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, targetZ, 0.06);
  });

  const body = (
    <group ref={group} dispose={null}>
      <primitive object={model} scale={cfg.scale} position={[0, cfg.yOffset, 0]} />
    </group>
  );

  // Float re-renders every frame; skip it entirely for reduced-motion rather
  // than feeding it a zero intensity.
  return still ? body : (
    <Float speed={1.1} rotationIntensity={0} floatIntensity={0.35} floatingRange={[-0.035, 0.035]}>
      {body}
    </Float>
  );
}

export default function GrabbitCupScene({
  variant,
  pointer,
  still,
}: {
  variant: CupVariant;
  pointer: React.RefObject<{ x: number; y: number }>;
  still: boolean;
}) {
  const cfg = VARIANTS[variant];

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, cfg.camera], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.15} />
      <directionalLight position={[-4, 1.5, 2]} intensity={0.4} />

      <Cup variant={variant} pointer={pointer} still={still} />

      {/* Procedural studio env. Drei's named presets (`preset="city"`) pull an HDR
          from a CDN, which this app's connect-src CSP blocks outright - the cup
          would just render flat and unlit with a console error. Lightformers build
          the same soft box reflections in-process, no network. */}
      <Environment resolution={192}>
        <Lightformer intensity={2.2} position={[0, 3, 2]} scale={[8, 6, 1]} color="#ffffff" />
        <Lightformer intensity={0.9} position={[-4, 1, 2]} scale={[4, 6, 1]} color="#cfe0ff" />
        <Lightformer intensity={0.7} position={[4, 0, 2]} scale={[4, 6, 1]} color="#ffffff" />
        <Lightformer intensity={0.5} position={[0, -3, 1]} scale={[8, 3, 1]} color="#ffffff" />
      </Environment>

      <ContactShadows
        position={[0, cfg.shadowY, 0]}
        opacity={cfg.shadowOpacity}
        scale={3.6}
        blur={2.6}
        far={4}
        resolution={256}
        color="#0F172A"
      />
    </Canvas>
  );
}

// Args must match the useGLTF call above or the two miss each other's cache entry.
useGLTF.preload(CUP_MODEL_URL, false, false);
