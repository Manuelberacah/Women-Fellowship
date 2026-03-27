import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PrayerRequestFab from "../components/PrayerRequestFab";
import { ToastProvider } from "../components/Toast";

export const metadata: Metadata = {
  title: "EUREKA – Women Fellowship",
  description: "Discovering the Strength God Placed in Women"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Navbar />
          <main className="pt-20">{children}</main>
          <PrayerRequestFab />
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
