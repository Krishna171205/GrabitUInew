'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bell, User } from 'lucide-react';

export interface TopHeaderNavProps {
  locationLabel?: string;
  userName?: string | null;
  userAvatarUrl?: string | null;
  notificationCount?: number;
  onNotificationClick?: () => void;
  className?: string;
}

export default function TopHeaderNav({
  locationLabel = 'DTU, Delhi',
  userName,
  userAvatarUrl,
  notificationCount = 2,
  onNotificationClick,
  className = '',
}: TopHeaderNavProps) {
  const firstName = userName?.trim()?.split(' ')[0] || null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-white/80 dark:bg-[#0A0A0C]/80 backdrop-blur-md border-b border-[#E5E5EA] dark:border-white/10 px-4 py-2.5 transition-colors ${className}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Location & Greeting */}
        <div className="flex flex-col min-w-0">
          {/* Location Selector */}
          <Link
            href="/location"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <span className="text-[#0055D4] text-xs">📍</span>
            <span className="truncate">{locationLabel}</span>
            <span className="text-[9px] text-slate-400 font-bold">▼</span>
          </Link>

          {/* Dynamic Greeting */}
          <h1 className="text-[17.5px] font-black text-slate-900 dark:text-white tracking-tight leading-snug truncate mt-0.5">
            {greeting}
            {firstName ? (
              <>
                , <span className="text-[#0055D4]">{firstName}</span>
              </>
            ) : (
              <span> to Grabbit</span>
            )}
          </h1>
        </div>

        {/* Right: Notification Bell & Profile Avatar */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Circular Notification Bell button */}
          <button
            type="button"
            onClick={onNotificationClick}
            className="relative w-10 h-10 rounded-full bg-white dark:bg-[#1C1C1E] border border-slate-200/90 dark:border-white/10 flex items-center justify-center shadow-xs hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-slate-700 dark:text-slate-200" />

            {/* Live notification counter badge */}
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1C1C1E] shadow-xs leading-none"
              >
                {notificationCount}
              </motion.span>
            )}
          </button>

          {/* Profile Avatar Circle */}
          <Link
            href="/profile"
            className="relative w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[#0055D4] font-bold flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
            aria-label="Profile"
          >
            {userAvatarUrl ? (
              <Image
                src={userAvatarUrl}
                alt="Profile"
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <User size={18} className="text-[#0055D4]" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
