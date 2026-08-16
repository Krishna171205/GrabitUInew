import { NextResponse } from 'next/server';

// Always answered by the deployment serving the request, never from a cache:
// this is what a running client compares itself against to notice a new build.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    { buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
