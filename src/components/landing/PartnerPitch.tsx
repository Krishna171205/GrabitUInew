'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MS } from '@/components/gb/kit';

export default function PartnerPitch() {
  // 3D rotation logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 30 });
  
  // Apple-like subtle isometric tilt
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  // Common transition for infinite 10s loop (11 keyframes = 10 equal 1s intervals)
  const loopTransition = { repeat: Infinity, duration: 10, ease: "easeInOut" };

  return (
    <section className="py-32 bg-[#FDFBF7] text-[#1A1311] relative overflow-hidden">
      {/* Ambient glowing mesh (Stripe-style) */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#F09819]/15 via-transparent to-blue-500/10 blur-[80px] rounded-full pointer-events-none z-0" />

      <div className="max-w-[1280px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        {/* LEFT: Copy */}
        <div className="w-full lg:w-5/12 order-2 lg:order-1 relative z-20">
          <span className="inline-flex items-center gap-2 bg-[#EBE4D8]/50 text-[#8A7A6B] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            For Café Partners
          </span>
          <h2 className="text-[42px] md:text-[56px] font-black tracking-tighter leading-[1.05] mb-6">
            Connecting customers <br />
            <span className="text-[#8A7A6B] font-serif italic font-medium">directly to your kitchen.</span>
          </h2>
          <p className="text-[18px] text-[#8A7A6B] font-semibold leading-relaxed mb-10 max-w-md">
            Watch how a pre-order flows from a customer's phone instantly to your Café Dashboard. No manual entry, no missed tickets, no angry queues.
          </p>
          <ul className="space-y-4 mb-10">
            {['Zero hardware integration costs.', 'Real-time sync with customers.', 'Automated prep-time calculations.'].map((item, i) => (
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

        {/* RIGHT: Dashboard + Widget Mockup (Stripe-style) */}
        <div 
          className="w-full lg:w-7/12 order-1 lg:order-2 flex justify-center items-center relative mt-12 lg:mt-0"
          style={{ perspective: 1400 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div 
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[720px] aspect-[4/3] sm:aspect-[16/10] md:h-[480px]"
          >
            {/* Smooth floating wrapper */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-full h-full relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              
              {/* --- BACKGROUND: Dashboard Window --- */}
              <div 
                className="absolute right-0 lg:right-[-40px] top-4 w-[100%] sm:w-[95%] h-[90%] bg-white rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden flex flex-col z-10"
                style={{ transform: 'translateZ(-30px)' }}
              >
                {/* Browser-like Header */}
                <div className="h-12 border-b border-gray-100 flex items-center px-4 bg-gray-50/80 backdrop-blur-sm gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-[11px] font-medium text-gray-500 flex items-center gap-2 shadow-sm w-48 sm:w-64 justify-center">
                      <MS name="lock" size={12} className="text-gray-400" />
                      dashboard.letsgrabbit.com
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="flex-1 flex bg-[#FAFAFA]">
                  {/* Sidebar (Subtle) */}
                  <div className="w-48 bg-white border-r border-gray-100 flex-col hidden sm:flex">
                    <div className="p-4 flex items-center gap-2 border-b border-gray-100 mb-2">
                      <div className="w-6 h-6 bg-[#1A1311] rounded text-white flex items-center justify-center font-bold text-[12px] shrink-0">G</div>
                      <span className="font-bold text-[#1A1311] text-[13px] truncate">Grabbit Partner</span>
                    </div>
                    <div className="p-3 space-y-1">
                      {['Overview', 'Live Queue', 'Menu', 'Settings'].map((item, i) => (
                        <div key={item} className={`px-3 py-2 rounded-lg text-[13px] font-medium ${i === 1 ? 'bg-gray-100 text-[#1A1311]' : 'text-gray-500'}`}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 p-4 sm:p-6 flex flex-col overflow-hidden">
                    <h3 className="text-[18px] sm:text-[20px] font-bold text-[#1A1311] mb-4 sm:mb-6">Live Queue</h3>
                    
                    {/* Table */}
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex-1 shadow-sm flex flex-col">
                      <div className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-5 py-3 border-b border-gray-100 text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-3 sm:col-span-2">Order</div>
                        <div className="col-span-5 sm:col-span-5">Items</div>
                        <div className="hidden sm:block sm:col-span-3">Status</div>
                        <div className="col-span-4 sm:col-span-2 text-right">Amount</div>
                      </div>
                      <div className="flex flex-col">
                        {[
                          { id: '#4092', items: '2x Iced Latte, 1x Croissant', status: 'PREPARING', amount: '₹680' },
                          { id: '#4091', items: '1x Americano', status: 'READY', amount: '₹150' },
                          { id: '#4090', items: '3x Flat White', status: 'PICKED UP', amount: '₹840' },
                          { id: '#4089', items: '1x Matcha Latte', status: 'PICKED UP', amount: '₹320' },
                        ].map((row, i) => (
                          <div key={i} className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-50 last:border-0 items-center text-[12px] sm:text-[13px]">
                            <div className="col-span-3 sm:col-span-2 font-bold text-gray-500">{row.id}</div>
                            <div className="col-span-5 sm:col-span-5 font-medium text-[#1A1311] truncate pr-2">{row.items}</div>
                            <div className="hidden sm:block sm:col-span-3">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold ${
                                row.status === 'READY' ? 'bg-green-100 text-green-700' : 
                                row.status === 'PREPARING' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {row.status}
                              </span>
                            </div>
                            <div className="col-span-4 sm:col-span-2 text-right font-bold text-[#1A1311]">{row.amount}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- FOREGROUND: Customer Widget (Stripe-style card) --- */}
              <div 
                className="absolute left-0 sm:left-[-30px] top-1/2 -translate-y-1/2 w-[280px] sm:w-[320px] bg-white rounded-[24px] shadow-[0_40px_80px_rgba(26,19,17,0.12)] border border-gray-100 overflow-hidden flex flex-col z-30"
                style={{ transform: 'translateZ(50px)' }}
              >
                {/* Header (Cafe Info) */}
                <div className="p-5 sm:p-6 border-b border-gray-50 bg-white">
                  <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-50 flex items-center justify-center text-[20px] sm:text-[24px] shadow-inner border border-orange-100">
                      ☕
                    </div>
                    <div>
                      <div className="font-bold text-[#1A1311] text-[15px] sm:text-[16px]">Blue Tokai</div>
                      <div className="text-[12px] sm:text-[13px] text-gray-500 font-medium">Connaught Place</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-[12px] sm:text-[13px] font-bold text-[#1A1311]">Order Summary</div>
                    <div className="flex justify-between items-center">
                      <div className="text-[13px] sm:text-[14px] font-medium text-gray-600">Iced Latte (Oat)</div>
                      <div className="text-[13px] sm:text-[14px] font-medium text-[#1A1311]">₹260</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-[13px] sm:text-[14px] font-medium text-gray-600">Almond Croissant</div>
                      <div className="text-[13px] sm:text-[14px] font-medium text-[#1A1311]">₹220</div>
                    </div>
                  </div>
                </div>
                
                {/* Footer (Payment) */}
                <div className="p-5 sm:p-6 bg-gray-50/50 flex flex-col gap-4 sm:gap-5">
                  <div className="flex justify-between items-center">
                    <div className="text-[13px] sm:text-[14px] font-bold text-[#1A1311]">Total</div>
                    <div className="text-[18px] sm:text-[20px] font-black text-[#1A1311]">₹480</div>
                  </div>
                  
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-widest">Payment Method</div>
                    <div className="flex items-center justify-between p-3 sm:p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-400 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-9 h-6 sm:w-10 bg-[#1434CB] rounded flex items-center justify-center overflow-hidden">
                          <span className="text-[9px] sm:text-[10px] font-black italic text-white">VISA</span>
                        </div>
                        <span className="text-[13px] sm:text-[14px] font-semibold text-[#1A1311]">•••• 4242</span>
                      </div>
                      <MS name="chevron_right" size={18} className="text-gray-400" />
                    </div>
                  </div>

                  <motion.div
                    animate={{
                      scale: [1, 0.98, 1, 1, 1, 1, 1],
                      backgroundColor: ['#10B981', '#10B981', '#059669', '#10B981', '#10B981', '#10B981', '#10B981']
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="w-full h-[48px] sm:h-[52px] rounded-xl text-white flex items-center justify-center font-bold text-[15px] sm:text-[16px] shadow-lg shadow-green-500/20 relative overflow-hidden mt-1 sm:mt-2 cursor-pointer"
                  >
                    <motion.div 
                      animate={{ opacity: [1, 1, 0, 0, 0, 1, 1] }} 
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute"
                    >
                      Pay ₹480
                    </motion.div>
                    <motion.div 
                      animate={{ opacity: [0, 0, 1, 1, 1, 0, 0] }} 
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute flex items-center gap-2"
                    >
                      <MS name="check_circle" size={18} /> Sent to kitchen
                    </motion.div>
                  </motion.div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
