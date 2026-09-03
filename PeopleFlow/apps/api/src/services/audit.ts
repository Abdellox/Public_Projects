import { prisma } from "@peopleflow/database";

export interface AuditInput {
  organizationId?: string | null;
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}

/**
 * Audit entries are append-only facts. Actor ids/names are denormalized so the
 * trail survives account deletion. Never log secrets or full document contents.
 */
export async function audit(input: AuditInput): Promise<void> {
  await prisma.auditLog
    .create({
      data: {
        organizationId: input.organizationId ?? null,
        actorId: input.actorId ?? null,
        actorName: input.actorName ?? null,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        metadata: (input.metadata ?? undefined) as never,
        ip: input.ip ?? null,
      },
    })
    .catch(() => undefined);
}
