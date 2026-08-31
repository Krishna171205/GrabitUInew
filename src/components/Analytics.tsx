'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

/**
 * Google Tag Manager. GTM is the container; GA4 (and anything else) is
 * configured inside it, so adding a tag later needs no deploy.
 *
 * Renders nothing when NEXT_PUBLIC_GTM_ID is unset, which is the case in local
 * dev, so no phantom traffic in the property, no console noise.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * The app is a client-side-routed SPA: after the first load Next swaps the page
 * with history.pushState and no new document is fetched, so GTM's initial
 * pageview fires exactly once. Push an explicit event per route change instead
 * of relying on every GTM container being configured with a History Change
 * trigger.
 *
 * Reads the query string off window rather than useSearchParams(), which would
 * opt every statically rendered page in the app out of static rendering.
 */
function RouteChangeTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GTM_ID) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_path: `${pathname}${window.location.search}`,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}

export function Analytics() {
  if (!GTM_ID) return null;

  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
      <RouteChangeTracker />
    </>
  );
}
