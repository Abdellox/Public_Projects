/** Shared API contract types used by both apps/api and apps/web. */

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function paginate<T>(data: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}
