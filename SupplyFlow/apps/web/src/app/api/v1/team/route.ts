import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, logAudit, schema } from "@supplyflow/database";
import { inviteMemberSchema, updateMemberRoleSchema } from "@supplyflow/validation";
import { hashPassword, generateTemporaryPassword } from "@supplyflow/auth";
import { hasPermission } from "@supplyflow/types";
import { auditCtx, errorResponse, jsonOk, requirePermission, HttpError } from "@/lib/server/api";

export async function GET(): Promise<Response> {
  try {
    const ctx = await requirePermission("products.read");
    const rows = await getDb().select({
      userId: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.memberships.role,
      joinedAt: schema.memberships.createdAt,
      lastLoginAt: schema.users.lastLoginAt
    }).from(schema.memberships)
      .innerJoin(schema.users, eq(schema.users.id, schema.memberships.userId))
      .where(eq(schema.memberships.organizationId, ctx.user.organizationId))
      .orderBy(desc(schema.memberships.createdAt));
    return jsonOk({ data: rows });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("members.manage");
    const parsed = inviteMemberSchema.parse(await request.json().catch(() => null));
    const db = getDb();

    let user = (await db.select().from(schema.users).where(eq(schema.users.email, parsed.email.toLowerCase())).limit(1))[0];
    let tempPassword: string | null = null;
    if (!user) {
      tempPassword = parsed.temporaryPassword || generateTemporaryPassword();
      const [created] = await db.insert(schema.users).values({
        email: parsed.email.toLowerCase(),
        name: parsed.name,
        passwordHash: hashPassword(tempPassword as string)
      }).returning();
      user = created;
    }

    const existingMembership = (await db.select().from(schema.memberships).where(and(
      eq(schema.memberships.organizationId, ctx.user.organizationId),
      eq(schema.memberships.userId, user.id)
    )).limit(1))[0];
    if (existingMembership) throw new HttpError(409, "This user is already a member of the organization");

    await db.insert(schema.memberships).values({
      organizationId: ctx.user.organizationId,
      userId: user.id,
      role: parsed.role
    });

    await logAuditSafe(ctx, "member.invited", { email: parsed.email, role: parsed.role });
    return jsonOk({ data: { userId: user.id, email: user.email, role: parsed.role, temporaryPassword: tempPassword } }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    const ctx = await requirePermission("members.manage");
    const body = await request.json().catch(() => null) as Record<string, unknown>;
    const parsed = updateMemberRoleSchema.extend({ userId: z.string().uuid() }).parse(body);

    if (!hasPermission(ctx.user.role, "org.manage") && ctx.user.role !== "owner") {
      throw new HttpError(403, "Only owners and admins can change roles");
    }
    if (parsed.userId === ctx.user.userId) throw new HttpError(400, "You cannot change your own role");

    const [row] = await getDb().update(schema.memberships).set({ role: parsed.role })
      .where(and(eq(schema.memberships.organizationId, ctx.user.organizationId), eq(schema.memberships.userId, parsed.userId)))
      .returning();
    if (!row) throw new HttpError(404, "Member not found");

    await logAuditSafe(ctx, "member.role_changed", { userId: parsed.userId, role: parsed.role });
    return jsonOk({ data: row });
  } catch (err) {
    return errorResponse(err);
  }
}

async function logAuditSafe(ctx: Awaited<ReturnType<typeof requirePermission>>, action: string, metadata: Record<string, unknown>) {
  await logAudit(auditCtx(ctx), action, undefined, undefined, metadata);
}
