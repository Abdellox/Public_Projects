import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { updateApplicationStatusAction } from "@/app/actions/applications";

export default async function CompanyApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await db.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/company/profile");

  const application = await db.application.findUnique({
    where: { id },
    include: {
      candidate: { include: { user: { select: { name: true, email: true } }, cvs: true } },
      jobOffer: true,
      notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!application || application.jobOffer.companyId !== profile.id) notFound();

  const statuses = ["NEW", "REVIEWING", "SHORTLISTED", "INTERVIEW", "ACCEPTED", "REJECTED"] as const;

  return (
    <div className="container py-8 max-w-3xl">
      <Link href="/company/applications" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">&larr; Back to applications</Link>
      <h1 className="text-2xl font-bold mb-2">{application.candidate.user.name}</h1>
      <p className="text-muted-foreground mb-6">{application.candidate.user.email} &middot; Applied for {application.jobOffer.title}</p>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <form key={s} action={updateApplicationStatusAction.bind(null, application.id, s)}>
              <Button type="submit" size="sm" variant={application.status === s ? "default" : "outline"}>{s}</Button>
            </form>
          ))}
        </div>
      </div>

      {application.coverLetter && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Cover Letter</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground whitespace-pre-line">{application.coverLetter}</p></CardContent>
        </Card>
      )}

      {application.candidate.cvs.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle>CV</CardTitle></CardHeader>
          <CardContent>
            {application.candidate.cvs.map((cv) => (
              <p key={cv.id} className="text-sm text-muted-foreground">{cv.fileName} ({(cv.fileSize / 1024).toFixed(0)} KB)</p>
            ))}
          </CardContent>
        </Card>
      )}

      {application.notes.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {application.notes.map((note) => (
              <div key={note.id} className="border-b pb-2 last:border-0">
                <p className="text-sm">{note.content}</p>
                <p className="text-xs text-muted-foreground">by {note.author.name}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
