"use client";

import SectionHeader from "../../components/SectionHeader";

export default function MemberDashboardPage() {
  return (
    <section className="section-pad py-20">
      <SectionHeader eyebrow="Members" title="Member Dashboard">
        View upcoming events, register, and access your digital event passes.
      </SectionHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Upcoming Events</h3>
          <p className="mt-2 text-sm text-slate-600">Eureka Women Fellowship - May Gathering</p>
          <a href="/event-registration" className="mt-4 inline-flex rounded-full bg-primary-700 px-4 py-2 text-sm text-white">
            Register Now
          </a>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-card">
          <h3 className="font-display text-xl text-primary-900">Your Event Passes</h3>
          <p className="mt-2 text-sm text-slate-600">Your QR-based passes will appear here after payment.</p>
        </div>
      </div>
    </section>
  );
}
