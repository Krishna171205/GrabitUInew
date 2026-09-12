'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Compass, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/store/cart';

export interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  isCart?: boolean;
}

const DESKTOP_NAV_ITEMS: readonly SidebarItem[] = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Cart', href: '/orders', icon: ShoppingBag, isCart: true },
  { label: 'Profile', href: '/profile', icon: User },
] as const;

export default function DesktopSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const cartItemsCount = useCart((s) => s.items.length);

  return (
    <motion.aside
      initial={{ width: 88 }}
      animate={{ width: isExpanded ? 240 : 88 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="hidden md:flex h-[calc(100vh-32px)] my-4 ml-4 sticky top-4 rounded-[28px] bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_12px_36px_rgba(0,0,0,0.06)] flex-col relative z-30 overflow-hidden select-none"
      aria-label="Desktop Sidebar Navigation"
    >
      {/* Brand Header */}
      <div className="h-22 flex items-center px-6 shrink-0 border-b border-slate-100/80">
        <Link href="/home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0055D4] to-[#3B82F6] flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(0,85,212,0.32)] group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-black text-xl leading-none">G</span>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="text-lg font-black text-slate-900 tracking-tight leading-none">
                  Grabbit
                </span>
                <span className="text-[9px] font-black text-[#0055D4] tracking-widest uppercase mt-1">
                  CAMPUS
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {DESKTOP_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href + '/'));
          const Icon = item.icon;
          const badgeCount = item.isCart ? cartItemsCount : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center group"
              role="tab"
              aria-selected={isActive}
            >
              <div
                className={`flex items-center w-full h-12 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white shadow-[0_4px_18px_rgba(0,85,212,0.12)] border border-[#0055D4]/15'
                    : 'hover:bg-white/60 border border-transparent'
                }`}
              >
                {/* Active Indicator Accent */}
                {isActive && (
                  <motion.div
                    layoutId="desktop-active-indicator"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute left-0 top-[12px] w-1.5 h-6 bg-[#0055D4] rounded-r-full shadow-[0_0_12px_rgba(0,85,212,0.8)]"
                  />
                )}

                {/* Icon Container with Badge */}
                <div className="w-[56px] h-full flex items-center justify-center shrink-0 relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? 'text-[#0055D4]'
                        : 'text-slate-500 group-hover:text-slate-900'
                    }`}
                  />

                  {Boolean(badgeCount > 0) && (
                    <span className="absolute top-2 right-3.5 bg-[#EF4444] text-white text-[9.5px] font-black min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                      {badgeCount}
                    </span>
                  )}
                </div>

                {/* Label (Animated on expand) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.16 }}
                      className={`text-[13.5px] font-bold tracking-tight whitespace-nowrap ${
                        isActive ? 'text-[#0055D4]' : 'text-slate-600 group-hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile Chip */}
      <div className="p-4 shrink-0 border-t border-slate-100/80">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/60 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-[#0055D4] font-bold flex items-center justify-center shrink-0 overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
            <User size={20} className="text-[#0055D4]" />
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
                className="flex flex-col whitespace-nowrap min-w-0"
              >
                <span className="text-[13.5px] font-extrabold text-slate-800 tracking-tight leading-tight truncate">
                  My Profile
                </span>
                <span className="text-[11px] font-medium text-slate-400 leading-tight truncate mt-0.5">
                  DTU Campus
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </motion.aside>
  );
}
