"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitPrayerRequest } from "../lib/api";
import Spinner from "./Spinner";
import { useToast } from "./Toast";

export default function PrayerRequestFab() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [request, setRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await submitPrayerRequest({ name, request });
      toast.success("Prayer request submitted. Our team is praying with you.");
      setName("");
      setRequest("");
      setOpen(false);
    } catch {
      toast.error("Unable to submit right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Submit a Prayer Request"
        className="group fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 aspect-square items-center justify-center gap-0 rounded-full bg-primary-700 p-0 text-sm font-semibold text-white shadow-glow transition-all duration-200 group-hover:w-auto group-hover:px-4 group-hover:gap-3 group-focus-within:w-auto group-focus-within:px-4 group-focus-within:gap-3"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 14a4 4 0 0 1-4 4H9l-4 3V7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4z" />
          <path d="M9 10h6" />
          <path d="M9 14h4" />
        </svg>
        <span className="whitespace-nowrap max-w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100 group-focus-within:max-w-xs group-focus-within:opacity-100">
          Submit a Prayer Request
        </span>
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
