import type { MetadataRoute } from 'next';
import { SITE_URL, NOINDEX_ROUTES } from '@/lib/seo';

/**
 * robots.txt, generated from the same route lists the sitemap and the
 * X-Robots-Tag header use, so the three can't drift.
 *
 * Two deliberate changes from the old static file:
 *  - no Crawl-delay. Googlebot ignores it, but Bing honours it, and a delay of
 *    10s on a site this small just slows discovery down for no benefit.
 *  - AI crawlers are allowed explicitly. Being quotable by ChatGPT/Claude/
 *    Perplexity is the point; they are separate user agents from Googlebot and
 *    an engine that can't fetch the page can't cite it.
 */

// Signed-in cafe/customer surfaces that live under the /:slug namespace.
const CAFE_PRIVATE_PATHS = ['/*/manage', '/*/cart', '/*/order', '/*/profile', '/*/wallet'];

const DISALLOW = [...NOINDEX_ROUTES, ...CAFE_PRIVATE_PATHS, '/api/', '/_next/', '/static/'];

const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'meta-externalagent',
  'Amazonbot',
  'cohere-ai',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      // Named so the allow is unambiguous even if the wildcard rule ever tightens.
      { userAgent: AI_CRAWLERS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
