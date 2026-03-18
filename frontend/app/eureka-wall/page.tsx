"use client";

import { useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import { submitEurekaWall } from "../../lib/api";
import { motion } from "framer-motion";
import Spinner from "../../components/Spinner";

const sampleMessages = [
  "I feel called to serve in children's ministry.",
  "I want to pray more for my church.",
  "Eureka helped me find sisters in faith."
];

export default function EurekaWallPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);
    try {
      await submitEurekaWall({ name, message });
      setStatus("Your message was submitted for approval.");
      setName("");
      setMessage("");
    } catch {
      setStatus("Unable to submit right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-pad py-20">
      <SectionHeader eyebrow="Eureka Wall" title="My Eureka Moment" center>
        Share your discovery and encourage others. Posts are approved by the admin before they appear publicly.
      </SectionHeader>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-card">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3"
          required
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Share your Eureka moment"
          rows={4}
          className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3"
          required
        />
        {status && <p className="mb-4 text-sm text-primary-700">{status}</p>}
        <button
          className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : null}
          Submit Message
        </button>
      </form>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {sampleMessages.map((msg) => (
          <motion.div
            key={msg}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl bg-white p-6 shadow-card"
          >
            <p className="text-sm text-slate-600">{msg}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
