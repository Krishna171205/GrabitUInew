// grabit/src/components/landing/content.ts
// Landing copy, Grabit-original. Shared by section components (DRY).

export interface Feature { n: string; icon: string; title: string; body: string; }
export interface Step { n: string; title: string; body: string; }
export interface StepImage { src: string; alt: string; }

export const FEATURES: Feature[] = [
  { n: '01', icon: 'schedule', title: 'Pick any pickup time', body: 'Want it 15 minutes from now, or hours ahead? Set any pickup time that works. No fixed slots, no limits.' },
  { n: '02', icon: 'credit_card', title: 'Pay online', body: 'UPI, card, or netbanking at checkout, or pay at the counter. Your call.' },
  { n: '03', icon: 'chat', title: 'WhatsApp updates', body: 'Order status lands in WhatsApp at every step. No new app to install.' },
];

export const STEPS: Step[] = [
  { n: '1', title: 'Pick your café', body: 'Browse menus from cafés near you. No login needed to look around.' },
  { n: '2', title: 'Customize & pay', body: 'Build your order, choose a pickup slot, and check out in a tap.' },
  { n: '3', title: 'Grab & go', body: 'Skip the queue. Collect your order from the counter when it is ready.' },
];

// Unsplash CDN, placeholder café imagery; swap to owned photos before prod.
export const STEP_IMAGES: StepImage[] = [
  { src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=85', alt: 'Warm café interior' },
  { src: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=85', alt: 'Barista pouring latte art' },
];
