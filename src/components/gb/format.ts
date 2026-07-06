/** Pure formatting helpers — deliberately NOT 'use client' so server components can call them directly. */
export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const toMin = (t: string) => { const [h, m] = t.slice(0, 5).split(':').map(Number); return h * 60 + m; };

/** 24h "HH:mm[:ss]" -> "9:45 PM". */
export const fmtTime12 = (t: string) => {
  const [h, m] = t.slice(0, 5).split(':').map(Number);
  return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'PM' : 'AM'}`;
};

/** True if now is within [opening, closing). Unknown hours -> treat as open. Call client-side for local time. */
export const cafeOpenNow = (opening?: string | null, closing?: string | null) => {
  if (!opening || !closing) return true;
  const now = new Date().getHours() * 60 + new Date().getMinutes();
  return now >= toMin(opening) && now < toMin(closing);
};
