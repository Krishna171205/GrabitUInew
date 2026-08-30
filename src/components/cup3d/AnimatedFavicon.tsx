'use client';
import { useEffect, useRef } from 'react';
import GrabbitCup3D from './GrabbitCup3D';

// Sampling the WebGL canvas into the tab icon a few times a second reads as a
// spin without the cost (or tab-throttling risk) of doing it every frame.
const CAPTURE_MS = 130;

/**
 * Mounted once, site-wide: renders the cup into an off-screen canvas and
 * pushes its frames onto the real <link rel="icon">, so the browser tab shows
 * the same rotating cup as the on-page 3D spots.
 */
export default function AnimatedFavicon() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    const original = link.href;

    let cancelled = false;
    let findCanvasFrame: number;
    let timer: ReturnType<typeof setInterval> | undefined;

    // The scene mounts async (dynamic import + IntersectionObserver), so the
    // <canvas> isn't there on first paint - keep checking until it is.
    const waitForCanvas = () => {
      if (cancelled) return;
      const canvas = hostRef.current?.querySelector('canvas');
      if (!canvas) {
        findCanvasFrame = requestAnimationFrame(waitForCanvas);
        return;
      }
      timer = setInterval(() => {
        try {
          link.href = canvas.toDataURL('image/png');
        } catch {
          // Not ready yet on this tick - next interval will catch it.
        }
      }, CAPTURE_MS);
    };
    findCanvasFrame = requestAnimationFrame(waitForCanvas);

    return () => {
      cancelled = true;
      cancelAnimationFrame(findCanvasFrame);
      if (timer) clearInterval(timer);
      link.href = original;
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      style={{ position: 'fixed', top: 0, left: 0, width: 48, height: 48, opacity: 0, pointerEvents: 'none', zIndex: -1 }}
    >
      <GrabbitCup3D variant="favicon" interactive={false} />
    </div>
  );
}
