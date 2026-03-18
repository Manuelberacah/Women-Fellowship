"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="mt-20 border-t border-primary-100 bg-white"
    >
      <div className="section-pad grid gap-8 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl text-primary-900">EUREKA</h3>
          <p className="mt-3 text-sm text-slate-600">
            Discovering the strength, purpose, and calling God has placed in women through community, prayer, and fellowship.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary-800">Quick Links</h4>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <Link href="/about">About</Link>
            <Link href="/events">Upcoming Events</Link>
            <Link href="/become-member">Become a Member</Link>
            <Link href="/eureka-wall">Eureka Wall</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary-800">Contact</h4>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <span>Email: manuelberacah.gospel@gmail.com</span>
            <span>Phone: 8015300905, 8125414142</span>
            <span>City: Visakhapatnam</span>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-100 py-4 text-center text-xs text-slate-500">
        (c) 2026 EUREKA Women Fellowship. Built with love and faith.
      </div>
    </motion.footer>
  );
}
