import type { FastifyInstance } from "fastify";
import {
  buildMessages,
  buildSystemPrompt,
  createAiProvider,
  detectPromptInjection,
  sanitizeRetrievedContent,
} from "@peopleflow/ai";
import { aiChatSchema } from "@peopleflow/validation";
import { ApiError } from "../lib/errors.js";
import { requireCtx } from "../context.js";
import { audit } from "../services/audit.js";

export function registerAiRoutes(app: FastifyInstance, provider: ReturnType<typeof createAiProvider>): void {
  app.get("/ai/status", async () => ({
    available: provider.isAvailable(),
    provider: provider.name,
    model: provider.model,
  }));

  app.post(
    "/ai/chat",
    { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
    async (request) => {
      const ctx = requireCtx(request);
      if (!provider.isAvailable()) {
        throw new ApiError(
          503,
          "AI_NOT_CONFIGURED",
          "The AI assistant is not configured on this instance. Set AI_PROVIDER and AI_API_KEY.",
        );
      }
      const input = aiChatSchema.parse(request.body);

      for (const message of input.messages) {
        if (detectPromptInjection(message.content)) {
          await audit({
            organizationId: ctx.organizationId,
            actorId: ctx.userId,
            actorName: ctx.name,
            action: "ai.injection_attempt_blocked",
            metadata: { preview: message.content.slice(0, 120) },
          });
          throw new ApiError(400, "PROMPT_REJECTED", "Your message was blocked by content guardrails.");
        }
      }

      const dataBlocks = await buildAuthorizedContext(ctx);

      try {
        const result = await provider.chat(
          buildMessages(buildSystemPrompt(ctx.organizationName), input.messages, dataBlocks),
          { temperature: 0.2, maxTokens: 800 },
        );

        await audit({
          organizationId: ctx.organizationId,
          actorId: ctx.userId,
          actorName: ctx.name,
          action: "ai.chat",
          metadata: { messages: input.messages.length },
        });

        return {
          reply: result.content,
          provider: result.provider,
          model: result.model,
          contextSources: dataBlocks.length,
        };
      } catch (e) {
        if (e instanceof ApiError) throw e;
        app.log.error({ err: e }, "AI provider call failed");
        throw new ApiError(502, "AI_UPSTREAM_ERROR", "The AI provider could not be reached. Try again later.");
      }
    },
  );
}

/**
 * Retrieval is strictly scoped to what the requesting user may see.
 * The AI never receives a query channel to the database — only these blocks.
 */
async function buildAuthorizedContext(ctx: import("../context.js").RequestContext): Promise<string[]> {
  const blocks: string[] = [];
  const db = ctx.db;

  const balances = ctx.employeeId
    ? await db.leaveBalance.findMany({
        where: { employeeId: ctx.employeeId, year: new Date().getUTCFullYear() },
        include: { leaveType: { select: { name: true } } },
      })
    : [];

  blocks.push(
    sanitizeRetrievedContent(
      "my-leave-balances",
      JSON.stringify(
        balances.map((b) => ({
          type: b.leaveType.name,
          entitled: b.entitled + b.carriedOver,
          used: b.used,
          pending: b.pending,
          remaining: b.entitled + b.carriedOver - b.used - b.pending,
        })),
      ),
    ).text,
  );

  if (ctx.employeeId) {
    const myLeave = await db.leaveRequest.findMany({
      where: { employeeId: ctx.employeeId, status: { in: ["PENDING", "APPROVED"] }, endDate: { gte: new Date() } },
      take: 10,
      select: { startDate: true, endDate: true, days: true, status: true },
    });
    blocks.push(sanitizeRetrievedContent("my-upcoming-leave", JSON.stringify(myLeave)).text);
  }

  const myTasks = ctx.employeeId
    ? await db.task.findMany({
        where: { assigneeEmployeeId: ctx.employeeId, status: { in: ["TODO", "IN_PROGRESS"] } },
        take: 15,
        select: { title: true, dueDate: true, priority: true },
      })
    : [];
  blocks.push(sanitizeRetrievedContent("my-tasks", JSON.stringify(myTasks)).text);

  const permissions = [...ctx.permissions];
  blocks.push(
    sanitizeRetrievedContent("caller-role", JSON.stringify({ role: ctx.roleName, permissions })).text,
  );

  if (permissions.includes("leave.viewAll")) {
    const pendingCount = await db.leaveRequest.count({ where: { status: "PENDING" } });
    blocks.push(sanitizeRetrievedContent("org-pending-approvals", JSON.stringify({ pendingLeaveRequests: pendingCount })).text);
  }

  if (permissions.includes("document.viewAll")) {
    const cutoff = new Date(Date.now() + 30 * 864e5);
    const expiring = await db.document.findMany({
      where: { expiresAt: { lte: cutoff, gte: new Date() }, archivedAt: null },
      take: 20,
      select: { title: true, expiresAt: true },
    });
    blocks.push(sanitizeRetrievedContent("documents-expiring-30d", JSON.stringify(expiring)).text);
  }

  if (permissions.includes("recruitment.manage")) {
    const pipeline = await db.application.groupBy({ by: ["stage"], _count: true });
    blocks.push(sanitizeRetrievedContent("recruitment-pipeline", JSON.stringify(pipeline.map((p) => ({ stage: p.stage, count: p._count })))).text);
  }

  if (permissions.includes("report.view")) {
    const [headcount] = await Promise.all([db.employee.count({ where: { terminationDate: null } })]);
    blocks.push(sanitizeRetrievedContent("headcount", JSON.stringify({ headcount })).text);
  }

  return blocks;
}
