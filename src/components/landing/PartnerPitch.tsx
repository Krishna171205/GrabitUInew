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

        {/* RIGHT: Live Business Mockup (Phone + Tablet) */}
        <div 
          className="w-full lg:w-7/12 order-1 lg:order-2 flex justify-center items-center"
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
            className="relative w-full max-w-[640px] h-[500px]"
          >
            {/* Smooth floating wrapper */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="w-full h-full relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              
              {/* --- TABLET KDS (BACK / RIGHT) --- */}
              <div 
                className="absolute right-0 top-12 w-[440px] h-[340px] bg-white/95 backdrop-blur-md rounded-[24px] shadow-[0_40px_80px_rgba(26,19,17,0.1)] border border-[#EBE4D8] overflow-hidden flex flex-col z-10"
                style={{ transform: 'translateZ(-40px) translateX(40px)' }}
              >
                {/* Header */}
                <div className="h-12 border-b border-gray-100 flex items-center justify-between px-5 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <img src="/transparent-image.svg" alt="Grabbit" className="h-5 w-auto opacity-80" />
                    <span className="font-bold text-[#1A1311] text-[13px] border-l border-gray-200 pl-2">Dashboard</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-green-700 uppercase tracking-wider">Online</span>
                  </div>
                </div>
                
                {/* Body */}
                <div className="p-5 flex-1 bg-[#FDFBF7]/30 flex flex-col gap-3 relative overflow-hidden">
                  <div className="flex justify-between items-end">
                    <h3 className="font-bold text-[14px]">Live Queue</h3>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Auto-accepting</div>
                  </div>
                  
                  <div className="relative mt-2">
                    {/* The new incoming order #4093 */}
                    <motion.div
                      animate={{ 
                        y: [-20, -20, -20, 0, 0, 0, 0, 0, 0, -20, -20],
                        opacity: [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
                        scale: [0.95, 0.95, 0.95, 1, 1, 1, 1, 1, 1, 0.95, 0.95]
                      }}
                      transition={loopTransition}
                      className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-blue-50/80 backdrop-blur-sm shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-[13px] text-blue-700 border border-blue-200">#4093</div>
                        <div>
                          <div className="font-bold text-[#1A1311] text-[14px]">1x Iced Latte</div>
                          <div className="text-[12px] text-gray-500 font-medium">Oat Milk</div>
                        </div>
                      </div>
                      
                      {/* Status Pill Animation */}
                      <div className="relative w-[85px] h-[28px]">
                        {/* PENDING -> 3s to 4s */}
                        <motion.div 
                          animate={{ opacity: [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1] }}
                          transition={loopTransition}
                          className="absolute inset-0 bg-[#F09819]/10 text-[#F09819] border border-[#F09819]/20 rounded-md flex items-center justify-center text-[10px] font-bold"
                        >
                          PENDING
                        </motion.div>
                        {/* PREPARING -> 4s to 6s */}
                        <motion.div 
                          animate={{ opacity: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0] }}
                          transition={loopTransition}
                          className="absolute inset-0 bg-blue-100 text-blue-700 border border-blue-200 rounded-md flex items-center justify-center text-[10px] font-bold"
                        >
                          PREPARING
                        </motion.div>
                        {/* READY -> 6s to 9s */}
                        <motion.div 
                          animate={{ opacity: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0] }}
                          transition={loopTransition}
                          className="absolute inset-0 bg-green-100 text-green-700 border border-green-200 rounded-md flex items-center justify-center text-[10px] font-bold"
                        >
                          READY
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Existing static orders that shift down */}
                    <motion.div
                      animate={{ y: [0, 0, 0, 75, 75, 75, 75, 75, 75, 0, 0] }}
                      transition={loopTransition}
                      className="flex flex-col gap-3 relative z-10"
                    >
                      {[
                        { id: '#4092', items: '2x Americano', status: 'PREPARING', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                        { id: '#4091', items: '1x Flat White', status: 'READY', color: 'bg-green-100 text-green-700 border-green-200' },
                      ].map((order, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-white shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center font-bold text-[13px] text-gray-600 border border-gray-100">{order.id}</div>
                            <div className="font-bold text-[#1A1311] text-[14px]">{order.items}</div>
                          </div>
                          <div className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold border ${order.color}`}>
                            {order.status}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* --- CUSTOMER PHONE (FRONT / LEFT) --- */}
              <div 
                className="absolute left-0 bottom-6 w-[260px] h-[460px] bg-white rounded-[36px] shadow-[0_40px_80px_rgba(0,0,0,0.2)] border-[8px] border-[#1A1311] overflow-hidden flex flex-col z-30"
                style={{ transform: 'translateZ(60px)' }}
              >
                {/* Dynamic Island Area */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
                  <div className="w-[80px] h-[24px] bg-[#1A1311] rounded-full z-10" />
                  
                  {/* Phone Ready Notification Toast */}
                  <motion.div
                    animate={{ 
                      y: [-100, -100, -100, -100, -100, -100, -100, 10, 10, -100, -100],
                      opacity: [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]
                    }}
                    transition={loopTransition}
                    className="absolute top-0 bg-white/95 backdrop-blur-xl rounded-[20px] shadow-2xl border border-gray-100 p-3 w-[220px] flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(74,222,128,0.4)]">
                      <MS name="check" size={16} color="#fff" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#1A1311] leading-tight mb-0.5">Order Ready!</div>
                      <div className="text-[11px] text-gray-500 font-medium leading-tight">Pick up at Counter 04</div>
                    </div>
                  </motion.div>
                </div>

                <div className="h-48 bg-gray-100 relative shrink-0">
                  <img src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-5 text-white">
                    <div className="text-[22px] font-black">Iced Latte</div>
                    <div className="text-[14px] font-bold text-[#F09819]">₹220</div>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1 bg-[#FDFBF7]">
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <div className="text-[13px] font-bold text-[#1A1311]">Milk</div>
                      <div className="text-[11px] font-semibold bg-[#F09819]/10 text-[#F09819] px-2 py-1 rounded">Oat Milk</div>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                      <div className="text-[13px] font-bold text-[#1A1311]">Total</div>
                      <div className="text-[15px] font-black text-[#1A1311]">₹220</div>
                    </div>
                  </div>
                  
                  {/* Place Order Button */}
                  <motion.div
                    animate={{
                      scale: [1, 0.95, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                      backgroundColor: ['#1A1311', '#1A1311', '#4ade80', '#4ade80', '#4ade80', '#4ade80', '#4ade80', '#4ade80', '#4ade80', '#1A1311', '#1A1311']
                    }}
                    transition={loopTransition}
                    className="w-full h-[48px] rounded-[14px] text-white flex items-center justify-center font-bold text-[14px] shadow-lg relative overflow-hidden"
                  >
                    <motion.div 
                      animate={{ opacity: [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1] }} 
                      transition={loopTransition}
                      className="absolute"
                    >
                      Pay ₹220
                    </motion.div>
                    <motion.div 
                      animate={{ opacity: [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0] }} 
                      transition={loopTransition}
                      className="absolute flex items-center gap-1.5"
                    >
                      <MS name="check_circle" size={16} /> Sent to Café
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* --- DATA TRANSMISSION EFFECT (The "Magic" Link) --- */}
              {/* Particle zipping from phone to tablet */}
              <motion.div
                animate={{
                  x: [120, 120, 200, 360, 360, 360, 360, 360, 360, 360, 120],
                  y: [360, 360, 240, 120, 120, 120, 120, 120, 120, 120, 360],
                  opacity: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                  scale: [0.5, 0.5, 1.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]
                }}
                transition={loopTransition}
                className="absolute w-5 h-5 bg-[#F09819] rounded-full shadow-[0_0_30px_rgba(240,152,25,0.8)] z-20 pointer-events-none"
              />

              {/* Return Particle (Ready Signal) */}
              <motion.div
                animate={{
                  x: [360, 360, 360, 360, 360, 360, 360, 200, 120, 120, 360],
                  y: [120, 120, 120, 120, 120, 120, 120, 60, 30, 30, 120],
                  opacity: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                  scale: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.5, 0.5, 0.5, 0.5]
                }}
                transition={loopTransition}
                className="absolute w-5 h-5 bg-green-400 rounded-full shadow-[0_0_30px_rgba(74,222,128,0.8)] z-40 pointer-events-none"
              />

            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
