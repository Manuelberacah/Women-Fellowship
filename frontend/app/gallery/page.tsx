import SectionHeader from "../../components/SectionHeader";
import GalleryGrid from "../../components/GalleryGrid";

export default function GalleryPage() {
  return (
    <section className="section-pad py-20">
      <SectionHeader eyebrow="Gallery" title="Moments of Worship & Fellowship">
        Admins can upload event images and highlight the beauty of community in Christ.
      </SectionHeader>
      <GalleryGrid />
    </section>
  );
}
