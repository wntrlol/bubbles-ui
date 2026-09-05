import { cn } from "@/lib/utils";

/**
 * Zenox's mark. A single geometric glyph: two bars joined by a
 * diagonal, reading as both a Z and a strip of film. Takes the current
 * accent token so it follows the viewer's theme.
 */
export default function ZenoxMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-[10px] bg-primary text-on-primary",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="size-[68%]" fill="none" aria-hidden>
        <path
          d="M9 8h14L9 24h14"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Mark plus wordmark, for the footer and other full-width lockups. */
export function ZenoxLockup({ className }: { className?: string }) {
  return (
    <span className={cn("group flex items-center gap-2.5", className)}>
      {/* <ZenoxMark className="size-8" /> */}
      <span className="zenox-wordmark text-3xl font-black leading-none select-none">
        zenox.
      </span>
    </span>
  );
}
