'use client';
import { motion } from 'framer-motion';
import { MS } from '@/components/gb/kit';

const CAFES = [
  {
    name: 'The Raydee Cafe',
    location: 'DTU, Rohini, Delhi',
    prepTime: '8–12',
    rating: '4.8',
    tag: 'Popular Coffee & Bowls',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
    status: 'OPEN NOW',
  },
  {
    name: 'Blue Tokai Coffee',
    location: 'Connaught Place, Delhi',
    prepTime: '07',
    rating: '4.9',
    tag: 'Specialty Espresso Bar',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80',
    status: 'OPEN NOW',
  },
  {
    name: 'Third Wave Coffee',
    location: 'Cyber Hub, Gurugram',
    prepTime: '10',
    rating: '4.7',
    tag: 'Handcrafted Brews',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
    status: 'OPEN NOW',
  },
];

export default function CafeDiscovery() {
  return (
    <section className="py-32 bg-white text-[#1A1311] relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-[42px] md:text-[56px] font-black tracking-tighter text-[#1A1311] leading-[1.05] mb-4">
              Top cafés live on <span className="text-[#F09819]">Grabbit.</span>
            </h2>
            <p className="text-[#8A7A6B] text-[18px] font-semibold">
              Skip lines at Delhi NCR’s best coffee spots. Order ahead, track your slot, and grab your order warm.
            </p>
          </div>
          <div className="shrink-0">
            <div className="group flex items-center gap-2 bg-[#FDFBF7] border border-[#EBE4D8] text-[#1A1311] px-6 py-3 rounded-[16px] font-bold text-[14px] cursor-pointer hover:border-[#F09819] transition-colors shadow-sm">
              View all 50+ Cafés <MS name="arrow_forward" size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>

        {/* Cafes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CAFES.map((cafe, index) => (
            <motion.div
              key={cafe.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="group bg-[#FDFBF7] rounded-[24px] border border-[#EBE4D8] shadow-[0_4px_24px_rgba(26,19,17,0.04)] overflow-hidden flex flex-col cursor-pointer hover:shadow-[0_24px_48px_rgba(26,19,17,0.12)] hover:-translate-y-2 transition-all duration-300"
            >
              {/* Image Banner */}
              <div className="relative h-[240px] w-full overflow-hidden bg-[#1A1311]">
                <img
                  src={cafe.image}
                  alt={cafe.name}
                  className="w-full h-full object-cover opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1311]/80 via-transparent to-[#1A1311]/20 group-hover:from-[#1A1311]/90 transition-colors" />
                
                {/* Rating Badge */}
                <div className="absolute top-4 left-4 bg-[#FDFBF7]/90 backdrop-blur-md text-[#1A1311] text-[12px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                  <MS name="star" size={14} color="#F09819" /> {cafe.rating}
                </div>

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-black tracking-widest text-[#F09819] uppercase block mb-1">{cafe.tag}</span>
                  <h3 className="text-[24px] font-black leading-tight">{cafe.name}</h3>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 flex flex-col grow">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-[13px] font-semibold text-[#8A7A6B]">
                    <MS name="location_on" size={16} color="#8A7A6B" />
                    <span>{cafe.location}</span>
                  </div>
                  <div className="bg-[#EBE4D8]/50 text-[#8A7A6B] text-[10px] font-bold tracking-wider px-2 py-1 rounded">
                    {cafe.status}
                  </div>
                </div>

                {/* Pickup Time & Action */}
                <div className="mt-auto flex items-center justify-between border-t border-[#EBE4D8] pt-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F09819]/10 flex items-center justify-center">
                      <MS name="schedule" size={20} color="#F09819" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#8A7A6B] tracking-widest uppercase">Ready in</div>
                      <div className="text-[18px] font-black text-[#1A1311] leading-none group-hover:text-[#F09819] transition-colors">{cafe.prepTime} Min</div>
                    </div>
                  </div>
                  
                  {/* Hover Order Button */}
                  <div className="w-10 h-10 rounded-full bg-[#1A1311] flex items-center justify-center text-white opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <MS name="arrow_forward" size={18} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
