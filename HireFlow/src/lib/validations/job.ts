import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requirements: z.string().min(20, "Requirements must be at least 20 characters"),
  benefits: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "COMPANY", "INTERNSHIP", "FREELANCE"]),
  level: z.enum(["ENTRY", "JUNIOR", "MID", "SENIOR", "LEAD"]),
  isRemote: z.boolean().default(false),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  currency: z.string().default("USD"),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const searchJobSchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  employmentType: z.string().optional(),
  level: z.string().optional(),
  isRemote: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export type SearchJobInput = z.infer<typeof searchJobSchema>;
