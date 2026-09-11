'use client';

import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const textVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } },
};

export default function MeetTheFoundersSection() {
  return (
    <section className="relative w-full bg-white text-[#020617] pt-24 pb-32 overflow-hidden font-sans">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-12 relative z-10">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true, margin: "-100px" }}
          className="mb-32 md:mb-48 relative flex flex-col items-center text-center"
        >
          <div className="relative inline-block">
            <motion.div variants={itemVariants} className="text-left">
              <h2 className="uppercase tracking-tight leading-[0.9] flex flex-col" style={{ fontFamily: 'var(--font-anton)' }}>
                <span className="block text-[32px] sm:text-[42px] lg:text-[48px] text-[#020617] mb-1 font-normal tracking-wide">
                  MEET
                </span>
                <span className="block text-[56px] sm:text-[84px] lg:text-[112px] text-[#020617] mb-1 font-normal">
                  THE GRABBIT
                </span>
                <span className="block text-[56px] sm:text-[84px] lg:text-[112px] text-[#0055D4] font-normal">
                  GUYS.
                </span>
              </h2>
            </motion.div>

            {/* Subtle Annotation */}
            <motion.div 
              variants={textVariants}
              className="absolute -top-6 -right-12 sm:-top-10 sm:-right-24 rotate-[4deg]"
            >
              <span 
                className="text-[#0757D5] text-[18px] sm:text-[22px] tracking-wide font-bold" 
                style={{ fontFamily: 'var(--font-caveat), cursive' }}
              >
                the people behind your break
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* FOUNDERS CONTAINER */}
        <div className="relative flex flex-col gap-32 md:gap-40">
          
          {/* Subtle connecting line - Desktop only */}
          <div className="hidden md:block absolute left-1/2 top-[10%] bottom-[10%] w-[1px] bg-[#EFF6FF] -translate-x-1/2 z-0"></div>

          {/* ROW 01: TEXT LEFT, IMAGE RIGHT */}
          <motion.div 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col-reverse md:flex-row items-center justify-between gap-12 md:gap-20 relative z-10"
          >
            {/* Founder 01 Info */}
            <motion.div variants={textVariants} className="flex-1 flex flex-col items-start text-left max-w-lg w-full md:pr-10">
              <h3 className="text-[38px] sm:text-[48px] lg:text-[64px] uppercase tracking-tight text-[#020617] leading-none mb-3" style={{ fontFamily: 'var(--font-anton)' }}>
                Sumit
              </h3>
              <div className="text-[13px] font-bold uppercase tracking-widest text-[#0055D4] mb-8">
                Co-Founder · CEO
              </div>
              <p className="text-[16px] md:text-[18px] text-slate-500 font-medium leading-relaxed mb-8 max-w-[400px]">
                Drives strategy, partnerships, and growth. Previously co-ran The Raydee Cafe, Gradient's first tenant and the reason the product is shaped the way it is. DTU alumnus.
              </p>
              <div className="flex flex-col gap-1.5 border-l-2 border-[#EFF6FF] pl-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Based in Delhi</span>
                <span className="text-[11px] font-bold text-[#020617] uppercase tracking-wider">Building Grabbit</span>
              </div>
            </motion.div>

            {/* Founder 01 Portrait */}
            <motion.div variants={itemVariants} className="flex-1 flex justify-center md:justify-end w-full relative">
              <div className="relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px]">
                {/* Thin blue ring behind */}
                <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-full border border-[#0055D4]/20"></div>
                {/* Image Container */}
                <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAFAFA] border border-slate-100 shadow-[0_12px_40px_rgba(0,10,30,0.03)] z-10">
                  <img 
                    src="/founders/sumit.jpeg" 
                    alt="Sumit"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Sumit&background=F8FAFC&color=0055D4&size=512";
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* VISUAL BREAK */}
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }} 
            whileInView={{ opacity: 1, scaleX: 1 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center justify-center gap-6 w-full max-w-2xl mx-auto relative z-10"
          >
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#0055D4]/20 to-[#0055D4]/20"></div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#0055D4]">
              Built For The Break.
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#0055D4]/20 to-[#0055D4]/20"></div>
          </motion.div>

          {/* ROW 02: IMAGE LEFT, TEXT RIGHT */}
          <motion.div 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20 relative z-10"
          >
            {/* Founder 02 Portrait */}
            <motion.div variants={itemVariants} className="flex-1 flex justify-center md:justify-start w-full relative">
              <div className="relative w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] lg:w-[480px] lg:h-[480px]">
                {/* Thin blue ring behind */}
                <div className="absolute inset-0 -translate-x-4 translate-y-4 rounded-full border border-[#0055D4]/20"></div>
                
                {/* Optional tiny handwritten note near image */}
                <motion.div variants={textVariants} className="absolute -left-6 bottom-12 rotate-[-8deg] z-20 hidden md:block">
                  <span className="text-[#0757D5] text-[20px] font-bold tracking-wide" style={{ fontFamily: 'var(--font-caveat), cursive' }}>
                    yep, that's us.
                  </span>
                </motion.div>

                {/* Image Container */}
                <div className="relative w-full h-full rounded-full overflow-hidden bg-[#FAFAFA] border border-slate-100 shadow-[0_12px_40px_rgba(0,10,30,0.03)] z-10">
                  <img 
                    src="/founders/sahil.jpeg" 
                    alt="Sahil"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Sahil&background=F8FAFC&color=0055D4&size=512";
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Founder 02 Info */}
            <motion.div variants={textVariants} className="flex-1 flex flex-col items-start text-left max-w-lg w-full md:pl-10">
              <h3 className="text-[38px] sm:text-[48px] lg:text-[64px] uppercase tracking-tight text-[#020617] leading-none mb-3" style={{ fontFamily: 'var(--font-anton)' }}>
                Sahil
              </h3>
              <div className="text-[13px] font-bold uppercase tracking-widest text-[#0055D4] mb-8">
                Co-Founder · Engineering
              </div>
              <p className="text-[16px] md:text-[18px] text-slate-500 font-medium leading-relaxed mb-8 max-w-[400px]">
                Builds the platform end-to-end: backend, all four portals, and the supplier privacy walls. Previously on logistics infrastructure at Jumbotail. DTU alumnus.
              </p>
              <div className="flex flex-col gap-1.5 border-l-2 border-[#EFF6FF] pl-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Based in Delhi</span>
                <span className="text-[11px] font-bold text-[#020617] uppercase tracking-wider">Building Grabbit</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
