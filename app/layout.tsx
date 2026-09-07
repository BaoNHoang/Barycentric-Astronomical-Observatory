import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "BAO · Barycentric Astronomical Observatory",
  description:
    "Barycentric Astronomical Observatory. Planetary motion, sky charts, space imagery and astronomical data.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
