export interface SecretRule {
  id: string;
  label: string;
  pattern: RegExp;
  extraFlags?: string;
}

export const SECRET_RULES: SecretRule[] = [
  {
    id: "secret.aws-access-key",
    label: "AWS access key",
    pattern: /\b((?:AKIA|ASIA|ABIA|ACCA)[0-9A-Z]{16})\b/,
  },
  {
    id: "secret.aws-secret-key",
    label: "AWS secret access key",
    pattern: /\baws.{0,20}?['"][0-9a-zA-Z/+]{40}['"]/,
    extraFlags: "i",
  },
  {
    id: "secret.github-token",
    label: "GitHub token",
    pattern: /\b(gh[pousr]_[A-Za-z0-9]{36,255}|github_pat_[A-Za-z0-9_]{22,255})\b/,
  },
  {
    id: "secret.openai-key",
    label: "OpenAI API key",
    pattern: /\b(sk-(?:proj-)?[A-Za-z0-9_-]{20,})\b/,
  },
  {
    id: "secret.anthropic-key",
    label: "Anthropic API key",
    pattern: /\b(sk-ant-[A-Za-z0-9_-]{20,})\b/,
  },
  {
    id: "secret.slack-token",
    label: "Slack token",
    pattern: /\b(xox[baprs]-[A-Za-z0-9-]{10,})\b/,
  },
  {
    id: "secret.google-api-key",
    label: "Google API key",
    pattern: /\b(AIza[0-9A-Za-z_-]{35})\b/,
  },
  {
    id: "secret.stripe-live-key",
    label: "Stripe live secret key",
    pattern: /\b(sk_live_[0-9a-zA-Z]{16,})\b/,
  },
  {
    id: "secret.private-key-block",
    label: "Private key material",
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY(?: BLOCK)?-----/,
  },
  {
    id: "secret.jwt",
    label: "JSON Web Token",
    pattern: /\b(eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/,
  },
  {
    id: "secret.generic-assignment",
    label: "High-entropy assignment to an UPPERCASE variable",
    pattern:
      /\b([A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIALS?))\s*[:=]\s*['"]([A-Za-z0-9+/_=-]{24,})['"]/,
  },
];

export interface SecretFinding {
  ruleId: string;
  label: string;
  match: string;
}

export function detectSecrets(text: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  for (const rule of SECRET_RULES) {
    const baseFlags = (rule.extraFlags ?? "") + (rule.pattern.flags.includes("g") ? "g" : "g");
    const re = new RegExp(rule.pattern.source, baseFlags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const value = (m[2] ?? m[1] ?? m[0]) as string;
      findings.push({ ruleId: rule.id, label: rule.label, match: value });
      if (m.index === re.lastIndex) re.lastIndex++;
      if (findings.length >= 50) return findings;
    }
  }
  return findings;
}

export function redactSecrets(text: string): { redacted: string; findings: SecretFinding[] } {
  const findings: SecretFinding[] = [];
  let redacted = text;
  for (const rule of SECRET_RULES) {
    const flags = (rule.extraFlags ?? "") + "g";
    const re = new RegExp(rule.pattern.source, flags);
    redacted = redacted.replace(re, (...args) => {
      const full = args[0] as string;
      const groups = args.slice(0, -2).filter((g) => typeof g === "string");
      const value = groups[groups.length - 1] ?? full;
      findings.push({ ruleId: rule.id, label: rule.label, match: value });
      const head = value.slice(0, Math.min(4, Math.max(value.length - 4, 1)));
      return full.replace(value, `${head}${"*".repeat(8)}`);
    });
  }
  return { redacted, findings };
}
