'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Compass, ShoppingBag, User } from 'lucide-react';

export interface NavTabItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  badge?: number;
}

export const CAMPUS_TABS: readonly NavTabItem[] = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/orders', label: 'Orders', icon: ShoppingBag, badge: 1 },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

export default function CampusLinkNavBar() {
  const pathname = usePathname();

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {
        // Ignore if vibration is not supported
      }
    }
  };

  return (
    <div className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none md:hidden">
      <nav
        className="pointer-events-auto w-full max-w-[350px] sm:max-w-[370px] h-[68px] rounded-[34px] bg-white shadow-[0_14px_40px_rgba(0,85,212,0.18)] border border-[#BED8FE]/60 px-2.5 py-2 flex items-center justify-between select-none"
        aria-label="Main Navigation"
      >
        <ul className="flex items-center justify-between m-0 p-0 list-none w-full h-full">
          {CAMPUS_TABS.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
            const Icon = tab.icon;

            return (
              <li key={tab.href} className="relative flex-1 flex items-center justify-center h-full">
                <Link
                  href={tab.href}
                  onClick={triggerHaptic}
                  role="tab"
                  aria-selected={active}
                  aria-label={tab.label}
                  className="relative flex items-center justify-center w-[54px] h-[54px] rounded-[22px] focus:outline-hidden"
                >
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                    className="relative flex items-center justify-center w-full h-full"
                  >
                    {/* Active State: Royal Blue Squircle + Pure White Circle + Blue Icon */}
                    {active ? (
                      <motion.div
                        layoutId="activeDockIndicator"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 bg-[#0055D4] rounded-[22px] flex items-center justify-center shadow-[0_6px_18px_rgba(0,85,212,0.38)]"
                      >
                        {/* Pure White Inner Circle */}
                        <div className="w-[38px] h-[38px] rounded-full bg-white flex items-center justify-center shadow-xs">
                          <Icon size={21} strokeWidth={2.4} className="text-[#0055D4]" />
                        </div>
                      </motion.div>
                    ) : (
                      /* Inactive State: Clean Blue Outline Icon */
                      <div className="relative flex items-center justify-center w-[38px] h-[38px] text-[#0055D4]/55 hover:text-[#0055D4] transition-colors">
                        <Icon size={22} strokeWidth={2} />

                        {/* Optional Notification Badge */}
                        {Boolean(tab.badge && tab.badge > 0) && (
                          <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-black min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                            {tab.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

// Backwards-compatible export
export { CampusLinkNavBar as BottomNav };
