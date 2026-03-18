"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1.15 }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0"
      >
        <Image
          src="https://i.pinimg.com/736x/97/14/cb/9714cb79cdea70a30e438e954627dfd9.jpg"
          alt="Women fellowship bible study"
          fill
          priority
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-900/60 to-primary-900/30" />
      <div className="relative z-10 flex min-h-[90vh] items-center">
        <div className="section-pad grid gap-10 lg:grid-cols-2">
          <div className="text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-200">EUREKA</p>
            <h1 className="mt-4 font-display text-4xl md:text-6xl">Women Fellowship</h1>
            <p className="mt-6 text-lg text-white/90">Discovering the Strength God Placed in Women</p>
            <div className="mt-8 rounded-3xl bg-white/10 p-6 text-white shadow-card">
              <p className="text-sm uppercase tracking-widest text-gold-200">Theme Verse</p>
              <p className="mt-3 text-lg font-semibold">Proverbs 31:25</p>
              <p className="mt-2 text-white/90">
                “She is clothed with strength and dignity; she can laugh at the days to come.”
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/become-member" className="rounded-full bg-gold-300 px-6 py-3 text-sm font-semibold text-primary-900">
                Become a Member
              </Link>
              <Link href="/event-registration" className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white">
                Register for Event
              </Link>
            </div>
          </div>
          <div className="hidden items-center justify-end lg:flex">
            <div className="glass w-full max-w-md rounded-3xl p-8 text-slate-900 shadow-card">
              <h3 className="font-display text-2xl text-primary-900">Next Fellowship Gathering</h3>
              <p className="mt-2 text-sm text-slate-600">Topic: Women’s Part in the Church</p>
              <div className="mt-6 text-3xl font-semibold text-primary-800">May Gathering</div>
              <p className="mt-4 text-sm text-slate-500">9:00 AM – 4:00 PM</p>
              <Link href="/event-registration" className="mt-6 inline-flex rounded-full bg-primary-700 px-5 py-3 text-sm font-semibold text-white">
                Register Now – ₹200
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
