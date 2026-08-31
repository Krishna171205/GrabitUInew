import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LegalLayout from '@/components/LegalLayout';
import { GUIDES, guideBySlug } from '@/content/guides';
import { SITE_NAME, SITE_URL, canonicalUrl, breadcrumbList } from '@/lib/seo';

// Fixed set of guides, so every one is prerendered at build and served as
// static HTML, nothing for a crawler to wait on.
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: 'Guide not found', robots: { index: false, follow: true } };

  return {
    title: guide.metaTitle,
    description: guide.description,
    alternates: { canonical: canonicalUrl(`/guides/${guide.slug}`) },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      locale: 'en_IN',
      siteName: SITE_NAME,
      url: canonicalUrl(`/guides/${guide.slug}`),
      title: guide.metaTitle,
      description: guide.description,
      publishedTime: guide.updated,
      modifiedTime: guide.updated,
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const url = canonicalUrl(`/guides/${guide.slug}`);
  const jsonLd: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: guide.title,
      description: guide.description,
      abstract: guide.summary,
      url,
      mainEntityOfPage: url,
      datePublished: guide.updated,
      dateModified: guide.updated,
      inLanguage: 'en-IN',
      author: { '@id': `${SITE_URL}/#organization` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      about: { '@type': 'Thing', name: 'Cafe pre-ordering and pickup' },
      // Named sections let an engine cite one heading rather than the page.
      hasPart: guide.sections.map((s) => ({ '@type': 'WebPageElement', name: s.heading })),
    },
    breadcrumbList([
      { name: 'Guides', path: '/guides' },
      { name: guide.title, path: `/guides/${guide.slug}` },
    ]),
  ];

  if (guide.faq?.length) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: guide.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LegalLayout title={guide.title} updated={guide.updated}>
        <p>
          <strong>In short:</strong> {guide.summary}
        </p>

        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body?.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((b) => (
                  <li key={b.slice(0, 40)}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {guide.faq?.length ? (
          <section>
            <h2>Common questions</h2>
            {guide.faq.map((f) => (
              <div key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>
        ) : null}

        <section>
          <h2>Next</h2>
          <ul>
            {(guide.related ?? []).map((slug) => {
              const other = guideBySlug(slug);
              return other ? (
                <li key={slug}>
                  <Link href={`/guides/${other.slug}`}>{other.title}</Link>
                </li>
              ) : null;
            })}
            <li>
              <Link href="/cafes">Cafes you can order ahead from today</Link>
            </li>
            <li>
              <Link href="/partner">Put your cafe on Grabbit</Link>
            </li>
          </ul>
        </section>
      </LegalLayout>
    </>
  );
}
