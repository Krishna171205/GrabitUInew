// grabbit/src/components/faq/content.ts
//
// Single source of truth for the FAQ. The page renders from this, and
// lib/seo.ts builds the FAQPage JSON-LD from the same array - previously the
// page carried six questions and the schema five, which is the sort of drift
// Google notices and nobody else does. Add a question here and both update.

export type FaqCategory = 'Ordering' | 'Payment' | 'Pickup' | 'Cafés';

export interface Faq {
  /** Stable slug. Used as the DOM id, so /faq#how-it-works deep-links here. */
  id: string;
  category: FaqCategory;
  q: string;
  a: string;
  /** Extra terms people search for that don't appear in the question or answer. */
  keywords?: string[];
}

export const FAQ_CATEGORIES: FaqCategory[] = ['Ordering', 'Payment', 'Pickup', 'Cafés'];

export const FAQS: Faq[] = [
  {
    id: 'how-it-works',
    category: 'Ordering',
    q: 'How does Grabbit work?',
    a: 'Browse menus from cafés near you, customise your order, choose a pickup time, and pay online with UPI, card, or netbanking. Your order is ready when you arrive — no queue.',
    keywords: ['start', 'begin', 'basics', 'letsgrabbit'],
  },
  {
    id: 'where-available',
    category: 'Ordering',
    q: 'Where is Grabbit available?',
    a: 'Grabbit (also known as LetsGrabbit) is live in Delhi NCR. Order ahead from your favourite cafés in and around Delhi, with new neighbourhoods opening regularly.',
    keywords: ['delhi', 'ncr', 'city', 'location', 'near me'],
  },
  {
    id: 'need-an-app',
    category: 'Ordering',
    q: 'Do I need to download an app?',
    a: 'No. Grabbit runs in your browser — bookmark letsgrabbit.com and order in seconds. There is nothing to install and nothing to update.',
    keywords: ['download', 'install', 'play store', 'app store', 'ios', 'android'],
  },
  {
    id: 'customise-order',
    category: 'Ordering',
    q: 'Can I customise my drink?',
    a: 'Yes. Add-ons, milk choices, and sizes appear on the item itself, and you can leave a note for the barista at checkout — less sugar, extra hot, no ice.',
    keywords: ['add-ons', 'addons', 'milk', 'sugar', 'notes', 'customize'],
  },
  {
    id: 'payment-methods',
    category: 'Payment',
    q: 'How do I pay for my order?',
    a: 'Checkout is prepaid: pay online with UPI, card, or netbanking. Once payment clears, your order goes straight to the café.',
    keywords: ['upi', 'card', 'netbanking', 'gpay', 'paytm', 'cash'],
  },
  {
    id: 'payment-secure',
    category: 'Payment',
    q: 'Is my payment secure?',
    a: 'Payments are handled by Cashfree, a PCI-DSS compliant Indian payment gateway. Grabbit never sees or stores your card details.',
    keywords: ['safe', 'security', 'cashfree', 'pci', 'card details'],
  },
  {
    id: 'cancel-refund',
    category: 'Payment',
    q: 'Can I cancel an order or get a refund?',
    a: 'Paid orders go straight to the café and start being made, so they cannot be cancelled from the app. If something goes wrong with your order, contact us and we will sort it out with the café.',
    keywords: ['cancel', 'refund', 'money back', 'wrong order'],
  },
  {
    id: 'schedule-pickup',
    category: 'Pickup',
    q: 'Can I schedule a pickup for later?',
    a: 'Yes. Set any pickup time that works — 15 minutes from now or hours ahead. No fixed slots, no limits.',
    keywords: ['later', 'schedule', 'advance', 'slot', 'time'],
  },
  {
    id: 'order-updates',
    category: 'Pickup',
    q: 'How do I get updates on my order?',
    a: 'Order status lands in WhatsApp at every step — confirmed, prepping, then ready for pickup. The live order page updates in real time too.',
    keywords: ['whatsapp', 'sms', 'notification', 'status', 'tracking'],
  },
  {
    id: 'running-late',
    category: 'Pickup',
    q: 'What if I am running late?',
    a: 'Your order is held at the counter. Cafés keep it aside for you, though drinks are at their best within a few minutes of being made, so come by as close to your slot as you can.',
    keywords: ['late', 'delay', 'miss', 'held'],
  },
  {
    id: 'dine-in',
    category: 'Pickup',
    q: 'Can I order to my table instead?',
    a: 'At cafés with table QR codes, yes — scan the code at your table and the order is brought out to you rather than held at the counter.',
    keywords: ['dine in', 'table', 'qr', 'sit'],
  },
  {
    id: 'list-my-cafe',
    category: 'Cafés',
    q: 'I run a café. How do I join Grabbit?',
    a: 'Head to our partner page and tell us about your café. Onboarding covers your menu, pickup capacity, and payouts, and most cafés are taking orders within a few days.',
    keywords: ['partner', 'business', 'owner', 'merchant', 'signup', 'list'],
  },
  {
    id: 'cafe-cost',
    category: 'Cafés',
    q: 'What does it cost a café?',
    a: 'There is no setup fee and no monthly subscription. Grabbit takes a small commission per order, so it only costs when it earns.',
    keywords: ['pricing', 'commission', 'fee', 'subscription', 'charges'],
  },
  {
    id: 'cafe-hardware',
    category: 'Cafés',
    q: 'Does my café need new hardware?',
    a: 'No. The kitchen display runs in a browser on any tablet, laptop, or phone you already have, and it syncs with your existing POS.',
    keywords: ['hardware', 'tablet', 'pos', 'equipment', 'printer'],
  },
];

/** Shape the FAQs into schema.org FAQPage mainEntity entries. */
export const faqMainEntity = FAQS.map(({ q, a }) => ({
  '@type': 'Question',
  name: q,
  acceptedAnswer: { '@type': 'Answer', text: a },
}));
