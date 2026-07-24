import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

// Long-lived SSE passthrough: allow the max function duration so the stream is not
// cut mid-connection. When it does end, the client's EventSource reconnects and we
// forward its Last-Event-ID so the backend replays anything missed.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  // Prefer the httpOnly cookie; fall back to the per-order access token in ?t=
  // so magic-link visitors (token in URL, no cookie) also get the live stream
  // (matches how the order REST refetch authenticates). EventSource can't send
  // headers, so the token has to arrive via cookie or query.
  const token = (await cookies()).get('grabit_customer_token')?.value
    ?? req.nextUrl.searchParams.get('t')
    ?? undefined;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'text/event-stream',
  };
  const lastEventId = req.headers.get('last-event-id');
  if (lastEventId) headers['Last-Event-ID'] = lastEventId;

  const upstream = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/grabit/orders/stream/order/${orderId}`,
    {
      headers,
      cache: 'no-store',
    },
  );

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Stream unavailable' }, { status: upstream.status });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
