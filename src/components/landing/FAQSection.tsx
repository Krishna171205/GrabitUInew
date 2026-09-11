'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'How does Grabbit work?',
    a: 'Browse menus from cafes near you, customize your order, choose a pickup time, and pay online with UPI, card, or netbanking. Your order is ready when you arrive — no queue.',
  },
  {
    q: 'Where is Grabbit available?',
    a: 'Grabbit (also known as LetsGrabbit) is now live in Delhi NCR. Order ahead from your favourite cafes in and around Delhi.',
  },
  {
    q: 'How do I pay for my order?',
    a: 'Checkout is prepaid: pay online with UPI, card, or netbanking and your order goes straight to the cafe.',
  },
  {
    q: 'How do I get updates on my order?',
    a: 'Order status updates are sent via WhatsApp at every step — from confirmed, to prepping, to ready for pickup. No new app to install.',
  },
  {
    q: 'Can I schedule a pickup for later?',
    a: 'Yes. Set any pickup time that works — 15 minutes from now or hours ahead. No fixed slots, no limits. That is LetsGrabbit.',
  },
  {
    q: 'Is there an app to download?',
    a: 'Grabbit works in your browser — no app required. Just bookmark letsgrabbit.com and order ahead in seconds.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="pt-12 pb-24 md:pt-16 md:pb-32 bg-[#FAFAF7] relative text-[#111317] selection:bg-[#0757D5] selection:text-white border-b border-slate-200/60">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:pl-12 lg:pr-12 relative z-10 flex flex-col lg:flex-row items-start min-h-[720px] lg:min-h-[850px]">

        {/* Left Column: Headline */}
        <div className="w-full lg:w-[42%] flex flex-col z-20 py-12 lg:py-0 pr-0 lg:pr-12 lg:sticky lg:top-32">
          <h2
            className="text-[14vw] min-[380px]:text-[64px] sm:text-[76px] lg:text-[88px] xl:text-[96px] leading-[1.05] tracking-[0.02em] font-normal uppercase text-[#111317] mb-6 lg:mb-8"
            style={{ fontFamily: 'var(--font-anton)' }}
          >
            <span>YOU ASK,</span><br />
            <span className="text-[#0757D5]">WE ANSWER!</span>
          </h2>
          <p className="text-[16px] lg:text-[17px] text-[#4A4E58] font-medium leading-[1.6] max-w-[420px] border-l-2 border-[#0757D5]/30 pl-4">
            Everything you need to know about skipping the queue and pre-ordering your coffee with Grabbit.
          </p>
        </div>

        {/* Right Column: Accordions */}
        <div className="w-full lg:w-[58%] flex flex-col gap-4 mt-8 lg:mt-0 z-20">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={false}
                animate={{ borderRadius: isOpen ? 16 : 48 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`border-2 overflow-hidden transition-colors duration-300 ${isOpen
                    ? 'border-[#0757D5] bg-[#0757D5]/[0.02]'
                    : 'border-slate-200 bg-white hover:border-[#0757D5]/40'
                  }`}
              >
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full flex items-center justify-between text-left px-6 py-5 sm:px-8 sm:py-6 cursor-pointer focus:outline-none"
                >
                  <span
                    className={`text-[18px] sm:text-[22px] tracking-wide uppercase transition-colors duration-300 ${isOpen ? 'text-[#0757D5]' : 'text-slate-900'}`}
                    style={{ fontFamily: 'var(--font-anton)' }}
                  >
                    {faq.q}
                  </span>

                  {/* Plus/Minus Icon */}
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ml-4 ${isOpen ? 'bg-[#0757D5] text-white' : 'bg-slate-100 text-slate-900'}`}>
                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="text-xl font-light leading-none"
                    >
                      +
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 pb-6 sm:px-8 sm:pb-8 text-slate-600 font-medium text-[15px] leading-relaxed max-w-2xl pt-2">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
