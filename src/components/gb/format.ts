/** Pure formatting helpers, deliberately NOT 'use client' so server components can call them directly. */
export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const toMin = (t: string) => { const [h, m] = t.slice(0, 5).split(':').map(Number); return h * 60 + m; };

/** 24h "HH:mm[:ss]" -> "9:45 PM". */
export const fmtTime12 = (t: string) => {
  const [h, m] = t.slice(0, 5).split(':').map(Number);
  return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'PM' : 'AM'}`;
};

/**
 * Time-of-day greeting. Pinned to IST because this renders on the server, which
 * runs UTC, so an unpinned new Date().getHours() would say "Good morning" to a
 * user at 1pm in Delhi. India is our only market, so a fixed zone is correct
 * here and keeps this usable from a server component with no hydration risk.
 */
export const greeting = (now: Date = new Date()) => {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Kolkata' }).format(now)
  );
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/** True if now is within [opening, closing). Unknown hours -> treat as open. Call client-side for local time. */
export const cafeOpenNow = (opening?: string | null, closing?: string | null) => {
  if (!opening || !closing) return true;
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  return now >= toMin(opening) && now < toMin(closing);
};
