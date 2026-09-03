import "dotenv/config";
import bcrypt from "bcryptjs";
import { Prisma, EmploymentType, prisma } from "../src/index.js";

const DEMO_PASSWORD = "AcmeDemo2024!";

const day = (offsetFromToday: number): Date => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offsetFromToday);
  return d;
};

const dateInYear = (month: number, dayOfMonth: number): Date => {
  const year = new Date().getUTCFullYear();
  return new Date(Date.UTC(year, month - 1, dayOfMonth));
};

async function main() {
  console.log("Seeding PeopleFlow demo data…");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const org = await prisma.organization.upsert({
    where: { slug: "acme" },
    update: {},
    create: { name: "Acme Inc.", slug: "acme" },
  });

  // ── Roles ──────────────────────────────────────────────────────────────────
  const roleDefs = [
    { name: "Owner", systemKey: "owner", permissions: ["*"] },
    {
      name: "Administrator",
      systemKey: "administrator",
      permissions: [
        "*", 
      ],
    },
    {
      name: "HR Manager",
      systemKey: "hr_manager",
      permissions: [
        "employee.view", "employee.create", "employee.update", "employee.delete",
        "salary.view", "salary.update",
        "leave.request", "leave.approve", "leave.viewAll",
        "attendance.clock", "attendance.viewAll",
        "document.upload", "document.manage", "document.viewAll",
        "performance.manage", "performance.viewAll",
        "recruitment.manage",
        "training.manage",
        "announcement.publish",
        "workflow.manage",
        "task.manage",
        "report.view",
        "data.import", "data.export",
        "audit.view",
      ],
    },
    {
      name: "Manager",
      systemKey: "manager",
      permissions: [
        "employee.view",
        "leave.approve",
        "attendance.viewAll",
        "performance.manage",
        "task.manage",
        "document.upload",
      ],
    },
    {
      name: "Employee",
      systemKey: "employee",
      permissions: ["leave.request", "attendance.clock"],
    },
  ] as const;

  const roles: Record<string, string> = {};
  for (const def of roleDefs) {
    const role = await prisma.role.upsert({
      where: { organizationId_name: { organizationId: org.id, name: def.name } },
      update: { permissions: [...def.permissions] },
      create: {
        organizationId: org.id,
        name: def.name,
        permissions: [...def.permissions],
        systemKey: def.systemKey,
        isSystem: true,
      },
    });
    roles[def.systemKey] = role.id;
  }

  // ── Statuses ───────────────────────────────────────────────────────────────
  const statusNames = [
    { name: "Active", category: "ACTIVE" as const, color: "#22c55e", isDefault: true },
    { name: "On leave", category: "ON_LEAVE" as const, color: "#f59e0b", isDefault: false },
    { name: "Suspended", category: "SUSPENDED" as const, color: "#ef4444", isDefault: false },
    { name: "Terminated", category: "TERMINATED" as const, color: "#64748b", isDefault: false },
  ];
  const statuses: Record<string, string> = {};
  for (const s of statusNames) {
    const status = await prisma.employeeStatusDef.upsert({
      where: { organizationId_name: { organizationId: org.id, name: s.name } },
      update: {},
      create: { organizationId: org.id, ...s },
    });
    statuses[s.category] = status.id;
  }

  // ── Structure ──────────────────────────────────────────────────────────────
  const departmentNames = ["Engineering", "Sales", "Human Resources", "Finance"];
  const departments: Record<string, string> = {};
  for (const name of departmentNames) {
    const d = await prisma.department.upsert({
      where: { organizationId_name: { organizationId: org.id, name } },
      update: {},
      create: { organizationId: org.id, name },
    });
    departments[name] = d.id;
  }

  const teams: Record<string, string> = {};
  for (const [name, dept] of [["Platform", "Engineering"], ["Mobile", "Engineering"], ["Inside Sales", "Sales"]]) {
    const t = await prisma.team.upsert({
      where: { organizationId_name: { organizationId: org.id, name } },
      update: {},
      create: { organizationId: org.id, name, departmentId: departments[dept] },
    });
    teams[name] = t.id;
  }

  const hq = await prisma.location.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Berlin HQ" } },
    update: {},
    create: { organizationId: org.id, name: "Berlin HQ", address: "Torstraße 1, Berlin", timezone: "Europe/Berlin" },
  });
  const remote = await prisma.location.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Remote" } },
    update: {},
    create: { organizationId: org.id, name: "Remote", timezone: "UTC" },
  });

  const titleNames = ["Software Engineer", "Engineering Manager", "HR Director", "Account Executive", "Financial Analyst", "Product Designer"];
  const titles: Record<string, string> = {};
  for (const name of titleNames) {
    const t = await prisma.jobTitle.upsert({
      where: { organizationId_name: { organizationId: org.id, name } },
      update: {},
      create: { organizationId: org.id, name },
    });
    titles[name] = t.id;
  }

  await prisma.workSchedule.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Standard 40h" } },
    update: {},
    create: {
      organizationId: org.id,
      name: "Standard 40h",
      isDefault: true,
      days: Array.from({ length: 7 }, (_, i) => ({
        day: i,
        enabled: i >= 1 && i <= 5,
        startTime: "09:00",
        endTime: "17:00",
      })),
    },
  });

  const holidaySeeds: [string, number, number][] = [["New Year's Day", 1, 1], ["Spring Holiday", 5, 1], ["Company Day", 9, 15]];
  for (const [name, m, d] of holidaySeeds) {
    await prisma.publicHoliday.upsert({
      where: { organizationId_date_name: { organizationId: org.id, date: dateInYear(m, d), name } },
      update: {},
      create: { organizationId: org.id, name, date: dateInYear(m, d) },
    });
  }

  // ── Leave types ────────────────────────────────────────────────────────────
  const leaveTypes: Record<string, string> = {};
  for (const lt of [
    { name: "Annual Leave", annualAllowanceDays: 25, carryOverMaxDays: 5, paid: true, requiresApproval: true, color: "#6366f1" },
    { name: "Sick Leave", annualAllowanceDays: 10, carryOverMaxDays: 0, paid: true, requiresApproval: false, color: "#ef4444" },
    { name: "Personal Leave", annualAllowanceDays: 3, carryOverMaxDays: 0, paid: true, requiresApproval: true, color: "#14b8a6" },
  ]) {
    const t = await prisma.leaveType.upsert({
      where: { organizationId_name: { organizationId: org.id, name: lt.name } },
      update: {},
      create: { organizationId: org.id, ...lt },
    });
    leaveTypes[lt.name] = t.id;
  }

  // ── Users & employees ─────────────────────────────────────────────────────
  type PersonSpec = {
    email: string;
    name: string;
    first: string;
    last: string;
    number: string;
    role: keyof typeof roles;
    isOwner?: boolean;
    dept: string;
    team?: string;
    title: string;
    locationId: string;
    startOffsetDays: number;
    employment?: EmploymentType;
    skills?: string[];
    managerNumber?: string;
  };

  const people: PersonSpec[] = [
    { email: "admin@acme.demo", name: "Alice Chen", first: "Alice", last: "Chen", number: "EMP-001", role: "owner", isOwner: true, dept: "Human Resources", title: "HR Director", locationId: hq.id, startOffsetDays: -1200, skills: ["People Ops", "Recruiting"] },
    { email: "manager@acme.demo", name: "Bob Martinez", first: "Bob", last: "Martinez", number: "EMP-002", role: "manager", dept: "Engineering", team: "Platform", title: "Engineering Manager", locationId: remote.id, startOffsetDays: -900, skills: ["Leadership", "Go"], managerNumber: "EMP-001" },
    { email: "employee@acme.demo", name: "Carol Kim", first: "Carol", last: "Kim", number: "EMP-003", role: "employee", dept: "Engineering", team: "Platform", title: "Software Engineer", locationId: remote.id, startOffsetDays: -400, skills: ["TypeScript", "React"], managerNumber: "EMP-002" },
    { email: "david@acme.demo", name: "David Osei", first: "David", last: "Osei", number: "EMP-004", role: "employee", dept: "Engineering", team: "Mobile", title: "Software Engineer", locationId: remote.id, startOffsetDays: -200, skills: ["Swift", "Kotlin"], managerNumber: "EMP-002" },
    { email: "emma@acme.demo", name: "Emma Fischer", first: "Emma", last: "Fischer", number: "EMP-005", role: "employee", dept: "Engineering", team: "Platform", title: "Product Designer", locationId: hq.id, startOffsetDays: -150, skills: ["Figma"], managerNumber: "EMP-002" },
    { email: "frank@acme.demo", name: "Frank Weber", first: "Frank", last: "Weber", number: "EMP-006", role: "manager", dept: "Sales", team: "Inside Sales", title: "Account Executive", locationId: hq.id, startOffsetDays: -700, skills: ["Negotiation"], managerNumber: "EMP-001" },
    { email: "grace@acme.demo", name: "Grace Liu", first: "Grace", last: "Liu", number: "EMP-007", role: "employee", dept: "Finance", title: "Financial Analyst", locationId: hq.id, startOffsetDays: -500, skills: ["SQL"], managerNumber: "EMP-001" },
    { email: "henry@acme.demo", name: "Henry Adams", first: "Henry", last: "Adams", number: "EMP-008", role: "employee", dept: "Engineering", team: "Platform", title: "Software Engineer", locationId: remote.id, startOffsetDays: -30, employment: "CONTRACT", skills: ["Rust"], managerNumber: "EMP-002" },
  ];

  const employeesByEmail = new Map<string, string>();
  for (const p of people) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { name: p.name },
      create: { email: p.email, passwordHash, name: p.name },
    });

    await prisma.membership.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
      update: { roleId: roles[p.role], isOwner: p.isOwner ?? false },
      create: { userId: user.id, organizationId: org.id, roleId: roles[p.role], isOwner: p.isOwner ?? false },
    });

    const manager = p.managerNumber ? people.find((m) => m.number === p.managerNumber) : undefined;
    const managerEmployee = manager ? await findEmployee(org.id, manager.number) : null;

    const existing = await prisma.employee.findUnique({
      where: { organizationId_employeeNumber: { organizationId: org.id, employeeNumber: p.number } },
    });

    const data = {
      firstName: p.first,
      lastName: p.last,
      email: p.email,
      departmentId: departments[p.dept],
      teamId: p.team ? teams[p.team] : null,
      jobTitleId: titles[p.title],
      locationId: p.locationId,
      managerId: managerEmployee?.id ?? null,
      employmentType: p.employment ?? ("FULL_TIME" as EmploymentType),
      startDate: day(p.startOffsetDays),
      skills: p.skills ?? [],
    };

    const employee = existing
      ? await prisma.employee.update({ where: { id: existing.id }, data })
      : await prisma.employee.create({
          data: {
            organizationId: org.id,
            userId: user.id,
            employeeNumber: p.number,
            statusId: statuses.ACTIVE,
            ...data,
          },
        });

    employeesByEmail.set(p.email, employee.id);
  }

  // A departed employee for turnover reporting
  const exEmployee = await prisma.employee.findFirst({
    where: { organizationId: org.id, employeeNumber: "EMP-000" },
  });
  if (!exEmployee) {
    await prisma.employee.create({
      data: {
        organizationId: org.id,
        employeeNumber: "EMP-000",
        firstName: "Ivy",
        lastName: "Novak",
        email: "ivy@acme.demo",
        employmentType: "FULL_TIME",
        startDate: day(-800),
        terminationDate: day(-60),
        statusId: statuses.TERMINATED,
        departmentId: departments["Sales"],
      },
    });
  }

  async function findEmployee(orgId: string, employeeNumber: string) {
    return prisma.employee.findUnique({
      where: { organizationId_employeeNumber: { organizationId: orgId, employeeNumber } },
    });
  }

  // ── Leave balances & requests ──────────────────────────────────────────────
  const year = new Date().getUTCFullYear();
  for (const [, employeeId] of employeesByEmail) {
    for (const [typeName, typeId] of Object.entries(leaveTypes)) {
      const allowance = typeName === "Annual Leave" ? 25 : typeName === "Sick Leave" ? 10 : 3;
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId: typeId, year } },
        update: {},
        create: {
          organizationId: org.id,
          employeeId,
          leaveTypeId: typeId,
          year,
          entitled: allowance,
          used: typeName === "Annual Leave" ? Math.floor(Math.random() * 8) : 0,
        },
      });
    }
  }

  const carol = employeesByEmail.get("employee@acme.demo")!;
  const bob = employeesByEmail.get("manager@acme.demo")!;
  const aliceUser = await prisma.user.findUniqueOrThrow({ where: { email: "admin@acme.demo" } });
  const bobUser = await prisma.user.findUniqueOrThrow({ where: { email: "manager@acme.demo" } });

  const pendingExists = await prisma.leaveRequest.findFirst({
    where: { organizationId: org.id, employeeId: carol, status: "PENDING" },
  });
  if (!pendingExists) {
    await prisma.leaveRequest.create({
      data: {
        organizationId: org.id,
        employeeId: carol,
        leaveTypeId: leaveTypes["Annual Leave"],
        startDate: day(14),
        endDate: day(18),
        days: 5,
        reason: "Family trip",
      },
    });
  }
  const approvedExists = await prisma.leaveRequest.findFirst({
    where: { organizationId: org.id, employeeId: bob, status: "APPROVED" },
  });
  if (!approvedExists) {
    await prisma.leaveRequest.create({
      data: {
        organizationId: org.id,
        employeeId: bob,
        leaveTypeId: leaveTypes["Annual Leave"],
        startDate: day(-20),
        endDate: day(-16),
        days: 5,
        status: "APPROVED",
        approverUserId: aliceUser.id,
        decidedAt: day(-25),
      },
    });
  }

  // ── Attendance ─────────────────────────────────────────────────────────────
  for (let i = 1; i <= 5; i++) {
    const d = day(-i);
    const clockIn = new Date(d); clockIn.setUTCHours(8, 55, 0, 0);
    const clockOut = new Date(d); clockOut.setUTCHours(17, 30 + i, 0, 0);
    await prisma.attendanceEntry.upsert({
      where: { employeeId_date: { employeeId: carol, date: d } },
      update: {},
      create: {
        organizationId: org.id,
        employeeId: carol,
        date: d,
        clockIn,
        clockOut,
        breakMinutes: 30,
        workedMinutes: 480 + i * 5,
        overtimeMinutes: i * 5,
      },
    });
  }

  // ── Announcements ──────────────────────────────────────────────────────────
  const announcementExists = await prisma.announcement.findFirst({
    where: { organizationId: org.id, title: "Welcome to PeopleFlow 🎉" },
  });
  if (!announcementExists) {
    const announcement = await prisma.announcement.create({
      data: {
        organizationId: org.id,
        authorUserId: aliceUser.id,
        title: "Welcome to PeopleFlow 🎉",
        body:
          "Hi everyone!\n\nOur new HR platform is live. You can request leave, check your attendance, browse the employee directory and read company policies — all in one place.\n\nIf anything looks off, ping the HR team.",
        pinned: true,
      },
    });
    await prisma.announcementReaction.create({
      data: { organizationId: org.id, announcementId: announcement.id, userId: bobUser.id, emoji: "🎉" },
    });
    await prisma.announcementComment.create({
      data: { organizationId: org.id, announcementId: announcement.id, userId: bobUser.id, body: "Great initiative!" },
    });
  }

  // ── Performance ────────────────────────────────────────────────────────────
  const cycle = await prisma.reviewCycle.upsert({
    where: { organizationId_name: { organizationId: org.id, name: `${year} Mid-Year Review` } },
    update: {},
    create: {
      organizationId: org.id,
      name: `${year} Mid-Year Review`,
      periodStart: new Date(Date.UTC(year, 0, 1)),
      periodEnd: new Date(Date.UTC(year, 5, 30)),
    },
  });
  await prisma.review.upsert({
    where: { cycleId_employeeId: { cycleId: cycle.id, employeeId: carol } },
    update: {},
    create: {
      organizationId: org.id,
      cycleId: cycle.id,
      employeeId: carol,
      managerUserId: bobUser.id,
    },
  });
  await prisma.goal.create({
    data: {
      organizationId: org.id,
      employeeId: carol,
      title: "Increase customer satisfaction by 10%",
      description: "Own the feedback loop between support tickets and platform fixes.",
      progress: 40,
      dueDate: day(90),
    },
  });

  // ── Recruitment ────────────────────────────────────────────────────────────
  let job = await prisma.jobOpening.findFirst({
    where: { organizationId: org.id, title: "Senior Backend Engineer" },
  });
  if (!job) {
    job = await prisma.jobOpening.create({
      data: {
        organizationId: org.id,
        title: "Senior Backend Engineer",
        description: "Help us build the core of our platform.",
        departmentId: departments["Engineering"],
        locationId: remote.id,
      },
    });
  }

  const candidateSeed = [
    { first: "Nina", last: "Petrova", email: "nina@example.com", stage: "INTERVIEW" as const },
    { first: "Omar", last: "Haddad", email: "omar@example.com", stage: "SCREENING" as const },
    { first: "Sofia", last: "Rossi", email: "sofia@example.com", stage: "OFFER" as const },
  ];
  for (const c of candidateSeed) {
    const candidate = await prisma.candidate.upsert({
      where: { organizationId_email: { organizationId: org.id, email: c.email } },
      update: {},
      create: { organizationId: org.id, firstName: c.first, lastName: c.last, email: c.email, source: "Referral" },
    });
    const application = await prisma.application.upsert({
      where: { jobId_candidateId: { jobId: job.id, candidateId: candidate.id } },
      update: { stage: c.stage },
      create: { organizationId: org.id, jobId: job.id, candidateId: candidate.id, stage: c.stage },
    });
    const historyExists = await prisma.applicationStageHistory.findFirst({
      where: { applicationId: application.id, stage: c.stage },
    });
    if (!historyExists) {
      await prisma.applicationStageHistory.create({
        data: { applicationId: application.id, stage: c.stage },
      });
    }
  }

  // ── Training ───────────────────────────────────────────────────────────────
  let course = await prisma.course.findFirst({
    where: { organizationId: org.id, title: "Security Awareness Basics" },
  });
  if (!course) {
    course = await prisma.course.create({
      data: {
        organizationId: org.id,
        title: "Security Awareness Basics",
        description: "Phishing, passwords and data handling.",
        category: "Compliance",
        durationHours: 2,
        certificationValidMonths: 12,
      },
    });
  }

  const assignmentExists = await prisma.trainingAssignment.findFirst({
    where: { organizationId: org.id, courseId: course.id, employeeId: carol },
  });
  if (!assignmentExists) {
    await prisma.trainingAssignment.create({
      data: { organizationId: org.id, courseId: course.id, employeeId: carol, dueDate: day(21) },
    });
  }

  // ── Onboarding workflow template ───────────────────────────────────────────
  await prisma.workflowTemplate.upsert({
    where: { organizationId_name: { organizationId: org.id, name: "Standard Onboarding" } },
    update: {},
    create: {
      organizationId: org.id,
      name: "Standard Onboarding",
      trigger: "ONBOARDING",
      steps: [
        { title: "Sign employment contract", offsetDays: 0, roleKey: "ASSIGNEE" },
        { title: "Upload ID document", offsetDays: 1, roleKey: "ASSIGNEE" },
        { title: "Add bank details for payroll", offsetDays: 1, roleKey: "ASSIGNEE" },
        { title: "Read company policies", offsetDays: 2, roleKey: "ASSIGNEE" },
        { title: "Intro meeting with manager", offsetDays: 1, roleKey: "MANAGER" },
        { title: "Issue equipment", offsetDays: 0, roleKey: "HR" },
      ],
    },
  });

  console.log("Seed complete.");
  console.log("  Organization: Acme Inc.");
  console.log(`  Login: admin@acme.demo / ${DEMO_PASSWORD}`);
  console.log(`  Login: manager@acme.demo / ${DEMO_PASSWORD}`);
  console.log(`  Login: employee@acme.demo / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
