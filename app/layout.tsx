import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";

import AmbientBackdrop from "@/components/AmbientBackdrop";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import SettingsBridge from "@/components/SettingsBridge";
import { OverlayProvider } from "@/components/overlay/OverlayProvider";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zenox",
    template: "%s · Zenox",
  },
  description:
    "A cinematic streaming interface: a dense, fast catalog with a resilient multi-server playback engine.",
  applicationName: "Zenox",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-canvas text-white antialiased">
        <SettingsBridge />
        <AmbientBackdrop />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-primary focus:px-5 focus:py-2 focus:text-label-md focus:text-on-primary"
        >
          Skip to content
        </a>
        {/* Settings and title details open as overlays rather than routes. */}
        <OverlayProvider>
          <div className="relative flex min-h-dvh flex-col">
            <Navbar />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <ScrollToTop />
        </OverlayProvider>
      </body>
    </html>
  );
}
