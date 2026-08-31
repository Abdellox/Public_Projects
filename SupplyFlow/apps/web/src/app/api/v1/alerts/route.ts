import { errorResponse, jsonOk, requirePermission } from "@/lib/server/api";
import { computeAlerts } from "@supplyflow/database";

export async function GET(): Promise<Response> {
  try {
    const ctx = await requirePermission("products.read");
    const alerts = await computeAlerts(ctx.user.organizationId);
    return jsonOk({ data: alerts });
  } catch (err) {
    return errorResponse(err);
  }
}
