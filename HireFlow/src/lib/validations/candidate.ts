import { z } from "zod";

export const candidateProfileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().max(1000).optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  skills: z.array(z.string()).default([]),
});

export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;

export const companyProfileSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  industry: z.string().optional(),
  employeeCount: z.string().optional(),
  foundedYear: z.number().min(1900).max(2100).optional(),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
