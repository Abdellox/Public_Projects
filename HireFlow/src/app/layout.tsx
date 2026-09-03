import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HireFlow - Recruitment Platform",
  description: "A clean recruitment platform where companies publish job offers and manage candidates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <footer className="border-t py-8 mt-16">
            <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} HireFlow. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-foreground">About</a>
                <a href="#" className="hover:text-foreground">Privacy</a>
                <a href="#" className="hover:text-foreground">Terms</a>
              </div>
            </div>
          </footer>
          <Toaster position="top-right" richColors closeButton />
        </SessionProvider>
      </body>
    </html>
  );
}
