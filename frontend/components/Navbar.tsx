"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Upcoming Events", href: "/events" },
  { label: "Become a Member", href: "/become-member" },
  { label: "Gallery", href: "/gallery" },
  { label: "Prayer Requests", href: "/prayer-requests" },
  { label: "Eureka Wall", href: "/eureka-wall" },
  { label: "Contact", href: "/contact" }
];

export default function Navbar() {
  const router = useRouter();
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    clickCount.current += 1;

    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }

    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 600);

    if (clickCount.current === 3) {
      event.preventDefault();
      clickCount.current = 0;
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }
      router.push("/admin");
    }
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 z-50 w-full border-b border-white/30 bg-soft-white/80 backdrop-blur"
    >
      <div className="section-pad flex items-center justify-between py-4">
        <Link href="/" onClick={handleLogoClick} className="font-display text-xl tracking-wide text-primary-900">
          EUREKA
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-slate-700 hover:text-primary-700">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/event-registration" className="rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-glow">
            Register Event
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
