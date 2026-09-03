import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cancelApplicationAction } from "@/app/actions/applications";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.candidateProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/register");

  const application = await db.application.findUnique({
    where: { id },
    include: {
      jobOffer: { include: { company: { include: { user: { select: { name: true } } } } } },
      cv: true,
      notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!application || application.candidateId !== profile.id) notFound();

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-500", REVIEWING: "bg-yellow-500", SHORTLISTED: "bg-purple-500",
    INTERVIEW: "bg-indigo-500", ACCEPTED: "bg-green-500", REJECTED: "bg-red-500",
  };

  return (
    <div className="container py-8 max-w-3xl">
      <Link href="/candidate/applications" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">&larr; Back to applications</Link>
      <h1 className="text-2xl font-bold mb-2">{application.jobOffer.title}</h1>
      <p className="text-muted-foreground mb-6">{application.jobOffer.company.name} &middot; {application.jobOffer.location}</p>

      <div className="flex items-center gap-3 mb-6">
        <Badge className={statusColors[application.status]}>{application.status}</Badge>
        {application.isCanceled && <Badge variant="outline">Canceled</Badge>}
      </div>

      {application.coverLetter && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Cover Letter</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground whitespace-pre-line">{application.coverLetter}</p></CardContent>
        </Card>
      )}

      {!application.isCanceled && !["ACCEPTED", "REJECTED"].includes(application.status) && (
        <form action={cancelApplicationAction.bind(null, application.id)}>
          <Button type="submit" variant="destructive" size="sm">Cancel Application</Button>
        </form>
      )}
    </div>
  );
}
