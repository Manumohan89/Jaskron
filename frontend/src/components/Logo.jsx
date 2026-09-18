/**
 * JASKRON Technologies PVT LTD brand mark.
 * Uses the official raster logo (hexagon shield mark) shipped in /public.
 * `variant="full"` renders the complete lockup (mark + wordmark).
 */
export default function Logo({ size = 40, className = '', variant = 'mark' }) {
  if (variant === 'full') {
    return (
      <img
        src="/logo-full.png"
        alt="JASKRON Technologies PVT LTD"
        style={{ height: size, width: 'auto' }}
        className={`object-contain select-none ${className}`}
        draggable={false}
      />
    );
  }

  return (
    <img
      src="/logo-mark.png"
      alt="JASKRON"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
