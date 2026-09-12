import { cookies } from 'next/headers';
import CampusLinkNavBar from '@/components/navigation/CampusLinkNavBar';
import DesktopNavBar from '@/components/navigation/DesktopNavBar';

interface Me {
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

async function getMe(token: string): Promise<Me | null> {
  try {
    if (!process.env.NEXT_PUBLIC_API_URL) return null;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/me`, {
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

async function getDefaultAddress(token: string): Promise<{ label: string; shortText: string } | null> {
  try {
    if (!process.env.NEXT_PUBLIC_API_URL) return null;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(4_000),
    });
    if (!res.ok) return null;
    const rows = await res.json();
    const a = rows[0];
    if (!a) return null;
    return {
      label: a.label,
      shortText: [a.line1, a.line2].filter(Boolean).join(', ') || a.formatted_address || a.label,
    };
  } catch {
    return null;
  }
}

/**
 * Tab screens (Home / Explore / Orders / Profile):
 * - Desktop (>= md): Clean full-width canvas with signature 4-element upper navbar.
 * - Mobile (< md): Mobile feed with floating CampusLink bottom dock.
 */
export default async function TabsLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('grabbit_customer_token')?.value;
  const [me, address] = await Promise.all([
    token ? getMe(token) : Promise.resolve(null),
    token ? getDefaultAddress(token) : Promise.resolve(null),
  ]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col relative">
      {/* Desktop Upper Navbar mounted across the 4 screens */}
      <DesktopNavBar me={me} address={address} />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {children}
      </div>

      {/* Mobile Floating Bottom Navigation Dock */}
      <CampusLinkNavBar />
    </div>
  );
}
