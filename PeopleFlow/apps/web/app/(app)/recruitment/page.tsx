"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/components/session-provider";
import { Badge, Button, Card, CardHeader, EmptyState, ErrorBanner, Field, Input, Modal, Select, Spinner, Table, Textarea } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

const STAGES = ["APPLIED", "SCREENING", "INTERVIEW", "FINAL_INTERVIEW", "OFFER", "HIRED", "REJECTED"] as const;

interface Job {
  id: string;
  title: string;
  status: string;
  department?: { name: string } | null;
  location?: { name: string } | null;
  _count?: { applications: number };
}

interface PipelineApp {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  appliedAt: string;
  rating?: number | null;
}

interface Pipeline {
  stage: string;
  applications: PipelineApp[];
}

export default function RecruitmentPage() {
  const { can } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pipeline, setPipeline] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobOpen, setJobOpen] = useState(false);
  const [candidateOpen, setCandidateOpen] = useState(false);
  const [jobForm, setJobForm] = useState({ title: "", description: "", remote: "false" });
  const [candForm, setCandForm] = useState({ firstName: "", lastName: "", email: "", phone: "", jobId: "" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const [j, a] = await Promise.all([
        api<{ data: Job[] }>("/jobs"),
        api<{ data: unknown; pipeline: Pipeline[] }>("/applications"),
      ]);
      setJobs(j.data);
      setPipeline(a.pipeline);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recruiting data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createJob() {
    setSubmitting(true);
    setError(null);
    try {
      await api("/jobs", { method: "POST", body: { title: jobForm.title, description: jobForm.description || undefined, remote: jobForm.remote === "true" } });
      setJobOpen(false);
      setJobForm({ title: "", description: "", remote: "false" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create job");
    } finally {
      setSubmitting(false);
    }
  }

  async function createCandidate() {
    setSubmitting(true);
    setError(null);
    try {
      const c = await api<{ id: string }>("/candidates", {
        method: "POST",
        body: { firstName: candForm.firstName, lastName: candForm.lastName, email: candForm.email, phone: candForm.phone || undefined },
      });
      if (candForm.jobId) {
        await api("/applications", { method: "POST", body: { jobId: candForm.jobId, candidateId: c.id, stage: "APPLIED" } });
      }
      setCandidateOpen(false);
      setCandForm({ firstName: "", lastName: "", email: "", phone: "", jobId: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add candidate");
    } finally {
      setSubmitting(false);
    }
  }

  async function move(id: string, stage: string) {
    try {
      await api(`/applications/${id}/move`, { method: "POST", body: { stage } });
      await load();
    } catch {
      /* ignore */
    }
  }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (error) return <EmptyState title="Could not load recruiting" description={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Recruiting</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Jobs, candidates and your hiring pipeline.</p>
        </div>
        {can("recruitment.manage") && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setCandidateOpen(true)}>Add candidate</Button>
            <Button onClick={() => setJobOpen(true)}>New job</Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Open roles" />
          {jobs.length === 0 ? (
            <EmptyState title="No jobs yet" />
          ) : (
            <ul className="divide-y divide-zinc-50">
              {jobs.map((j) => (
                <li key={j.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{j.title}</p>
                    <p className="text-xs text-zinc-400">{j.department?.name ?? ""}{j._count ? ` · ${j._count.applications} applications` : ""}</p>
                  </div>
                  <Badge tone={j.status === "OPEN" ? "green" : "gray"}>{j.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Pipeline" />
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {pipeline.map((col) => (
              <div key={col.stage} className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{col.stage.replace(/_/g, " ")}</p>
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">{col.applications.length}</span>
                </div>
                <div className="space-y-2">
                  {col.applications.length === 0 ? (
                    <p className="py-3 text-center text-xs text-zinc-400">Empty</p>
                  ) : (
                    col.applications.map((a) => (
                      <div key={a.id} className="rounded-lg border border-zinc-200 bg-white p-2.5 shadow-sm">
                        <p className="text-xs font-medium text-zinc-800">{a.candidateName}</p>
                        <p className="text-[11px] text-zinc-400">{a.jobTitle}</p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400">{formatDateTime(a.appliedAt)}</span>
                          {col.stage !== "HIRED" && col.stage !== "REJECTED" && (
                            <select
                              value={col.stage}
                              onChange={(e) => void move(a.id, e.target.value)}
                              className="rounded border border-zinc-200 text-[10px] px-1 py-0.5 text-zinc-600"
                            >
                              {STAGES.map((s) => (
                                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={jobOpen} onClose={() => setJobOpen(false)} title="New job opening">
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <Field label="Title">
            <Input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} placeholder="Senior Backend Engineer" />
          </Field>
          <Field label="Description">
            <Textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} />
          </Field>
          <Field label="Remote">
            <Select value={jobForm.remote} onChange={(e) => setJobForm({ ...jobForm, remote: e.target.value })}>
              <option value="false">On-site</option>
              <option value="true">Remote</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setJobOpen(false)}>Cancel</Button>
            <Button onClick={() => void createJob()} loading={submitting}>Create job</Button>
          </div>
        </div>
      </Modal>

      <Modal open={candidateOpen} onClose={() => setCandidateOpen(false)} title="Add candidate" wide>
        <div className="space-y-4">
          <ErrorBanner message={error} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <Input value={candForm.firstName} onChange={(e) => setCandForm({ ...candForm, firstName: e.target.value })} />
            </Field>
            <Field label="Last name">
              <Input value={candForm.lastName} onChange={(e) => setCandForm({ ...candForm, lastName: e.target.value })} />
            </Field>
          </div>
          <Field label="Email">
            <Input type="email" value={candForm.email} onChange={(e) => setCandForm({ ...candForm, email: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <Input value={candForm.phone} onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })} />
            </Field>
            <Field label="Apply to role">
              <Select value={candForm.jobId} onChange={(e) => setCandForm({ ...candForm, jobId: e.target.value })}>
                <option value="">Just add candidate</option>
                {jobs.filter((j) => j.status === "OPEN").map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCandidateOpen(false)}>Cancel</Button>
            <Button onClick={() => void createCandidate()} loading={submitting}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
