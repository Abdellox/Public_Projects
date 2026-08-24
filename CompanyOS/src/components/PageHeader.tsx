import { Link } from "react-router-dom";
import { ArrowRightIcon, ChevronRightIcon } from "./icons";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="mb-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-7 text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export function CardLink({
  to,
  title,
  description,
  footer,
}: {
  to: string;
  title: string;
  description: string;
  footer?: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-600/5 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-indigo-500/40"
    >
      <h3 className="font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
        {title}
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {footer && <div className="mt-4">{footer}</div>}
    </Link>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  linkTo,
  linkLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          {title}
        </h2>
        {description && (
          <p className="mt-2 leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {linkLabel ?? "View all"} <ArrowRightIcon className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function Breadcrumbish({ items }: { items: string[] }) {
  return (
    <div className="flex items-center gap-1 text-xs text-zinc-400">
      {items.map((i, idx) => (
        <span key={idx} className="flex items-center gap-1">
          {idx > 0 && <ChevronRightIcon className="h-3 w-3" />}
          {i}
        </span>
      ))}
    </div>
  );
}
