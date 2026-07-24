import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs'

const isDev = process.env.NODE_ENV === 'development';

const securityHeaders = [
  // XSS: only allow scripts from self + Cashfree SDK + Supabase
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // 'unsafe-eval' needed in dev: Next.js wraps HMR/dynamic chunks in eval() for source maps
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://sdk.cashfree.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cashfree.com https://sandbox.cashfree.com https://nominatim.openstreetmap.org https://api.grabit365.com${isDev ? ' http://localhost:8083' : ''}`,
      "frame-src https://sdk.cashfree.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
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
    ];
  },
};

export default withSentryConfig(nextConfig, { silent: true });
