import * as React from "react"
import { cn } from "@/lib/utils"

interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  currentPage?: number
  totalPages?: number
}

function Pagination({ className, currentPage = 1, totalPages = 1, ...props }: PaginationProps) {
  const pageNumbers: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pageNumbers.push(i)
    }
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full items-center justify-center gap-2", className)}
      {...props}
    >
      <PaginationLink
        disabled={currentPage <= 1}
        onClick={() => {
          const params = new URLSearchParams(window.location.search)
          params.set("page", String(currentPage - 1))
          window.location.search = params.toString()
        }}
      >
        Previous
      </PaginationLink>
      {pageNumbers.map((p, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && pageNumbers[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">…</span>}
          <PaginationLink
            isActive={p === currentPage}
            onClick={() => {
              const params = new URLSearchParams(window.location.search)
              params.set("page", String(p))
              window.location.search = params.toString()
            }}
          >
            {p}
          </PaginationLink>
        </React.Fragment>
      ))}
      <PaginationLink
        disabled={currentPage >= totalPages}
        onClick={() => {
          const params = new URLSearchParams(window.location.search)
          params.set("page", String(currentPage + 1))
          window.location.search = params.toString()
        }}
      >
        Next
      </PaginationLink>
    </nav>
  )
}

function PaginationContent({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

interface PaginationItemProps extends React.HTMLAttributes<HTMLLIElement> {}

function PaginationItem({ className, ...props }: PaginationItemProps) {
  return <li className={cn("", className)} {...props} />
}

interface PaginationLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
}

function PaginationLink({ className, isActive, ...props }: PaginationLinkProps) {
  return (
    <button
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "border-transparent bg-primary text-primary-foreground shadow"
          : "",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label="Go to previous page"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1 rounded-md border px-4 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      <span>Previous</span>
    </button>
  )
}

function PaginationNext({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label="Go to next page"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1 rounded-md border px-4 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span>Next</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
}
