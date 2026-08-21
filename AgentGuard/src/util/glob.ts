export function matchesAnyPattern(text: string, patterns: string[]): string | null {
  for (const pattern of patterns) {
    if (matchPattern(text, pattern)) return pattern;
  }
  return null;
}

export function matchPattern(text: string, pattern: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim();
  const re = globToRegExp(pattern);
  return re.test(text) || re.test(normalized);
}

export function globToRegExp(glob: string): RegExp {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]!;
    if (c === "*") {
      if (glob[i + 1] === "*") {
        re += "[\\s\\S]*";
        i++;
        if (glob[i + 1] === "/") i++;
      } else if (i === glob.length - 1) {
        re += "[\\s\\S]*";
      } else {
        re += "[^\\s]*";
      }
    } else if (c === "?") {
      re += "[^\\s]";
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${re}$`, "i");
}
