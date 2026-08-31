import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy · Grabbit | LetsGrabbit — Cafe Pre-order App',
  description: 'How Grabbit (LetsGrabbit) collects, uses, and protects your personal information when you order coffee ahead.',
  keywords: ['grabbit privacy', 'lets grabbit privacy policy', 'grabbit data protection', 'cafe app privacy'],
  openGraph: {
    title: 'Privacy Policy · Grabbit | LetsGrabbit',
    description: 'How Grabbit collects, uses, and protects your personal information when you order coffee ahead.',
    url: `${SITE_URL}/privacy`,
    siteName: 'Grabbit',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: `${SITE_URL}/og-image.svg`, width: 1200, height: 630, alt: 'Grabbit Privacy Policy' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@grabbit',
    title: 'Privacy Policy · Grabbit | LetsGrabbit',
    description: 'How Grabbit collects, uses, and protects your personal information.',
    images: [`${SITE_URL}/og-image.svg`],
  },
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

const EMAIL = 'hello@unifiednexgrade.com';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="5 July 2026">
      <p>
        This Privacy Policy explains how <strong>Unified Nexgrade Private Limited</strong>
        (&quot;Grabbit&quot;, &quot;we&quot;) collects, uses, and protects your information when you use
        the Grabbit platform.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account details:</strong> your mobile number and name for login and order updates.</li>
        <li><strong>Order details:</strong> items ordered, pickup slot, and the cafe you ordered from.</li>
        <li><strong>Payment details:</strong> processed securely by Cashfree Payments. We do not store full card numbers.</li>
        <li><strong>Usage data:</strong> basic device and app-interaction data to keep the service reliable.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To process and hand over your orders through partner cafes.</li>
        <li>To send order status updates (including via WhatsApp/SMS).</li>
        <li>To process payments and refunds.</li>
        <li>To improve the platform and provide support.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We share only what is necessary: your order and pickup details with the cafe fulfilling it,
        and payment information with our payment processor. We do not sell your personal data.
      </p>

      <h2>Data security & retention</h2>
      <p>
        We use reasonable technical and organisational measures to protect your data and retain it
        only as long as needed to provide the service and meet legal obligations.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data by emailing{' '}
        <a href={`mailto:${EMAIL}?subject=Privacy%20request`}>{EMAIL}</a>.
      </p>

      <h2>Contact</h2>
      <p>
        For any privacy question, reach us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or via our{' '}
        <a href="/contact">Contact Us</a> page.
      </p>
    </LegalLayout>
  );
}
