import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

export interface ShellPolicy {
  default: "allow" | "deny";
  allow: string[];
  deny: string[];
  ask: string[];
}

export interface FilesystemPolicy {
  protected: string[];
}

export interface NetworkPolicy {
  mode: "monitor" | "allowlist";
  allow: string[];
}

export interface SecretsPolicy {
  scan_commands: boolean;
  block_on_detection: boolean;
}

export interface Policy {
  version: number;
  permissions: {
    shell: ShellPolicy;
    filesystem: FilesystemPolicy;
    network: NetworkPolicy;
  };
  secrets: SecretsPolicy;
}

export const DEFAULT_PROTECTED_PATHS = [
  ".env",
  ".env.*",
  "**/*.pem",
  "**/*.key",
  "**/id_rsa*",
  "**/id_ed25519*",
  ".ssh/**",
  ".aws/**",
  ".gnupg/**",
  "*.p12",
  "*.pfx",
  "credentials.json",
  "*.kdbx",
];

export function defaultPolicy(): Policy {
  return {
    version: 1,
    permissions: {
      shell: {
        default: "allow",
        allow: [],
        deny: [
          "rm -rf /",
          "rm -rf /*",
          "rm -rf ~",
          "rm -rf ~/*",
          "sudo *",
          "mkfs*",
          "dd *of=/dev/*",
          ":(){ :|:& };:",
          "shutdown *",
          "*| bash",
          "*| sh",
          "*| zsh",
          "* | bash",
          "* | sh",
          "* | zsh",
        ],
        ask: ["git push --force*", "git reset --hard*", "npm publish*", "curl *| *", "wget *| *"],
      },
      filesystem: {
        protected: DEFAULT_PROTECTED_PATHS,
      },
      network: {
        mode: "monitor",
        allow: [],
      },
    },
    secrets: {
      scan_commands: true,
      block_on_detection: true,
    },
  };
}

export class PolicyValidationError extends Error {}

function asStringArray(value: unknown, field: string): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new PolicyValidationError(`${field} must be a list of strings`);
  return value.map((v) => {
    if (typeof v !== "string") throw new PolicyValidationError(`${field} must contain only strings`);
    return v;
  });
}

function parseShell(raw: any, base: ShellPolicy): ShellPolicy {
  if (raw === undefined || raw === null) return base;
  if (typeof raw !== "object") throw new PolicyValidationError("permissions.shell must be a mapping");
  const dflt = raw.default ?? base.default;
  if (dflt !== "allow" && dflt !== "deny") {
    throw new PolicyValidationError('permissions.shell.default must be "allow" or "deny"');
  }
  return {
    default: dflt,
    allow: asStringArray(raw.allow, "permissions.shell.allow"),
    deny: asStringArray(raw.deny, "permissions.shell.deny"),
    ask: asStringArray(raw.ask, "permissions.shell.ask"),
  };
}

function parseFilesystem(raw: any, base: FilesystemPolicy): FilesystemPolicy {
  if (raw === undefined || raw === null) return base;
  if (typeof raw !== "object") throw new PolicyValidationError("permissions.filesystem must be a mapping");
  return {
    protected: asStringArray(raw.protected, "permissions.filesystem.protected"),
  };
}

function parseNetwork(raw: any, base: NetworkPolicy): NetworkPolicy {
  if (raw === undefined || raw === null) return base;
  if (typeof raw !== "object") throw new PolicyValidationError("permissions.network must be a mapping");
  const mode = raw.mode ?? base.mode;
  if (mode !== "monitor" && mode !== "allowlist") {
    throw new PolicyValidationError('permissions.network.mode must be "monitor" or "allowlist"');
  }
  return {
    mode,
    allow: asStringArray(raw.allow, "permissions.network.allow"),
  };
}

function parseSecrets(raw: any, base: SecretsPolicy): SecretsPolicy {
  if (raw === undefined || raw === null) return base;
  if (typeof raw !== "object") throw new PolicyValidationError("secrets must be a mapping");
  return {
    scan_commands: raw.scan_commands ?? base.scan_commands,
    block_on_detection: raw.block_on_detection ?? base.block_on_detection,
  };
}

export function validatePolicy(raw: any): Policy {
  if (raw === undefined || raw === null) throw new PolicyValidationError("policy document is empty");
  if (typeof raw !== "object" || Array.isArray(raw)) throw new PolicyValidationError("policy must be a mapping");
  const base = defaultPolicy();
  const perms = raw.permissions ?? {};
  if (typeof perms !== "object" || Array.isArray(perms)) {
    throw new PolicyValidationError("permissions must be a mapping");
  }
  return {
    version: typeof raw.version === "number" ? raw.version : 1,
    permissions: {
      shell: parseShell(perms.shell, base.permissions.shell),
      filesystem: parseFilesystem(perms.filesystem, base.permissions.filesystem),
      network: parseNetwork(perms.network, base.permissions.network),
    },
    secrets: parseSecrets(raw.secrets, base.secrets),
  };
}

export function findPolicyPath(projectDir: string): string | null {
  const candidate = path.join(projectDir, ".agentguard", "policy.yaml");
  return fs.existsSync(candidate) ? candidate : null;
}

export function loadPolicy(projectDir: string): { policy: Policy; path: string | null; warnings: string[] } {
  const policyPath = findPolicyPath(projectDir);
  const warnings: string[] = [];
  if (!policyPath) {
    warnings.push(
      "No .agentguard/policy.yaml found; using built-in default policy. Run `agentguard init` to customize."
    );
    return { policy: defaultPolicy(), path: null, warnings };
  }
  let parsed: unknown;
  try {
    parsed = YAML.parse(fs.readFileSync(policyPath, "utf8"));
  } catch (err) {
    throw new PolicyValidationError(`Failed to parse ${policyPath}: ${(err as Error).message}`);
  }
  return { policy: validatePolicy(parsed), path: policyPath, warnings };
}
