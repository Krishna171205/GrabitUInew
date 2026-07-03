import { redirect } from 'next/navigation';

// grabit365.com root — the marketplace itself is the landing page (app-first, no marketing splash).
export default function RootPage() {
  redirect('/home');
}
