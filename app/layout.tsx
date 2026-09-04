import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";

import AmbientBackdrop from "@/components/AmbientBackdrop";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import SettingsBridge from "@/components/SettingsBridge";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nexa",
    template: "%s · Nexa",
  },
  description:
    "Nexa is a cinematic streaming interface: a dense, fast catalog with a resilient multi-server playback engine.",
  applicationName: "Nexa",
};

export const viewport: Viewport = {
  themeColor: "#04120b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-canvas text-white antialiased">
        <SettingsBridge />
        <AmbientBackdrop />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-primary focus:px-5 focus:py-2 focus:text-label-md focus:text-on-primary"
        >
          Skip to content
        </a>
        <div className="relative flex min-h-dvh flex-col">
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <ScrollToTop />
      </body>
    </html>
  );
}
