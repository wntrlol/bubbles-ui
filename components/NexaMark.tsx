import { cn } from "@/lib/utils";

/**
 * Nexa's mark. A single geometric glyph: two sprocket bars joined by a
 * diagonal, reading as both an N and a strip of film. Takes the current
 * accent token so it follows the viewer's theme.
 */
export default function NexaMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-[10px] bg-primary text-on-primary",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="size-[68%]" fill="none" aria-hidden>
        <path
          d="M7 25V7l18 18V7"
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
export function NexaLockup({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <NexaMark className="size-8" />
      <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-white">
        Nexa
      </span>
    </span>
  );
}
