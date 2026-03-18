import Image from "next/image";
import SectionHeader from "../../components/SectionHeader";

export default function AboutPage() {
  return (
    <section className="section-pad py-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <SectionHeader eyebrow="About" title="What is Eureka?">
            Eureka means a moment of discovery.
          </SectionHeader>
          <div className="space-y-6 text-slate-700">
            <p>
              The Eureka Women Fellowship was created to help women discover the strength, purpose, and calling that God has placed
              within them.
            </p>
            <p>This fellowship encourages women to:</p>
            <ul className="grid gap-2">
              <li>Grow spiritually</li>
              <li>Support one another in faith</li>
              <li>Serve actively in the church</li>
              <li>Build meaningful Christian community</li>
            </ul>
            <p>
              Through regular gatherings, discussions, prayer sessions, and fellowship events, Eureka aims to inspire women to become
              pillars of strength in their churches and communities.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="relative h-72 overflow-hidden rounded-3xl shadow-card lg:mt-2">
            <Image
              src="https://i.pinimg.com/webp/736x/d9/ed/50/d9ed50e2d3bcefc26bfe94117376f5e6.webp"
              alt="Women praying in church"
              fill
              className="object-cover object-[center_35%]"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { title: "Community", text: "Sisters encouraging sisters through prayer and fellowship." },
              { title: "Purpose", text: "Helping women discover their gifts and calling." },
              { title: "Faith", text: "Rooted in God’s word and spiritual growth." },
              { title: "Service", text: "Serving churches and communities with love." }
            ].map((card) => (
              <div key={card.title} className="rounded-3xl bg-white p-5 shadow-card">
                <h3 className="text-lg font-semibold text-primary-900">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
