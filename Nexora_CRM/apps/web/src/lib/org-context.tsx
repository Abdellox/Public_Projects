'use client';

import { createContext, useContext } from 'react';
import type { MembershipSummary, MeResponse } from '@nexora/types';

interface OrgContextValue {
  me: MeResponse;
  activeOrg: MembershipSummary;
  setActiveOrg: (organizationId: string) => void;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export const OrgProvider = OrgContext.Provider;

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used inside OrgProvider');
  return ctx;
}
