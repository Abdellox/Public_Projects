import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Plus, BarChart3 } from "lucide-react";

export default async function CompanyDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.companyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      jobOffers: {
        include: { _count: { select: { applications: { where: { isCanceled: false } } } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!profile) redirect("/company/profile");

  const stats = {
    totalJobs: profile.jobOffers.length,
    publishedJobs: profile.jobOffers.filter((j) => j.status === "PUBLISHED").length,
    totalApplications: profile.jobOffers.reduce((sum, j) => sum + j._count.applications, 0),
  };

  const recentApplications = await db.application.findMany({
    where: { jobOffer: { companyId: profile.id } },
    include: {
      candidate: { include: { user: { select: { name: true, email: true } } } },
      jobOffer: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-500", REVIEWING: "bg-yellow-500", SHORTLISTED: "bg-purple-500",
    INTERVIEW: "bg-indigo-500", ACCEPTED: "bg-green-500", REJECTED: "bg-red-500",
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="text-muted-foreground">Company Dashboard</p>
        </div>
        <Link href="/company/jobs/new"><Button><Plus className="h-4 w-4 mr-2" />Post New Job</Button></Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalJobs}</div><p className="text-xs text-muted-foreground">{stats.publishedJobs} published</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalApplications}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button size="sm" variant="outline" asChild><Link href="/company/jobs">Manage Jobs</Link></Button>
            <Button size="sm" variant="outline" asChild><Link href="/company/profile">Edit Profile</Link></Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Your Jobs</CardTitle></CardHeader>
          <CardContent>
            {profile.jobOffers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No jobs posted yet</p>
            ) : (
              <div className="space-y-2">
                {profile.jobOffers.slice(0, 5).map((job) => (
                  <Link key={job.id} href={`/company/jobs/${job.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job._count.applications} applications</p>
                    </div>
                    <Badge variant={job.status === "PUBLISHED" ? "default" : job.status === "DRAFT" ? "secondary" : "outline"}>{job.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Applications</CardTitle></CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No applications yet</p>
            ) : (
              <div className="space-y-2">
                {recentApplications.map((app) => (
                  <Link key={app.id} href={`/company/applications/${app.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{app.candidate.user.name}</p>
                      <p className="text-xs text-muted-foreground">{app.jobOffer.title}</p>
                    </div>
                    <Badge className={statusColors[app.status]}>{app.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
