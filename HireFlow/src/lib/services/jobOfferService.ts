import { db } from "@/lib/db";
import { Prisma, JobStatus, EmploymentType, JobLevel } from "@prisma/client";
import { SearchJobInput } from "@/lib/validations/job";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createJobOffer(data: Prisma.JobOfferCreateInput) {
  const slug = slugify(data.title) + "-" + Date.now().toString(36);
  return db.jobOffer.create({ data: { ...data, slug } });
}

export async function updateJobOffer(id: string, data: Prisma.JobOfferUpdateInput) {
  return db.jobOffer.update({ where: { id }, data });
}

export async function deleteJobOffer(id: string) {
  return db.jobOffer.delete({ where: { id } });
}

export async function getJobOfferById(id: string) {
  return db.jobOffer.findUnique({
    where: { id },
    include: {
      company: { include: { user: { select: { id: true, name: true, image: true } } } },
      _count: { select: { applications: { where: { isCanceled: false } } } },
    },
  });
}

export async function getJobOfferBySlug(slug: string) {
  return db.jobOffer.findUnique({
    where: { slug },
    include: {
      company: { include: { user: { select: { id: true, name: true, image: true } } } },
      _count: { select: { applications: { where: { isCanceled: false } } } },
    },
  });
}

export async function searchJobs(filters: SearchJobInput) {
  const { q, location, category, employmentType, level, isRemote, page, limit } = filters;
  const where: Prisma.JobOfferWhereInput = { status: JobStatus.PUBLISHED };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { company: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (category) where.category = { contains: category, mode: "insensitive" };
  if (employmentType) where.employmentType = employmentType as EmploymentType;
  if (level) where.level = level as JobLevel;
  if (isRemote !== undefined) where.isRemote = isRemote;

  const [data, total] = await Promise.all([
    db.jobOffer.findMany({
      where,
      include: {
        company: { include: { user: { select: { id: true, name: true, image: true } } } },
        _count: { select: { applications: { where: { isCanceled: false } } } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.jobOffer.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getJobsByCompany(companyId: string, status?: JobStatus) {
  const where: Prisma.JobOfferWhereInput = { companyId };
  if (status) where.status = status;
  return db.jobOffer.findMany({
    where,
    include: { _count: { select: { applications: { where: { isCanceled: false } } } } },
    orderBy: { createdAt: "desc" },
  });
}
