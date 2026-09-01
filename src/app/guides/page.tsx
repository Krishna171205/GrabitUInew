import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/LegalLayout';
import { GUIDES } from '@/content/guides';
import { SITE_NAME, canonicalUrl, breadcrumbList } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Guides: Ordering Ahead in Delhi',
  description:
    'Practical guides to ordering coffee ahead in Delhi: how pre-order pickup works, how it compares to delivery apps, where to order near DTU, and how cafes set it up.',
  alternates: { canonical: canonicalUrl('/guides') },
  robots: { index: true, follow: true },
};

export default function GuidesIndex() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Guides | ${SITE_NAME}`,
      url: canonicalUrl('/guides'),
      description: metadata.description,
      hasPart: GUIDES.map((g) => ({
        '@type': 'Article',
        headline: g.title,
        url: canonicalUrl(`/guides/${g.slug}`),
        description: g.description,
        datePublished: g.updated,
      })),
    },
    breadcrumbList([{ name: 'Guides', path: '/guides' }]),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LegalLayout title="Guides">
        <p>
          How ordering ahead actually works, what it costs, and when it beats a delivery app. Written for people
          buying coffee in Delhi and for the cafes serving it.
        </p>
        <ul>
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`}>{g.title}</Link>: {g.description}
            </li>
          ))}
        </ul>
        <h2>Start here</h2>
        <p>
          If you have never pre-ordered before, read{' '}
          <Link href="/guides/order-coffee-online-delhi">how to order coffee online in Delhi</Link>. If you run a
          cafe, <Link href="/guides/order-ahead-system-for-cafes">setting up order-ahead at your cafe</Link> covers
          what changes at the counter. The cafes you can order from today are on the{' '}
          <Link href="/cafes">cafes page</Link>.
        </p>
      </LegalLayout>
    </>
  );
}
