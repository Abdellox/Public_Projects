type ClassValue = string | false | null | undefined | Record<string, boolean>

export function cn(...values: ClassValue[]): string {
  const classes: string[] = []
  for (const value of values) {
    if (!value) continue
    if (typeof value === 'string') {
      classes.push(value)
    } else {
      for (const [key, active] of Object.entries(value)) {
        if (active) classes.push(key)
      }
    }
  }
  return classes.filter(Boolean).join(' ')
}