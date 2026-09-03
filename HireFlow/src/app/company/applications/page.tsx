import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CompanyApplicationsPage({ searchParams }: { searchParams: Promise<{ jobId?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/company/profile");

  const { jobId } = await searchParams;

  const where: Record<string, unknown> = { jobOffer: { companyId: profile.id } };
  if (jobId) where.jobOfferId = jobId;

  const applications = await db.application.findMany({
    where,
    include: {
      candidate: { include: { user: { select: { name: true, email: true } } } },
      jobOffer: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-500", REVIEWING: "bg-yellow-500", SHORTLISTED: "bg-purple-500",
    INTERVIEW: "bg-indigo-500", ACCEPTED: "bg-green-500", REJECTED: "bg-red-500",
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Applications</h1>
      {applications.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No applications found</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/company/applications/${app.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between py-4 px-6">
                  <div>
                    <h3 className="font-semibold">{app.candidate.user.name}</h3>
                    <p className="text-sm text-muted-foreground">{app.jobOffer.title} &middot; {app.candidate.user.email}</p>
                  </div>
                  <Badge className={statusColors[app.status]}>{app.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
