"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 600);
    if (clickCount.current === 3) {
      event.preventDefault();
      clickCount.current = 0;
      if (clickTimer.current) clearTimeout(clickTimer.current);
      router.push("/admin");
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 z-50 w-full border-b border-white/30 bg-soft-white/90 backdrop-blur"
    >
      <div className="section-pad flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" onClick={handleLogoClick} className="font-display text-xl tracking-wide text-primary-900">
          EUREKA
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-slate-700 hover:text-primary-700">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Register button + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/event-registration"
            className="hidden rounded-full bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-glow sm:inline-flex"
          >
            Register Event
          </Link>

          {/* Hamburger button — hidden on lg+ */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white lg:hidden"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block h-0.5 w-5 rounded-full bg-primary-900"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="block h-0.5 w-5 rounded-full bg-primary-900"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="block h-0.5 w-5 rounded-full bg-primary-900"
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-primary-100 bg-soft-white/95 backdrop-blur lg:hidden"
          >
            <nav className="section-pad grid gap-1 py-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-primary-50 hover:text-primary-700"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/event-registration"
                onClick={closeMenu}
                className="mt-3 rounded-full bg-primary-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-glow"
              >
                Register Event – ₹200
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
