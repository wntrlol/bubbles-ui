"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import MediaCard from "@/components/MediaCard";
import { useRevealOnView } from "@/lib/useRevealOnView";
import type { MediaSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MediaRowProps {
  title: string;
  items: MediaSummary[];
  /** Optional "View All" destination shown beside the heading. */
  href?: string;
  priority?: boolean;
}

export default function MediaRow({ title, items, href, priority }: MediaRowProps) {
  const railRef = useRevealOnView<HTMLUListElement>();
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setEdges({
      start: el.scrollLeft <= 8,
      end: maxScroll <= 8 || el.scrollLeft >= maxScroll - 8,
    });
  }, [railRef]);

  useEffect(() => {
    measure();
    const el = railRef.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, railRef, items.length]);

  const scrollBy = (direction: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="relative py-5 sm:py-6">
      <div className="mb-3 flex w-full items-center justify-between gap-4 px-8 sm:px-12 lg:px-16">
        <h2 className="text-headline-md text-white">{title}</h2>

        <div className="flex items-center gap-2">
          {href && (
            <Link
              href={href}
              className="group/all flex items-center gap-1.5 rounded-full px-3 py-1.5 text-label-md text-white/55 transition-colors hover:text-white"
            >
              View All
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/all:translate-x-0.5" />
            </Link>
          )}
          <div className="hidden items-center gap-1.5 md:flex">
            <RailButton
              direction="left"
              disabled={edges.start}
              onClick={() => scrollBy(-1)}
              label={`Scroll ${title} backward`}
            />
            <RailButton
              direction="right"
              disabled={edges.end}
              onClick={() => scrollBy(1)}
              label={`Scroll ${title} forward`}
            />
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Cards arrive in reading order as the rail enters the viewport. */}
        <ul
          ref={railRef}
          onScroll={measure}
          className="rail rail-hide flex w-full snap-x gap-4 overflow-x-auto pb-6 pt-4 sm:gap-5"
        >
          {/* Rock-solid flex spacers: immune to Chrome flex-scroll padding drop bug on zoom/load */}
          <li aria-hidden className="w-8 shrink-0 sm:w-12 lg:w-16" />

          {items.map((media, i) => (
            <li
              key={`${media.mediaType}-${media.id}`}
              style={{ "--reveal-index": Math.min(i, 9) } as React.CSSProperties}
              className="w-[42vw] shrink-0 snap-start sm:w-[28vw] md:w-[20vw] lg:w-[15vw] xl:w-[12.8vw] 2xl:w-[11.2vw] min-w-[145px] max-w-[215px]"
            >
              <MediaCard media={media} priority={priority && i < 6} />
            </li>
          ))}

          <li aria-hidden className="w-8 shrink-0 sm:w-12 lg:w-16" />
        </ul>

        {!edges.end && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-canvas to-transparent transition-opacity duration-300"
          />
        )}
      </div>
    </section>
  );
}

function RailButton({
  direction,
  disabled,
  onClick,
  label,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "grid size-9 place-items-center rounded-full border border-white/12 bg-white/5 text-white",
        "transition-[background-color,border-color,transform] duration-200 hover:border-white/25 hover:bg-white/12",
        "active:scale-95 disabled:pointer-events-none disabled:opacity-25",
      )}
    >
      <Icon className="size-4.5" />
    </button>
  );
}
