import type { RiskLevel } from "../core/events.js";

export interface CommandRule {
  id: string;
  description: string;
  risk: RiskLevel;
  test: RegExp;
}

export const COMMAND_RULES: CommandRule[] = [
  {
    id: "cmd.pipe-to-shell",
    description: "Pipes downloaded content directly into a shell (remote code execution pattern)",
    risk: "critical",
    test: /\b(curl|wget|fetch|Invoke-WebRequest|iwr)\b[^|]*\|\s*(sudo\s+)?(ba|z|da|k)?sh\b/i,
  },
  {
    id: "cmd.fork-bomb",
    description: "Fork bomb pattern detected",
    risk: "critical",
    test: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/,
  },
  {
    id: "cmd.disk-overwrite",
    description: "Writes directly to a raw disk device",
    risk: "critical",
    test: /\bdd\b[^|]*\bof=\/dev\/(sd|hd|nvme|disk)/i,
  },
  {
    id: "cmd.filesystem-format",
    description: "Formats a filesystem",
    risk: "critical",
    test: /\b(mkfs(\.\w+)?|format\s+[a-z]:)\b/i,
  },
  {
    id: "cmd.root-delete",
    description: "Recursive delete targeting filesystem root or home directory",
    risk: "critical",
    test: /\brm\s+(-[a-z]*r[a-z]*f[a-z]*|-rf|--recursive)\b[^;|&]*(\s\/(\s|$)|\s\/\*|\s~(\/\*)?(\s|$))/i,
  },
  {
    id: "cmd.sudo",
    description: "Elevates privileges with sudo",
    risk: "high",
    test: /\bsudo\b/,
  },
  {
    id: "cmd.wildcard-delete-cwd",
    description: "Recursive delete of everything in the current directory",
    risk: "high",
    test: /\brm\s+-[a-z]*r[a-z]*f?[a-z]*\s+(\.|\*|\.\*|"?\$\(pwd\)"?)\s*$/i,
  },
  {
    id: "cmd.env-dump",
    description: "Prints environment variables, which may expose secrets",
    risk: "medium",
    test: /^(printenv|env)(\s|$)|\bset\b\s*$/i,
  },
  {
    id: "cmd.remote-script-exec",
    description: "Downloads a script to disk and executes it in one step",
    risk: "high",
    test: /\b(curl|wget)\b[^|]*-o\s*\S+\s*&&\s*(ba|z|da|k)?sh\b/i,
  },
  {
    id: "cmd.base64-pipe-shell",
    description: "Decodes encoded content straight into a shell",
    risk: "critical",
    test: /\bbase64\s+(-d|-D|--decode)\b[^|]*\|\s*(ba|z|da|k)?sh\b/i,
  },
  {
    id: "cmd.registry-edit",
    description: "Modifies the Windows registry from a script context",
    risk: "high",
    test: /\breg\s+(add|delete|import)\b/i,
  },
];

export interface CommandFinding {
  ruleId: string;
  description: string;
  risk: RiskLevel;
}

export function analyzeCommand(command: string): CommandFinding[] {
  const findings: CommandFinding[] = [];
  for (const rule of COMMAND_RULES) {
    if (rule.test.test(command)) {
      findings.push({ ruleId: rule.id, description: rule.description, risk: rule.risk });
    }
  }
  return findings;
}
