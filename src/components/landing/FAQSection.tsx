'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { MS } from '@/components/gb/kit';

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

          {/* Still Have Questions Support Card (Simple & Glassmorphic) */}
          <div className="mt-8 lg:mt-10 w-full max-w-[420px] rounded-[24px] sm:rounded-[28px] bg-white/75 backdrop-blur-xl border border-white/90 p-6 sm:p-7 relative overflow-hidden shadow-[0_16px_36px_-10px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.8)_inset] transition-all duration-300 hover:shadow-[0_20px_45px_-10px_rgba(7,87,213,0.12)] hover:border-slate-200/80">
            <div className="relative z-10 flex flex-col">
              {/* Header Title */}
              <h3
                className="text-[22px] sm:text-[25px] leading-[1.1] tracking-wide font-normal uppercase text-[#111317] mb-2"
                style={{ fontFamily: 'var(--font-anton)' }}
              >
                <span>STILL HAVE </span>
                <span className="text-[#0757D5]">QUESTIONS?</span>
              </h3>

              {/* Subtitle */}
              <p className="text-[13.5px] sm:text-[14px] text-slate-600 font-medium leading-relaxed mb-6">
                Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {/* Contact Support Button (Clean Glass / White Card) */}
                <Link
                  href="mailto:hello@unifiednexgrade.com?subject=Grabbit%20Support%20Inquiry"
                  className="w-full bg-white/95 hover:bg-white text-[#111317] font-bold text-[13px] sm:text-[13.5px] tracking-wide uppercase py-3.5 px-4 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:border-[#0757D5]/40 hover:shadow-[0_6px_20px_-4px_rgba(7,87,213,0.14)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <MS name="mail" size={17} className="text-[#0757D5] group-hover:scale-110 transition-transform" />
                  <span>CONTACT SUPPORT</span>
                </Link>

                {/* WhatsApp Button (Clean & Vibrant Green) */}
                <Link
                  href={`https://wa.me/917496064936?text=${encodeURIComponent("Hi Grabbit team, I have a question about ordering:")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[13px] sm:text-[13.5px] tracking-wide uppercase py-3.5 px-4 rounded-xl sm:rounded-2xl shadow-[0_6px_18px_-3px_rgba(37,211,102,0.35)] hover:shadow-[0_8px_24px_-3px_rgba(37,211,102,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 2.052.81 2.796.81h.005c3.18 0 5.767-2.587 5.768-5.766.001-3.182-2.585-5.769-5.769-5.769zm3.364 8.167c-.145.409-.844.755-1.164.795-.319.04-.707.054-2.029-.49-1.57-.648-2.581-2.247-2.66-2.351-.079-.105-.639-.851-.639-1.624 0-.773.407-1.154.552-1.31.145-.156.319-.195.426-.195.106 0 .213.001.306.006.098.005.23-.037.36.275.135.324.46 1.121.501 1.203.041.082.068.178.014.286-.054.108-.081.176-.162.27-.081.095-.171.212-.244.285-.082.082-.167.172-.072.336.095.163.423.698.908 1.13.624.556 1.15.728 1.314.81.164.082.26.069.356-.041.096-.11.411-.479.521-.643.11-.164.22-.137.37-.082.15.055.952.449 1.115.531.164.082.273.123.314.192.041.069.041.396-.104.805zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.981-1.306A9.948 9.948 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.155-.47-4.444-1.282l-.319-.2-2.964.777.791-2.89-.208-.331A8.167 8.167 0 0 1 3.8 12c0-4.521 3.679-8.2 8.2-8.2 4.521 0 8.2 3.679 8.2 8.2 0 4.521-3.679 8.2-8.2 8.2z" />
                  </svg>
                  <span>WHATSAPP</span>
                </Link>
              </div>
            </div>
          </div>
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
