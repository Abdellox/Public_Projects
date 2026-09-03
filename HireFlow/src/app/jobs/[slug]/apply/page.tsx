"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { applyToJobAction } from "@/app/actions/applications";

export default function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onApply() {
    setLoading(true);
    const slug = (await params).slug;
    const res = await fetch(`/api/jobs/${slug}`);
    const job = await res.json();
    const result = await applyToJobAction(job.id);
    if (result.error) { toast.error(result.error); setLoading(false); }
    else { toast.success("Application submitted!"); router.push("/candidate/applications"); }
  }

  return (
    <div className="container py-8 max-w-lg">
      <Card>
        <CardHeader><CardTitle>Apply for this position</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Submit your application with your default CV and profile information.</p>
          <div className="flex gap-3">
            <Button onClick={onApply} disabled={loading}>{loading ? "Submitting..." : "Submit Application"}</Button>
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
