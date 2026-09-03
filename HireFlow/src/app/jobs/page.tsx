"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Building2, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Job {
  id: string;
  title: string;
  slug: string;
  location: string;
  category: string;
  employmentType: string;
  level: string;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  publishedAt: string;
  company: { name: string; logo: string | null; user: { name: string } };
  _count: { applications: number };
}

interface SearchResults {
  data: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const page = parseInt(searchParams.get("page") || "1");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchParams.get("q")) params.set("q", searchParams.get("q")!);
    if (searchParams.get("location")) params.set("location", searchParams.get("location")!);
    if (searchParams.get("category")) params.set("category", searchParams.get("category")!);
    params.set("page", searchParams.get("page") || "1");
    params.set("limit", "12");

    try {
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({ data: [], total: 0, page: 1, limit: 12, totalPages: 0 });
    }
    setLoading(false);
  }, [searchParams]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("q", query);
    else params.delete("q");
    params.set("page", "1");
    router.push(`/jobs?${params}`);
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
        <p className="text-muted-foreground">Find your next opportunity</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-32 bg-muted rounded-t-lg" />
              <CardContent className="pt-6 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : results && results.data.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">{results.total} jobs found</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.data.map((job) => (
              <Link key={job.id} href={`/jobs/${job.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                      {job.isRemote && <Badge variant="info" className="shrink-0">Remote</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {job.company.name}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{job.location}</div>
                      <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{job.employmentType.replace("_", " ")}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="secondary">{job.level}</Badge>
                      {job.salaryMin && <Badge variant="outline">${(job.salaryMin / 1000).toFixed(0)}k+</Badge>}
                      {job.publishedAt && <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(job.publishedAt), { addSuffix: true })}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {results.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set("page", String(page - 1)); router.push(`/jobs?${p}`); }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {results.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= results.totalPages} onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set("page", String(page + 1)); router.push(`/jobs?${p}`); }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return <Suspense><JobsContent /></Suspense>;
}
