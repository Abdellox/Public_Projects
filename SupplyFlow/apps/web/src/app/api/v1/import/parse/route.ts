import Papa from "papaparse";
import ExcelJS from "exceljs";
import { errorResponse, jsonOk, requirePermission } from "@/lib/server/api";

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  try {
    await requirePermission("products.write");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "Upload a CSV or XLSX file in the 'file' field" }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return Response.json({ error: "File exceeds the 8 MB limit" }, { status: 413 });
    }

    const name = file.name.toLowerCase();
    let headers: string[] = [];
    let rows: Record<string, string>[] = [];

    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const sheet = workbook.worksheets[0];
      if (!sheet) return Response.json({ error: "Workbook has no sheets" }, { status: 400 });

      let headerRowSeen = false;
      sheet.eachRow((row) => {
        const values = (row.values as unknown[]).slice(1).map((v) =>
          v === null || v === undefined ? "" : v instanceof Date ? v.toISOString().slice(0, 10) : String(v).trim()
        );
        if (!headerRowSeen) {
          headers = values.map((h, i) => h || `Column ${i + 1}`);
          headerRowSeen = true;
          return;
        }
        if (values.every((v) => v === "")) return;
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] ?? "";
        });
        rows.push(obj);
      });
    } else {
      const text = await file.text();
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim()
      });
      headers = parsed.meta.fields ?? [];
      rows = parsed.data.filter((r) => Object.values(r).some((v) => (v ?? "").trim() !== ""));
      if (parsed.errors.length > 0) {
        console.warn("[import] csv parse warnings:", parsed.errors.slice(0, 5));
      }
    }

    const MAX_ROWS = 2000;
    const totalRows = rows.length;
    if (totalRows > MAX_ROWS) rows = rows.slice(0, MAX_ROWS);

    return jsonOk({
      data: {
        filename: file.name,
        headers,
        rowCount: totalRows,
        truncated: totalRows > MAX_ROWS,
        maxRows: MAX_ROWS,
        preview: rows.slice(0, 50),
        rows
      }
    });
  } catch (err) {
    return errorResponse(err);
  }
}
