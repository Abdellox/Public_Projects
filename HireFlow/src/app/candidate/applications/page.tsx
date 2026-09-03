import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function CandidateApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.candidateProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/register");

  const applications = await db.application.findMany({
    where: { candidateId: profile.id },
    include: {
      jobOffer: { include: { company: { include: { user: { select: { name: true } } } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-500", REVIEWING: "bg-yellow-500", SHORTLISTED: "bg-purple-500",
    INTERVIEW: "bg-indigo-500", ACCEPTED: "bg-green-500", REJECTED: "bg-red-500",
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Applications</h1>
      {applications.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No applications yet. <Link href="/jobs" className="text-primary hover:underline">Browse jobs</Link></p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/candidate/applications/${app.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between py-4 px-6">
                  <div>
                    <h3 className="font-semibold">{app.jobOffer.title}</h3>
                    <p className="text-sm text-muted-foreground">{app.jobOffer.company.name} &middot; {app.jobOffer.location}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.isCanceled && <Badge variant="outline">Canceled</Badge>}
                    <Badge className={statusColors[app.status]}>{app.status}</Badge>
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
