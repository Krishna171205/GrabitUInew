/**
 * Static sitemap for letsgrabbit.com.
 * Generated at build time via `next build` — no runtime cost.
 * Covers all public, indexable routes with appropriate priority
 * and change frequency to guide Googlebot crawlers.
 *
 * Target keywords: "lets grabbit", "grabbit"
 */
import { SITE_URL, sitemapDate } from '@/lib/seo';

export const revalidate = 86400; // regenerate once per day

export default async function sitemap() {
  const staticRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/partner', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'monthly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'monthly' as const },
    { path: '/refunds', priority: 0.3, changeFrequency: 'monthly' as const },
  ];

  return staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    lastModified: sitemapDate(),
    changeFrequency,
    priority,
  }));
}
