'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormError,
  Spinner,
} from '@nexora/ui';
import { apiDelete, apiGet } from '@/lib/api';
import { useOrg } from '@/lib/org-context';
import { InviteForm } from './invite-form';

interface RoleRow {
  id: string;
  key: string;
  name: string;
}
interface MemberRow {
  membershipId: string;
  status: 'active' | 'suspended';
  user: { id: string; name: string; email: string };
  role: { id: string; key: string; name: string };
}
interface InvitationRow {
  id: string;
  email: string;
  roleName: string;
  expiresAt: string;
}

export default function TeamPage() {
  const { activeOrg, me } = useOrg();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManage = activeOrg.roleKey === 'owner' || activeOrg.roleKey === 'admin';
  const base = `/v1/organizations/${activeOrg.organizationId}`;

  const reload = useCallback(async () => {
    try {
      const memberRes = await apiGet<{ members: MemberRow[] }>(`${base}/members`);
      setMembers(memberRes.members);
      if (canManage) {
        const [roleRes, invRes] = await Promise.all([
          apiGet<{ roles: RoleRow[] }>(`${base}/roles`),
          apiGet<{ invitations: InvitationRow[] }>(`${base}/invitations`),
        ]);
        setRoles(roleRes.roles.filter((r) => r.key !== 'owner'));
        setInvitations(invRes.invitations);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, [base, canManage]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (loading) {
    return (
      <div className="flex justify-center pt-16">
        <Spinner className="h-8 w-8 text-brand-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
      <p className="mt-1 text-sm text-neutral-500">
        People in {activeOrg.organizationName}.
      </p>

      <FormError message={error} />

      <div className="mt-6 space-y-6">
        {canManage ? (
          roles.length > 0 ? (
            <Card>
              <CardBody>
                <InviteForm base={base} roles={roles} onDone={reload} />
                <p className="mt-3 text-xs text-neutral-400">
                  Email delivery is not wired up yet — share the generated link
                  yourself.
                </p>
              </CardBody>
            </Card>
          ) : null
        ) : null}

        <Card>
          <CardHeader title={`Members (${members.length})`} />
          <CardBody className="px-0 py-0">
            <ul className="divide-y divide-neutral-100">
              {members.map((member) => (
                <li key={member.membershipId} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar name={member.user.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">
                      {member.user.name}
                      {member.user.id === me.user.id ? (
                        <span className="ml-1.5 text-xs text-neutral-400">(you)</span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-neutral-500">{member.user.email}</p>
                  </div>
                  <Badge tone={member.role.key === 'owner' ? 'brand' : 'neutral'}>
                    {member.role.name}
                  </Badge>
                  <Badge tone={member.status === 'active' ? 'green' : 'red'}>
                    {member.status}
                  </Badge>
                  {canManage && member.role.key !== 'owner' ? (
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-xs hover:bg-red-50 hover:text-red-700"
                      onClick={() =>
                        void apiDelete(`${base}/members/${member.membershipId}`).then(reload)
                      }
                    >
                      Remove
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {canManage && invitations.length > 0 ? (
          <Card>
            <CardHeader title={`Pending invitations (${invitations.length})`} />
            <CardBody className="px-0 py-0">
              <ul className="divide-y divide-neutral-100">
                {invitations.map((invitation) => (
                  <li key={invitation.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {invitation.email}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {invitation.roleName} · expires{' '}
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() =>
                        void apiDelete(`${base}/invitations/${invitation.id}`).then(reload)
                      }
                    >
                      Revoke
                    </Button>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
