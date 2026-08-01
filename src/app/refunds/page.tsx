import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Refunds & Cancellations · Grabit',
  description: 'When Grabit orders can be refunded, and why a paid pre-order cannot be cancelled.',
};

const EMAIL = 'gradient365.team@gmail.com';

export default function RefundsPage() {
  return (
    <LegalLayout title="Refunds & Cancellations" updated="2 August 2026">
      <p>
        This policy explains when you can cancel a Grabit order and how refunds are processed. Grabit
        is operated by <strong>Unified Nexgrade Private Limited</strong>. All amounts are in Indian
        Rupees (INR / ₹).
      </p>

      <h2>Cancelling an order</h2>
      <p>
        Once your payment goes through, the order is confirmed and sent straight to the cafe&apos;s
        counter, and <strong>it can no longer be cancelled</strong>. Cafes start work against
        confirmed pre-orders, which is what makes your pickup slot possible.
      </p>
      <p>
        Please double-check your items and pickup slot before paying. If you have a genuine problem
        with an order, contact the cafe or{' '}
        <a href={`mailto:${EMAIL}?subject=Order%20query`}>email us</a> — we will take it up with the
        cafe on your behalf, though any refund is at the cafe&apos;s discretion.
      </p>
      <p>
        Orders marked <strong>pay at counter</strong> are not charged online. If you no longer want
        one, simply do not collect it; no payment is taken.
      </p>

      <h2>When you get a refund</h2>
      <p>You are refunded in full, automatically, when the fault is not yours:</p>
      <ul>
        <li>The cafe cancels or rejects your order.</li>
        <li>The cafe is unable to fulfil the order, or closes before your pickup slot.</li>
        <li>Your payment was charged but the order was not confirmed due to a technical error.</li>
      </ul>

      <h2>Refund method and timeline</h2>
      <p>
        Approved refunds are credited to your <strong>original payment method</strong> (UPI, card, or
        netbanking) via our payment partner, Cashfree Payments. Refunds are typically initiated within
        24 hours of approval and reflect in your account within <strong>5 to 7 business days</strong>,
        depending on your bank or UPI provider.
      </p>

      <h2>Non-refundable cases</h2>
      <ul>
        <li>Change of mind after payment.</li>
        <li>Failure to pick up a prepared order within the cafe&apos;s stated holding time.</li>
        <li>Ordering the wrong item or the wrong pickup slot.</li>
      </ul>

      <h2>Need help?</h2>
      <p>
        If a refund hasn&apos;t reached you within the expected timeline, or you have any dispute,
        email us at <a href={`mailto:${EMAIL}?subject=Refund%20query`}>{EMAIL}</a> with your order ID
        and we will resolve it promptly. See also our <a href="/contact">Contact Us</a> page.
      </p>
    </LegalLayout>
  );
}
