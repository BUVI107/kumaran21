import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { AppStateProvider } from "@/context/AppStateContext";
import "./globals.css";

// Self-hosted, variable-weight fonts (sourced from the open-source
// Google Fonts repository, OFL-licensed — see src/fonts/OFL-*.txt).
// Self-hosting avoids a runtime dependency on Google's font CDN and
// keeps builds fully offline-capable.
const cormorant = localFont({
  src: [
    { path: "../fonts/Cormorant.ttf", weight: "300 700", style: "normal" },
    {
      path: "../fonts/Cormorant-Italic.ttf",
      weight: "300 700",
      style: "italic",
    },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = localFont({
  src: [{ path: "../fonts/Jost.ttf", weight: "300 700", style: "normal" }],
  variable: "--font-jost",
  display: "swap",
});

const caveat = localFont({
  src: [{ path: "../fonts/Caveat.ttf", weight: "500 700", style: "normal" }],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kumaran's 21 — A Private Invitation",
  description:
    "A premium, cinematic 21st birthday experience for Kumaran.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${caveat.variable} h-full`}
    >
      <body className="min-h-full bg-black text-[var(--text)] antialiased">
        <div className="grain-overlay" />
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
