import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Bookmark, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-500",
  REVIEWING: "bg-yellow-500",
  SHORTLISTED: "bg-purple-500",
  INTERVIEW: "bg-indigo-500",
  ACCEPTED: "bg-green-500",
  REJECTED: "bg-red-500",
};

export default async function CandidateDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: { cvs: true },
  });

  if (!profile) redirect("/register");

  const applications = await db.application.findMany({
    where: { candidateId: profile.id },
    include: {
      jobOffer: {
        include: { company: { include: { user: { select: { name: true } } } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const stats = {
    total: applications.length,
    active: applications.filter((a) => !a.isCanceled && !["ACCEPTED", "REJECTED"].includes(a.status)).length,
    interviews: applications.filter((a) => a.status === "INTERVIEW").length,
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {session.user.name}</h1>
          <p className="text-muted-foreground">Manage your job applications</p>
        </div>
        <Link href="/jobs"><Button><Plus className="h-4 w-4 mr-2" />Browse Jobs</Button></Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.active}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.interviews}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No applications yet</p>
              <Link href="/jobs"><Button>Browse Jobs</Button></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <Link key={app.id} href={`/candidate/applications/${app.id}`} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{app.jobOffer.title}</p>
                    <p className="text-sm text-muted-foreground">{app.jobOffer.company.name} &middot; {formatDistanceToNow(app.createdAt, { addSuffix: true })}</p>
                  </div>
                  <Badge className={statusColors[app.status]}>{app.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
