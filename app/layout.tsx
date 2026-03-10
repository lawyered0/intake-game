import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import {
  Barlow_Condensed,
  IBM_Plex_Mono,
  Shrikhand,
  Source_Sans_3,
} from "next/font/google";
import "./globals.css";

const displayFont = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const titleFont = Shrikhand({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["400"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Lawyered Games",
    template: "%s | Lawyered Games",
  },
  description:
    "Practice legal judgment with intake screening and deal negotiation games.",
  openGraph: {
    title: "Lawyered Games",
    description:
      "Practice intake judgment and deal negotiation in browser games for law students and junior lawyers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${displayFont.variable} ${titleFont.variable} ${bodyFont.variable} ${monoFont.variable} flex min-h-screen flex-col antialiased`}
      >
        <div className="flex-1">{children}</div>
        <footer className="px-5 pb-5 pt-2 text-center sm:px-8">
          <p className="font-mono text-[10px] leading-5 text-[var(--muted)]">
            All situations are fictional. Created by{" "}
            <a
              href="https://x.com/BitGrateful/"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--text-primary)] underline decoration-[var(--accent-gold)]/55 underline-offset-3"
            >
              BitGrateful
            </a>
            .
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
