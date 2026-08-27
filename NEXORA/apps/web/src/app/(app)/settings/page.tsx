"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Department, JobTitle } from "@nexora/types";
import { useOrg } from "@/components/shell/org-context";
import { clientApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { Card, CardHeader, EmptyState, ErrorNote } from "@/components/ui/card";
import { XIcon } from "@/components/icons";

interface SkillDraft {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
}

export default function SettingsPage() {
  const { me, membership } = useOrg();
  const orgId = membership?.organization.id;

  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [placementMsg, setPlacementMsg] = useState<string | null>(null);
  const [skillsMsg, setSkillsMsg] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [titles, setTitles] = useState<JobTitle[]>([]);

  const [departmentId, setDepartmentId] = useState(membership?.departmentId ?? "");
  const [teamId, setTeamId] = useState(membership?.teamId ?? "");
  const [jobTitleId, setJobTitleId] = useState(membership?.jobTitleId ?? "");
  const [teams, setTeams] = useState<Array<{ id: string; name: string; departmentId: string }>>([]);
  const [skillList, setSkillList] = useState<SkillDraft[]>([]);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (!orgId) return;
    void clientApi<Department[]>(`/organizations/${orgId}/departments`).then(setDepartments).catch(() => undefined);
    void clientApi<JobTitle[]>(`/organizations/${orgId}/job-titles`).then(setTitles).catch(() => undefined);
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    void clientApi<Array<{ id: string; name: string; departmentId: string }>>(
      `/organizations/${orgId}/teams`
    )
      .then((rows) =>
        setTeams(rows.map((t) => ({ id: t.id, name: t.name, departmentId: t.departmentId })))
      )
      .catch(() => undefined);
  }, [orgId]);

  // Load the caller's current placement details and skills.
  useEffect(() => {
    if (!membership) return;
    let cancelled = false;
    void clientApi<{
      departmentId: string | null;
      teamId: string | null;
      jobTitleId: string | null;
      skills: SkillDraft[];
    }>(`/me/memberships/${membership.id}`)
      .then((detail) => {
        if (cancelled) return;
        setDepartmentId(detail.departmentId ?? "");
        setTeamId(detail.teamId ?? "");
        setJobTitleId(detail.jobTitleId ?? "");
        setSkillList(detail.skills);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [membership]);

  const teamOptions = useMemo(
    () => teams.filter((t) => (departmentId ? t.departmentId === departmentId : true)),
    [teams, departmentId]
  );

  if (!membership) return <EmptyState title="Join an organization first" />;

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileMsg(null);
    const form = new FormData(e.currentTarget);
    try {
      await clientApi("/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          bio: String(form.get("bio") ?? "") || null,
          interests: String(form.get("interests") ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        })
      });
      setProfileMsg("Profile saved.");
    } catch (err) {
      setProfileMsg(err instanceof ApiError ? err.message : "Could not save profile");
    }
  }

  async function savePlacement() {
    setPlacementMsg(null);
    try {
      await clientApi(`/me/memberships/${membership?.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          departmentId: departmentId || null,
          teamId: teamId || null,
          jobTitleId: jobTitleId || null
        })
      });
      setPlacementMsg("Placement saved. Refresh to see it everywhere.");
    } catch (err) {
      setPlacementMsg(err instanceof ApiError ? err.message : "Could not save placement");
    }
  }

  function addSkill() {
    const name = skillInput.trim();
    if (!name) return;
    setSkillList((prev) =>
      prev.some((s) => s.name.toLowerCase() === name.toLowerCase())
        ? prev
        : [...prev, { name, level: "intermediate" }]
    );
    setSkillInput("");
  }

  async function saveSkills() {
    setSkillsMsg(null);
    try {
      await clientApi(`/me/memberships/${membership?.id}/skills`, {
        method: "PUT",
        body: JSON.stringify({ skills: skillList })
      });
      setSkillsMsg("Skills saved.");
    } catch (err) {
      setSkillsMsg(err instanceof ApiError ? err.message : "Could not save skills");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Your profile and your place in the organization.</p>
      </header>

      <Card>
        <CardHeader title="Profile" subtitle="How colleagues see you" />
        <form onSubmit={saveProfile} className="space-y-4 p-5">
          <Field label="Full name" htmlFor="s-name">
            <Input id="s-name" name="name" defaultValue={me.user.name} required />
          </Field>
          <Field label="Bio" htmlFor="s-bio">
            <Textarea id="s-bio" name="bio" defaultValue={me.user.bio ?? ""} rows={3} />
          </Field>
          <Field label="Interests" htmlFor="s-interests" hint="Comma-separated, up to 20.">
            <Input id="s-interests" name="interests" defaultValue={me.user.interests.join(", ")} />
          </Field>
          {profileMsg ? (
            <p className={profileMsg.includes("saved") ? "text-xs text-emerald-600" : "text-xs text-red-600"}>
              {profileMsg}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" size="sm">
              Save profile
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Organizational placement" subtitle="Department, team and job title" />
        <div className="space-y-4 p-5">
          <Field label="Department" htmlFor="s-dept">
            <Select
              id="s-dept"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setTeamId("");
              }}
            >
              <option value="">— None —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Team" htmlFor="s-team">
            <Select id="s-team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">— None —</option>
              {teamOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Job title" htmlFor="s-title">
            <Select id="s-title" value={jobTitleId} onChange={(e) => setJobTitleId(e.target.value)}>
              <option value="">— None —</option>
              {titles.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
          {placementMsg ? (
            <p className={placementMsg.includes("saved") ? "text-xs text-emerald-600" : "text-xs text-red-600"}>
              {placementMsg}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button size="sm" onClick={() => void savePlacement()}>
              Save placement
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Skills & expertise"
          subtitle="Colleagues discover you through these"
        />
        <div className="space-y-4 p-5">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="e.g. PostgreSQL"
              aria-label="Add a skill"
            />
            <Button type="button" variant="secondary" onClick={addSkill}>
              Add
            </Button>
          </div>

          <ul className="flex flex-wrap gap-2">
            {skillList.map((s) => (
              <li
                key={s.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 py-1 pl-3 pr-1 text-[13px]"
              >
                <span className="font-medium">{s.name}</span>
                <select
                  aria-label={`Level for ${s.name}`}
                  value={s.level}
                  onChange={(e) =>
                    setSkillList((prev) =>
                      prev.map((x) =>
                        x.name === s.name ? { ...x, level: e.target.value as SkillDraft["level"] } : x
                      )
                    )
                  }
                  className="bg-transparent text-xs capitalize outline-none"
                >
                  {["beginner", "intermediate", "advanced", "expert"].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setSkillList((prev) => prev.filter((x) => x.name !== s.name))}
                  aria-label={`Remove ${s.name}`}
                  className="rounded-full p-0.5 text-ink-400 hover:bg-ink-200 hover:text-ink-700"
                >
                  <XIcon width={12} height={12} />
                </button>
              </li>
            ))}
          </ul>

          <ErrorNote message={skillsMsg && !skillsMsg.includes("saved") ? skillsMsg : ""} />
          {skillsMsg?.includes("saved") ? (
            <p className="text-xs text-emerald-600">{skillsMsg}</p>
          ) : null}

          <div className="flex justify-end">
            <Button size="sm" onClick={() => void saveSkills()}>
              Save skills
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
