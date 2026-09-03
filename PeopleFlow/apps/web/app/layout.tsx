import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PeopleFlow — Open-source HR platform",
    template: "%s · PeopleFlow",
  },
  description:
    "Everything your people need, in one place. Open-source HR platform for people management, leave, attendance, documents, performance and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
