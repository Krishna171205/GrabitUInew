/**
 * Grabit consumer app, sample data mirroring the design mockups.
 * Marketplace-level fields (rating, distance, ETA, trending) aren't in the
 * backend yet, so these screens render faithfully off this until the discovery
 * API lands. Café `slug`s route to the real /[slug] storefront.
 */

/** Unsplash image URL from a photo id. */
export const ph = (id: string, w = 700, h = 700) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=70`;

export interface GbItem {
  id: number;
  slug: string;       // café slug this item can actually be ordered from
  name: string;
  cafe: string;
  price: number;
  photo: string;
  desc?: string;
  bestseller?: boolean;
}

export interface GbCafe {
  slug: string;
  name: string;
  tagline: string;
  rating: number;
  ready: string;      // "8 min"
  distance: string;   // "0.4 km"
  forOne: number;     // ₹ for one
  cover: string;      // photo id
  offer?: string;     // "20% off on pickup orders"
}

export const CAFES: GbCafe[] = [
  { slug: 'the-roastery', name: 'The Roastery', tagline: 'Specialty coffee · Bakes', rating: 4.8, ready: '8 min', distance: '0.4 km', forOne: 250, cover: 'photo-1495474472287-4d71bcdd2085', offer: '20% off on pickup orders' },
  { slug: 'olive-and-sage', name: 'Olive & Sage', tagline: 'Breakfast · All-day brunch', rating: 4.7, ready: '12 min', distance: '0.9 km', forOne: 400, cover: 'photo-1533089860892-a7c6f0a88666' },
];

export const TRENDING: (GbCafe & { rank: string })[] = [
  { slug: 'kettle-and-co', name: 'Kettle & Co.', tagline: 'Chai · Snacks · Bakes', rating: 4.6, ready: '10 min', distance: '1.2 km', forOne: 180, cover: 'photo-1521017432531-fbd92d768814', rank: '#1 trending' },
];

// Real items from the one live café (raydee), so add-to-cart actually works end to end.
export const POPULAR: GbItem[] = [
  { id: 1, slug: 'raydee', name: 'Classic Cold Coffee', cafe: 'The Raydee Cafe', price: 90, photo: 'photo-1541167760496-1628856ab772' },
  { id: 2, slug: 'raydee', name: 'Hazelnut Cold Coffee', cafe: 'The Raydee Cafe', price: 110, photo: 'photo-1461023058943-07fcbe16d735' },
  { id: 4, slug: 'raydee', name: 'Americano (Hot)', cafe: 'The Raydee Cafe', price: 60, photo: 'photo-1555507036-ab1f4038808a' },
  { id: 5, slug: 'raydee', name: 'Cappuccino', cafe: 'The Raydee Cafe', price: 95, photo: 'photo-1572442388796-11668a67e53d' },
  { id: 6, slug: 'raydee', name: 'Almond Croissant', cafe: 'The Raydee Cafe', price: 120, photo: 'photo-1509440159596-0249088772ff' },
  { id: 7, slug: 'raydee', name: 'Avocado Toast', cafe: 'The Raydee Cafe', price: 180, photo: 'photo-1525351484163-7529414344d8' },
  { id: 8, slug: 'raydee', name: 'Cold Brew', cafe: 'The Raydee Cafe', price: 130, photo: 'photo-1461023058943-07fcbe16d735' },
  { id: 9, slug: 'raydee', name: 'Blueberry Muffin', cafe: 'The Raydee Cafe', price: 85, photo: 'photo-1607958996333-41aef7caefaa' },
];

// photo = real raydee menu image (one representative variant per craving),
// full CDN URL — not an unsplash id, so CategoryCircle renders it directly.
export interface GbCategory { label: string; photo: string; }
export const CATEGORIES: GbCategory[] = [
  { label: 'Coffee', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/cold-coffee.png' },
  { label: 'Shakes', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/oreo-shake.png' },
  { label: 'Sandwiches', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/veg-grilled-sandwich.png' },
  { label: 'Burgers', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/veg-burger.png' },
  { label: 'Mojitos', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/peach-mojito.png' },
  { label: 'Wraps', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/veg-wrap.png' },
  { label: 'Fries', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/salted-fries.png' },
  { label: 'Maggi', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/cheese-maggi.png' },
];

/** Explore's category tiles (same set as Home, see note above). */
export const EXPLORE_CATEGORIES: GbCategory[] = CATEGORIES;

export interface GbRecentOrder { title: string; price: number; when: string; photo: string; }
export const RECENT_ORDERS: GbRecentOrder[] = [
  { title: 'Oat Flat White · The Roastery', price: 280, when: '2 days ago', photo: 'photo-1541167760496-1628856ab772' },
  { title: 'Baked Shakshuka · Olive & Sage', price: 340, when: 'last week', photo: 'photo-1482049016688-2d3e1b311543' },
];

export interface GbActiveOrder {
  cafe: string; slug: string; items: string; total: number; code: string; status: string; photo: string;
}
export const ACTIVE_ORDER: GbActiveOrder = {
  cafe: 'The Roastery', slug: 'the-roastery', items: 'Oat Flat White, Almond Croissant', total: 494,
  code: 'GB-4207', status: 'Preparing · pickup 9:45 AM', photo: 'photo-1495474472287-4d71bcdd2085',
};

export interface GbPastOrder { cafe: string; item: string; price: number; when: string; photo: string; }
export const PAST_ORDERS: GbPastOrder[] = [
  { cafe: 'Olive & Sage', item: 'Baked Shakshuka', price: 340, when: '28 Jun', photo: 'photo-1482049016688-2d3e1b311543' },
  { cafe: 'The Roastery', item: 'Oat Flat White', price: 280, when: '25 Jun', photo: 'photo-1541167760496-1628856ab772' },
];

export interface GbNotif {
  icon: string; iconColor: string; iconBg: string; title: string; body: string; time: string;
  unread?: boolean; group: 'Today' | 'Earlier';
}
export const NOTIFICATIONS: GbNotif[] = [
  { group: 'Today', icon: 'restaurant', iconColor: 'var(--gb-primary)', iconBg: '#F3D9C8', title: 'Your order is being prepared', body: "The Roastery · pickup at 9:45 AM. We'll ping you when it's ready.", time: '2 min ago', unread: true },
  { group: 'Today', icon: 'local_offer', iconColor: 'var(--gb-gold)', iconBg: '#EDE4D6', title: '20% off your next cold brew', body: 'Valid at The Roastery till Sunday. Tap to view.', time: '3 hours ago' },
  { group: 'Earlier', icon: 'check_circle', iconColor: 'var(--gb-green)', iconBg: '#DFEAD9', title: 'Order picked up', body: 'Baked Shakshuka from Olive & Sage. Enjoy!', time: '28 Jun' },
  { group: 'Earlier', icon: 'workspace_premium', iconColor: '#720DB5', iconBg: '#EAE0F2', title: 'Try Grabit Gold free for 7 days', body: 'Priority pickup & member-only prices.', time: '24 Jun' },
];

export const USER = {
  name: 'Aditi Rao',
  first: 'Aditi',
  phone: '+91 98765 43210',
  avatar: 'photo-1494790108377-be9c29b29330',
  location: 'MG Road, Bengaluru',
};
