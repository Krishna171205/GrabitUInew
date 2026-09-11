'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function HomeFooter() {
  return (
    <footer className="bg-white pt-12 pb-24 md:pb-12 border-t border-[#F1F5F9]">
      <div className="max-w-[1240px] mx-auto px-5 md:px-8 xl:px-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
          
          <div className="max-w-[280px]">
            <div className="mb-4">
              <Image src="/new-logo.svg" alt="Grabbit" width={140} height={42} className="object-contain" />
            </div>
            <p className="text-[14px] text-[#64748B] font-medium leading-relaxed">
              Your campus café discovery platform. Find, save, and grab from the best spots around you.
            </p>
          </div>
          
          <div className="flex gap-12 sm:gap-16">
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-[#0F172A] text-[14px] mb-1">Company</h4>
              <Link href="/about" className="text-[13px] text-[#64748B] hover:text-[#0055D4] transition-colors font-medium">About us</Link>
              <Link href="/partner" className="text-[13px] text-[#64748B] hover:text-[#0055D4] transition-colors font-medium">Partner with us</Link>
              <Link href="/contact" className="text-[13px] text-[#64748B] hover:text-[#0055D4] transition-colors font-medium">Contact</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-[#0F172A] text-[14px] mb-1">Legal</h4>
              <Link href="/terms" className="text-[13px] text-[#64748B] hover:text-[#0055D4] transition-colors font-medium">Terms of service</Link>
              <Link href="/privacy" className="text-[13px] text-[#64748B] hover:text-[#0055D4] transition-colors font-medium">Privacy policy</Link>
              <Link href="/refunds" className="text-[13px] text-[#64748B] hover:text-[#0055D4] transition-colors font-medium">Refund policy</Link>
            </div>
          </div>
          
        </div>
        
        <div className="pt-6 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-[#94A3B8] font-medium">
            © {new Date().getFullYear()} Grabbit. Made for campus foodies.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://instagram.com" className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors">
              <span className="sr-only">Instagram</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
