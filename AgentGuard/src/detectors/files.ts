import path from "node:path";
import { matchesAnyPattern } from "../util/glob.js";

export interface ProtectedPathMatch {
  pattern: string;
  token: string;
}

const PATH_TOKEN_RE = /(?:[A-Za-z]:)?[^\s"'`|;&<>()]*[^\s"'`|;&<>()/\\]/g;

export function findProtectedPathTokens(
  command: string,
  protectedPatterns: string[],
  projectDir: string
): ProtectedPathMatch[] {
  const matches: ProtectedPathMatch[] = [];
  const seen = new Set<string>();
  for (const token of command.match(PATH_TOKEN_RE) ?? []) {
    if (seen.has(token)) continue;
    seen.add(token);
    const rel = toProjectRelative(token, projectDir);
    const candidates = new Set([token, rel, path.posix.normalize(rel.replace(/\\/g, "/"))]);
    for (const candidate of candidates) {
      const pattern = matchesAnyPattern(candidate, protectedPatterns);
      if (pattern) {
        matches.push({ pattern, token });
        break;
      }
    }
  }
  return matches;
}

export function isProtectedPath(
  relPath: string,
  protectedPatterns: string[]
): string | null {
  const normalized = relPath.replace(/\\/g, "/");
  return matchesAnyPattern(normalized, protectedPatterns);
}

function toProjectRelative(token: string, projectDir: string): string {
  try {
    const abs = path.isAbsolute(token) ? token : path.resolve(projectDir, token);
    return path.relative(projectDir, abs);
  } catch {
    return token;
  }
}
