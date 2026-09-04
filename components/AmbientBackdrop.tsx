/**
 * The canvas everything floats above. Three slow-drifting colour fields tinted
 * from `--ambient-hue`, so the background shifts as the featured artwork
 * changes. Decorative only: out of the accessibility tree, never hit-tested.
 */
export default function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-canvas">
      <div className="ambient-field ambient-field-a" />
      <div className="ambient-field ambient-field-b" />
      <div className="ambient-field ambient-field-c" />

      {/* Sink the edges toward the dim token so rails fade out rather than stop. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 85% at 50% 0%, rgba(4,18,11,0) 32%, rgba(5,5,5,0.82) 100%)",
        }}
      />

      {/* Fine grain stops the wide blurs banding on wide-gamut displays. */}
      <div className="ambient-grain" />
    </div>
  );
}
