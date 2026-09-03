import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/services/jobOfferService";
import { searchJobSchema } from "@/lib/validations/job";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const params: Record<string, string> = {};
  searchParams.forEach((v, k) => { params[k] = v; });

  const parsed = searchJobSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }

  const results = await searchJobs(parsed.data);
  return NextResponse.json(results);
}
