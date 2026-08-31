import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { SITE_URL } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Terms & Conditions · Grabbit | LetsGrabbit — Cafe Pre-order Platform',
  description: 'The terms governing your use of the Grabbit (LetsGrabbit) cafe pre-ordering platform in Delhi.',
  keywords: ['grabbit terms', 'lets grabbit terms', 'cafe app terms delhi', 'grabbit conditions'],
  openGraph: {
    title: 'Terms & Conditions · Grabbit | LetsGrabbit',
    description: 'The terms governing your use of the Grabbit cafe pre-ordering platform.',
    url: `${SITE_URL}/terms`,
    siteName: 'Grabbit',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: `${SITE_URL}/og-image.svg`, width: 1200, height: 630, alt: 'Grabbit Terms' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@grabbit',
    title: 'Terms & Conditions · Grabbit | LetsGrabbit',
    description: 'The terms governing your use of the Grabbit cafe pre-ordering platform.',
    images: [`${SITE_URL}/og-image.svg`],
  },
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
};

const EMAIL = 'hello@unifiednexgrade.com';

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" updated="5 July 2026">
      <p>
        These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of Grabbit
        (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;), operated by{' '}
        <strong>Unified Nexgrade Private Limited</strong>. By placing an order or otherwise using
        the Platform, you agree to these Terms.
      </p>

      <h2>1. What Grabbit does</h2>
      <p>
        Grabbit lets customers pre-order food and beverages from participating cafes for pickup at a
        chosen time slot. The cafe (&quot;Merchant&quot;) is the seller and is solely responsible for
        preparing and handing over your order. Grabbit facilitates ordering and payment between you
        and the Merchant.
      </p>

      <h2>2. Orders and pricing</h2>
      <ul>
        <li>All prices are listed in Indian Rupees (INR / ₹) and are inclusive of applicable taxes unless stated otherwise.</li>
        <li>Menu items, availability, and prices are set by each Merchant and may change without notice.</li>
        <li>An order is confirmed only after successful payment or after the Merchant accepts a pay-at-counter order.</li>
        <li>A paid order cannot be cancelled. It goes to the Merchant immediately so your pickup slot can be held. See our <a href="/refunds">Refunds &amp; Cancellations</a> policy for when a refund still applies.</li>
        <li>You must arrive within the selected pickup slot. Orders unclaimed after the cafe&apos;s stated holding time may be forfeited.</li>
      </ul>

      <h2>3. Payments</h2>
      <p>
        Online payments are processed by our payment partner (Cashfree Payments) via UPI, cards, and
        netbanking. We do not store your full card details. You agree to pay the total shown at
        checkout, including any delivery, packaging, or convenience charges displayed before payment.
      </p>

      <h2>4. Cancellations and refunds</h2>
      <p>
        Cancellations, refunds, and their timelines are governed by our{' '}
        <a href="/refunds">Refunds &amp; Cancellations</a> policy, which forms part of these Terms.
      </p>

      <h2>5. Acceptable use</h2>
      <ul>
        <li>Provide accurate contact and payment information.</li>
        <li>Do not misuse the Platform, place fraudulent orders, or infringe others&apos; rights.</li>
        <li>Do not attempt to disrupt, reverse-engineer, or gain unauthorised access to the Platform.</li>
      </ul>

      <h2>6. Limitation of liability</h2>
      <p>
        Grabbit is a technology platform and is not the manufacturer or preparer of any food item. To
        the maximum extent permitted by law, our liability for any order is limited to the amount you
        paid for that order. We are not liable for the quality, safety, or fitness of items prepared
        by a Merchant.
      </p>

      <h2>7. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the Platform after changes are
        posted constitutes acceptance of the revised Terms.
      </p>

      <h2>8. Governing law</h2>
      <p>
        These Terms are governed by the laws of India, and courts at our registered office location
        shall have exclusive jurisdiction over any dispute.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these Terms? Email us at{' '}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or see our <a href="/contact">Contact Us</a> page.
      </p>
    </LegalLayout>
  );
}
