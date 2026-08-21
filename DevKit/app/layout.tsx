import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevKit — Free Online Developer Tools",
    template: "%s · DevKit",
  },
  description:
    "A beautiful, open-source collection of free developer tools — JSON formatter, JWT decoder, regex tester, SQL formatter, cron parser and more. 100% client-side and privacy-first.",
  keywords: [
    "developer tools",
    "json formatter",
    "jwt decoder",
    "regex tester",
    "sql formatter",
    "cron parser",
    "base64",
    "uuid generator",
    "online tools",
    "open source",
  ],
};

const themeInit = `(function(){try{var t=localStorage.getItem("devkit-theme");var d=t?t==="dark":true;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
      </body>
    </html>
  );
}
