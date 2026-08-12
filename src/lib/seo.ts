/**
 * Shared SEO constants for Grabbit.
 * Used across layout, pages, sitemap, and robots.
 */

export const SITE_URL = 'https://letsgrabbit.com';
export const SITE_NAME = 'Grabbit';
export const ALTERNATE_NAMES = ['LetsGrabbit', 'Lets Grabbit', 'Grabit', 'Order Ahead'];

export const DESCRIPTION =
  'Grabbit — order coffee and snacks ahead from cafes near you in Delhi. ' +
  'Pre-order, skip the queue, pick up in minutes. ' +
  'Pay online with UPI, card, or netbanking. WhatsApp updates. Now live in Delhi.';

export const BRAND_KEYWORDS = [
  'lets grabbit',
  'lets grabit',
  'grabbit',
  'grabit',
  'order ahead',
  'cafe ordering',
  'coffee order ahead delhi',
  'pre order coffee',
  'skip the queue',
  'cafe pickup',
  'delhi cafe app',
];

export const PRIMARY_KEYWORDS = ['lets grabbit', 'lets grabit', 'grabbit'];

// Pages that should be indexed by search engines
export const INDEXED_ROUTES = ['/', '/partner', '/contact', '/privacy', '/terms', '/refunds'] as const;

// Pages that should NOT be indexed (auth gates, app internals, design docs)
export const NOINDEX_ROUTES = ['/login', '/complete-profile', '/brand-type', '/partner/signup', '/home', '/explore', '/orders', '/profile', '/settings', '/notifications', '/support', '/location', '/[slug]'] as const;

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/** Build the full canonical URL for a path. */
export function canonicalUrl(path: string): string {
  const cleanPath = path === '/' ? '' : path;
  return `${SITE_URL}${cleanPath}`;
}

/** @returns ISO-8601 date string for the sitemap `lastmod` field. */
export function sitemapDate(date: Date = new Date()): string {
  return date.toISOString();
}

// ── Structured Data (JSON-LD) ────────────────────────────────────────────────

export interface SeoSchema {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export const organizationSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Grabbit',
  alternateName: ['LetsGrabbit', 'Lets Grabbit', 'Grabit', 'Grabbit Coffee'],
  url: SITE_URL,
  logo: `${SITE_URL}/grabbit-logo.svg`,
  brand: { '@type': 'Brand', name: 'Grabbit', alternateName: ['LetsGrabbit', 'Lets Grabit', 'Grabit'] },
  description: DESCRIPTION,
  keywords: BRAND_KEYWORDS.join(', '),
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'gradient365.team@gmail.com',
      availableLanguage: ['English', 'Hindi'],
      areaServed: 'IN',
      serviceType: 'Cafe pre-order platform',
    },
  ],
  sameAs: ['https://instagram.com/grabbit', 'https://twitter.com/grabbit', 'https://linkedin.com/company/grabbit'],
  address: { '@type': 'PostalAddress', addressLocality: 'Delhi', addressRegion: 'Delhi NCR', addressCountry: 'IN' },
};

export const websiteSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Grabbit',
  alternateName: ['LetsGrabbit', 'Grabit'],
  url: SITE_URL,
  description: DESCRIPTION,
  keywords: BRAND_KEYWORDS.join(', '),
  publisher: { '@type': 'Organization', name: 'Grabbit' },
  potentialAction: [
    {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/explore?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
      name: 'Search cafes and menu items',
    },
  ],
  inLanguage: 'en-IN',
};

export const faqSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does Grabbit work?',
      acceptedAnswer: { '@type': 'Answer', text: 'Browse menus from cafes near you, customize your order, choose a pickup time, and pay online with UPI, card, or netbanking. Your order is ready when you arrive — no queue.' },
    },
    {
      '@type': 'Question',
      name: 'Where is Grabbit available?',
      acceptedAnswer: { '@type': 'Answer', text: 'Grabbit is now live in Delhi NCR. Order ahead from your favourite cafes in and around Delhi.' },
    },
    {
      '@type': 'Question',
      name: 'How do I pay for my order?',
      acceptedAnswer: { '@type': 'Answer', text: 'Checkout is prepaid: pay online with UPI, card, or netbanking and your order goes straight to the cafe.' },
    },
    {
      '@type': 'Question',
      name: 'How do I get updates on my order?',
      acceptedAnswer: { '@type': 'Answer', text: 'Order status updates are sent via WhatsApp at every step — from confirmed, to prepping, to ready for pickup.' },
    },
    {
      '@type': 'Question',
      name: 'Can I schedule a pickup for later?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Set any pickup time that works — 15 minutes from now or hours ahead. No fixed slots, no limits.' },
    },
  ],
};

export const howToSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to order with Grabbit',
  description: 'Pre-order coffee and snacks from cafes near you in 3 simple steps.',
  step: [
    { '@type': 'HowToStep', url: `${SITE_URL}/#how-it-works`, name: 'Pick your cafe', text: 'Browse menus from cafes near you. No login needed to look around.', position: 1 },
    { '@type': 'HowToStep', url: `${SITE_URL}/#how-it-works`, name: 'Customize & pay', text: 'Build your order, choose a pickup slot, and check out in a tap.', position: 2 },
    { '@type': 'HowToStep', url: `${SITE_URL}/#how-it-works`, name: 'Grab & go', text: 'Skip the queue. Collect your order from the counter when it is ready.', position: 3 },
  ],
  totalTime: 'PT3M',
};

export const breadcrumbSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Grabbit — Home', item: SITE_URL }],
};

export const schemas = {
  organization: organizationSchema,
  website: websiteSchema,
  faq: faqSchema,
  howTo: howToSchema,
  breadcrumb: breadcrumbSchema,
};

