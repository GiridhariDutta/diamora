import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight, ShieldCheck, Gem } from 'lucide-react';

export default function ExhibitionEvents({ onOpenTickets }) {
  const events = [
    {
      id: 1,
      title: 'Private VIP Gemstone Salon: D-Flawless Masterpieces',
      tag: 'PRIVATE SALON',
      date: 'SEPTEMBER 18, 2026',
      time: '19:00 — 21:30 CEST',
      wing: 'Place Vendôme Private Vault',
      price: 'By Invitation / Appointment',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      description: 'An exclusive evening salon led by Master Gemologist Jean-Luc Blanc, presenting raw and polished Type IIa diamonds under precision illumination.'
    },
    {
      id: 2,
      title: 'Symposium: The Evolution of the Brilliant Cut',
      tag: 'MASTER CLASS',
      date: 'OCTOBER 15, 2026',
      time: '14:30 — 17:30 CEST',
      wing: 'Atelier Saint-Honoré',
      price: 'Reserve Pass',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      description: 'A masterclass on optical scintillation, light ray physics, and hand-cut platinum pavilion proportioning.'
    },
    {
      id: 3,
      title: 'Nocturne Haute Joaillerie Viewing & Champagne',
      tag: 'SPECIAL EVENING',
      date: 'NOVEMBER 06, 2026',
      time: '20:30 — 23:30 CEST',
      wing: 'Hôtel de Nocé Salon',
      price: 'Reserve Pass',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      description: 'Experience Maison Luxe’s high-jewelry creations lit by candlelight accompanied by live acoustic violin.'
    }
  ];

  return (
    <section id="events" className="relative py-28 px-6 md:px-12 bg-[#060607] text-[#F5F5F0]">
      
      <div className="absolute inset-0 hairline-grid pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#3B6EF5] tracking-[0.3em] uppercase mb-3">
              <Gem className="w-3.5 h-3.5 text-[#3B6EF5]" />
              <span>ATELIER PROGRAMMING</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-white tracking-tight">
              Private Salons & <br />
              <span className="italic text-[#3B6EF5] font-normal">Atelier Symposia</span>
            </h2>
          </div>

          <button
            onClick={onOpenTickets}
            className="self-start md:self-auto px-6 py-3 rounded-full border border-white/20 hover:border-[#3B6EF5] bg-white/5 hover:bg-[#3B6EF5] text-white text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-2"
          >
            <span>REQUEST PRIVATE INVITATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {events.map((evt, idx) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="rounded-3xl border border-white/10 bg-[#121214] p-6 flex flex-col justify-between hover:border-white/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,110,245,0.15)] group"
            >
              <div>
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-6 bg-black">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover filter grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full border border-white/20 bg-black/70 backdrop-blur-md text-[9px] font-mono tracking-widest text-[#3B6EF5]">
                    {evt.tag}
                  </div>
                </div>

                <h3 className="font-serif text-2xl font-normal text-white group-hover:text-[#3B6EF5] transition-colors mb-3 leading-snug">
                  {evt.title}
                </h3>

                <p className="text-xs text-[#9B9B9B] leading-relaxed mb-6">
                  {evt.description}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-mono text-[#9B9B9B]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#3B6EF5]" />
                    <span>{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#3B6EF5]" />
                    <span>{evt.time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-mono text-xs font-bold text-white uppercase">{evt.price}</span>
                  <button
                    onClick={onOpenTickets}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#3B6EF5] text-white text-[11px] font-semibold tracking-wider transition-colors"
                  >
                    BOOK SEAT
                  </button>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
