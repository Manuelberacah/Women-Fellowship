"use client";

import { useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import { submitEurekaWall } from "../../lib/api";
import { motion } from "framer-motion";
import Spinner from "../../components/Spinner";
import { useToast } from "../../components/Toast";

const sampleMessages = [
  "I feel called to serve in children's ministry.",
  "I want to pray more for my church.",
  "Eureka helped me find sisters in faith."
];

export default function EurekaWallPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await submitEurekaWall({ name, message });
      toast.success("Your message was submitted for approval.");
      setName("");
      setMessage("");
    } catch {
      toast.error("Unable to submit right now.");
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
          <motion.button
            key={msg}
            type="button"
            onClick={() => setMessage(msg)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`rounded-3xl p-6 text-left shadow-card transition hover:-translate-y-1 hover:shadow-lg hover:bg-primary-50 ${
              message === msg ? "bg-primary-700 text-white" : "bg-white"
            }`}
          >
            <p className={`text-sm ${message === msg ? "text-white" : "text-slate-600"}`}>{msg}</p>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
