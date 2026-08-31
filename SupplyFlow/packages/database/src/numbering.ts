import { and, desc, eq, like } from "drizzle-orm";
import { getDb, schema } from "./index";

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];
type Executor = ReturnType<typeof getDb> | Tx;

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

export async function nextNumber(executor: Executor, kind: "PO" | "SO" | "ASN" | "OS" | "TR" | "ADJ", organizationId: string): Promise<string> {
  const year = new Date().getUTCFullYear();
  const prefix = `${kind}-${year}-`;

  const last = async (): Promise<string | undefined> => {
    switch (kind) {
      case "PO":
        return (await executor.select({ n: schema.purchaseOrders.number }).from(schema.purchaseOrders).where(and(eq(schema.purchaseOrders.organizationId, organizationId), like(schema.purchaseOrders.number, `${prefix}%`))).orderBy(desc(schema.purchaseOrders.number)).limit(1))[0]?.n;
      case "SO":
        return (await executor.select({ n: schema.customerOrders.number }).from(schema.customerOrders).where(and(eq(schema.customerOrders.organizationId, organizationId), like(schema.customerOrders.number, `${prefix}%`))).orderBy(desc(schema.customerOrders.number)).limit(1))[0]?.n;
      case "ASN":
        return (await executor.select({ n: schema.inboundShipments.number }).from(schema.inboundShipments).where(and(eq(schema.inboundShipments.organizationId, organizationId), like(schema.inboundShipments.number, `${prefix}%`))).orderBy(desc(schema.inboundShipments.number)).limit(1))[0]?.n;
      case "OS":
        return (await executor.select({ n: schema.outboundShipments.number }).from(schema.outboundShipments).where(and(eq(schema.outboundShipments.organizationId, organizationId), like(schema.outboundShipments.number, `${prefix}%`))).orderBy(desc(schema.outboundShipments.number)).limit(1))[0]?.n;
      case "TR":
        return (await executor.select({ n: schema.transfers.number }).from(schema.transfers).where(and(eq(schema.transfers.organizationId, organizationId), like(schema.transfers.number, `${prefix}%`))).orderBy(desc(schema.transfers.number)).limit(1))[0]?.n;
      default:
        return undefined;
    }
  };

  const current = await last();
  const seq = current ? parseInt(current.split("-").pop() ?? "0", 10) : 0;
  return `${prefix}${pad(seq + 1)}`;
}
