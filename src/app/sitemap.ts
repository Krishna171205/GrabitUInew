/**
 * Sitemap for letsgrabbit.com: the static marketing/legal routes plus one entry
 * per live cafe. Cafe pages are the only part of the site that grows, and they
 * are the pages that answer "<cafe name> order online", so they have to be
 * discoverable without waiting for a crawler to find an internal link.
 *
 * Revalidated daily; a failed cafe fetch degrades to the static routes rather
 * than serving an empty sitemap.
 */
import type { MetadataRoute } from 'next';
import { SITE_URL, INDEXED_ROUTES, canonicalUrl, sitemapDate } from '@/lib/seo';
import { GUIDES } from '@/content/guides';

export const revalidate = 86400; // regenerate once per day

const PRIORITY: Record<string, { priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = {
  '/': { priority: 1.0, changeFrequency: 'daily' },
  '/cafes': { priority: 0.9, changeFrequency: 'daily' },
  '/about': { priority: 0.8, changeFrequency: 'monthly' },
  '/partner': { priority: 0.8, changeFrequency: 'weekly' },
  '/faq': { priority: 0.7, changeFrequency: 'monthly' },
  '/guides': { priority: 0.7, changeFrequency: 'weekly' },
  '/contact': { priority: 0.5, changeFrequency: 'monthly' },
};
const DEFAULT_PRIORITY = { priority: 0.3, changeFrequency: 'monthly' as const };

async function getCafeSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const cafes: { slug?: string }[] = await res.json();
    return cafes.map((c) => c.slug).filter((s): s is string => !!s);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = sitemapDate();
  const slugs = await getCafeSlugs();

  const staticEntries = INDEXED_ROUTES.map((path) => ({
    url: canonicalUrl(path),
    lastModified,
    ...(PRIORITY[path] ?? DEFAULT_PRIORITY),
  }));

  const cafeEntries = slugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const guideEntries = GUIDES.map((guide) => ({
    url: canonicalUrl(`/guides/${guide.slug}`),
    lastModified: new Date(guide.updated).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...cafeEntries, ...guideEntries];
}
