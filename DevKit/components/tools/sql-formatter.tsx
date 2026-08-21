"use client";

import { Database, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { format, type SqlLanguage } from "sql-formatter";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const LANGUAGES: Array<{ value: SqlLanguage; label: string }> = [
  { value: "sql", label: "Standard SQL" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "mariadb", label: "MariaDB" },
  { value: "sqlite", label: "SQLite" },
  { value: "transactsql", label: "SQL Server (T-SQL)" },
  { value: "bigquery", label: "BigQuery" },
];

const SAMPLE = `select u.id, u.name, count(o.id) as order_count from users u left join orders o on o.user_id = u.id where u.created_at > '2024-01-01' group by u.id, u.name having count(o.id) > 5 order by order_count desc limit 20;`;

export default function SqlFormatter() {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<SqlLanguage>("sql");
  const [keywordCase, setKeywordCase] = useState<"upper" | "lower" | "preserve">("upper");
  const [tabWidth, setTabWidth] = useState("2");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null as string | null };
    try {
      const result = format(input, {
        language,
        keywordCase,
        tabWidth: Number(tabWidth),
      });
      return { output: result, error: null as string | null };
    } catch (e) {
      return {
        output: "",
        error: e instanceof Error ? e.message : "Could not parse this SQL.",
      };
    }
  }, [input, language, keywordCase, tabWidth]);

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Dialect</Label>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SqlLanguage)}
            aria-label="SQL dialect"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Keywords</Label>
          <Select
            value={keywordCase}
            onChange={(e) => setKeywordCase(e.target.value as typeof keywordCase)}
            aria-label="Keyword case"
          >
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
            <option value="preserve">preserve</option>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Indent</Label>
          <Select value={tabWidth} onChange={(e) => setTabWidth(e.target.value)} aria-label="Indent width">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="8">8 spaces</option>
          </Select>
        </div>
        <Button size="sm" variant="secondary" className="mb-0.5" onClick={() => setInput(SAMPLE)}>
          <Wand2 className="size-3.5" /> Sample query
        </Button>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="flex flex-col gap-3">
          <Label>Your SQL</Label>
          <Textarea
            rows={16}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SELECT * FROM users WHERE id = 1;"
            aria-label="SQL input"
          />
          {error && <ErrorText>{error}</ErrorText>}
        </Panel>
        <Panel className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>Formatted</Label>
            <CopyButton value={output} />
          </div>
          {output ? (
            <pre className="max-h-[420px] grow overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-sm leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {output}
            </pre>
          ) : (
            <div className="flex max-h-[420px] grow flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700">
              <Database className="size-8 opacity-50" />
              Pretty SQL appears here
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
