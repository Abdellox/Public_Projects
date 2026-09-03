"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createJobSchema, CreateJobInput } from "@/lib/validations/job";

export async function createJob(data: CreateJobInput) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return { error: "Unauthorized" };
  }

  const parsed = createJobSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const profile = await db.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return { error: "Company profile required" };
  }

  const slug = parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);

  const job = await db.jobOffer.create({
    data: {
      companyId: profile.id,
      ...parsed.data,
      slug,
    },
  });

  return { success: true, jobId: job.id, slug: job.slug };
}

export async function updateJob(id: string, data: Partial<CreateJobInput>) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return { error: "Unauthorized" };
  }

  const profile = await db.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { error: "Company profile required" };

  const job = await db.jobOffer.findUnique({ where: { id } });
  if (!job || job.companyId !== profile.id) return { error: "Not found" };

  const updated = await db.jobOffer.update({ where: { id }, data });
  return { success: true, slug: updated.slug };
}

export async function publishJob(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") return { error: "Unauthorized" };

  const profile = await db.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { error: "Company profile required" };

  const job = await db.jobOffer.findUnique({ where: { id } });
  if (!job || job.companyId !== profile.id) return { error: "Not found" };

  await db.jobOffer.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
  return { success: true };
}

export async function closeJob(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") return { error: "Unauthorized" };

  const profile = await db.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { error: "Company profile required" };

  const job = await db.jobOffer.findUnique({ where: { id } });
  if (!job || job.companyId !== profile.id) return { error: "Not found" };

  await db.jobOffer.update({ where: { id }, data: { status: "CLOSED" } });
  return { success: true };
}

export async function deleteJob(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") return { error: "Unauthorized" };

  const profile = await db.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { error: "Company profile required" };

  const job = await db.jobOffer.findUnique({ where: { id } });
  if (!job || job.companyId !== profile.id) return { error: "Not found" };

  await db.jobOffer.delete({ where: { id } });
  return { success: true };
}
