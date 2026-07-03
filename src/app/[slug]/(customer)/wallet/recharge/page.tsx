'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPaise } from '@/lib/utils';
import type { GrabitWallet } from '@gradient365/gradient-commons';
import { WALLET_SLABS } from '@gradient365/gradient-commons';
import { TopBar, Button } from '@/components/ui/kit';

type WalletSlab = { readonly amountPaise: number; readonly bonusPaise: number; readonly expiryDays: number };

interface WalletData { wallet: GrabitWallet; }

const CONFETTI_COLORS = ['#b7122a', '#4ade80', '#60a5fa', '#ffbb0c', '#ec4899', '#8b5cf6'];

export default function RechargePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [cafeId, setCafeId] = useState<number | null>(null);
  const [selectedSlab, setSelectedSlab] = useState<number | null>(null);
  const [showReferral, setShowReferral] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralStatus, setReferralStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ slab: number; bonus: number } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/proxy/grabit/auth/me').then(r => {
        if (r.status === 401) { router.replace(`/login?next=/${slug}/wallet/recharge`); throw new Error('unauth'); }
        return r.json();
      }),
      (() => {
        const cached = sessionStorage.getItem(`grabit_cafe_id_${slug}`);
        if (cached) return Promise.resolve(Number(cached));
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/grabit/menu/${slug}`)
          .then(r => r.json())
          .then(d => {
            const id = d.cafe?.id ?? null;
            if (id) sessionStorage.setItem(`grabit_cafe_id_${slug}`, String(id));
            return id;
          });
      })(),
    ])
      .then(([me, cid]) => { setCustomerId(me.id); setCafeId(cid); })
      .catch(() => {});
  }, [slug, router]);

  const { data } = useQuery<WalletData>({
    queryKey: ['wallet', customerId, cafeId],
    queryFn: async () => {
      const res = await fetch(`/api/proxy/grabit/wallet/${customerId}?cafeId=${cafeId}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!(customerId && cafeId),
  });

  const wallet = data?.wallet;

  async function applyReferral() {
    if (!referralCode.trim() || !customerId || !cafeId) return;
    try {
      const res = await fetch('/api/proxy/grabit/wallet/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, cafeId, referralCode: referralCode.trim() }),
      });
      setReferralStatus(res.ok ? 'success' : 'error');
    } catch {
      setReferralStatus('error');
    }
  }

  async function handleRecharge() {
    if (!selectedSlab || !customerId || !cafeId) return;
    setProcessing(true);
    try {
      const initRes = await fetch('/api/proxy/grabit/wallet/recharge/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, cafeId, slabAmountPaise: selectedSlab }),
      });
      if (!initRes.ok) throw new Error('Failed to initiate recharge');
      const initData = await initRes.json();

      await new Promise(res => setTimeout(res, 1500));

      const confirmRes = await fetch('/api/grabit-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rechargeId: initData.recharge_id, cashfreeOrderId: initData.cashfree_order_id }),
      });
      if (!confirmRes.ok) throw new Error('Failed to confirm recharge');

      const slabInfo = (WALLET_SLABS as readonly WalletSlab[]).find(s => s.amountPaise === selectedSlab);
      setSuccessData({ slab: selectedSlab, bonus: slabInfo?.bonusPaise ?? 0 });
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  if (!customerId || !cafeId) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--surface)' }}><p style={{ color: 'var(--muted)' }}>Loading…</p></div>;
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: 'var(--surface)', position: 'relative' }}>
      <TopBar title="Recharge Wallet" onBack={() => router.push(`/${slug}/wallet`)} />

      <div style={{ padding: '14px 20px 110px' }}>
        {/* Current balance pill */}
        {wallet && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface-container)', borderRadius: 'var(--r-pill)', padding: '8px 16px', marginBottom: 24, fontSize: 13 }}>
            <span style={{ color: 'var(--muted)' }}>Current balance:</span>
            <span className="tabular" style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{formatPaise(wallet.base_balance_paise)}</span>
          </div>
        )}

        {/* Slabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {(WALLET_SLABS as readonly WalletSlab[]).map(slab => {
            const selected = selectedSlab === slab.amountPaise;
            return (
              <motion.button key={slab.amountPaise} whileTap={{ scale: 0.98 }} onClick={() => setSelectedSlab(slab.amountPaise)}
                style={{ borderRadius: 'var(--r-lg)', padding: 20, border: `1.5px solid ${selected ? 'var(--primary)' : 'var(--hairline-strong)'}`, background: selected ? 'var(--primary-tint)' : 'var(--surface-card)', boxShadow: selected ? '0 4px 16px rgba(183,18,42,0.15)' : 'var(--shadow-card)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="tabular" style={{ fontSize: 24, fontWeight: 700, color: 'var(--on-surface)' }}>{formatPaise(slab.amountPaise)}</span>
                  <span style={{ background: 'var(--success-tint)', color: 'var(--success)', borderRadius: 'var(--r-pill)', padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>+{formatPaise(slab.bonusPaise)} bonus</span>
                </div>
                <div className="t-caption" style={{ marginBottom: 4 }}>Total {formatPaise(slab.amountPaise + slab.bonusPaise)} credited</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Bonus usable on orders ₹500+ · Valid {slab.expiryDays} days</div>
              </motion.button>
            );
          })}
        </div>

        {/* Referral code (collapsible) */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => { setShowReferral(v => !v); setReferralStatus('idle'); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            {showReferral ? 'Hide referral code ▲' : 'Have a referral code? ▼'}
          </button>
          <AnimatePresence>
            {showReferral && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input type="text" value={referralCode} onChange={e => { setReferralCode(e.target.value.toUpperCase()); setReferralStatus('idle'); }} placeholder="Enter code"
                    style={{ flex: 1, padding: '12px 14px', background: 'var(--surface-card)', border: '1.5px solid var(--hairline-strong)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font)', fontSize: 15, outline: 'none', color: 'var(--on-surface)' }} />
                  <Button size="md" onClick={applyReferral}>Apply</Button>
                </div>
                <AnimatePresence mode="wait">
                  {referralStatus === 'success' && <motion.p key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'var(--success)', fontSize: 13, marginTop: 8 }}>✓ ₹50 bonus will be added!</motion.p>}
                  {referralStatus === 'error' && <motion.p key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ color: 'var(--error)', fontSize: 13, marginTop: 8 }}>Invalid or already used code</motion.p>}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '16px 20px', background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '0.5px solid var(--glass-border)' }}>
        <Button full disabled={!selectedSlab || processing} onClick={handleRecharge}>
          {processing
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'gb-spin 0.8s linear infinite', display: 'inline-block' }} />Processing payment…</span>
            : selectedSlab ? `Recharge ${formatPaise(selectedSlab)}` : 'Select an amount'}
        </Button>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && successData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'var(--surface)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', maxWidth: 480, left: '50%', transform: 'translateX(-50%)' }}>
            {CONFETTI_COLORS.map((color, i) => (
              <motion.div key={i} initial={{ y: -100, x: (i - 3) * 30, opacity: 1 }} animate={{ y: 700, x: (i - 3) * 50, opacity: 0 }} transition={{ duration: 2, delay: i * 0.12, ease: 'easeIn' }}
                style={{ position: 'absolute', width: 10, height: 10, borderRadius: 2, background: color, top: '20%', left: `${20 + (i * 12)}%` }} />
            ))}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-tint)', color: 'var(--success)', display: 'grid', placeItems: 'center', fontSize: 28, marginBottom: 20 }}>✓</motion.div>
            <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8, textAlign: 'center' }}>Recharge Successful!</p>
            <p style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 8, textAlign: 'center' }}>{formatPaise(successData.slab)} added to your wallet</p>
            {successData.bonus > 0 && <p style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600, marginBottom: 32, textAlign: 'center' }}>Plus {formatPaise(successData.bonus)} bonus!</p>}
            <Button onClick={() => router.push(`/${slug}/wallet`)}>Go to Wallet</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes gb-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
