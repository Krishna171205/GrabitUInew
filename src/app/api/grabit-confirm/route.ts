import { NextResponse, type NextRequest } from 'next/server';

// Server-side-only route — INTERNAL_SECRET is never exposed to the client.
// This route sits between the frontend and the Express /recharge/confirm endpoint,
// injecting the x-internal-secret header that the proxy cannot safely forward.
//
// In production, real Cashfree webhooks should also hit this endpoint (or a
// separate /api/cashfree-webhook route) so the secret is always injected server-side.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.rechargeId || !body?.cashfreeOrderId) {
    return NextResponse.json(
      { error: 'rechargeId and cashfreeOrderId required' },
      { status: 400 },
    );
  }

  const secret = process.env.INTERNAL_SECRET;
  if (!secret) {
    console.error('[grabit-confirm] INTERNAL_SECRET env var is not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const expressUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/grabit/wallet/recharge/confirm`;

  const res = await fetch(expressUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': secret,
    },
    body: JSON.stringify({
      rechargeId: body.rechargeId,
      cashfreeOrderId: body.cashfreeOrderId,
    }),
  });

  const data = await res.json().catch(() => ({ error: 'Invalid response from API' }));
  return NextResponse.json(data, { status: res.status });
}
