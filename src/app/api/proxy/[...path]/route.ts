import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// Only allow proxying to grabit/* routes, prevents this proxy from reaching
// Gradient 365 portals, admin routes, or any non-grabit Express endpoints.
function isPathAllowed(pathParts: string[]): boolean {
  return pathParts[0] === 'grabit' && pathParts.length >= 2;
}

async function proxyRequest(req: NextRequest, pathParts: string[], method: string) {
  if (!isPathAllowed(pathParts)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const cookieStore = await cookies();
  const staffToken    = cookieStore.get('grabbit_staff_token')?.value;
  const customerToken = cookieStore.get('grabbit_customer_token')?.value;
  const token = staffToken || customerToken;

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/${pathParts.join('/')}${req.nextUrl.search}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // This call is server-to-server, so the API sees THIS box as the client for every
  // customer of the site and rate-limits them as one. Pass on the client our own nginx
  // observed; the API only honours it from its own web tier. x-real-ip first because
  // nginx overwrites it, unlike x-forwarded-for, whose first hop is caller-supplied text.
  const clientIp = req.headers.get('x-real-ip')?.trim()
    || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (clientIp) headers['X-Grabit-Client-Ip'] = clientIp;

  const body = ['POST', 'PATCH'].includes(method) ? await req.text() : undefined;

  try {
    const res = await fetch(url, { method, headers, body });
    // Null-body statuses (204/205/304): the Response constructor throws if a body
    // is passed alongside one of these, so forward status with no body untouched.
    if (res.status === 204 || res.status === 205 || res.status === 304) {
      return new NextResponse(null, { status: res.status });
    }
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json()
      : await res.text();

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`[Proxy Error] ${method} ${url}:`, error.message);
    return NextResponse.json({ error: 'Gateway Timeout' }, { status: 504 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path, 'GET');
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path, 'POST');
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path, 'PATCH');
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path, 'DELETE');
}
