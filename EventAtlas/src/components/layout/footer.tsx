import Link from "next/link";
import { Globe, Twitter, Facebook, Instagram, Youtube } from "lucide-react";

const discoverLinks = [
  { href: "/events", label: "Explore" },
  { href: "/map", label: "Map" },
  { href: "/categories", label: "Categories" },
  { href: "/events?free=true", label: "Free Events" },
];

const organizerLinks = [
  { href: "/dashboard/create-event", label: "Create Event" },
  { href: "/dashboard", label: "Organizer Dashboard" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const socials = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-purple-400" />
              <span className="text-lg font-bold text-white">EventAtlas</span>
            </Link>
            <p className="mt-3 text-sm text-slate-400">
              Discover local and global events happening around the world.
            </p>
            <div className="mt-5 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Discover" links={discoverLinks} />
          <FooterColumn title="For Organizers" links={organizerLinks} />
          <FooterColumn title="Company" links={companyLinks} />
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} EventAtlas. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
