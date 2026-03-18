import Hero from "../components/Hero";
import SectionHeader from "../components/SectionHeader";
import CountdownTimer from "../components/CountdownTimer";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";
import EventCard from "../components/EventCard";
import GalleryGrid from "../components/GalleryGrid";
import { NEXT_EVENT_DATE } from "../lib/constants";

export default function HomePage() {
  return (
    <div>
      <Hero />

      <section className="section-pad hero-gradient py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <SectionHeader eyebrow="Upcoming Gathering" title="Next Gathering Begins In" center>
            Topic: Women’s Part in the Church
          </SectionHeader>
        </div>
        <div className="mt-6 flex justify-center">
          <CountdownTimer targetDate={NEXT_EVENT_DATE} />
        </div>
        <div className="mt-8 flex justify-center">
          <a href="/event-registration" className="rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white">
            Register Now – ₹200
          </a>
        </div>
      </section>

      <section className="section-pad py-20">
        <SectionHeader eyebrow="Community Impact" title="Strengthening Women in Faith">
          Eureka brings together women across churches to grow spiritually and serve with boldness.
        </SectionHeader>
        <Stats />
      </section>

      <section className="section-pad py-20">
        <SectionHeader eyebrow="Upcoming Event" title="Eureka Women Fellowship – May Gathering" />
        <EventCard />
      </section>

      <section className="section-pad py-20">
        <SectionHeader eyebrow="Testimonials" title="Stories of Impact" />
        <Testimonials />
      </section>

      <section className="section-pad py-20">
        <SectionHeader eyebrow="Gallery" title="Moments of Fellowship" />
        <GalleryGrid />
      </section>
    </div>
  );
}
