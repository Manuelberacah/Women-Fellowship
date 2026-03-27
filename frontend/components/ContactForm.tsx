"use client";

import { useState } from "react";
import { submitContactMessage } from "../lib/api";
import Spinner from "./Spinner";
import { useToast } from "./Toast";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContactMessage(form);
      toast.success("Message sent! We will respond soon.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Unable to send message right now.");
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
        <button
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : null}
          Send Message
        </button>
      </div>
    </form>
  );
}
