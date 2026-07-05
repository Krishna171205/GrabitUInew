import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Refunds & Cancellations · Grabit',
  description: 'How cancellations and refunds work on the Grabit cafe pre-ordering platform.',
};

const EMAIL = 'gradient365.team@gmail.com';

export default function RefundsPage() {
  return (
    <LegalLayout title="Refunds & Cancellations" updated="5 July 2026">
      <p>
        This policy explains when you can cancel a Grabit order and how refunds are processed. Grabit
        is operated by <strong>Unified Nexgrade Private Limited</strong>. All amounts are in Indian
        Rupees (INR / ₹).
      </p>

      <h2>Cancelling an order</h2>
      <ul>
        <li>
          <strong>Before preparation begins:</strong> You can cancel from the order screen while the
          order status is still &quot;Pending&quot; or &quot;Confirmed&quot; and the cafe has not
          started preparing it. A <strong>5% cancellation fee</strong> is deducted and the remaining
          95% is refunded to your original payment method.
        </li>
        <li>
          <strong>After preparation begins:</strong> Once the cafe marks the order as being prepared,
          it cannot be cancelled, as ingredients and effort have already been committed.
        </li>
      </ul>

      <h2>When you get an automatic refund</h2>
      <ul>
        <li>The cafe cancels or rejects your order.</li>
        <li>The cafe is unable to fulfil the order or closes before your pickup slot.</li>
        <li>Your payment was charged but the order was not confirmed due to a technical error.</li>
      </ul>

      <h2>Refund method and timeline</h2>
      <p>
        Approved refunds are credited to your <strong>original payment method</strong> (UPI, card, or
        netbanking) via our payment partner, Cashfree Payments. Refunds are typically initiated within
        24 hours of approval and reflect in your account within <strong>5 to 7 business days</strong>,
        depending on your bank or UPI provider.
      </p>

      <h2>Pay-at-counter orders</h2>
      <p>
        Orders marked &quot;pay at counter&quot; are not charged online, so no online refund applies.
        If such an order is cancelled before pickup, simply no payment is collected.
      </p>

      <h2>Non-refundable cases</h2>
      <ul>
        <li>Failure to pick up a prepared order within the cafe&apos;s stated holding time.</li>
        <li>Change of mind after the order has been prepared.</li>
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
