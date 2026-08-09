import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs'
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

const securityHeaders = [
  // XSS: only allow scripts from self + Cashfree SDK
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // 'unsafe-eval' needed in dev: Next.js wraps HMR/dynamic chunks in eval() for source maps
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://sdk.cashfree.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      // The avatar upload PUTs straight to S3 on a presigned URL, so the bucket host
      // has to be allowed here or the browser blocks the request before it is sent.
      // That failure is invisible server-side (no S3 log, no object) and surfaces to
      // the user only as "Load failed", the same way the Cashfree iframe did below.
      `connect-src 'self' https://api.cashfree.com https://sandbox.cashfree.com https://nominatim.openstreetmap.org https://api.grabit365.com https://gradient-cafe-assets-676591241313.s3.ap-south-1.amazonaws.com${isDev ? ' http://localhost:8083' : ''}`,
      // sdk.cashfree.com only hosts the loader/ping atoms. The v3 Drop-in renders the actual
      // checkout by POSTing a form into a modal iframe at api.cashfree.com/pg/view/sessions/checkout
      // (sandbox.cashfree.com in sandbox), so both frame-src AND form-action must allow it -
      // confirmed via securitypolicyviolation events, which is the only place this surfaced:
      // the blocked iframe just left the customer on a blank full-screen overlay with no error.
      "frame-src https://sdk.cashfree.com https://api.cashfree.com https://sandbox.cashfree.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://api.cashfree.com https://sandbox.cashfree.com",
      "upgrade-insecure-requests",
    ].join('; '),
  },
  // Prevent browsers from MIME-sniffing response types
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Strict HTTPS for 1 year once deployed
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Don't leak referrer to third-party sites
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features not needed by Grabit
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  // Next 15 defaults the client router cache to 0s for dynamic routes, so tapping
  // back (or re-tapping a tab) refetches the whole RSC payload every time. 30s of
  // reuse makes back/forward and tab re-visits instant.
  experimental: { staleTimes: { dynamic: 30, static: 180 } },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Defense-in-depth: prevent Google from indexing auth gates and app routes
      // even if a robots.txt entry is missed. Matches NOINDEX_ROUTES in src/lib/seo.ts
      {
        source: '/(login|complete-profile|brand-type|partner/signup|home|explore|orders|profile|settings|notifications|support|location)(/.*)?',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, { silent: true });
