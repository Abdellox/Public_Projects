import { db } from "@/lib/db";
import { ApplicationStatus } from "@prisma/client";

export async function applyToJob(candidateId: string, jobOfferId: string, cvId?: string, coverLetter?: string) {
  return db.application.create({
    data: { candidateId, jobOfferId, cvId, coverLetter },
  });
}

export async function getApplicationById(id: string) {
  return db.application.findUnique({
    where: { id },
    include: {
      candidate: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      jobOffer: { include: { company: true } },
      cv: true,
      notes: { include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
      interviews: { orderBy: { scheduledAt: "desc" } },
    },
  });
}

export async function getApplicationsByCandidate(candidateId: string) {
  return db.application.findMany({
    where: { candidateId },
    include: {
      jobOffer: {
        include: { company: { include: { user: { select: { id: true, name: true, image: true } } } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApplicationsByJob(jobOfferId: string) {
  return db.application.findMany({
    where: { jobOfferId },
    include: {
      candidate: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          cvs: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return db.application.update({ where: { id }, data: { status } });
}

export async function cancelApplication(id: string) {
  return db.application.update({ where: { id }, data: { isCanceled: true } });
}

export async function hasAlreadyApplied(candidateId: string, jobOfferId: string) {
  const app = await db.application.findUnique({
    where: { candidateId_jobOfferId: { candidateId, jobOfferId } },
  });
  return !!app && !app.isCanceled;
}
