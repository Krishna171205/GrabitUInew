import type { NextConfig } from 'next';

const securityHeaders = [
  // XSS: only allow scripts from self + Cashfree SDK + Supabase
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://sdk.cashfree.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cashfree.com https://sandbox.cashfree.com",
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
  transpilePackages: ['@gradient365/types'],
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

export default nextConfig;
