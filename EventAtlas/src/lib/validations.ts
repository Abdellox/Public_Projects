import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  shortDescription: z.string().min(10, "Short description required").max(300),
  fullDescription: z.string().min(20, "Full description required"),
  coverImage: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  countryId: z.string().min(1, "Country is required"),
  cityId: z.string().min(1, "City is required"),
  venueName: z.string().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.string().min(1, "End date is required"),
  endTime: z.string().min(1, "End time is required"),
  timeZone: z.string().default("UTC"),
  price: z.coerce.number().min(0).default(0),
  currency: z.string().default("USD"),
  isFree: z.boolean().default(true),
  ticketUrl: z.string().url().optional().or(z.literal("")),
  registrationUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  ageRequirement: z.string().optional(),
  accessibility: z.string().optional(),
  isIndoor: z.coerce.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
  preferredCountryId: z.string().optional(),
  preferredCityId: z.string().optional(),
});

export const organizerSchema = z.object({
  name: z.string().min(2, "Organizer name required").max(200),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  facebook: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const countrySchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().length(2),
  slug: z.string().min(1).max(100),
  emoji: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export const citySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  countryId: z.string().min(1),
});

export const reportSchema = z.object({
  reason: z.string().min(5, "Please describe the reason"),
  details: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type OrganizerInput = z.infer<typeof organizerSchema>;
