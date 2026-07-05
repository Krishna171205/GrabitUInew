"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "I have a 9 AM lecture in the ECE block every day. Grabit means my cappuccino is already waiting at Raydee when I walk past. Life. Changed.",
    image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
    name: "Rohan Verma",
    role: "3rd Year, Electronics & Communication, DTU",
  },
  {
    text: "The queue at Raydee used to eat 15 minutes of my lunch break. Now I pre-order from the lab, walk in, pick up, walk out. My whole batch has switched.",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
    name: "Ishita Arora",
    role: "2nd Year, Computer Science, DTU",
  },
  {
    text: "Between back-to-back lectures and tutorials, there's no time to stand in line. Grabit fits perfectly into the five-minute gap between classes.",
    image: "https://randomuser.me/api/portraits/men/38.jpg",
    name: "Aditya Rathore",
    role: "4th Year, Mechanical Engineering, DTU",
  },
  {
    text: "As a faculty member I have a packed schedule. Grabit lets me order my masala chai before the department meeting without leaving my office early.",
    image: "https://randomuser.me/api/portraits/men/76.jpg",
    name: "Dr. Sunil Pandey",
    role: "Associate Professor, Civil Engineering, DTU",
  },
  {
    text: "The WhatsApp ping when my order is ready is brilliant. I'm always mid-experiment in the chem lab — I don't have to keep checking my phone.",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=80&h=80&q=80",
    name: "Divya Nair",
    role: "M.Tech, Biotechnology, DTU",
  },
  {
    text: "I manage the admin office and we used to do a painful tea round every afternoon. Now I place a single Grabit order for six people and it's done in two minutes.",
    image: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
    name: "Sanjay Malik",
    role: "Administrative Officer, DTU",
  },
  {
    text: "Honestly didn't trust it at first. Tried it before a placement PPT and my cold brew was there the second I arrived. I've ordered every working day since.",
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=80&h=80&q=80",
    name: "Tanvi Gupta",
    role: "Final Year, IT Engineering, DTU",
  },
  {
    text: "Our research group meets at 8:30 AM. Grabit means the coffee is already on the table when everyone walks in. Sets the right tone for the whole session.",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    name: "Dr. Prerna Saxena",
    role: "Assistant Professor, Mathematics, DTU",
  },
  {
    text: "I'm in the hostel so I pass Raydee on the way to the main building. Pre-order from my room, pick up mid-walk — doesn't cost me a single extra minute.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Harshit Bansal",
    role: "1st Year, Production Engineering, DTU",
  },
  {
    text: "Slot picker is smarter than it looks. It only shows times that are actually achievable — I've never had an order late or not ready on time.",
    image: "https://randomuser.me/api/portraits/women/13.jpg",
    name: "Mehak Chawla",
    role: "3rd Year, Environmental Engineering, DTU",
  },
  {
    text: "I work at the library help desk. Used to run to the cafe and back on breaks. Now I order 10 minutes before my break starts and it's seamless.",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=80&h=80&q=80",
    name: "Deepak Sharma",
    role: "Library Staff, DTU",
  },
  {
    text: "UPI payment is instant, the order confirmation screen is clear, and the WhatsApp message format is clean. Small details that show real craft.",
    image: "https://randomuser.me/api/portraits/women/15.jpg",
    name: "Anika Singh",
    role: "2nd Year, Software Engineering, DTU",
  },
];

const firstColumn = testimonials.slice(0, 4);
const secondColumn = testimonials.slice(4, 8);
const thirdColumn = testimonials.slice(8, 12);

export function TestimonialsColumn({
  className,
  testimonials: items,
  duration = 10,
}: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-5 pb-5"
      >
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {items.map(({ text, image, name, role }, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl border border-outline-variant/30 bg-surface-container-lowest shadow-lg max-w-xs w-full"
                style={{ boxShadow: "0 8px 32px rgba(255,177,0,0.10)" }}
              >
                <p className="text-sm leading-relaxed text-on-surface-variant">{text}</p>
                <div className="flex items-center gap-3 mt-5">
                  <Image
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    loading="lazy"
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold tracking-tight text-on-surface leading-5">
                      {name}
                    </span>
                    <span className="text-xs leading-5 text-on-surface-variant/70 tracking-tight">
                      {role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))]}
      </motion.div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-32 px-6 bg-surface-container-low overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center max-w-[540px] mx-auto mb-16"
        >
          <div className="flex justify-center mb-5">
            <span className="border border-primary/30 text-primary text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
              What customers say
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-headline font-extrabold tracking-tighter text-center text-on-surface">
            Skip the queue,<br />
            <span className="text-primary italic">love the ritual.</span>
          </h2>
          <p className="text-center mt-5 text-on-surface-variant leading-relaxed">
            Real reviews from cafe-goers who never wait in line anymore.
          </p>
        </motion.div>

        <div className="flex justify-center gap-5 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] max-h-[720px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={18} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={22}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={20}
          />
        </div>
      </div>
    </section>
  );
}
