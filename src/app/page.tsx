import type { GrabitCafe } from '@/types/grabit';
import LandingClient from './LandingClient';

async function getCafes(): Promise<GrabitCafe[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/cafes`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.cafes ?? data ?? [];
  } catch {
    return [];
  }
}

export default async function RootPage() {
  const cafes = await getCafes();
  return <LandingClient cafes={cafes} />;
}
