"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchGalleryImages } from "../lib/api";

export default function GalleryGrid() {
  const [images, setImages] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages()
      .then(setImages)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-sm text-slate-500">Loading gallery...</p>;
  }

  if (images.length === 0) {
    return <p className="text-center text-sm text-slate-500">No photos yet. Check back soon!</p>;
  }

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
