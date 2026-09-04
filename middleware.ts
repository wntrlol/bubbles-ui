import { NextResponse } from "next/server";

import { getStreamProviders, providerOrigins } from "@/lib/providers";

/**
 * Edge security headers.
 *
 * `frame-src` and `media-src` are derived from the operator's own
 * STREAM_PROVIDERS entries, so an embed can only ever load from an origin that
 * was explicitly registered. With nothing configured the app frames nothing.
 */
export function middleware() {
  const response = NextResponse.next();

  const { frame, media } = providerOrigins(getStreamProviders());
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    // Next's inline bootstrap needs 'unsafe-inline'; the dev overlay also needs eval.
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // next/font self-hosts Montserrat and Inter, so no external font origin is required.
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://image.tmdb.org",
    // hls.js drives MSE through blob URLs and blob workers.
    `media-src 'self' blob: ${media.join(" ")}`.trim(),
    "worker-src 'self' blob:",
    `connect-src 'self' ${media.join(" ")}${isDev ? " ws: wss:" : ""}`.trim(),
    `frame-src 'self' ${frame.join(" ")}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
