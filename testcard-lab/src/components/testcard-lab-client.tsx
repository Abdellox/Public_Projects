"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Copy,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { getAllProviders, getScenariosForProvider } from "@/core/providers";
import { generateTestData } from "@/core/generator";
import type { GeneratedTestData } from "@/core/types";
import { toJson } from "@/core/exporters";
import { ProviderSelector } from "./provider-selector";
import { ScenarioSelector } from "./scenario-selector";
import { ResultCard } from "./result-card";
import { DeveloperTools } from "./developer-tools";
import { useClipboard } from "@/hooks/use-clipboard";
import { cn } from "@/lib/cn";

export function TestCardLabClient() {
  const [providerId, setProviderId] = useState("stripe");
  const [scenarioId, setScenarioId] = useState<string | undefined>(undefined);
  const [data, setData] = useState<GeneratedTestData>(() =>
    generateTestData({ provider: "stripe" }),
  );
  const { copy, feedback } = useClipboard();

  const providers = useMemo(() => getAllProviders(), []);
  const scenarios = useMemo(
    () => getScenariosForProvider(providerId),
    [providerId],
  );

  const activeProvider = providers.find((p) => p.id === providerId)!;

  const handleProviderChange = (id: string) => {
    setProviderId(id);
    const firstScenario = getScenariosForProvider(id)[0];
    setScenarioId(firstScenario?.id);
    setData(generateTestData({ provider: id, scenario: firstScenario?.id }));
  };

  const handleScenarioChange = (id: string) => {
    setScenarioId(id);
    setData(generateTestData({ provider: providerId, scenario: id }));
  };

  const regenerate = () => {
    setData(generateTestData({ provider: providerId, scenario: scenarioId }));
  };

  const fixtureJson = toJson(data);
  const copiedAll = feedback.state === "success" && feedback.value === fixtureJson;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      {/* Safety banner */}
      <div className="mb-6 flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          SANDBOX / TEST ONLY
        </div>
        <p className="text-xs text-amber-200/80">
          All data is generated for use with official payment-provider sandboxes
          only. This tool never connects to real payment networks and never
          generates numbers intended to bypass real verification.
        </p>
      </div>

      {/* Hero / description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
          TestCard Lab
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Generate official sandbox test data for ecommerce payment developers.
          Every card value shown comes from provider documentation — nothing is
          invented. Designed to simulate checkout flows in development, QA, and CI.
        </p>
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column: controls */}
        <div className="space-y-6 lg:col-span-4">
          <ProviderSelector
            providers={providers}
            selected={providerId}
            onSelect={handleProviderChange}
          />

          <ScenarioSelector
            scenarios={scenarios}
            selected={scenarioId ?? activeProvider.scenarios[0].id}
            onSelect={handleScenarioChange}
          />

          {/* Generate + copy all */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={regenerate}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              <RefreshCw className="h-4 w-4" />
              Generate
            </button>
            <button
              type="button"
              onClick={() => copy(fixtureJson)}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-700",
                copiedAll && "border-emerald-500/40 text-emerald-300",
              )}
            >
              {copiedAll ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedAll ? "Copied full fixture" : "Copy full fixture"}
            </button>
          </div>
        </div>

        {/* Right column: results */}
        <div className="space-y-6 lg:col-span-8">
          <ResultCard data={data} outcome={getOutcome(data.scenario)} />
          <DeveloperTools data={data} />
        </div>
      </div>
    </div>
  );
}

function getOutcome(
  scenario: string,
): "success" | "declined" | "warning" | "info" {
  const provider = getAllProviders().find((p) =>
    p.scenarios.some((s) => s.id === scenario),
  );
  return provider?.scenarios.find((s) => s.id === scenario)?.outcome ?? "info";
}
