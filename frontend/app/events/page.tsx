import SectionHeader from "../../components/SectionHeader";
import EventCard from "../../components/EventCard";

export default function EventsPage() {
  return (
    <section className="section-pad py-20">
      <SectionHeader eyebrow="Upcoming Events" title="Gather, Grow, Serve" />
      <EventCard />
    </section>
  );
}
