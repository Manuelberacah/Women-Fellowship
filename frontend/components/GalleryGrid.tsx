"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchGalleryImages } from "../lib/api";

const fallbackImages = [
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=900&q=80"
];

export default function GalleryGrid() {
  const [images, setImages] = useState<string[]>(fallbackImages);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetchGalleryImages().then((data) => {
      if (data.length > 0) setImages(data);
    });
  }, []);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((src) => (
          <motion.button
            key={src}
            onClick={() => setLightbox(src)}
            className="mb-4 block w-full overflow-hidden rounded-3xl"
            whileHover={{ scale: 1.03 }}
          >
            <Image src={src} alt="Eureka event" width={900} height={700} className="h-auto w-full object-cover" />
          </motion.button>
        ))}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-6" onClick={() => setLightbox(null)}>
          <div className="max-w-4xl overflow-hidden rounded-3xl">
            <Image src={lightbox} alt="Eureka event" width={1200} height={900} className="h-auto w-full object-cover" />
          </div>
        </div>
      )}
    </>
  );
}
