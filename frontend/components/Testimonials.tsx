"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fetchWallApproved } from "../lib/api";

const fallbackTestimonials = [
  { name: "Eureka Member", message: "Eureka helped me discover my calling in church ministry." },
  { name: "Eureka Member", message: "I felt spiritually encouraged and connected with other women." },
  { name: "Eureka Member", message: "The fellowship gave me strength to serve with joy and purpose." }
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);

  useEffect(() => {
    fetchWallApproved().then((posts) => {
      if (posts.length > 0) {
        setTestimonials(posts.map((post) => ({ name: post.name || "Eureka Member", message: post.message })));
      }
    });
  }, []);

  const looped = useMemo(() => [...testimonials, ...testimonials], [testimonials]);

  return (
    <div className="marquee">
      <div className="marquee-track">
        {looped.map((item, index) => (
          <motion.div
            key={`${item.message}-${index}`}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="min-w-[260px] rounded-3xl bg-white p-6 shadow-card"
          >
            <p className="text-sm text-slate-600">{item.message}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary-700">{item.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
