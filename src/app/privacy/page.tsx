import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy · Grabit',
  description: 'How Grabit collects, uses, and protects your personal information.',
};

const EMAIL = 'gradient365.team@gmail.com';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="5 July 2026">
      <p>
        This Privacy Policy explains how <strong>Unified Nexgrade Private Limited</strong>
        (&quot;Grabit&quot;, &quot;we&quot;) collects, uses, and protects your information when you use
        the Grabit platform.
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
