"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const stats = [
  { label: "Women Connected", value: 200 },
  { label: "Churches Participating", value: 5 },
  { label: "Mission - Strengthening Women in Faith", value: 1 }
];

export default function Stats() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = Math.max(Math.floor(duration / value), 20);
    const timer = setInterval(() => {
      start += 1;
      setCount(Math.min(start, value));
      if (start >= value) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="rounded-3xl bg-white p-6 text-center shadow-card"
    >
      <div className="text-4xl font-semibold text-primary-800">{count}+</div>
      <div className="mt-2 text-sm font-semibold text-slate-600">{label}</div>
    </motion.div>
  );
}
