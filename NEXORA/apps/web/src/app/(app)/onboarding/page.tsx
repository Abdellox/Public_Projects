"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Department, JobTitle } from "@nexora/types";
import { useOrg } from "@/components/shell/org-context";
import { clientApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { Card, CardHeader, ErrorNote } from "@/components/ui/card";

function OnboardingInner() {
  const params = useSearchParams();
  const inviteToken = params.get("invite");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Set up your place</h1>
        <p className="mt-1 text-sm text-ink-500">
          NEXORA personalizes everything around your organizational identity.
        </p>
      </header>
      {inviteToken ? (
        <AcceptInviteCard token={inviteToken} />
      ) : (
        <NeedsOrgOrIdentity />
      )}
    </div>
  );
}

function NeedsOrgOrIdentity() {
  const router = useRouter();
  const { me, membership } = useOrg();
  if (!membership) return <CreateOrganizationCard onCreated={() => router.refresh()} />;
  return <IdentityWizard me={me} membershipId={membership.id} orgId={membership.organization.id} />;
}

function AcceptInviteCard({ token }: { token: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function accept() {
    setError(null);
    setPending(true);
    try {
      await clientApi("/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token })
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not accept the invitation");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader title="You have been invited" subtitle="Accept to join your organization" />
      <div className="space-y-4 p-5">
        <ErrorNote message={error ?? ""} />
        {done ? (
          <div className="space-y-3">
            <p className="text-sm text-emerald-600">Welcome aboard! Your invitation was accepted.</p>
            <Button onClick={() => router.push("/home")}>Go to your organization →</Button>
          </div>
        ) : (
          <Button onClick={() => void accept()} loading={pending}>
            Accept invitation
          </Button>
        )}
      </div>
    </Card>
  );
}

function CreateOrganizationCard({ onCreated }: { onCreated: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    try {
      await clientApi("/organizations", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          description: String(form.get("description") ?? "") || undefined
        })
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the organization");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Create your organization"
        subtitle="You will become its first owner"
      />
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        <ErrorNote message={error ?? ""} />
        <Field label="Organization name" htmlFor="org-name">
          <Input id="org-name" name="name" required placeholder="Acme Inc." autoFocus />
        </Field>
        <Field label="Description" htmlFor="org-desc">
          <Input id="org-desc" name="description" placeholder="What does this company do?" />
        </Field>
        <Button type="submit" loading={pending} className="w-full">
          Create organization
        </Button>
      </form>
    </Card>
  );
}

function IdentityWizard({
  me,
  membershipId,
  orgId
}: {
  me: ReturnType<typeof useOrg>["me"];
  membershipId: string;
  orgId: string;
}) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [titles, setTitles] = useState<JobTitle[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [jobTitleId, setJobTitleId] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  void me;

  useEffect(() => {
    void clientApi<Department[]>(`/organizations/${orgId}/departments`).then(setDepartments).catch(() => undefined);
    void clientApi<JobTitle[]>(`/organizations/${orgId}/job-titles`).then(setTitles).catch(() => undefined);
  }, [orgId]);

  async function finish() {
    setError(null);
    setPending(true);
    try {
      await clientApi(`/me/memberships/${membershipId}`, {
        method: "PATCH",
        body: JSON.stringify({ departmentId: departmentId || null })
      });
      if (jobTitleId) {
        await clientApi(`/me/memberships/${membershipId}`, {
          method: "PATCH",
          body: JSON.stringify({ jobTitleId })
        });
      }
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 30)
        .map((name) => ({ name, level: "intermediate" as const }));
      await clientApi(`/me/memberships/${membershipId}/skills`, {
        method: "PUT",
        body: JSON.stringify({ skills })
      });
      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your identity");
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Your organizational identity"
        subtitle="This determines what you see and who finds you"
      />
      <div className="space-y-4 p-5">
        <ErrorNote message={error ?? ""} />
        <Field label="Department" htmlFor="ob-dept">
          <Select id="ob-dept" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">Choose a department…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Job title" htmlFor="ob-title">
          <Select id="ob-title" value={jobTitleId} onChange={(e) => setJobTitleId(e.target.value)}>
            <option value="">Choose a job title…</option>
            {titles.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Skills"
          htmlFor="ob-skills"
          hint="Comma-separated — e.g. Python, PostgreSQL, APIs"
        >
          <Input
            id="ob-skills"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="Python, PostgreSQL, APIs"
          />
        </Field>
        <Button onClick={() => void finish()} loading={pending} className="w-full">
          Enter your organization →
        </Button>
      </div>
    </Card>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white" />}>
      <OnboardingInner />
    </Suspense>
  );
}
