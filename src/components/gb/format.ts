/** Pure formatting helpers — deliberately NOT 'use client' so server components can call them directly. */
export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
