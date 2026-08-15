'use client';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';
import CoffeeCup3D from './CoffeeCup3D';

export default function LandingFooter() {
  return (
    <footer className="bg-[#F4F4F4] pt-12 md:pt-20 pb-8 md:pb-12 overflow-hidden">
      <div className="bg-white rounded-[40px] px-8 sm:px-12 md:px-14 pt-12 pb-8 max-w-[1360px] mx-auto relative overflow-hidden shadow-sm mx-4 sm:mx-8">
        
        {/* Main Footer Layout (12-column grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 mb-8 relative z-10 items-center">
          
          {/* Column 1: Connect with us */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="font-bold text-[#1A1311] text-[14px] mb-2">Connect with us</h4>
            {['Call', 'Text (WhatsApp)', 'Instagram', 'YouTube', 'LinkedIn'].map((item) => (
              <Link key={item} href="#" className="text-[13px] text-gray-500 hover:text-[#1A1311] transition-colors font-medium w-fit">
                {item}
              </Link>
            ))}
          </div>

          {/* Column 2: Order Support */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="font-bold text-[#1A1311] text-[14px] mb-2">Order Support</h4>
            {['Make a return/Exchange', 'Refund/Exchange policy', 'Track your order', 'Shipping policy', "FAQ's", 'Terms'].map((item) => (
              <Link key={item} href="#" className="text-[13px] text-gray-500 hover:text-[#1A1311] transition-colors font-medium w-fit">
                {item}
              </Link>
            ))}
          </div>

          {/* Column 3: We are GRABBIT */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h4 className="font-bold text-[#1A1311] text-[14px] mb-2">We are GRABBIT</h4>
            {['Our story', 'Walk-in Stores', 'Collaborations', 'Careers', 'Media', 'Blogs'].map((item) => (
              <Link key={item} href="#" className="text-[13px] text-gray-500 hover:text-[#1A1311] transition-colors font-medium w-fit">
                {item}
              </Link>
            ))}
          </div>

          {/* Column 4: Far Right 3D GRABBIT Coffee Cup */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 flex items-center justify-center lg:justify-end relative pr-0 lg:pr-4">
            <div className="w-full max-w-[160px] sm:max-w-[185px] lg:max-w-[210px] h-[200px] sm:h-[230px] lg:h-[250px] relative pointer-events-auto">
              <CoffeeCup3D />
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-100 pt-6 relative z-10">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 md:mb-0">
            © 2026 UNIFIED NEXGRADE PRIVATE LIMITED. ALL RIGHTS RESERVED.
          </div>
          
          {/* Floating Action Button (Chat) */}
          <div className="w-11 h-11 bg-[#1A1311] rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-105 hover:bg-[#F09819] transition-all shadow-md">
            <MS name="chat_bubble" size={18} />
          </div>
        </div>

      </div>
    </footer>
  );
}
