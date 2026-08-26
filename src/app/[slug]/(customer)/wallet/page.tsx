'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { formatPaise } from '@/lib/utils';
import type { GrabbitWallet, GrabbitWalletTransaction, GrabbitWalletTransactionType } from '@gradient365/gradient-commons';
import { TopBar, Card, Button, Toggle, Icon } from '@/components/ui/kit';

interface WalletData {
  wallet: GrabbitWallet;
  transactions: GrabbitWalletTransaction[];
  streak: { months: number; lastRechargeMonth: string | null };
}

function txIcon(type: GrabbitWalletTransactionType) {
  const base: React.CSSProperties = {
    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0,
  };
  switch (type) {
    case 'recharge':       return { style: { ...base, background: 'var(--success-tint)', color: 'var(--success)' }, label: '↑' };
    case 'order_debit':    return { style: { ...base, background: 'var(--primary-tint)', color: 'var(--primary)' }, label: '🛒' };
    case 'bonus_credit':   return { style: { ...base, background: 'var(--success-tint)', color: 'var(--success)' }, label: '🎁' };
    case 'referral_bonus': return { style: { ...base, background: '#dbeafe', color: 'var(--info)' }, label: '👥' };
    case 'streak_bonus':   return { style: { ...base, background: 'var(--warning-tint)', color: 'var(--tertiary)' }, label: '🔥' };
    case 'bonus_expired':  return { style: { ...base, background: 'var(--error-tint)', color: 'var(--error)' }, label: '⏰' };
    default:               return { style: { ...base, background: 'var(--surface-container)', color: 'var(--muted)' }, label: '•' };
  }
}

function formatTxDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function groupTransactionsByDate(txs: GrabbitWalletTransaction[]): Array<{ date: string; items: GrabbitWalletTransaction[] }> {
  const groups: Record<string, GrabbitWalletTransaction[]> = {};
  for (const tx of txs) {
    const label = formatTxDate(tx.created_at);
    (groups[label] ??= []).push(tx);
  }
  return Object.entries(groups).map(([date, items]) => ({ date, items }));
}

function isCredit(type: GrabbitWalletTransactionType): boolean {
  return ['recharge', 'bonus_credit', 'referral_bonus', 'streak_bonus'].includes(type);
}

export default function WalletPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [cafeId, setCafeId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/proxy/grabit/auth/me').then(r => {
        if (r.status === 401) { router.replace(`/login?next=/${slug}/wallet`); throw new Error('unauth'); }
        return r.json();
      }),
      (() => {
        const cached = sessionStorage.getItem(`grabbit_cafe_id_${slug}`);
        if (cached) return Promise.resolve(Number(cached));
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`)
          .then(r => r.json())
          .then(d => {
            const id = d.cafe?.id ?? null;
            if (id) sessionStorage.setItem(`grabbit_cafe_id_${slug}`, String(id));
            return id;
          });
      })(),
    ])
      .then(([me, cid]) => { setCustomerId(me.id); setCafeId(cid); })
      .catch(() => {});
  }, [slug, router]);

  const { data, isLoading, isError } = useQuery<WalletData>({
    queryKey: ['wallet', customerId, cafeId],
    queryFn: async () => {
      const res = await fetch(`/api/proxy/grabit/wallet/${customerId}?cafeId=${cafeId}`);
      if (!res.ok) throw new Error('Failed to load wallet');
      return res.json();
    },
    enabled: !!(customerId && cafeId),
  });

  const autoRechargeMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await fetch(`/api/proxy/grabit/wallet/${customerId}/auto-recharge?cafeId=${cafeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error('Failed to update auto-recharge');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallet', customerId, cafeId] }); },
  });

  if (!customerId || !cafeId || isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface)' }}><p style={{ color: 'var(--muted)' }}>Loading wallet…</p></div>;
  }
  if (isError || !data) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface)' }}><p style={{ color: 'var(--error)' }}>Failed to load wallet</p></div>;
  }

  const { wallet, transactions, streak } = data;
  const groups = groupTransactionsByDate(transactions);
  const autoRechargeEnabled = wallet.auto_recharge_enabled;

  return (
    <div className="gb-cust-page-lg gb-wide-lg" style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: 'var(--surface)', position: 'relative' }}>
      <TopBar title="My Wallet" onBack={() => router.push(`/${slug}`)} />

      {/* Balance and streak on the left, what you spent on the right, once there
          is room for two columns. */}
      <div className="gb-wallet-cols" style={{ padding: '14px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Balance card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ background: 'var(--inverse-surface)', borderRadius: 'var(--r-xl)', padding: 24, boxShadow: 'var(--shadow-pop)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Balance</div>
          <div className="tabular" style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>{formatPaise(wallet.base_balance_paise)}</div>
          {wallet.bonus_balance_paise > 0 ? (
            <div className="tabular" style={{ fontSize: 14, color: '#4ade80', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>🎁 {formatPaise(wallet.bonus_balance_paise)} bonus</div>
          ) : (
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>No bonus credits</div>
          )}
          <Link href={`/${slug}/wallet/recharge`}><Button full>Top Up</Button></Link>
        </motion.div>

        {/* Auto-recharge */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>Auto-recharge</div>
              <div className="t-caption">Top up when balance drops below {formatPaise(wallet.auto_recharge_threshold_paise)}</div>
            </div>
            <Toggle on={autoRechargeEnabled} onChange={(v) => { if (!autoRechargeMutation.isPending) autoRechargeMutation.mutate(v); }} />
          </div>
        </Card>

        {/* Streak */}
        <Card>
          <div className="t-label" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11, marginBottom: 14 }}>Recharge streak</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            {[1, 2, 3].map((month, i) => {
              const filled = streak.months >= month;
              const isCurrent = streak.months === month - 1 && month <= 3;
              return (
                <div key={month} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
                  <motion.div animate={isCurrent ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: filled ? 'var(--primary)' : 'var(--surface-card)', border: filled ? 'none' : '2px solid var(--hairline-strong)', display: 'grid', placeItems: 'center', fontSize: 14, color: filled ? '#fff' : 'var(--muted)', boxShadow: isCurrent ? '0 0 0 4px var(--primary-tint)' : 'none', flexShrink: 0 }}>
                    {filled ? '✓' : month}
                  </motion.div>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: streak.months > month ? 'var(--primary)' : 'var(--hairline-strong)', margin: '0 4px' }} />}
                </div>
              );
            })}
          </div>
          <div className="t-caption">{streak.months}/3 months, ₹100 bonus at 3!</div>
        </Card>

        {/* Transactions */}
        <div className="gb-wallet-ledger">
          <div className="t-label" style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 11, marginBottom: 12 }}>Recent transactions</div>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>👛</p>
              <p style={{ fontSize: 15 }}>No transactions yet</p>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
              {groups.map(group => (
                <div key={group.date} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>{group.date}</div>
                  {group.items.map(tx => {
                    const icon = txIcon(tx.type);
                    const credit = isCredit(tx.type);
                    return (
                      <motion.div key={tx.id} variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--hairline)' }}>
                        <div style={icon.style}>{icon.label}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--on-surface)', textTransform: tx.note ? 'none' : 'capitalize' }}>{tx.note || tx.type.replace(/_/g, ' ')}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{new Date(tx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                        </div>
                        <div className="tabular" style={{ fontSize: 14, fontWeight: 600, color: credit ? 'var(--success)' : 'var(--on-surface)', flexShrink: 0 }}>{credit ? '+' : '-'}{formatPaise(tx.amount_paise)}</div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Refer banner */}
        <Link href={`/${slug}/wallet/referral`} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--primary-tint)', border: '1px solid var(--primary-tint-strong)', borderRadius: 'var(--r-md)', padding: 14 }}>
          <span style={{ fontSize: 24 }}>🎁</span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}>Refer a friend, earn ₹50</span>
          <span style={{ color: 'var(--primary)' }}>{Icon.chevR({ size: 18 })}</span>
        </Link>
      </div>
    </div>
  );
}
