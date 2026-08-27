import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Nexora CRM — Your customers. Your team. One open platform.',
    template: '%s · Nexora CRM',
  },
  description:
    'Nexora CRM is a modern, fast, secure, open-source CRM platform for contacts, companies, leads and sales pipelines. Available in the cloud or self-hosted.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
