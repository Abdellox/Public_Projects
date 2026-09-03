"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createJob } from "@/app/actions/jobs";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createJob({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      requirements: formData.get("requirements") as string,
      benefits: (formData.get("benefits") as string) || undefined,
      location: formData.get("location") as string,
      category: formData.get("category") as string,
      employmentType: formData.get("employmentType") as "FULL_TIME" | "PART_TIME" | "COMPANY" | "INTERNSHIP" | "FREELANCE",
      level: formData.get("level") as "ENTRY" | "JUNIOR" | "MID" | "SENIOR" | "LEAD",
      isRemote: formData.get("isRemote") === "on",
      salaryMin: formData.get("salaryMin") ? parseInt(formData.get("salaryMin") as string) : undefined,
      salaryMax: formData.get("salaryMax") ? parseInt(formData.get("salaryMax") as string) : undefined,
      currency: "USD",
    });
    if (result.error) { toast.error(result.error); setLoading(false); }
    else { toast.success("Job created!"); router.push("/company/jobs"); }
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Post a New Job</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input id="title" name="title" placeholder="e.g. Senior Frontend Developer" required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" name="location" placeholder="e.g. New York, NY" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input id="category" name="category" placeholder="e.g. Engineering" required />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employmentType">Type *</Label>
                <select name="employmentType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <select name="level" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                  <option value="ENTRY">Entry</option>
                  <option value="JUNIOR">Junior</option>
                  <option value="MID">Mid</option>
                  <option value="SENIOR">Senior</option>
                  <option value="LEAD">Lead</option>
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isRemote" className="rounded" />Remote friendly</label>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Min Salary</Label>
                <Input id="salaryMin" name="salaryMin" type="number" placeholder="50000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Max Salary</Label>
                <Input id="salaryMax" name="salaryMax" type="number" placeholder="100000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea id="description" name="description" rows={6} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required placeholder="Describe the role, responsibilities..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements *</Label>
              <textarea id="requirements" name="requirements" rows={4} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required placeholder="List required skills, experience..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <textarea id="benefits" name="benefits" rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Health insurance, PTO, etc." />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Job"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
