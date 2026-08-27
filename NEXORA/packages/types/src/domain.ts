import type { Permission, RoleKey } from "./permissions.js";

export type MembershipStatus = "active" | "invited" | "suspended";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  interests: string[];
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
}

export interface MembershipSummary {
  id: string;
  organization: OrganizationSummary;
  roleKey: RoleKey;
  roleName: string;
  departmentId: string | null;
  teamId: string | null;
  jobTitleId: string | null;
  status: MembershipStatus;
}

export interface MeResponse {
  user: PublicUser;
  memberships: MembershipSummary[];
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  memberCount: number;
  createdAt: string;
}

export interface Team {
  id: string;
  organizationId: string;
  departmentId: string;
  name: string;
  slug: string;
  description: string | null;
  memberCount: number;
  createdAt: string;
}

export interface JobTitle {
  id: string;
  organizationId: string;
  name: string;
}

export interface Skill {
  id: string;
  organizationId: string;
  name: string;
}

export type MemberSortField = "createdAt" | "name";

export interface MemberListItem {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  membershipId: string;
  roleKey: RoleKey;
  roleName: string;
  departmentId: string | null;
  departmentName: string | null;
  teamId: string | null;
  teamName: string | null;
  jobTitleId: string | null;
  jobTitleName: string | null;
  skills: string[];
  status: MembershipStatus;
  joinedAt: string;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  roleName: string;
  invitedBy: string;
  invitedByName: string;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  organizationId: string | null;
  actorUserId: string | null;
  actorName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  createdAt: string;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface OrganizationOverview {
  organization: OrganizationSummary & { createdAt: string };
  myMembership: {
    id: string;
    roleKey: RoleKey;
    permissions: Permission[];
    departmentId: string | null;
    teamId: string | null;
    jobTitleId: string | null;
  };
  stats: {
    members: number;
    departments: number;
    teams: number;
    jobTitles: number;
    skills: number;
  };
  departments: Department[];
  recentMembers: Array<Pick<MemberListItem, "userId" | "name" | "avatarUrl" | "jobTitleName" | "departmentName"> & { joinedAt: string }>;
}
