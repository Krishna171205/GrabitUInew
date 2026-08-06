import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('grabbit_customer_token');
  cookieStore.delete('grabbit_staff_token');
  return NextResponse.json({ success: true });
}
