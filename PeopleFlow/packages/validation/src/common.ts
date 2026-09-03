import { z } from "zod";

/** ISO date string: yyyy-mm-dd (normalized server-side to UTC midnight). */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be an ISO date string (yyyy-mm-dd)");

export const isoDateTime = z.string().datetime({ offset: true });

export const uuid = z.string().uuid();

export const idParam = z.object({ id: uuid });

/** Shared pagination query parameters. */
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchQuery = paginationQuery.extend({
  q: z.string().trim().max(200).optional(),
});

export function dateStringToUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function toDateOrThrow(value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${value}`);
  return d;
}

const phone = z
  .string()
  .trim()
  .max(32)
  .regex(/^[+()\-\s\d]+$/, "Invalid phone number")
  .optional();

const url = z.string().trim().url().max(2048).optional();

export { phone, url };
