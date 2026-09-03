import { hasPermission } from "@peopleflow/auth";
import { Prisma, type Db } from "@peopleflow/database";

export interface SearchHit {
  id: string;
  title: string;
  subtitle?: string;
}

export type SearchResults = Partial<
  Record<"employees" | "departments" | "teams" | "documents" | "jobs" | "candidates" | "courses" | "announcements", SearchHit[]>
>;

const contains = (q: string) => ({ contains: q, mode: Prisma.QueryMode.insensitive });

/**
 * Permission-aware global search. Every group is only queried when the caller
 * holds the corresponding permission; queries are tenant-scoped by the db client.
 */
export async function globalSearch(db: Db, permissions: ReadonlySet<string>, q: string): Promise<SearchResults> {
  const term = q.trim();
  if (term.length < 2) return {};
  const like = contains(term);

  const [
    employees,
    departments,
    teams,
    documents,
    jobs,
    candidates,
    courses,
    announcements,
  ] = await Promise.all([
    hasPermission(permissions, "employee.view")
      ? db.employee.findMany({
          where: {
            OR: [
              { firstName: like },
              { lastName: like },
              { email: like },
              { employeeNumber: like },
            ],
          },
          select: { id: true, firstName: true, lastName: true, employeeNumber: true, jobTitle: { select: { name: true } } },
          take: 5,
          orderBy: [{ lastName: "asc" }],
        })
      : Promise.resolve([]),
    hasPermission(permissions, "employee.view")
      ? db.department.findMany({
          where: { name: like },
          select: { id: true, name: true },
          take: 5,
        })
      : Promise.resolve([]),
    hasPermission(permissions, "employee.view")
      ? db.team.findMany({
          where: { name: like },
          select: { id: true, name: true },
          take: 5,
        })
      : Promise.resolve([]),
    hasPermission(permissions, "document.viewAll")
      ? db.document.findMany({
          where: { archivedAt: null, title: like },
          select: { id: true, title: true, category: true },
          take: 5,
        })
      : Promise.resolve([]),
    hasPermission(permissions, "recruitment.manage")
      ? db.jobOpening.findMany({
          where: { title: like },
          select: { id: true, title: true, status: true },
          take: 5,
        })
      : Promise.resolve([]),
    hasPermission(permissions, "recruitment.manage")
      ? db.candidate.findMany({
          where: { OR: [{ firstName: like }, { lastName: like }, { email: like }] },
          select: { id: true, firstName: true, lastName: true, email: true },
          take: 5,
        })
      : Promise.resolve([]),
    hasPermission(permissions, "training.manage")
      ? db.course.findMany({
          where: { archivedAt: null, title: like },
          select: { id: true, title: true, category: true },
          take: 5,
        })
      : Promise.resolve([]),
    db.announcement.findMany({
      where: { title: like },
      select: { id: true, title: true, publishedAt: true },
      take: 5,
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  return {
    employees: employees.map((e) => ({
      id: e.id,
      title: `${e.firstName} ${e.lastName}`,
      subtitle: e.jobTitle?.name ?? e.employeeNumber,
    })),
    departments: departments.map((d) => ({ id: d.id, title: d.name })),
    teams: teams.map((t) => ({ id: t.id, title: t.name })),
    documents: documents.map((d) => ({ id: d.id, title: d.title, subtitle: d.category })),
    jobs: jobs.map((j) => ({ id: j.id, title: j.title, subtitle: j.status })),
    candidates: candidates.map((c) => ({ id: c.id, title: `${c.firstName} ${c.lastName}`, subtitle: c.email })),
    courses: courses.map((c) => ({ id: c.id, title: c.title, subtitle: c.category ?? undefined })),
    announcements: announcements.map((a) => ({ id: a.id, title: a.title })),
  };
}
