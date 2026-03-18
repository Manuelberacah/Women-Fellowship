"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitPrayerRequest } from "../lib/api";
import Spinner from "./Spinner";

export default function PrayerRequestFab() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [request, setRequest] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);
    try {
      await submitPrayerRequest({ name, request });
      setStatus("Prayer request submitted. Our team is praying with you.");
      setName("");
      setRequest("");
    } catch (error) {
      setStatus("Unable to submit right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-primary-700 px-4 py-3 text-sm font-semibold text-white shadow-glow"
      >
        Submit a Prayer Request
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-card"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl text-primary-900">Share a Prayer Request</h3>
                <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
                  Close
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your Name"
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                  required
                />
                <textarea
                  value={request}
                  onChange={(event) => setRequest(event.target.value)}
                  placeholder="Write your prayer request"
                  rows={4}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                  required
                />
                {status && <p className="text-sm text-primary-700">{status}</p>}
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-4 py-3 text-sm font-semibold text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner /> : null}
                  Submit Request
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
