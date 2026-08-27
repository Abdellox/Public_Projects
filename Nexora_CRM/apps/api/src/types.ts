import type { MembershipSummary } from '@nexora/types';

export interface SessionContext {
  sessionId: string;
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  jobTitle: string | null;
}

export interface OrganizationContext {
  organizationId: string;
  organizationSlug: string;
  membershipId: string;
  roleId: string;
  roleKey: string;
  permissions: Set<string>;
}

export type AppEnv = {
  Variables: {
    session?: SessionContext;
    org?: OrganizationContext;
    membershipSummaries?: MembershipSummary[];
  };
};
