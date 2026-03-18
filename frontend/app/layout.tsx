import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PrayerRequestFab from "../components/PrayerRequestFab";

export const metadata: Metadata = {
  title: "EUREKA – Women Fellowship",
  description: "Discovering the Strength God Placed in Women"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="pt-20">{children}</main>
        <PrayerRequestFab />
        <Footer />
      </body>
    </html>
  );
}
