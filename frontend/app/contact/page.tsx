import SectionHeader from "../../components/SectionHeader";
import ContactForm from "../../components/ContactForm";

export default function ContactPage() {
  return (
    <section className="section-pad py-20">
      <SectionHeader eyebrow="Contact" title="Connect With Us">
        Reach out for partnerships, prayer, or membership inquiries.
      </SectionHeader>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-8 shadow-card">
          <h3 className="font-display text-2xl text-primary-900">Eureka Fellowship Office</h3>
          <p className="mt-4 text-sm text-slate-600">Email: manuelberacah.gospel@gmail.com</p>
          <p className="mt-2 text-sm text-slate-600">Phone: 8015300905, 8125414142</p>
          <p className="mt-2 text-sm text-slate-600">Address: Visakhapatnam</p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
