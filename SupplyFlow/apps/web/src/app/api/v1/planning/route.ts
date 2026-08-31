import { errorResponse, jsonOk, requirePermission } from "@/lib/server/api";
import { computePlanning, supplierScorecards } from "@supplyflow/database";

export async function GET(): Promise<Response> {
  try {
    const ctx = await requirePermission("planning.read");
    const [rows, suppliers] = await Promise.all([
      computePlanning(ctx.user.organizationId),
      supplierScorecards(ctx.user.organizationId)
    ]);
    return jsonOk({ data: { rows, suppliers } });
  } catch (err) {
    return errorResponse(err);
  }
}
