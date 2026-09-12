'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Compass, ShoppingBag, User, MapPin, ChevronDown } from 'lucide-react';
import { useCart } from '@/store/cart';

export interface DesktopNavBarProps {
  me?: {
    name: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null;
  address?: {
    label: string;
    shortText: string;
  } | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  isCart?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Cart', href: '/orders', icon: ShoppingBag, isCart: true },
  { label: 'Profile', href: '/profile', icon: User },
] as const;

export default function DesktopNavBar({ me, address }: DesktopNavBarProps) {
  const pathname = usePathname();
  const cartItemsCount = useCart((s) => s.items.length);
  const locationLabel = address?.label || 'DTU, Delhi';
  const firstName = me?.name?.trim()?.split(' ')[0] || null;

  return (
    <header className="hidden md:block sticky top-0 z-40 w-full bg-white/85 backdrop-blur-xl border-b border-[#BED8FE]/50 shadow-[0_4px_24px_rgba(0,85,212,0.06)] transition-all">
      <div className="max-w-[1460px] mx-auto h-[74px] px-6 lg:px-10 flex items-center justify-between">
        {/* Left: Brand Wordmark + Campus Location Chip */}
        <div className="flex items-center gap-4">
          <Link href="/home" className="flex items-center gap-2 group transition-transform active:scale-95">
            <Image
              src="/new-logo.svg"
              alt="Grabbit"
              width={124}
              height={38}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Campus Location Pill (Inspired by Mobile Header) */}
          <Link
            href="/location"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BED8FE]/70 text-[#0055D4] hover:bg-[#E0EDFF] hover:border-[#0055D4]/40 transition-all text-xs font-extrabold shadow-xs group"
          >
            <MapPin size={13} strokeWidth={2.5} className="text-[#0055D4] shrink-0" />
            <span className="truncate max-w-[130px]">{locationLabel}</span>
            <ChevronDown size={12} strokeWidth={3} className="text-[#0055D4]/70 group-hover:translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Center: The 4 Core Navigation Elements (Identical to Mobile) */}
        <nav
          className="bg-white/90 backdrop-blur-md border border-[#BED8FE]/60 rounded-full px-2 py-1.5 shadow-[0_8px_25px_rgba(0,85,212,0.08)] flex items-center gap-1 select-none"
          aria-label="Desktop Main Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href + '/'));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-full focus:outline-hidden"
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="relative flex items-center"
                >
                  {/* Active State: Royal Blue Pill with White Circle Icon */}
                  {active ? (
                    <motion.div
                      layoutId="desktopActiveTabIndicator"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      className="relative bg-[#0055D4] text-white rounded-full shadow-[0_4px_16px_rgba(0,85,212,0.32)] px-3.5 py-1.5 flex items-center gap-2 font-extrabold text-[13.5px]"
                    >
                      <div className="w-[26px] h-[26px] rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                        <Icon size={15} strokeWidth={2.5} className="text-[#0055D4]" />
                      </div>
                      <span className="tracking-wide pr-1">{item.label}</span>

                      {/* Active Cart Counter */}
                      {Boolean(item.isCart && cartItemsCount > 0) && (
                        <span className="bg-white text-[#0055D4] text-[10px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-xs">
                          {cartItemsCount}
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    /* Inactive State: Clean Blue Outline Icon + Label */
                    <div className="relative flex items-center gap-2 px-3.5 py-1.5 text-[#0055D4]/70 hover:text-[#0055D4] hover:bg-[#EFF6FF]/60 rounded-full transition-all font-bold text-[13.5px]">
                      <Icon size={17} strokeWidth={2} className="shrink-0" />
                      <span>{item.label}</span>

                      {/* Inactive Cart Counter Badge */}
                      {Boolean(item.isCart && cartItemsCount > 0) && (
                        <span className="bg-[#EF4444] text-white text-[10px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                          {cartItemsCount}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Right: User Greeting / Account Chip */}
        <div className="flex items-center gap-3">
          {me ? (
            <Link
              href="/profile"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-[#BED8FE]/60 hover:border-[#0055D4]/40 shadow-xs hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0055D4] to-[#3B82F6] text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                {me.avatar_url ? (
                  <Image src={me.avatar_url} alt="Profile" width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  <span>{(me.name?.[0] || 'U').toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Welcome</span>
                <span className="text-[13px] font-extrabold text-[#0F172A] leading-tight truncate max-w-[110px]">
                  {firstName || 'Account'}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              style={{ color: '#ffffff' }}
              className="inline-flex items-center gap-1.5 bg-[#0055D4] hover:bg-[#0047B3] active:scale-95 !text-white font-extrabold text-[13.5px] px-5 py-2 rounded-full shadow-[0_4px_14px_rgba(0,85,212,0.25)] hover:shadow-[0_6px_20px_rgba(0,85,212,0.35)] transition-all"
            >
              <span style={{ color: '#ffffff' }} className="!text-white">Sign In</span>
              <span style={{ color: '#ffffff' }} className="!text-white text-base leading-none">→</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
