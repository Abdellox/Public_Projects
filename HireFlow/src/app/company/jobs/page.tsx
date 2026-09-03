import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export default async function CompanyJobsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/company/profile");

  const jobs = await db.jobOffer.findMany({
    where: { companyId: profile.id },
    include: { _count: { select: { applications: { where: { isCanceled: false } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Job Offers</h1>
        <Link href="/company/jobs/new"><Button><Plus className="h-4 w-4 mr-2" />Post New Job</Button></Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No jobs posted yet</p>
            <Link href="/company/jobs/new"><Button>Post Your First Job</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/company/jobs/${job.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between py-4 px-6">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.location} &middot; {job.employmentType.replace("_", " ")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground"><Users className="h-4 w-4" />{job._count.applications}</span>
                    <Badge variant={job.status === "PUBLISHED" ? "default" : job.status === "DRAFT" ? "secondary" : "outline"}>{job.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
