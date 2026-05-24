import { redirect } from 'next/navigation';

// Root of grabitui app — marketing lives in grabitui-landing.
// Redirect to the landing site domain.
export default function RootPage() {
  redirect(process.env.NEXT_PUBLIC_LANDING_URL || 'https://grabit365.com');
}
