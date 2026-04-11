import { NextResponse, type NextRequest } from 'next/server';

// Parse JWT payload and check expiry without verifying signature.
// Full signature verification happens in Express on every API call.
// This catches expired tokens early at the edge, avoiding a round-trip.
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    // base64url → base64
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(padded));
    if (!payload.exp) return false; // no expiry = not expired
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true; // malformed → treat as expired
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect manage routes (staff only)
  const isManage =
    /^\/[^/]+\/manage/.test(pathname) &&
    !pathname.includes('/manage/login');

  // Protect customer checkout flows
  const isCustomerProtected = /^\/[^/]+\/(cart|checkout|order)/.test(pathname);

  if (isManage) {
    const token = req.cookies.get('grabit_staff_token')?.value;
    if (!token || isTokenExpired(token)) {
      const slug = pathname.split('/')[1];
      return NextResponse.redirect(new URL(`/${slug}/manage/login`, req.url));
    }
  }

  if (isCustomerProtected) {
    const token = req.cookies.get('grabit_customer_token')?.value;
    if (!token || isTokenExpired(token)) {
      const slug = pathname.split('/')[1];
      return NextResponse.redirect(new URL(`/${slug}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
