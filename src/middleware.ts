import { NextResponse, type NextRequest } from 'next/server';

interface StaffPayload {
  exp?: number;
  cafeId?: number;
  staffId?: number;
  role?: 'owner' | 'manager' | 'staff';
}

// Parse JWT payload without verifying signature.
// Full signature verification happens in Express on every API call.
// Edge use: catch expired tokens early + extract cafeId/staffId/role for layout injection.
function parseStaffToken(token: string): StaffPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(padded)) as StaffPayload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseStaffToken(token);
  if (!payload) return true;
  if (!payload.exp) return false;
  return payload.exp < Math.floor(Date.now() / 1000);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Wallet/referral has no deployed backend yet, orphan the routes so a direct
  // URL visit lands on the cafe home instead of a dead recharge flow.
  if (/^\/[^/]+\/wallet/.test(pathname)) {
    const slug = pathname.split('/')[1];
    return NextResponse.redirect(new URL(`/${slug}`, req.url));
  }

  const isManage =
    /^\/[^/]+\/manage/.test(pathname) &&
    !pathname.includes('/manage/login');

  if (isManage) {
    const token = req.cookies.get('grabbit_staff_token')?.value;
    if (!token || isTokenExpired(token)) {
      const slug = pathname.split('/')[1];
      return NextResponse.redirect(new URL(`/${slug}/manage/login`, req.url));
    }
    const payload = parseStaffToken(token);
    const requestHeaders = new Headers(req.headers);
    if (payload?.cafeId) requestHeaders.set('x-cafe-id', String(payload.cafeId));
    if (payload?.staffId) requestHeaders.set('x-staff-id', String(payload.staffId));
    if (payload?.role) requestHeaders.set('x-staff-role', payload.role);

    // NOTE: role check here is UI-only, derived from unverified JWT body.
    // API endpoints enforce role via verified JWT in Express requireStaff middleware.
    // A crafted cookie can reach the finance UI shell but cannot fetch real data (API returns 403).
    const isFinance = /^\/[^/]+\/manage\/finance/.test(pathname);
    if (isFinance && payload?.role === 'staff') {
      const slug = pathname.split('/')[1];
      return NextResponse.redirect(new URL(`/${slug}/manage`, req.url));
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
