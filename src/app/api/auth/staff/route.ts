import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/grabit/auth/verify-otp`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );
  const data = await apiRes.json();
  if (!apiRes.ok) return NextResponse.json(data, { status: apiRes.status });

  const cookieStore = await cookies();
  cookieStore.set('grabit_staff_token', data.token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
    secure: process.env.NODE_ENV === 'production'
  });
  return NextResponse.json({ staff: data.staff });
}
