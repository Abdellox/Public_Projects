import type { FastifyInstance } from "fastify";
import { requireCtx } from "../context.js";
import { buildDashboard } from "../services/dashboard.js";

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get("/dashboard", async (request) => {
    const ctx = requireCtx(request);
    return buildDashboard(ctx);
  });
}
