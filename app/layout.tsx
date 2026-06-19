import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "LRP Marketing Hub",
  description: "Liberty Roofing Pros marketing + SEO command center",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
