import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import "dotenv/config";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from "@nexora/types";
import { createDb, type Db } from "../client.js";
import {
  departments,
  jobTitles,
  organizations,
  organizationMemberships,
  permissions,
  rolePermissions,
  roles,
  skills,
  teams,
  userSkills,
  users
} from "../schema/index.js";

const ARGON_OPTS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

interface SeedUser {
  name: string;
  email: string;
  departmentSlug: string;
  teamSlug?: string;
  jobTitle: string;
  interests: string[];
  roleKey: "owner" | "admin" | "member";
  skills: Array<{ name: string; level: "beginner" | "intermediate" | "advanced" | "expert" }>;
}

const DEMO_ORG = {
  name: "Nexora Labs",
  slug: "nexora-labs",
  description: "A demo organization showcasing the platform with a realistic company structure."
};

const DEMO_DEPARTMENTS = [
  { name: "Engineering", color: "#6366f1", description: "Builds and operates the product." },
  { name: "Product", color: "#0ea5e9", description: "Owns the roadmap and discovery." },
  { name: "Design", color: "#ec4899", description: "Product design and brand." },
  { name: "Marketing", color: "#f59e0b", description: "Growth, content and campaigns." },
  { name: "Sales", color: "#10b981", description: "Revenue and customer relationships." },
  { name: "People Ops", color: "#8b5cf6", description: "Hiring, onboarding and culture." }
];

const DEMO_TEAMS = [
  { departmentSlug: "engineering", name: "Backend Team" },
  { departmentSlug: "engineering", name: "Frontend Team" },
  { departmentSlug: "engineering", name: "Platform Team" },
  { departmentSlug: "product", name: "Core Product" },
  { departmentSlug: "design", name: "Brand Studio" }
];

const DEMO_TITLES = [
  "Chief Technology Officer",
  "Backend Engineer",
  "Frontend Engineer",
  "DevOps Engineer",
  "Product Manager",
  "Product Designer",
  "Growth Marketer",
  "Account Executive",
  "People Partner"
];

const SEED_USERS: SeedUser[] = [
  {
    name: "Ada Okafor",
    email: "ada@nexora.dev",
    departmentSlug: "engineering",
    jobTitle: "Chief Technology Officer",
    roleKey: "owner",
    interests: ["distributed systems", "developer experience"],
    skills: [
      { name: "System Architecture", level: "expert" },
      { name: "PostgreSQL", level: "advanced" },
      { name: "Team Leadership", level: "expert" }
    ]
  },
  {
    name: "Maya Lindqvist",
    email: "maya@nexora.dev",
    departmentSlug: "engineering",
    teamSlug: "backend-team",
    jobTitle: "Backend Engineer",
    roleKey: "admin",
    interests: ["data engineering", "performance tuning"],
    skills: [
      { name: "Python", level: "expert" },
      { name: "PostgreSQL", level: "advanced" },
      { name: "Kafka", level: "advanced" },
      { name: "APIs", level: "advanced" }
    ]
  },
  {
    name: "Leo Marchetti",
    email: "leo@nexora.dev",
    departmentSlug: "engineering",
    teamSlug: "frontend-team",
    jobTitle: "Frontend Engineer",
    roleKey: "member",
    interests: ["design systems", "web performance"],
    skills: [
      { name: "TypeScript", level: "expert" },
      { name: "React", level: "expert" },
      { name: "CSS", level: "advanced" }
    ]
  },
  {
    name: "Ravi Deshmukh",
    email: "ravi@nexora.dev",
    departmentSlug: "engineering",
    teamSlug: "platform-team",
    jobTitle: "DevOps Engineer",
    roleKey: "member",
    interests: ["infrastructure as code", "observability"],
    skills: [
      { name: "Kubernetes", level: "expert" },
      { name: "Terraform", level: "advanced" },
      { name: "AWS", level: "advanced" }
    ]
  },
  {
    name: "Priya Nair",
    email: "priya@nexora.dev",
    departmentSlug: "product",
    teamSlug: "core-product",
    jobTitle: "Product Manager",
    roleKey: "admin",
    interests: ["discovery", "pricing strategy"],
    skills: [
      { name: "Roadmapping", level: "expert" },
      { name: "User Research", level: "advanced" }
    ]
  },
  {
    name: "Sam Duarte",
    email: "sam@nexora.dev",
    departmentSlug: "design",
    teamSlug: "brand-studio",
    jobTitle: "Product Designer",
    roleKey: "member",
    interests: ["accessibility", "motion design"],
    skills: [
      { name: "Figma", level: "expert" },
      { name: "Design Systems", level: "advanced" },
      { name: "Prototyping", level: "advanced" }
    ]
  },
  {
    name: "Ana Kovač",
    email: "ana@nexora.dev",
    departmentSlug: "marketing",
    jobTitle: "Growth Marketer",
    roleKey: "member",
    interests: ["seo", "lifecycle marketing"],
    skills: [
      { name: "Content Strategy", level: "expert" },
      { name: "SEO", level: "advanced" },
      { name: "Analytics", level: "intermediate" }
    ]
  },
  {
    name: "Omar Haddad",
    email: "omar@nexora.dev",
    departmentSlug: "sales",
    jobTitle: "Account Executive",
    roleKey: "member",
    interests: ["enterprise sales"],
    skills: [
      { name: "Negotiation", level: "expert" },
      { name: "CRM Tools", level: "advanced" }
    ]
  }
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required (copy .env.example to .env)");
    process.exit(1);
  }

  const { db, close } = createDb({ connectionString });
  const password = process.env.SEED_PASSWORD ?? "Password123!";
  const passwordHash = await hash(password, ARGON_OPTS);

  try {
    // Safety net: keep the catalog in sync even before custom migrations exist.
    await db
      .insert(permissions)
      .values(Object.entries(PERMISSIONS).map(([key, description]) => ({ key, description })))
      .onConflictDoNothing();

    const existing = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, DEMO_ORG.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log("Demo organization already exists — seed skipped.");
      return;
    }

    await seedOrganization(db, { passwordHash });
  } finally {
    await close();
  }

  console.log(`Seeded "${DEMO_ORG.name}" with ${SEED_USERS.length} members.`);
  console.log(`Login with any seeded email (e.g. ada@nexora.dev / ${password})`);
}

async function seedOrganization(
  handle: { transaction: Db["transaction"] },
  opts: { passwordHash: string }
) {
  await handle.transaction(async (tx) => {
    const orgRows = await tx
      .insert(organizations)
      .values(DEMO_ORG)
      .returning({ id: organizations.id });
    const org = orgRows[0];
    if (!org) throw new Error("Failed to create organization");

    const roleRows = await tx
      .insert(roles)
      .values(
        (Object.keys(DEFAULT_ROLE_PERMISSIONS) as Array<keyof typeof DEFAULT_ROLE_PERMISSIONS>).map(
          (key) => ({
            organizationId: org.id,
            key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            isSystem: true
          })
        )
      )
      .returning({ id: roles.id, key: roles.key });

    const grants = Object.entries(DEFAULT_ROLE_PERMISSIONS).flatMap(([roleKey, perms]) => {
      const role = roleRows.find((r) => r.key === roleKey);
      if (!role) throw new Error(`Role ${roleKey} missing`);
      return perms.map((permissionKey) => ({ roleId: role.id, permissionKey }));
    });
    await tx.insert(rolePermissions).values(grants).onConflictDoNothing();

    const deptRows = await tx
      .insert(departments)
      .values(
        DEMO_DEPARTMENTS.map((d) => ({
          organizationId: org.id,
          name: d.name,
          slug: slugify(d.name),
          description: d.description,
          color: d.color
        }))
      )
      .returning({ id: departments.id, slug: departments.slug });

    const teamRows = await tx
      .insert(teams)
      .values(
        DEMO_TEAMS.map((t) => {
          const dept = deptRows.find((d) => d.slug === t.departmentSlug);
          if (!dept) throw new Error(`Department ${t.departmentSlug} missing`);
          return {
            organizationId: org.id,
            departmentId: dept.id,
            name: t.name,
            slug: slugify(t.name)
          };
        })
      )
      .returning({ id: teams.id, slug: teams.slug, departmentId: teams.departmentId });

    const titleRows = await tx
      .insert(jobTitles)
      .values(
        DEMO_TITLES.map((name) => ({
          organizationId: org.id,
          name,
          nameNorm: name.toLowerCase()
        }))
      )
      .returning({ id: jobTitles.id, nameNorm: jobTitles.nameNorm });

    // Upsert the union of all user skills into the org catalog first.
    const skillNames = [...new Set(SEED_USERS.flatMap((u) => u.skills.map((s) => s.name)))];
    const skillRows: Array<{ id: string; nameNorm: string }> = [];
    for (const name of skillNames) {
      const norm = name.toLowerCase();
      const rows = await tx
        .insert(skills)
        .values({ organizationId: org.id, name, nameNorm: norm })
        .onConflictDoUpdate({
          target: [skills.organizationId, skills.nameNorm],
          set: { name }
        })
        .returning({ id: skills.id, nameNorm: skills.nameNorm });
      const row = rows[0];
      if (!row) throw new Error(`Failed to upsert skill ${name}`);
      skillRows.push(row);
    }

    for (const u of SEED_USERS) {
      const userRows = await tx
        .insert(users)
        .values({
          email: u.email,
          passwordHash: opts.passwordHash,
          name: u.name,
          bio: `${u.jobTitle} at ${DEMO_ORG.name}.`,
          interests: u.interests
        })
        .returning({ id: users.id });
      const user = userRows[0];
      if (!user) throw new Error(`Failed to create user ${u.email}`);

      const dept = deptRows.find((d) => d.slug === u.departmentSlug);
      if (!dept) throw new Error(`Department ${u.departmentSlug} missing`);
      let teamId: string | null = null;
      if (u.teamSlug) {
        const team = teamRows.find((t) => t.slug === u.teamSlug && t.departmentId === dept.id);
        if (!team) throw new Error(`Team ${u.teamSlug} missing`);
        teamId = team.id;
      }
      const title = titleRows.find((t) => t.nameNorm === u.jobTitle.toLowerCase());
      if (!title) throw new Error(`Job title ${u.jobTitle} missing`);
      const role = roleRows.find((r) => r.key === u.roleKey);
      if (!role) throw new Error(`Role ${u.roleKey} missing`);

      await tx.insert(organizationMemberships).values({
        organizationId: org.id,
        userId: user.id,
        roleId: role.id,
        departmentId: dept.id,
        teamId,
        jobTitleId: title.id,
        status: "active"
      });

      if (u.skills.length > 0) {
        await tx.insert(userSkills).values(
          u.skills.map((s) => {
            const skill = skillRows.find((sr) => sr.nameNorm === s.name.toLowerCase());
            if (!skill) throw new Error(`Skill ${s.name} missing`);
            return {
              userId: user.id,
              skillId: skill.id,
              organizationId: org.id,
              level: s.level
            };
          })
        );
      }
    }
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
