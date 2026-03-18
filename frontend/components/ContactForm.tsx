"use client";

import { useState } from "react";
import { submitContactMessage } from "../lib/api";
import Spinner from "./Spinner";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);
    try {
      await submitContactMessage(form);
      setStatus("Message sent! We will respond soon.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("Unable to send message right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-card">
      <h3 className="font-display text-2xl text-primary-900">Send a Message</h3>
      <div className="mt-4 grid gap-4">
        <input
          value={form.name}
          onChange={(event) => handleChange("name", event.target.value)}
          placeholder="Name"
          className="rounded-2xl border border-slate-200 px-4 py-3"
          required
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) => handleChange("email", event.target.value)}
          placeholder="Email"
          className="rounded-2xl border border-slate-200 px-4 py-3"
          required
        />
        <textarea
          value={form.message}
          onChange={(event) => handleChange("message", event.target.value)}
          placeholder="Message"
          rows={4}
          className="rounded-2xl border border-slate-200 px-4 py-3"
          required
        />
        {status && <p className="text-sm text-primary-700">{status}</p>}
        <button
          className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : null}
          Send Message
        </button>
      </div>
    </form>
  );
}
