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

/** One day of a cafe's weekly schedule, as the API sends it. day_of_week is ISO: 1 = Mon. */
export interface DayHours { day_of_week: number; opens: string; closes: string }

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Today's hours from a weekly schedule, or null when the cafe has not set one. */
export function todayHours(hours?: DayHours[] | null): DayHours | null {
  if (!hours?.length) return null;
  // JS getDay() is 0 = Sunday; the API is ISO, 1 = Monday ... 7 = Sunday.
  const iso = new Date().getDay() === 0 ? 7 : new Date().getDay();
  return hours.find((h) => h.day_of_week === iso) ?? null;
}

/**
 * The week as a customer would say it: consecutive days sharing hours collapse into one
 * range, so seven rows read as "Mon-Fri 9 AM - 9 PM · Sat-Sun 11 AM - 8 PM".
 */
export function weekHoursSummary(hours?: DayHours[] | null): string[] {
  if (!hours?.length) return [];
  const byDay = [...hours].sort((a, b) => a.day_of_week - b.day_of_week);
  const groups: { from: number; to: number; opens: string; closes: string }[] = [];
  for (const h of byDay) {
    const last = groups[groups.length - 1];
    if (last && last.to === h.day_of_week - 1 && last.opens === h.opens && last.closes === h.closes) {
      last.to = h.day_of_week;
    } else {
      groups.push({ from: h.day_of_week, to: h.day_of_week, opens: h.opens, closes: h.closes });
    }
  }
  return groups.map((g) => {
    const days = g.from === g.to ? DAY_LABELS[g.from - 1] : `${DAY_LABELS[g.from - 1]}-${DAY_LABELS[g.to - 1]}`;
    return `${days} ${fmtTime12(g.opens)} – ${fmtTime12(g.closes)}`;
  });
}
