'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Browser / system back on this screen goes to `path` instead of walking the real
 * history, which still holds the cart and Cashfree entries this tab visited. Use it
 * on any screen whose own back button jumps somewhere other than the previous page.
 *
 * ponytail: a sentinel history entry + popstate is the only web API for intercepting
 * back; it costs one extra history entry per visit to the screen.
 */
export function useBackTo(path: string) {
  const router = useRouter();
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const onPop = () => router.replace(path);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [router, path]);
}
