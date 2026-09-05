import { NextRequest, NextResponse } from "next/server";
import { generateTestData } from "@/core/generator";
import { providers } from "@/core/providers";

/**
 * Simple in-memory rate limiter (per-process).
 * For production, replace with a distributed store like Redis.
 */
const rateLimit = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    return true;
  }
  return false;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const providerParam = searchParams.get("provider") ?? "";
  const scenario = searchParams.get("scenario") ?? "";

  const provider = providers.find((p) => p.id.toLowerCase() === providerParam.toLowerCase());

  const validProviders = providers.map((p) => p.id);

  if (providerParam && !provider) {
    return NextResponse.json(
      { error: `Unknown provider. Valid providers: ${validProviders.join(", ")}`, validProviders },
      { status: 400 },
    );
  }

  if (scenario && provider) {
    const valid = provider.scenarios.find((s) => s.id === scenario);
    if (!valid) {
      return NextResponse.json(
        {
          error: `Unknown scenario for provider '${provider.id}'.`,
          validScenarios: provider.scenarios.map((s) => s.id),
        },
        { status: 400 },
      );
    }
  }

  const data = generateTestData({
    provider: providerParam || undefined,
    scenario: scenario || undefined,
  });

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
