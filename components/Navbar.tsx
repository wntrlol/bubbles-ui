"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bookmark, Clapperboard, Home, Menu, Search, Settings, Tv, X } from "lucide-react";

import NexaMark from "@/components/NexaMark";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/movies", label: "Movies", icon: Clapperboard },
  { href: "/tv", label: "Shows", icon: Tv },
  { href: "/my-list", label: "My List", icon: Bookmark },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setMenuOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <Link
          href="/"
          aria-label="Nexa home"
          className="pointer-events-auto transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          <NexaMark className="size-9" />
        </Link>

        {/* Desktop: one floating pill carrying navigation and utilities. */}
        <nav className="pointer-events-auto hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full border border-white/12 bg-black/45 p-1.5 backdrop-blur-[20px]">
            {LINKS.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-2 rounded-full px-4 py-2 text-label-md transition-colors duration-200",
                      active ? "text-black" : "text-white/60 hover:text-white",
                    )}
                  >
                    {/* Shared-element indicator: shows where you moved from. */}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-full bg-white"
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 380, damping: 32 }
                        }
                      />
                    )}
                    {active && <Icon className="size-4" />}
                    {link.label}
                  </Link>
                </li>
              );
            })}

            <li aria-hidden className="mx-1 h-5 w-px bg-white/12" />

            <li>
              <IconLink href="/search" label="Search">
                <Search className="size-4.5" />
              </IconLink>
            </li>
            <li>
              <IconLink href="/settings" label="Settings" active={pathname.startsWith("/settings")}>
                <Settings className="size-4.5" />
              </IconLink>
            </li>
          </ul>
        </nav>

        {/* Mobile: the same pill, condensed to utilities plus a sheet trigger. */}
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/12 bg-black/45 p-1.5 backdrop-blur-[20px] lg:hidden">
          <IconLink href="/search" label="Search">
            <Search className="size-4.5" />
          </IconLink>
          <IconLink href="/settings" label="Settings" active={pathname.startsWith("/settings")}>
            <Settings className="size-4.5" />
          </IconLink>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="grid size-9 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
          >
            {menuOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={reduce ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto mx-4 rounded-2xl border border-white/15 bg-black/85 p-2 backdrop-blur-[40px] sm:mx-6 lg:hidden"
          >
            <ul>
              {LINKS.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-label-md transition-colors",
                        active ? "bg-white text-black" : "text-white/70 hover:bg-white/8 hover:text-white",
                      )}
                    >
                      <Icon className="size-4.5" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function IconLink({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "grid size-9 place-items-center rounded-full transition-colors duration-200",
        active ? "bg-white text-black" : "text-white/60 hover:bg-white/10 hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}
