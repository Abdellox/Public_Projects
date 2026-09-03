import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getCandidateProfile(userId: string) {
  return db.candidateProfile.findUnique({
    where: { userId },
    include: { cvs: true, _count: { select: { applications: true } } },
  });
}

export async function upsertCandidateProfile(userId: string, data: Prisma.CandidateProfileUpdateInput) {
  return db.candidateProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

export async function getCompanyProfile(userId: string) {
  return db.companyProfile.findUnique({
    where: { userId },
    include: { _count: { select: { jobOffers: true } } },
  });
}

export async function upsertCompanyProfile(userId: string, data: Prisma.CompanyProfileUpdateInput) {
  return db.companyProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...(data as Prisma.CompanyProfileUncheckedCreateWithoutUserInput) },
  });
}
