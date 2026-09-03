"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ApplicationStatus } from "@prisma/client";

export async function applyToJobAction(jobOfferId: string, cvId?: string, coverLetter?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    return { error: "Unauthorized" };
  }

  const profile = await db.candidateProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { error: "Profile required" };

  const existing = await db.application.findUnique({
    where: { candidateId_jobOfferId: { candidateId: profile.id, jobOfferId } },
  });
  if (existing && !existing.isCanceled) return { error: "Already applied" };

  const app = await db.application.create({
    data: { candidateId: profile.id, jobOfferId, cvId, coverLetter },
  });

  return { success: true, applicationId: app.id };
}

export async function cancelApplicationAction(applicationId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const profile = await db.candidateProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { error: "Profile required" };

  const app = await db.application.findUnique({ where: { id: applicationId } });
  if (!app || app.candidateId !== profile.id) return { error: "Not found" };
  if (app.status === "ACCEPTED") return { error: "Cannot cancel accepted application" };

  await db.application.update({ where: { id: applicationId }, data: { isCanceled: true } });
  return { success: true };
}

export async function updateApplicationStatusAction(applicationId: string, status: ApplicationStatus) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") return { error: "Unauthorized" };

  const app = await db.application.findUnique({
    where: { id: applicationId },
    include: { jobOffer: true },
  });
  if (!app) return { error: "Not found" };

  const profile = await db.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile || app.jobOffer.companyId !== profile.id) return { error: "Unauthorized" };

  await db.application.update({ where: { id: applicationId }, data: { status } });

  await db.notification.create({
    data: {
      userId: (await db.candidateProfile.findUnique({ where: { id: app.candidateId } }))!.userId,
      type: "STATUS_CHANGE",
      title: "Application Updated",
      message: `Your application for "${app.jobOffer.title}" is now ${status.toLowerCase()}`,
      link: `/candidate/applications`,
    },
  });

  return { success: true };
}

export async function addCandidateNoteAction(applicationId: string, content: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") return { error: "Unauthorized" };

  const profile = await db.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return { error: "Company profile required" };

  const app = await db.application.findUnique({ where: { id: applicationId }, include: { jobOffer: true } });
  if (!app || app.jobOffer.companyId !== profile.id) return { error: "Not found" };

  await db.candidateNote.create({
    data: { applicationId, authorId: session.user.id, content },
  });

  return { success: true };
}
