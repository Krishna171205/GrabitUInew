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
  { params }: { params: Promise<{ cafeId: string }> },
) {
  const { cafeId } = await params;
  const token = (await cookies()).get('grabbit_staff_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'text/event-stream',
  };
  const lastEventId = req.headers.get('last-event-id');
  if (lastEventId) headers['Last-Event-ID'] = lastEventId;

  const upstream = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/grabit/orders/stream/cafe/${cafeId}`,
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
