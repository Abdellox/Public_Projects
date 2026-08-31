import { errorResponse, jsonOk, requirePermission } from "@/lib/server/api";
import { computeDashboard, computeAlerts, supplierScorecards } from "@supplyflow/database";

export async function GET(): Promise<Response> {
  try {
    const ctx = await requirePermission("reports.read");
    const [dashboard, alerts, suppliers] = await Promise.all([
      computeDashboard(ctx.user.organizationId),
      computeAlerts(ctx.user.organizationId),
      supplierScorecards(ctx.user.organizationId)
    ]);
    return jsonOk({ data: { ...dashboard, alerts: alerts.slice(0, 8), suppliers: suppliers.slice(0, 5) } });
  } catch (err) {
    return errorResponse(err);
  }
}
