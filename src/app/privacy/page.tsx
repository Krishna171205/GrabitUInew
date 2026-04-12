import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Grabit',
  description: 'How Grabit collects, uses, and protects your personal information.',
};

const SECTIONS = [
  { id: 'information', label: 'Information We Collect' },
  { id: 'use', label: 'How We Use It' },
  { id: 'sharing', label: 'Data Sharing' },
  { id: 'security', label: 'Security' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'contact', label: 'Contact Us' },
];

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">
            We believe privacy is a right, not a feature. Here&apos;s exactly what we collect, why, and how we protect it.
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

        <div className="space-y-16 prose-grabit">

          <Section id="information" title="Information We Collect">
            <p>When you use Grabit, we collect only what&apos;s needed to provide the service.</p>
            <ul>
              <li><strong>Phone number</strong> — Used to create your account and send OTP verification codes via MSG91.</li>
              <li><strong>Order data</strong> — Items ordered, pickup times, customisations, and payment method chosen (Online or Pay at Counter).</li>
              <li><strong>Device information</strong> — Browser type, OS version, and IP address for security and fraud prevention.</li>
              <li><strong>Cafe interactions</strong> — Which cafes you&apos;ve visited, your order frequency, and favourite items — used to personalise your home screen.</li>
            </ul>
            <p>We do <strong>not</strong> collect your full name, email, or home address unless you voluntarily provide them in your profile.</p>
          </Section>

          <Section id="use" title="How We Use It">
            <ul>
              <li><strong>Authentication</strong> — Your phone number is your identity on Grabit. OTP codes confirm it&apos;s you.</li>
              <li><strong>Order processing</strong> — We share your order with the specific cafe you&apos;re ordering from so they can prepare it.</li>
              <li><strong>WhatsApp notifications</strong> — We send order status updates (Confirmed, Ready, Done) via Meta&apos;s WhatsApp Business API using your phone number. You can opt out at any time from your profile.</li>
              <li><strong>Product improvement</strong> — Aggregate, anonymised usage data helps us improve slot availability, reduce wait times, and fix bugs. We never sell individual data.</li>
            </ul>
          </Section>

          <Section id="sharing" title="Data Sharing">
            <p>We share your data with a limited set of trusted partners, only as needed to operate the service:</p>
            <ul>
              <li><strong>Cafe partners</strong> — Receive your name (if provided), phone (last 4 digits masked), and order details to prepare and hand over your order.</li>
              <li><strong>Cashfree Payments</strong> — Processes card, UPI, and netbanking transactions. We never store your card details — Cashfree&apos;s PCI-DSS compliant vault handles all payment data.</li>
              <li><strong>MSG91</strong> — Delivers OTP SMS and voice calls to your number. They do not receive any order or payment data.</li>
              <li><strong>Meta (WhatsApp)</strong> — Receives your phone number and order status messages. Subject to Meta&apos;s own privacy policy.</li>
              <li><strong>Supabase</strong> — Our database provider. Data is stored in Singapore (AWS ap-southeast-1) with row-level security.</li>
            </ul>
            <p>We <strong>never</strong> sell your data to advertisers, data brokers, or any third party not listed above.</p>
          </Section>

          <Section id="security" title="Security">
            <ul>
              <li>All data is transmitted over <strong>HTTPS/TLS 1.3</strong>.</li>
              <li>Auth tokens are stored in <strong>httpOnly cookies</strong> — inaccessible to JavaScript, preventing XSS attacks.</li>
              <li>Database access is protected by <strong>Supabase Row-Level Security</strong> — each cafe can only read its own orders.</li>
              <li>OTP codes expire after <strong>10 minutes</strong> and are single-use.</li>
              <li>Sessions expire after <strong>7 days</strong> of inactivity.</li>
            </ul>
          </Section>

          <Section id="rights" title="Your Rights">
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong> — Request a copy of all data we hold about you.</li>
              <li><strong>Correction</strong> — Ask us to correct inaccurate information.</li>
              <li><strong>Deletion</strong> — Request deletion of your account and associated data. We will comply within 30 days, except where data must be retained for legal or tax purposes (e.g., payment records for 7 years under Indian financial regulation).</li>
              <li><strong>Opt out of WhatsApp notifications</strong> — Go to Profile → Notifications and toggle off WhatsApp alerts.</li>
            </ul>
            <p>To exercise any of these rights, email <strong>privacy@grabit.in</strong>.</p>
          </Section>

          <Section id="cookies" title="Cookies">
            <p>Grabit uses exactly <strong>two cookies</strong>:</p>
            <ul>
              <li><code>grabit_customer_token</code> — httpOnly, Lax SameSite. Contains your encrypted session JWT. Required to use the app.</li>
              <li><code>grabit_staff_token</code> — httpOnly, Lax SameSite. Set only when you log in as cafe staff. Required for the manage dashboard.</li>
            </ul>
            <p>We use no advertising cookies, no tracking pixels, and no third-party analytics cookies.</p>
          </Section>

          <Section id="contact" title="Contact Us">
            <p>For privacy concerns, data requests, or anything in this policy:</p>
            <ul>
              <li>Email: <strong>privacy@grabit.in</strong></li>
              <li>Response time: within 5 business days</li>
              <li>Company: KineticTechno Solutions Pvt. Ltd., India</li>
            </ul>
            <p>If you believe your privacy rights have been violated and we have not resolved your concern, you may lodge a complaint with the relevant data protection authority in your jurisdiction.</p>
          </Section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-surface-container py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-on-surface-variant">
          <p>© 2025 KineticTechno Solutions. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
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
      <div className="pl-5 space-y-4 text-on-surface-variant leading-relaxed [&_strong]:text-on-surface [&_strong]:font-semibold [&_ul]:space-y-3 [&_ul]:list-none [&_ul>li]:flex [&_ul>li]:gap-3 [&_ul>li]:before:content-['—'] [&_ul>li]:before:text-primary [&_ul>li]:before:font-bold [&_ul>li]:before:flex-shrink-0 [&_code]:bg-surface-container [&_code]:px-2 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-on-surface">
        {children}
      </div>
    </section>
  );
}
