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
  const staffToken    = cookieStore.get('grabit_staff_token')?.value;
  const customerToken = cookieStore.get('grabit_customer_token')?.value;
  const token = staffToken || customerToken;

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/${pathParts.join('/')}${req.nextUrl.search}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const body = ['POST', 'PATCH'].includes(method) ? await req.text() : undefined;

  const res = await fetch(url, { method, headers, body });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text();

  return NextResponse.json(data, { status: res.status });
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
