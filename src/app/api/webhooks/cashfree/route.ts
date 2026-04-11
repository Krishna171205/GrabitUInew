import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('x-webhook-signature');
  const ts  = req.headers.get('x-webhook-timestamp');

  if (!sig || !ts) {
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 });
  }

  // Replay attack prevention: reject webhooks older than 5 minutes
  const webhookTimestamp = parseInt(ts, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (isNaN(webhookTimestamp) || Math.abs(nowSeconds - webhookTimestamp) > 300) {
    return NextResponse.json({ error: 'Webhook timestamp expired' }, { status: 401 });
  }

  // Verify HMAC-SHA256 using constant-time comparison to prevent timing attacks
  const expectedSig = crypto
    .createHmac('sha256', process.env.CASHFREE_WEBHOOK_SECRET!)
    .update(ts + rawBody)
    .digest('base64');

  const sigBuffer      = Buffer.from(sig,         'base64');
  const expectedBuffer = Buffer.from(expectedSig, 'base64');
  if (sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: { type?: string; data?: { order?: { order_id?: string } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (event.type !== 'PAYMENT_SUCCESS_WEBHOOK') {
    return NextResponse.json({ received: true });
  }

  const cashfreeOrderId = event.data?.order?.order_id;
  if (!cashfreeOrderId) return NextResponse.json({ received: true });

  // Forward to Express internal endpoint
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/orders/payment-webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': process.env.INTERNAL_SECRET!,
    },
    body: JSON.stringify({ cashfree_order_id: cashfreeOrderId, payment_status: 'paid' }),
  });

  return NextResponse.json({ received: true });
}
