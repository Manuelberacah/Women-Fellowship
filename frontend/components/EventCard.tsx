"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function EventCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl bg-white p-8 shadow-card"
    >
      <h3 className="font-display text-2xl text-primary-900">Eureka Women Fellowship – May Gathering</h3>
      <p className="mt-2 text-sm text-slate-500">Topic: Women’s Part in the Church</p>
      <p className="mt-2 text-sm text-slate-500">9:00 AM – 4:00 PM</p>
      <p className="mt-4 text-sm text-slate-600">
        This gathering focuses on the important role women play in strengthening the church through faith, prayer, service, and leadership.
      </p>
      <ul className="mt-4 grid gap-2 text-sm text-slate-600">
        <li>Guest speaker messages</li>
        <li>Church skit</li>
        <li>Debate session</li>
        <li>Group discussions</li>
        <li>Testimony sharing</li>
        <li>Quiz session</li>
        <li>Prayer basket</li>
        <li>Eureka Wall reflection activity</li>
      </ul>
      <p className="mt-4 text-sm font-semibold text-primary-800">Entry Contribution: ₹200 per participant</p>
      <Link href="/event-registration" className="mt-6 inline-flex rounded-full bg-primary-700 px-5 py-3 text-sm font-semibold text-white">
        Register Now
      </Link>
    </motion.div>
  );
}
