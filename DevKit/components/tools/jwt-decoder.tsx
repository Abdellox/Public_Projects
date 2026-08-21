"use client";

import { AlertTriangle, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const NOW = Date.now();

interface DecodedPart {
  raw: string;
  json: string;
}

interface DecodeError {
  error: string;
  header?: undefined;
  payload?: undefined;
  signature?: null;
}

interface DecodeSuccess {
  error: null;
  header: DecodedPart;
  payload: DecodedPart;
  signature: string | null;
}

export default function JwtDecoder() {
  const [token, setToken] = useState("");

  const result = useMemo<DecodeError | DecodeSuccess>(() => {
    const trimmed = token.trim();
    if (!trimmed) return { error: "empty" };
    const parts = trimmed.split(".");
    if (parts.length < 2 || parts.length > 3) {
      return { error: "A JWT must have 2 or 3 dot-separated segments." };
    }
    try {
      const decode = (segment: string): DecodedPart => {
        const raw = base64UrlDecode(segment);
        return { raw, json: JSON.stringify(JSON.parse(raw), null, 2) };
      };
      return {
        error: null,
        header: decode(parts[0]),
        payload: decode(parts[1]),
        signature: parts[2] ?? null,
      };
    } catch {
      return { error: "Invalid token — segments must be base64url-encoded JSON." };
    }
  }, [token]);

  const hasResult = result.error === null;

  const expInfo = useMemo(() => {
    if (!hasResult) return null;
    try {
      const claims = JSON.parse(result.payload.raw) as Record<string, unknown>;
      const exp = claims.exp;
      if (typeof exp !== "number") return null;
      const date = new Date(exp * 1000);
      const expired = date.getTime() < NOW;
      return { date, expired };
    } catch {
      return null;
    }
  }, [hasResult, result]);

  const algNone = hasResult && result.header.raw.includes('"alg":"none"');

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-col gap-3">
        <Label>Encoded token</Label>
        <Textarea
          rows={5}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
          aria-label="JWT"
        />
        <p className="text-xs text-zinc-400">
          Decoded entirely in your browser — the token never leaves your device.
        </p>
      </Panel>

      {result.error && token.trim() && <ErrorText>{result.error}</ErrorText>}

      {hasResult && (
        <>
          {algNone && (
            <p className="flex items-center gap-2 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
              <AlertTriangle className="size-4 shrink-0" /> This token uses &quot;alg&quot;:
              none — it is unsigned and unverified.
            </p>
          )}
          {expInfo && (
            <p
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                expInfo.expired
                  ? "border-red-300/60 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
                  : "border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
              }`}
            >
              <AlertTriangle className="size-4 shrink-0" />
              {expInfo.expired ? "Expired" : "Valid until"}{" "}
              {expInfo.date.toLocaleString()}
            </p>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Header</Label>
                <CopyButton value={result.header.json} />
              </div>
              <pre className="overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-indigo-300">
                {result.header.json}
              </pre>
            </Panel>
            <Panel className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Payload</Label>
                <CopyButton value={result.payload.json} />
              </div>
              <pre className="max-h-72 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                {result.payload.json}
              </pre>
            </Panel>
          </div>
          <Panel className="flex flex-col gap-2">
            <Label>Signature {result.signature ? "(not verified)" : "(absent)"}</Label>
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs break-all text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              {result.signature ?? "—"}
            </p>
          </Panel>
        </>
      )}

      {!token.trim() && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 p-10 text-sm text-zinc-400 dark:border-zinc-700">
          <KeyRound className="size-8 opacity-50" />
          Paste a JWT above to inspect its header and claims
        </div>
      )}
    </div>
  );
}
