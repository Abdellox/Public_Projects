"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { candidateProfileSchema, companyProfileSchema, CandidateProfileInput, CompanyProfileInput } from "@/lib/validations/candidate";

export async function updateCandidateProfile(data: CandidateProfileInput) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") return { error: "Unauthorized" };

  const parsed = candidateProfileSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await db.candidateProfile.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: { userId: session.user.id, ...parsed.data },
  });

  return { success: true };
}

export async function updateCompanyProfile(data: CompanyProfileInput) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") return { error: "Unauthorized" };

  const parsed = companyProfileSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await db.companyProfile.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: { userId: session.user.id, name: parsed.data.name },
  });

  return { success: true };
}
