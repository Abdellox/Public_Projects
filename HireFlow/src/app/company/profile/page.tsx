"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { updateCompanyProfile } from "@/app/actions/profiles";

export default function CompanyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateCompanyProfile({
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      website: (formData.get("website") as string) || undefined,
      location: (formData.get("location") as string) || undefined,
      industry: (formData.get("industry") as string) || undefined,
    });
    if (result.error) { toast.error(result.error); setLoading(false); }
    else { toast.success("Profile updated!"); router.push("/company"); }
  }

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Company Profile</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" name="description" rows={4} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" name="website" placeholder="https://..." /></div>
              <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" name="location" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="industry">Industry</Label><Input id="industry" name="industry" /></div>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Profile"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
