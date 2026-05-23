import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MenuClient from './MenuClient';
import type { GrabitCafe, GrabitMenuItem } from '@gradient365/gradient-commons';

export default async function MenuPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  if (!cookieStore.get('grabit_customer_token')?.value) redirect(`/${slug}/login`);

  const menuRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`,
    { next: { revalidate: 300 } }
  );
  if (!menuRes.ok) redirect('/');
  const { cafe, items } = await menuRes.json() as { cafe: GrabitCafe; items: GrabitMenuItem[] };

  return <MenuClient slug={slug} cafe={cafe} items={items} />;
}
