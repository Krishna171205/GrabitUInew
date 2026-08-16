'use client';
/**
 * Reloads the app when the deployment it is running has been replaced.
 *
 * Added to the home screen, Grabbit is a web clip: iOS suspends it rather than
 * closing it, so the same JS bundle can stay live for days and a deploy never
 * reaches the customer. There is no service worker to fire an update event, so
 * ask the server which build it is serving whenever the app comes back to the
 * foreground, and reload if it no longer matches the build we are running.
 */
import { useEffect } from 'react';

/** Flows where a reload would cost the customer money or an order. */
const NEVER_RELOAD = /\/(cart|checkout|order|wallet)(\/|$)/;

const MIN_GAP_MS = 60_000;

/**
 * Reload only on a definite mismatch. A missing, unreadable or identical id must
 * leave the app alone, or a bad deploy turns into a reload loop for every user.
 */
export function shouldReload(runningBuildId: string | undefined, serverBuildId: unknown, pathname: string): boolean {
  if (!runningBuildId) return false;
  if (typeof serverBuildId !== 'string' || !serverBuildId) return false;
  if (serverBuildId === runningBuildId) return false;
  return !NEVER_RELOAD.test(pathname);
}

export function UpdateOnResume() {
  useEffect(() => {
    const running = process.env.NEXT_PUBLIC_BUILD_ID;
    if (!running) return;
    let lastCheck = 0;

    async function check() {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastCheck < MIN_GAP_MS) return;
      lastCheck = Date.now();
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const { buildId } = await res.json();
        if (shouldReload(running, buildId, window.location.pathname)) window.location.reload();
      } catch {
        // Offline or the check failed. Nothing to do, try again on next resume.
      }
    }

    // visibilitychange covers app switching, focus covers window focus on desktop,
    // pageshow covers a bfcache restore (how an iOS web clip usually comes back).
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    window.addEventListener('pageshow', check);
    return () => {
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
      window.removeEventListener('pageshow', check);
    };
  }, []);

  return null;
}
