import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Building2, Clock, DollarSign, Globe, Calendar } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const job = await db.jobOffer.findUnique({
    where: { slug },
    include: {
      company: { include: { user: { select: { id: true, name: true, image: true } } } },
      _count: { select: { applications: { where: { isCanceled: false } } } },
    },
  });

  if (!job || job.status !== "PUBLISHED") notFound();

  let hasApplied = false;
  if (session?.user?.role === "CANDIDATE") {
    const profile = await db.candidateProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) {
      const app = await db.application.findUnique({
        where: { candidateId_jobOfferId: { candidateId: profile.id, jobOfferId: job.id } },
      });
      hasApplied = !!app && !app.isCanceled;
    }
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Link href={`/companies/${job.company.userId}`} className="flex items-center gap-1 hover:text-foreground">
                <Building2 className="h-4 w-4" />{job.company.name}
              </Link>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {job.isRemote && <Badge variant="info">Remote</Badge>}
            <Badge variant="secondary">{job.employmentType.replace("_", " ")}</Badge>
            <Badge variant="outline">{job.level}</Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-3">Requirements</h2>
              <p className="text-muted-foreground whitespace-pre-line">{job.requirements}</p>
            </CardContent>
          </Card>

          {job.benefits && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-3">Benefits</h2>
                <p className="text-muted-foreground whitespace-pre-line">{job.benefits}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Job Details</h3>
              <div className="space-y-3 text-sm">
                {job.salaryMin && (
                  <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" />${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString() || "Negotiable"} {job.currency}/yr</div>
                )}
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />{job.employmentType.replace("_", " ")}</div>
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" />{job.category}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" />{job.location}</div>
                {job.publishedAt && <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />Posted {formatDistanceToNow(job.publishedAt, { addSuffix: true })}</div>}
                <div className="text-xs text-muted-foreground">{job._count.applications} applicants</div>
              </div>
            </CardContent>
          </Card>

          {session?.user?.role === "CANDIDATE" ? (
            hasApplied ? (
              <Button className="w-full" disabled>Already Applied</Button>
            ) : (
              <Link href={`/jobs/${job.slug}/apply`} className="block">
                <Button className="w-full">Apply Now</Button>
              </Link>
            )
          ) : !session ? (
            <Link href={`/login?callbackUrl=/jobs/${job.slug}`} className="block">
              <Button className="w-full">Login to Apply</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
