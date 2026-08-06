import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Contact Us · Grabbit',
  description: 'Get in touch with the Grabbit team at Unified Nexgrade Private Limited.',
};

const EMAIL = 'gradient365.team@gmail.com';

export default function ContactPage() {
  return (
    <LegalLayout title="Contact Us">
      <p>
        Grabbit is a cafe pre-ordering platform operated by <strong>Unified Nexgrade Private Limited</strong>.
        We&apos;re here to help with orders, payments, refunds, or partnering your cafe with Grabbit.
      </p>

      <h2>Reach us</h2>
      <ul>
        <li>
          <strong>Email:</strong> <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </li>
        <li>
          <strong>Support hours:</strong> Monday to Saturday, 9:00 AM to 7:00 PM IST
        </li>
        <li>
          <strong>Response time:</strong> We reply to all queries within 24 business hours.
        </li>
      </ul>

      <h2>Registered office</h2>
      <p>
        Unified Nexgrade Private Limited
        <br />
        New Employees Colony, 1123 B/23, Gali no. 9
        <br />
        Jind, District Jind, Haryana 126102
        <br />
        India
        <br />
        <strong>Phone:</strong> <a href="tel:+917496064936">+91 74960 64936</a>
      </p>

      <h2>Business & partnerships</h2>
      <p>
        Own a cafe and want to list on Grabbit? Write to{' '}
        <a href={`mailto:${EMAIL}?subject=Cafe%20partnership%20enquiry`}>{EMAIL}</a> with your cafe
        name and city and our team will get you onboarded.
      </p>
    </LegalLayout>
  );
}
