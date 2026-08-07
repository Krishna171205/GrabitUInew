/**
 * Grabbit consumer app, sample data mirroring the design mockups.
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

// Real items from the one live café (raydee), ids verified against grabit_prod
// (grabit_menu_items) 2026-08-07 so add-to-cart actually works end to end —
// previous list had a disabled dupe id (Classic Cold Coffee) and 4 items
// (Croissant/Avocado Toast/Cold Brew/Blueberry Muffin) that don't exist on the menu.
export const POPULAR: GbItem[] = [
  { id: 100, slug: 'raydee', name: 'Classic Cold Coffee', cafe: 'The Raydee Cafe', price: 90, photo: 'photo-1541167760496-1628856ab772' },
  { id: 109, slug: 'raydee', name: 'Hazelnut Cold Coffee', cafe: 'The Raydee Cafe', price: 110, photo: 'photo-1461023058943-07fcbe16d735' },
  { id: 117, slug: 'raydee', name: 'Caramel Cold Coffee', cafe: 'The Raydee Cafe', price: 110, photo: 'photo-1461023058943-07fcbe16d735' },
  { id: 141, slug: 'raydee', name: 'Vanilla Cold Coffee', cafe: 'The Raydee Cafe', price: 110, photo: 'photo-1461023058943-07fcbe16d735' },
  { id: 132, slug: 'raydee', name: 'Cappucino (Hot)', cafe: 'The Raydee Cafe', price: 80, photo: 'photo-1572442388796-11668a67e53d' },
  { id: 110, slug: 'raydee', name: 'Hot Chocolate', cafe: 'The Raydee Cafe', price: 80, photo: 'photo-1541167760496-1628856ab772' },
  { id: 142, slug: 'raydee', name: 'Chocolate Cookie Cold Coffee', cafe: 'The Raydee Cafe', price: 110, photo: 'photo-1461023058943-07fcbe16d735' },
  { id: 103, slug: 'raydee', name: 'Oreo Shake', cafe: 'The Raydee Cafe', price: 90, photo: 'photo-1607958996333-41aef7caefaa' },
];

// photo = real raydee menu image (one representative variant per craving),
// full CDN URL — not an unsplash id, so CategoryCircle renders it directly.
// query = keyword matched against menu item names (MenuClient's search filter)
// to land on this craving's items when the circle is tapped.
export interface GbCategory { label: string; photo: string; query: string; }
export const CATEGORIES: GbCategory[] = [
  { label: 'Coffee', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/cold-coffee.png', query: 'coffee' },
  { label: 'Shakes', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/oreo-shake.png', query: 'shake' },
  { label: 'Sandwiches', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/veg-grilled-sandwich.png', query: 'sandwich' },
  { label: 'Burgers', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/veg-burger.png', query: 'burger' },
  { label: 'Mojitos', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/peach-mojito.png', query: 'mojito' },
  { label: 'Wraps', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/veg-wrap.png', query: 'wrap' },
  { label: 'Fries', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/salted-fries.png', query: 'fries' },
  { label: 'Maggi', photo: 'https://d1k5bio7n5wlqi.cloudfront.net/raydee/menu/cheese-maggi.png', query: 'maggi' },
];

export interface GbNotif {
  icon: string; iconColor: string; iconBg: string; title: string; body: string; time: string;
  unread?: boolean; group: 'Today' | 'Earlier';
}
export const NOTIFICATIONS: GbNotif[] = [
  { group: 'Today', icon: 'restaurant', iconColor: 'var(--gb-primary)', iconBg: '#F3D9C8', title: 'Your order is being prepared', body: "The Raydee Cafe · pickup at 9:45 AM. We'll ping you when it's ready.", time: '2 min ago', unread: true },
  { group: 'Today', icon: 'local_offer', iconColor: 'var(--gb-gold)', iconBg: '#EDE4D6', title: '20% off your next cold coffee', body: 'Valid at The Raydee Cafe till Sunday. Tap to view.', time: '3 hours ago' },
  { group: 'Earlier', icon: 'check_circle', iconColor: 'var(--gb-green)', iconBg: '#DFEAD9', title: 'Order picked up', body: 'Classic Cold Coffee from The Raydee Cafe. Enjoy!', time: '28 Jun' },
  { group: 'Earlier', icon: 'workspace_premium', iconColor: '#720DB5', iconBg: '#EAE0F2', title: 'Try Grabbit Gold free for 7 days', body: 'Priority pickup & member-only prices.', time: '24 Jun' },
];

export const USER = {
  name: 'Aditi Rao',
  first: 'Aditi',
  phone: '+91 98765 43210',
  avatar: 'photo-1494790108377-be9c29b29330',
  location: 'MG Road, Bengaluru',
};
