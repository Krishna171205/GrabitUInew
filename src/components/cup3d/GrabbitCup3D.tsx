'use client';
import { useRef, useEffect, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { VARIANTS, type CupVariant } from './config';

/**
 * The GRABBIT cup, rendered in 3D.
 *
 * This wrapper is the cheap half: it reserves the box, decides whether the cup
 * is worth rendering at all, and only then pulls in the three.js chunk. Nothing
 * here imports three, so a page that never scrolls the cup into view pays only
 * for this file.
 */
const Scene = dynamic(() => import('./GrabbitCupScene'), {
  ssr: false,
  loading: () => null,
});

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function GrabbitCup3D({
  variant = 'showcase',
  className,
  fallback = null,
  interactive = true,
}: {
  variant?: CupVariant;
  className?: string;
  /** Shown instead of the cup when WebGL is unavailable. */
  fallback?: ReactNode;
  /** Pointer parallax. Off for purely decorative placements. */
  interactive?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [mount, setMount] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [still, setStill] = useState(false);
  const cfg = VARIANTS[variant];

  useEffect(() => {
    if (!hasWebGL()) {
      setBlocked(true);
      return;
    }

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotion = () => setStill(motion.matches);
    applyMotion();
    motion.addEventListener('change', applyMotion);

    // Mount on approach, unmount on the way out: an off-screen Canvas keeps its
    // rAF loop (and the GPU) running, which is the whole cost of putting this in
    // a footer that most sessions scroll past once.
    const io = new IntersectionObserver(
      ([entry]) => setMount(entry.isIntersecting),
      { rootMargin: '200px' },
    );
    if (hostRef.current) io.observe(hostRef.current);

    return () => {
      io.disconnect();
      motion.removeEventListener('change', applyMotion);
    };
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!interactive || !hostRef.current) return;
    const { left, top, width, height } = hostRef.current.getBoundingClientRect();
    pointer.current = {
      x: ((e.clientX - left) / width) * 2 - 1,
      y: -((e.clientY - top) / height) * 2 + 1,
    };
  };

  const resetPointer = () => { pointer.current = { x: 0, y: 0 }; };

  if (blocked) {
    return <>{fallback}</>;
  }

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ minHeight: cfg.minHeight, width: '100%', height: '100%', position: 'relative' }}
      onPointerMove={onPointerMove}
      onPointerLeave={resetPointer}
      aria-hidden="true"
    >
      {mount && <Scene variant={variant} pointer={pointer} still={still} />}
    </div>
  );
}
