import Image from "next/image";

import { tmdbImage } from "@/lib/tmdb-image";
import { cn, posterGradient } from "@/lib/utils";

interface PosterArtProps {
  path: string | null;
  title: string;
  /** Poster (2:3) art vs. still/backdrop (16:9) art. */
  variant?: "poster" | "still";
  sizes?: string;
  priority?: boolean;
  className?: string;
  /**
   * Print the title inside the placeholder plate. Turn off wherever the title
   * is already shown beside the art, or the plate is too small to hold text.
   */
  showLabel?: boolean;
}

/**
 * Renders TMDB artwork when available and a deterministic gradient plate when
 * it is not, so the offline catalog still reads as a designed grid rather than
 * a wall of broken images.
 */
export default function PosterArt({
  path,
  title,
  variant = "poster",
  sizes = "(min-width: 1280px) 240px, (min-width: 768px) 25vw, 45vw",
  priority = false,
  className,
  showLabel = true,
}: PosterArtProps) {
  const src = tmdbImage(path, variant === "poster" ? "w500" : "w780");

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  const { from, to } = posterGradient(title);

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 flex items-end p-4", className)}
      style={{ background: `linear-gradient(155deg, ${from} 0%, ${to} 100%)` }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 22px)",
        }}
      />
      {showLabel && (
        <span
          className={cn(
            "relative line-clamp-3 font-[family-name:var(--font-display)] font-semibold leading-tight text-white/80",
            variant === "poster" ? "text-lg" : "text-sm",
          )}
        >
          {title}
        </span>
      )}
    </div>
  );
}
