import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Grabit',
  description: 'The rules for using Grabit — our pre-order platform for India\'s finest cafes.',
};

const SECTIONS = [
  { id: 'acceptance', label: 'Acceptance' },
  { id: 'service', label: 'The Service' },
  { id: 'accounts', label: 'Your Account' },
  { id: 'ordering', label: 'Ordering & Payment' },
  { id: 'cancellations', label: 'Cancellations' },
  { id: 'conduct', label: 'Prohibited Conduct' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'changes', label: 'Changes to Terms' },
  { id: 'contact', label: 'Contact' },
];

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background font-body text-on-background">

      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto">
          <Link href="/">
            <img alt="Grabit" className="h-9 w-auto" src="/grabit-logo.svg" />
          </Link>
          <Link href="/" className="text-sm font-bold text-primary hover:opacity-70 transition-opacity">
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="pt-16 bg-gradient-to-b from-surface-container-low to-background">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4 text-white" style={{ background: '#FF6B00' }}>
            Legal
          </span>
          <h1 className="text-4xl lg:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-4">
            Terms of Service
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
            Plain-language rules for using Grabit. We&apos;ve written these to be read, not just agreed to.
          </p>
          <p className="text-sm text-on-surface-variant mt-6 font-medium">
            Last updated: <strong className="text-on-surface">1 April 2025</strong>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-24">

        {/* Quick nav pills */}
        <div className="flex flex-wrap gap-2 mb-16 -mt-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant hover:bg-primary hover:text-white transition-all duration-200"
            >
              {s.label}
            </a>
          ))}
        </div>

        <div className="space-y-16">

          <Section id="acceptance" title="Acceptance of Terms">
            <p>
              By accessing or using Grabit (the app, website at grabit.in, or any associated service), you agree to be bound by these Terms of Service and our{' '}
              <Link href="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link>.
            </p>
            <p>
              If you do not agree to these terms, please do not use Grabit. These terms constitute a legally binding agreement between you and KineticTechno Solutions Pvt. Ltd. (&quot;Grabit&quot;, &quot;we&quot;, &quot;us&quot;).
            </p>
            <p>You must be at least 18 years old to create an account.</p>
          </Section>

          <Section id="service" title="The Service">
            <p>Grabit is a pre-order platform that allows customers to:</p>
            <ul>
              <li>Browse menus of participating cafes.</li>
              <li>Place orders in advance for a specific pickup time slot.</li>
              <li>Pay online or choose to pay at the counter on collection.</li>
              <li>Track order status in real time.</li>
            </ul>
            <p>
              Grabit is a <strong>technology platform</strong>, not a food business. The cafes listed on Grabit are independent businesses. Grabit does not prepare, cook, or deliver food. All food and beverage quality, hygiene, and safety responsibility lies with the participating cafe.
            </p>
            <p>Grabit reserves the right to add, modify, or remove features at any time without notice.</p>
          </Section>

          <Section id="accounts" title="Your Account">
            <ul>
              <li>Your account is tied to a single Indian mobile number. One phone number = one account.</li>
              <li>You are responsible for maintaining the security of your OTP codes. Never share an OTP with anyone.</li>
              <li>Grabit will never call or message you asking for your OTP. If someone does, it is a scam.</li>
              <li>If you suspect unauthorised access to your account, contact us immediately at <strong>support@grabit.in</strong>.</li>
            </ul>
          </Section>

          <Section id="ordering" title="Ordering & Payment">
            <ul>
              <li>Orders must be placed at least <strong>20 minutes before your chosen pickup slot</strong>.</li>
              <li>A slot can accommodate a maximum of 5 concurrent orders. If a slot is full, you will be shown the next available window.</li>
              <li>
                <strong>Online payment</strong> — Processed via Cashfree (UPI, Card, Netbanking). Your order is confirmed only after successful payment. In the event of a payment failure, no amount is charged.
              </li>
              <li>
                <strong>Pay at Counter</strong> — Your slot is reserved upon placing the order. Payment is made directly to the cafe on pickup. If you do not collect your order, the cafe may mark it as abandoned.
              </li>
              <li>Prices shown are inclusive of applicable taxes and set by the cafe. Grabit does not add hidden charges.</li>
            </ul>
          </Section>

          <Section id="cancellations" title="Cancellations & Refunds">
            <ul>
              <li>
                <strong>Before confirmation</strong> — Orders can be cancelled for a full refund within 2 minutes of placing, before the cafe confirms preparation.
              </li>
              <li>
                <strong>After confirmation</strong> — Once the cafe confirms your order and begins preparation, cancellations are not permitted and no refund is issued, as the items have been freshly prepared for your pickup slot.
              </li>
              <li>
                <strong>Cafe-initiated cancellation</strong> — If the cafe cancels your order (e.g., item unavailable), you will receive a full refund within 5–7 business days to your original payment method.
              </li>
              <li>
                <strong>No-show</strong> — If you do not collect a prepaid order within 30 minutes of the slot time, the order is considered completed. No refund is issued. Please cancel if you can no longer make it.
              </li>
            </ul>
          </Section>

          <Section id="conduct" title="Prohibited Conduct">
            <p>You agree not to:</p>
            <ul>
              <li>Use Grabit for any fraudulent or unlawful purpose.</li>
              <li>Place orders you have no intention of collecting.</li>
              <li>Attempt to manipulate slot availability or the ordering system.</li>
              <li>Reverse-engineer, scrape, or copy any part of the Grabit platform.</li>
              <li>Use automated tools (bots, scripts) to place or modify orders.</li>
              <li>Impersonate another user or cafe.</li>
            </ul>
            <p>Violation of these terms may result in immediate account suspension without refund of any pending balance.</p>
          </Section>

          <Section id="liability" title="Limitation of Liability">
            <p>
              Grabit is provided &quot;as is&quot; without warranty of any kind. To the maximum extent permitted by Indian law, KineticTechno Solutions Pvt. Ltd. shall not be liable for:
            </p>
            <ul>
              <li>Food quality, taste, hygiene, or safety issues — these are the cafe&apos;s responsibility.</li>
              <li>Delays due to cafe preparation or external circumstances.</li>
              <li>Losses arising from service downtime, technical errors, or third-party payment issues.</li>
              <li>Any indirect, incidental, or consequential damages.</li>
            </ul>
            <p>Our total liability to you for any claim shall not exceed the value of the specific order giving rise to the claim.</p>
          </Section>

          <Section id="changes" title="Changes to These Terms">
            <p>
              We may update these Terms from time to time. When we do, we will update the &quot;Last updated&quot; date at the top of this page. For material changes, we will send a WhatsApp notification to your registered number at least 7 days before the change takes effect.
            </p>
            <p>Continued use of Grabit after the effective date constitutes acceptance of the updated terms.</p>
          </Section>

          <Section id="contact" title="Contact">
            <p>Questions about these terms?</p>
            <ul>
              <li>Email: <strong>legal@grabit.in</strong></li>
              <li>Support: <strong>support@grabit.in</strong></li>
              <li>Company: KineticTechno Solutions Pvt. Ltd., India</li>
              <li>Response time: within 5 business days</li>
            </ul>
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.</p>
          </Section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-container py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-on-surface-variant">
          <p>© 2025 KineticTechno Solutions. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1 h-8 rounded-full" style={{ background: '#FF6B00' }} />
        <h2 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">{title}</h2>
      </div>
      <div className="pl-5 space-y-4 text-on-surface-variant leading-relaxed [&_strong]:text-on-surface [&_strong]:font-semibold [&_ul]:space-y-3 [&_ul]:list-none [&_ul>li]:flex [&_ul>li]:gap-3 [&_ul>li]:before:content-['—'] [&_ul>li]:before:text-primary [&_ul>li]:before:font-bold [&_ul>li]:before:flex-shrink-0">
        {children}
      </div>
    </section>
  );
}
