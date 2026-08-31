import { NextResponse, type NextRequest } from 'next/server';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

// Cafe owners reach this from the public /partner/signup form. It used to route
// straight into the self-service onboarding wizard (real OTP login, editing a
// live cafe record) with no human in the loop - a mistyped slug there once
// leaked another cafe's photo onto a garbage listing in production. This just
// mails the lead to the team instead; onboarding a cafe now always starts with
// a person on the call.
const ses = new SESv2Client({ region: 'ap-south-1' });
const TO = 'hello@unifiednexgrade.com';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const cafeName = typeof body?.cafeName === 'string' ? body.cafeName.trim() : '';
  const city = typeof body?.city === 'string' ? body.city.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  if (!name || !/^\d{10}$/.test(phone) || !cafeName) {
    return NextResponse.json({ error: 'name, a 10-digit phone, and cafeName are required' }, { status: 400 });
  }

  const bodyText = [
    `Name: ${name}`,
    `Phone: +91 ${phone}`,
    `Cafe name: ${cafeName}`,
    city && `City: ${city}`,
    message && `Message: ${message}`,
  ].filter(Boolean).join('\n');

  // Content.Raw so the message can carry Importance/X-Priority headers -
  // SESv2's Simple content type has no header field for these.
  const raw =
    `From: Grabbit Leads <${TO}>\r\n` +
    `To: ${TO}\r\n` +
    `Subject: NEW LEAD FOR CAFE\r\n` +
    `Importance: High\r\n` +
    `X-Priority: 1\r\n` +
    `Content-Type: text/plain; charset=UTF-8\r\n` +
    `\r\n` +
    bodyText;

  try {
    await ses.send(new SendEmailCommand({
      FromEmailAddress: TO,
      Destination: { ToAddresses: [TO] },
      Content: { Raw: { Data: new TextEncoder().encode(raw) } },
    }));
  } catch (err) {
    console.error('[partner-lead] SES send failed', err);
    return NextResponse.json({ error: 'Could not send right now, please try again' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
