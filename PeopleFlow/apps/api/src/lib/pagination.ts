import { z } from "zod";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@peopleflow/types";

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type PageQuery = z.infer<typeof pageQuery>;

export function meta(total: number, query: PageQuery) {
  return {
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export function skipTake(query: PageQuery) {
  return { skip: (query.page - 1) * query.pageSize, take: query.pageSize };
}
