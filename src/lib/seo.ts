/**
 * Shared SEO constants for Grabbit (letsgrabbit.com).
 *
 * Single source of truth for metadata, robots.txt, the sitemap and JSON-LD.
 * Anything that names a route or a keyword belongs here, not inlined in a page,
 * so robots/sitemap/metadata can never drift apart.
 */

export const SITE_URL = 'https://letsgrabbit.com';
export const SITE_NAME = 'Grabbit';
export const ALTERNATE_NAMES = ['LetsGrabbit', 'Lets Grabbit', 'Grabbit Coffee'];

export const DESCRIPTION =
  'Grabbit: order coffee and snacks ahead from cafes near you in Delhi. ' +
  'Pre-order any time, skip the queue with pickup in minutes, or get it delivered by our cafe delivery partners. ' +
  'Pay online with UPI, card, or netbanking. WhatsApp updates. Now live in Delhi.';

export const SUPPORT_EMAIL = 'hello@unifiednexgrade.com';

/**
 * `sameAs` entity signals. Only profiles we actually own belong here, because pointing
 * at a same-named profile owned by someone else tells Google the Grabbit entity
 * is that other account, which is worse than having no sameAs at all.
 * Empty until each handle is confirmed.
 */
export const SOCIAL_PROFILES: string[] = [];

export const BRAND_KEYWORDS = [
  'lets grabbit',
  'letsgrabbit',
  'grabbit',
  'grabbit app',
  'order ahead',
  'cafe ordering',
  'coffee order ahead delhi',
  'pre order coffee',
  'skip the queue',
  'cafe pickup',
  'delhi cafe app',
];

export const PRIMARY_KEYWORDS = ['lets grabbit', 'grabbit'];

/** Public, indexable routes. Drives the sitemap. */
export const INDEXED_ROUTES = [
  '/',
  '/about',
  '/faq',
  '/cafes',
  '/guides',
  '/partner',
  '/contact',
  '/privacy',
  '/terms',
  '/refunds',
] as const;

/**
 * Auth gates and signed-in app shells. No content to rank, and indexing them
 * burns crawl budget on pages that redirect. Kept in sync with the X-Robots-Tag
 * rule in next.config.ts.
 */
export const NOINDEX_ROUTES = [
  '/login',
  '/complete-profile',
  '/brand-type',
  '/partner/signup',
  '/home',
  '/explore',
  '/orders',
  '/profile',
  '/settings',
  '/notifications',
  '/support',
  '/location',
  '/moved',
] as const;

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
  '@id': `${SITE_URL}/#organization`,
  name: 'Grabbit',
  alternateName: ALTERNATE_NAMES,
  url: SITE_URL,
  logo: `${SITE_URL}/new-logo.svg`,
  brand: { '@type': 'Brand', name: 'Grabbit', alternateName: ['LetsGrabbit', 'Lets Grabbit'] },
  description: DESCRIPTION,
  foundingDate: '2025',
  parentOrganization: { '@type': 'Organization', name: 'Unified Nexgrade', url: 'https://unifiednexgrade.com' },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: SUPPORT_EMAIL,
      availableLanguage: ['English', 'Hindi'],
      areaServed: 'IN',
      serviceType: 'Cafe pre-order platform',
    },
  ],
  ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  address: { '@type': 'PostalAddress', addressLocality: 'Delhi', addressRegion: 'Delhi NCR', addressCountry: 'IN' },
};

export const websiteSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Grabbit',
  alternateName: ALTERNATE_NAMES,
  url: SITE_URL,
  description: DESCRIPTION,
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: [
    {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/cafes?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
      name: 'Search cafes and menu items',
    },
  ],
  inLanguage: 'en-IN',
};

/**
 * Answers are written to stand alone. An AI engine quoting one sentence out of
 * this block should still produce a correct, attributable answer. That is the
 * whole point of the passage, not the (commercial-site) rich result.
 */
export const faqSchema: SeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${SITE_URL}/faq#faqpage`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Grabbit?',
      acceptedAnswer: { '@type': 'Answer', text: 'Grabbit (letsgrabbit.com) is a cafe pre-order app in Delhi. You browse a cafe menu, pay online, and pick the order up at the counter without queueing. It is built by Unified Nexgrade and is live at cafes in Delhi NCR.' },
    },
    {
      '@type': 'Question',
      name: 'How does Grabbit work?',
      acceptedAnswer: { '@type': 'Answer', text: 'Browse menus from cafes near you, customize your order, choose a pickup time, and pay online with UPI, card, or netbanking. Your order is ready when you arrive, with no queue.' },
    },
    {
      '@type': 'Question',
      name: 'Do I need to download an app to use Grabbit?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Grabbit runs in the browser at letsgrabbit.com. Open the cafe link, order, and pay, and there is nothing to install. You can add it to your home screen if you want app-like access.' },
    },
    {
      '@type': 'Question',
      name: 'Where is Grabbit available?',
      acceptedAnswer: { '@type': 'Answer', text: 'Grabbit is live in Delhi NCR, including cafes on and around the Delhi Technological University (DTU) campus in Rohini. New cafes are added as they join.' },
    },
    {
      '@type': 'Question',
      name: 'How do I pay for my order?',
      acceptedAnswer: { '@type': 'Answer', text: 'Checkout is prepaid: pay online with UPI, card, or netbanking through Cashfree and your order goes straight to the cafe.' },
    },
    {
      '@type': 'Question',
      name: 'How do I get updates on my order?',
      acceptedAnswer: { '@type': 'Answer', text: 'Order status updates are sent via WhatsApp at every step, from confirmed, to prepping, to ready for pickup.' },
    },
    {
      '@type': 'Question',
      name: 'Can I schedule a pickup for later?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Set any pickup time that works, from 15 minutes from now or hours ahead. No fixed slots, no limits.' },
    },
    {
      '@type': 'Question',
      name: 'Does Grabbit charge the cafe a commission?',
      acceptedAnswer: { '@type': 'Answer', text: 'Grabbit is a pre-order and pickup platform, not a marketplace that takes a per-order cut of the menu price. Cafes keep their own pricing and their own customers. Partnership terms are on the partner page.' },
    },
    {
      '@type': 'Question',
      name: 'How is Grabbit different from Zomato or Swiggy?',
      acceptedAnswer: { '@type': 'Answer', text: 'Zomato and Swiggy are delivery marketplaces. Grabbit is order-ahead for pickup: you order from one cafe you already chose, pay online, and collect at the counter, so there is no rider, no delivery wait, and no marketplace markup on the menu.' },
    },
    {
      '@type': 'Question',
      name: 'How do I get a refund on Grabbit?',
      acceptedAnswer: { '@type': 'Answer', text: 'If a cafe cannot fulfil a paid order, the amount is refunded to the original payment method. Refund timelines and the full policy are on the refunds page at letsgrabbit.com/refunds.' },
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

/** Breadcrumb trail for a nested page. `Home` is always position 1. */
export function breadcrumbList(trail: { name: string; path: string }[]): SeoSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.path),
    })),
  };
}

export interface CafeSeoInput {
  name: string;
  slug: string;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  cover_url?: string | null;
  logo_url?: string | null;
  hours?: { day_of_week: number; opens: string; closes: string }[] | null;
}

// schema.org wants day names; the API returns ISO-8601 weekday numbers (1 = Monday).
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Per-cafe `Restaurant` node. This is what makes a cafe page eligible for the
 * local pack and for "can I order ahead from X" answers: name + geo + hours +
 * an OrderAction that names the exact URL an engine should send a user to.
 */
export function cafeSchema(cafe: CafeSeoInput): SeoSchema {
  const url = canonicalUrl(`/${cafe.slug}`);
  const hours = (cafe.hours ?? [])
    .filter((h) => DAY_NAMES[h.day_of_week - 1])
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DAY_NAMES[h.day_of_week - 1],
      opens: h.opens?.slice(0, 5),
      closes: h.closes?.slice(0, 5),
    }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${url}#restaurant`,
    name: cafe.name,
    url,
    ...(cafe.cover_url || cafe.logo_url ? { image: [cafe.cover_url, cafe.logo_url].filter(Boolean) } : {}),
    servesCuisine: ['Coffee', 'Cafe'],
    address: {
      '@type': 'PostalAddress',
      ...(cafe.address ? { streetAddress: cafe.address.trim() } : {}),
      addressLocality: cafe.city || 'Delhi',
      addressRegion: 'Delhi',
      addressCountry: 'IN',
    },
    ...(cafe.latitude && cafe.longitude
      ? { geo: { '@type': 'GeoCoordinates', latitude: cafe.latitude, longitude: cafe.longitude } }
      : {}),
    ...(hours.length ? { openingHoursSpecification: hours } : {}),
    hasMenu: url,
    acceptsReservations: false,
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: url,
        actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
      },
      deliveryMethod: ['https://schema.org/OnSitePickup'],
    },
    provider: { '@id': `${SITE_URL}/#organization` },
  };
}

export const schemas = {
  organization: organizationSchema,
  website: websiteSchema,
  faq: faqSchema,
  howTo: howToSchema,
};
