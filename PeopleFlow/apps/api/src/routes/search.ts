import type { FastifyInstance } from "fastify";
import { globalSearch } from "@peopleflow/search";
import { requireCtx } from "../context.js";

export async function searchRoutes(app: FastifyInstance): Promise<void> {
  app.get("/search", async (request) => {
    const ctx = requireCtx(request);
    const q = String((request.query as { q?: string }).q ?? "");
    return globalSearch(ctx.db, ctx.permissions, q);
  });
}
