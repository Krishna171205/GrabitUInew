import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('grabit_customer_token');
  cookieStore.delete('grabit_staff_token');
  return NextResponse.json({ success: true });
}
