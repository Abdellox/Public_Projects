"use client";

import { createContext, useContext } from "react";
import type { MeResponse, MembershipSummary } from "@nexora/types";

interface OrgContextValue {
  me: MeResponse;
  /** Active membership (first active one for v1). */
  membership: MembershipSummary | null;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used inside AppShell");
  return ctx;
}

export function OrgProvider({
  value,
  children
}: {
  value: OrgContextValue;
  children: React.ReactNode;
}) {
  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}
