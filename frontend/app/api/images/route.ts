import { NextResponse } from "next/server";

const fallbackImages = [
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1508973379184-7517410fb0bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=900&q=80"
];

const query = "christian women fellowship women praying church gathering worship";

export async function GET() {
  try {
    if (process.env.UNSPLASH_ACCESS_KEY) {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=9`,
        {
          headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
          next: { revalidate: 3600 }
        }
      );
      const data = await response.json();
      const images = data.results?.map((img: any) => img.urls?.regular).filter(Boolean);
      return NextResponse.json({ images: images?.length ? images : fallbackImages });
    }

    if (process.env.PEXELS_API_KEY) {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=9`,
        {
          headers: { Authorization: process.env.PEXELS_API_KEY },
          next: { revalidate: 3600 }
        }
      );
      const data = await response.json();
      const images = data.photos?.map((img: any) => img.src?.large).filter(Boolean);
      return NextResponse.json({ images: images?.length ? images : fallbackImages });
    }

    return NextResponse.json({ images: fallbackImages });
  } catch {
    return NextResponse.json({ images: fallbackImages });
  }
}
