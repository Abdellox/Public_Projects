import Link from "next/link";

interface PaginationProps {
  base: string;
  params: Record<string, string>;
  page: number;
  hasNext: boolean;
}

export default function Pagination({ base, params, page, hasNext }: PaginationProps) {
  if (page === 1 && !hasNext) return null;

  function hrefFor(targetPage: number): string {
    const qs = new URLSearchParams(params);
    if (targetPage > 1) {
      qs.set("page", String(targetPage));
    } else {
      qs.delete("page");
    }
    const queryString = qs.toString();
    return queryString ? `${base}?${queryString}` : base;
  }

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className="btn-secondary">
          &larr; Previous
        </Link>
      )}
      <span className="px-2 text-sm text-muted">Page {page}</span>
      {hasNext && (
        <Link href={hrefFor(page + 1)} className="btn-secondary">
          Next &rarr;
        </Link>
      )}
    </nav>
  );
}
