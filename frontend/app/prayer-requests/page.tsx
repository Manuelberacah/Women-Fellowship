"use client";

import { useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import { submitPrayerRequest } from "../../lib/api";
import Spinner from "../../components/Spinner";

export default function PrayerRequestsPage() {
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
      setStatus("Prayer request received. We are praying with you.");
      setName("");
      setRequest("");
    } catch {
      setStatus("Unable to submit right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="section-pad relative overflow-hidden py-20"
      style={{
        backgroundImage:
          "url('https://women.lifeway.com/wp-content/uploads/2022/02/Praying-Together-as-a-Community.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center 20%"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-950/80 via-primary-950/55 to-primary-950/35" />
      <div className="absolute inset-0 bg-white/60" />
      <div className="relative z-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <div>
            <SectionHeader eyebrow="Prayer Requests" title="We Are Praying With You">
              Submit your prayer needs and let the community lift you up in prayer.
            </SectionHeader>
            <form onSubmit={handleSubmit} className="max-w-2xl rounded-3xl bg-white/95 p-8 shadow-card">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name"
                className="mb-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                required
              />
              <textarea
                value={request}
                onChange={(event) => setRequest(event.target.value)}
                placeholder="Prayer Request"
                rows={4}
                className="mb-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3"
                required
              />
              {status && <p className="mb-4 text-sm text-primary-700">{status}</p>}
              <button
                className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : null}
                Submit Request
              </button>
            </form>
          </div>
          <aside className="hidden lg:flex items-center justify-end">
            <div className="max-w-sm text-right text-primary-900/85 drop-shadow-lg animate-verse-float translate-y-2">
              <p className="font-display text-2xl italic">
                "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."
              </p>
              <p className="mt-3 text-sm font-semibold text-primary-800">Philippians 4:6</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
