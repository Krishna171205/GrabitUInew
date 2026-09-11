import { cookies } from 'next/headers';
import LandingNav from '@/components/landing/LandingNav';
import HomeHero from '@/components/home/HomeHero';
import DishDiscoveryRow, { type DishItem } from '@/components/home/DishDiscoveryRow';
import EditorialCafeRow, { type CafeItem } from '@/components/home/EditorialCafeRow';
import { NavSpacer } from '@/components/gb/kit';

interface Me {
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

const FALLBACK_CAFES: CafeItem[] = [
  {
    id: 1,
    name: 'The Raydee Cafe',
    slug: 'raydee',
    address: 'North Campus, DTU',
    city: 'Delhi',
    acceptingOrders: true,
    cover_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1000',
    distanceKm: 0.4,
    prepTimeMinutes: '5–8',
    rating: 4.9,
    tags: ['Specialty Coffee', 'Bakery', 'Breakfast'],
  },
  {
    id: 2,
    name: 'The Hims Cafe',
    slug: 'the-hims-cafe',
    address: 'Near Mech Block',
    city: 'Delhi',
    acceptingOrders: true,
    cover_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1000',
    distanceKm: 0.8,
    prepTimeMinutes: '4–7',
    rating: 4.8,
    tags: ['Quick Bites', 'Shakes', 'Sandwiches'],
  },
  {
    id: 3,
    name: 'Mic Mac Cafe',
    slug: 'mic-mac',
    address: 'DTU Main Campus',
    city: 'Delhi',
    acceptingOrders: true,
    cover_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000',
    distanceKm: 1.2,
    prepTimeMinutes: '6–10',
    rating: 4.7,
    tags: ['Cold Brew', 'Burgers', 'Snacks'],
  },
  {
    id: 4,
    name: 'Cafe Peppermint',
    slug: 'cafe-peppermint',
    address: 'Student Plaza, DTU',
    city: 'Delhi',
    acceptingOrders: true,
    cover_url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=1000',
    distanceKm: 0.6,
    prepTimeMinutes: '8–12',
    rating: 4.9,
    tags: ['Artisan Coffee', 'Pasta', 'Desserts'],
  },
  {
    id: 5,
    name: 'Urban Brew Hub',
    slug: 'urban-brew',
    address: 'Tech Innovation Park',
    city: 'Delhi',
    acceptingOrders: true,
    cover_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1000',
    distanceKm: 1.5,
    prepTimeMinutes: '5–9',
    rating: 4.8,
    tags: ['Espresso Bar', 'Waffles', 'Coolers'],
  },
  {
    id: 6,
    name: 'Chaayos Campus Pod',
    slug: 'chaayos-pod',
    address: 'Central Library Walk',
    city: 'Delhi',
    acceptingOrders: true,
    cover_url: 'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&q=80&w=1000',
    distanceKm: 0.5,
    prepTimeMinutes: '3–6',
    rating: 4.6,
    tags: ['Chai Ritual', 'Samosas', 'Kathi Rolls'],
  },
];

const CRAVINGS_DISHES: DishItem[] = [
  {
    label: 'Coffee',
    query: 'coffee',
    photo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Shakes',
    query: 'shake',
    photo: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Sandwiches',
    query: 'sandwich',
    photo: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Burgers',
    query: 'burger',
    photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Mojitos',
    query: 'beverage',
    photo: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Wraps',
    query: 'wrap',
    photo: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Fries',
    query: 'fries',
    photo: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Maggi',
    query: 'maggi',
    photo: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Desserts',
    query: 'dessert',
    photo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=400',
  },
];

const GRAB_DISHES: DishItem[] = [
  {
    label: 'Cold Coffee',
    query: 'cold coffee',
    photo: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Pasta',
    query: 'pasta',
    photo: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281690?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Momos',
    query: 'momos',
    photo: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Pizza',
    query: 'pizza',
    photo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Loaded Fries',
    query: 'fries',
    photo: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Rolls',
    query: 'wrap',
    photo: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Brownies',
    query: 'dessert',
    photo: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=400',
  },
  {
    label: 'Hot Chocolate',
    query: 'beverage',
    photo: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&q=80&w=400',
  },
];

async function getCafeStatus(slug: string): Promise<boolean | undefined> {
  try {
    if (!process.env.NEXT_PUBLIC_API_URL) return undefined;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes/${slug}/status`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return undefined;
    const d = await res.json();
    return d.acceptingOrders !== false;
  } catch {
    return undefined;
  }
}

async function getCafes(): Promise<CafeItem[]> {
  try {
    if (!process.env.NEXT_PUBLIC_API_URL) return FALLBACK_CAFES;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return FALLBACK_CAFES;
    const cafes: CafeItem[] = await res.json();
    if (!cafes || cafes.length === 0) return FALLBACK_CAFES;

    const statuses = await Promise.all(cafes.map((c) => getCafeStatus(c.slug)));
    const enriched = cafes.map((c, i) => ({
      ...c,
      acceptingOrders: statuses[i] !== undefined ? statuses[i] : true,
    }));

    // If API returned fewer than 6, blend with fallbacks so both rows have 3 cards
    if (enriched.length < 6) {
      const existingSlugs = new Set(enriched.map((c) => c.slug));
      const neededFallbacks = FALLBACK_CAFES.filter((c) => !existingSlugs.has(c.slug));
      return [...enriched, ...neededFallbacks].slice(0, 6);
    }
    return enriched;
  } catch {
    return FALLBACK_CAFES;
  }
}

async function getMe(token: string): Promise<Me | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const token = (await cookies()).get('grabbit_customer_token')?.value;
  const [cafes, me] = await Promise.all([
    getCafes(),
    token ? getMe(token) : Promise.resolve(null),
  ]);

  const firstCafeRow = cafes.slice(0, 3);
  const secondCafeRow = cafes.length > 3 ? cafes.slice(3, 6) : FALLBACK_CAFES.slice(3, 6);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A] flex flex-col selection:bg-[#1268F3] selection:text-white">
      {/* 1. GLOBAL NAVBAR: Same signature navbar as used across the entire website */}
      <LandingNav />

      {/* Main container with refined left & right breathing margins */}
      <main className="flex-1 w-full max-w-[1460px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pt-[92px] sm:pt-[104px] pb-12 sm:pb-16 flex flex-col gap-9 sm:gap-11 lg:gap-13">
        {/* 2. LARGE BLUE HERO: 45/55 Split with Anton, Caveat, Search and Cafe Doodle */}
        <HomeHero />

        {/* 3. SMALL DISH DISCOVERY ROW 1: "What are you craving?" */}
        <DishDiscoveryRow
          title="What are you craving?"
          items={CRAVINGS_DISHES}
          seeAllHref="/explore"
        />

        {/* 4. DARK BLUE CAFÉ CARD ROW 1: "Cafés worth the stop" */}
        <EditorialCafeRow
          title="Cafés worth the stop"
          cafes={firstCafeRow}
          seeAllHref="/explore"
        />

        {/* 5. SMALL DISH DISCOVERY ROW 2: "Something to grab" */}
        <DishDiscoveryRow
          title="Something to grab"
          items={GRAB_DISHES}
          seeAllHref="/explore"
        />

        {/* 6. DARK BLUE CAFÉ CARD ROW 2: "More cafés to discover" */}
        <EditorialCafeRow
          title="More cafés to discover"
          cafes={secondCafeRow}
          seeAllHref="/explore"
        />

        {/* Spacing on mobile for bottom bar clearance */}
        <NavSpacer />
      </main>
    </div>
  );
}
