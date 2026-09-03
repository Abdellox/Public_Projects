import { PrismaClient, Role, JobStatus, ApplicationStatus, EmploymentType, JobLevel } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await hash("admin123", 12);
  const candidatePassword = await hash("candidate123", 12);
  const companyPassword = await hash("company123", 12);

  const admin = await prisma.user.create({
    data: { name: "Admin User", email: "admin@hireflow.com", passwordHash: adminPassword, role: Role.ADMIN },
  });

  const candidateUser = await prisma.user.create({
    data: { name: "Jane Developer", email: "jane@example.com", passwordHash: candidatePassword, role: Role.CANDIDATE },
  });

  const candidateProfile = await prisma.candidateProfile.create({
    data: {
      userId: candidateUser.id,
      headline: "Full-Stack Developer",
      bio: "Passionate developer with 5 years of experience in React and Node.js.",
      location: "San Francisco, CA",
      skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Tailwind CSS"],
      experience: [{ company: "TechCorp", role: "Senior Developer", duration: "2 years" }],
      education: [{ school: "UC Berkeley", degree: "BS Computer Science", year: 2019 }],
    },
  });

  const companyUser1 = await prisma.user.create({
    data: { name: "Alex Manager", email: "alex@techcorp.com", passwordHash: companyPassword, role: Role.COMPANY },
  });

  const companyProfile1 = await prisma.companyProfile.create({
    data: {
      userId: companyUser1.id,
      name: "TechCorp",
      description: "Leading technology company building the future.",
      industry: "Technology",
      location: "San Francisco, CA",
      website: "https://techcorp.com",
      employeeCount: "500-1000",
    },
  });

  const companyUser2 = await prisma.user.create({
    data: { name: "Sam Recruiter", email: "sam@designstudio.com", passwordHash: companyPassword, role: Role.COMPANY },
  });

  const companyProfile2 = await prisma.companyProfile.create({
    data: {
      userId: companyUser2.id,
      name: "Design Studio",
      description: "Creative design agency crafting beautiful experiences.",
      industry: "Design",
      location: "New York, NY",
      website: "https://designstudio.com",
      employeeCount: "50-200",
    },
  });

  const jobs = [
    { companyId: companyProfile1.id, title: "Senior Frontend Developer", description: "We are looking for a Senior Frontend Developer to join our team. You will build modern web applications using React and TypeScript.", requirements: "5+ years of experience with React, TypeScript, and modern CSS. Experience with Next.js preferred.", location: "San Francisco, CA", category: "Engineering", employmentType: EmploymentType.FULL_TIME, level: JobLevel.SENIOR, salaryMin: 120000, salaryMax: 180000, isRemote: true },
    { companyId: companyProfile1.id, title: "Backend Engineer", description: "Join our backend team to build scalable APIs and microservices.", requirements: "3+ years with Node.js or Python. Database design experience required.", location: "San Francisco, CA", category: "Engineering", employmentType: EmploymentType.FULL_TIME, level: JobLevel.MID, salaryMin: 100000, salaryMax: 150000, isRemote: false },
    { companyId: companyProfile1.id, title: "Product Manager", description: "Lead product strategy and execution for our flagship product.", requirements: "3+ years in product management. Strong analytical and communication skills.", location: "Remote", category: "Product", employmentType: EmploymentType.FULL_TIME, level: JobLevel.MID, salaryMin: 110000, salaryMax: 160000, isRemote: true },
    { companyId: companyProfile2.id, title: "UI/UX Designer", description: "Create beautiful and intuitive user interfaces for our clients.", requirements: "Portfolio demonstrating strong UI/UX skills. Figma proficiency.", location: "New York, NY", category: "Design", employmentType: EmploymentType.FULL_TIME, level: JobLevel.MID, salaryMin: 80000, salaryMax: 120000, isRemote: true },
    { companyId: companyProfile2.id, title: "Junior Graphic Designer", description: "Start your career at a top design agency.", requirements: "Basic design skills. Proficiency in Adobe Creative Suite.", location: "New York, NY", category: "Design", employmentType: EmploymentType.FULL_TIME, level: JobLevel.JUNIOR, salaryMin: 45000, salaryMax: 65000, isRemote: false },
  ];

  const createdJobs = [];
  for (const job of jobs) {
    const slug = job.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const created = await prisma.jobOffer.create({
      data: { ...job, slug, status: JobStatus.PUBLISHED, publishedAt: new Date() },
    });
    createdJobs.push(created);
  }

  if (createdJobs.length > 0) {
    await prisma.application.create({
      data: {
        candidateId: candidateProfile.id,
        jobOfferId: createdJobs[0].id,
        status: ApplicationStatus.NEW,
        coverLetter: "I am very interested in this position and believe my skills are a great match.",
      },
    });
  }

  console.log("Seed complete!");
  console.log("Demo accounts:");
  console.log("  Admin:    admin@hireflow.com / admin123");
  console.log("  Candidate: jane@example.com / candidate123");
  console.log("  Company:  alex@techcorp.com / company123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
