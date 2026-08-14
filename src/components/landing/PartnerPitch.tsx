'use client';
import { motion } from 'framer-motion';
import { MS } from '@/components/gb/kit';

export default function PartnerPitch() {
  return (
    <section className="py-32 bg-[#FDFBF7] text-[#1A1311] relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        {/* LEFT: Copy & CTA */}
        <div className="w-full lg:w-5/12 order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 bg-[#EBE4D8]/50 text-[#8A7A6B] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            For Café Owners
          </span>
          <h2 className="text-[42px] md:text-[56px] font-black tracking-tighter leading-[1.05] mb-6">
            Grow your revenue, <br />
            <span className="text-[#8A7A6B] font-serif italic font-medium">not your queue.</span>
          </h2>
          <p className="text-[18px] text-[#8A7A6B] font-semibold leading-relaxed mb-10 max-w-md">
            Grabbit isn't a food delivery app taking 30% margins. We are a direct pre-order channel built to increase your morning volume without overwhelming your counter staff.
          </p>
          
          <ul className="space-y-4 mb-10">
            {[
              'Keep your margins. No predatory delivery fees.',
              'Orders land directly on your custom Grabbit tablet.',
              'Eliminate counter congestion and customer frustration.'
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1A1311] flex items-center justify-center shrink-0 mt-0.5">
                  <MS name="check" size={14} color="#FDFBF7" />
                </div>
                <span className="text-[16px] font-bold text-[#1A1311]">{item}</span>
              </li>
            ))}
          </ul>

          <div className="group inline-flex items-center justify-center gap-2 bg-[#1A1311] hover:bg-[#F09819] text-white hover:text-[#1A1311] px-8 py-4 rounded-[16px] font-bold text-[16px] cursor-pointer transition-all duration-300 shadow-md">
            Partner with us
            <MS name="arrow_forward" size={18} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* RIGHT: B2B Dashboard Mockup */}
        <div className="w-full lg:w-7/12 order-1 lg:order-2">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="w-full aspect-[4/3] bg-white rounded-[24px] shadow-[0_32px_64px_rgba(26,19,17,0.1)] border border-[#EBE4D8] overflow-hidden flex flex-col perspective-1000"
          >
            {/* Dashboard Header */}
            <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <img src="/transparent-image.svg" alt="Grabbit" className="h-8 w-auto" />
                <span className="font-bold text-[#1A1311] border-l border-gray-200 pl-3">Blue Tokai Dashboard</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Accepting Orders</span>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 flex-1 bg-[#FDFBF7]/30 flex flex-col gap-6">
              
              {/* Top Metrics Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Today's Orders</div>
                  <div className="text-[28px] font-black text-[#1A1311]">142</div>
                  <div className="text-[12px] font-bold text-green-500 mt-1">↑ 12% vs yesterday</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg Prep Time</div>
                  <div className="text-[28px] font-black text-[#1A1311]">4m 12s</div>
                  <div className="text-[12px] font-bold text-green-500 mt-1">On target</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending</div>
                  <div className="text-[28px] font-black text-[#F09819]">8</div>
                  <div className="text-[12px] font-bold text-gray-400 mt-1">In kitchen</div>
                </div>
              </div>

              {/* Active Orders List */}
              <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <span className="font-bold text-[14px]">Live Queue</span>
                  <span className="text-[12px] text-[#F09819] font-bold bg-[#F09819]/10 px-2 py-1 rounded">Auto-accepting</span>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  {[
                    { id: '#4092', items: '2x Iced Americano, 1x Croissant', time: '02:45', status: 'PREPARING', color: 'bg-[#F09819]', text: 'text-[#1A1311]' },
                    { id: '#4091', items: '1x Flat White (Oat Milk)', time: '00:00', status: 'READY', color: 'bg-green-500', text: 'text-white' },
                    { id: '#4090', items: '1x Matcha Latte', time: '00:00', status: 'READY', color: 'bg-green-500', text: 'text-white' },
                  ].map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-[#1A1311]">{order.id}</div>
                        <div>
                          <div className="font-bold text-[#1A1311] text-[14px]">{order.items}</div>
                          <div className="text-[12px] text-gray-500 mt-0.5">Pickup at {(new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {order.time !== '00:00' && <span className="font-mono font-bold text-[#1A1311]">{order.time}</span>}
                        <div className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wider ${order.color} ${order.text}`}>
                          {order.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
