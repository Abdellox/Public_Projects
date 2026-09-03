"use client";

export class ApiClientError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

type ApiInit = Omit<RequestInit, "body"> & { body?: unknown };

export async function api<T = unknown>(path: string, init: ApiInit = {}): Promise<T> {
  const { body, headers, ...rest } = init;
  const res = await fetch(`/api/v1${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const err =
      typeof payload === "object" && payload !== null
        ? (payload as { error?: string; message?: string; details?: unknown })
        : {};
    throw new ApiClientError(res.status, err.error ?? "REQUEST_FAILED", err.message ?? `Request failed (${res.status})`, err.details);
  }

  return payload as T;
}

export async function apiUpload<T = unknown>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (payload ?? {}) as { error?: string; message?: string };
    throw new ApiClientError(res.status, err.error ?? "UPLOAD_FAILED", err.message ?? `Upload failed (${res.status})`);
  }
  return payload as T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; pageSize: number; pageCount: number };
}
