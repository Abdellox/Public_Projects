import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SupplyFlow — Plan better. Stock smarter. Deliver on time.",
    template: "%s · SupplyFlow"
  },
  description: "Open-source supply-chain management: connected inventory, purchasing, shipments and planning in one collaborative workspace."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
