import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

export const CATEGORIES = {
  formatters: "Formatters",
  converters: "Converters",
  generators: "Generators",
  security: "Security",
  testers: "Testers",
  utilities: "Utilities",
} as const;

export type Category = keyof typeof CATEGORIES;

/**
 * The metadata that describes a tool. This is what powers search,
 * category filters, SEO metadata and the tool cards on the home page.
 */
export interface ToolMeta {
  /** URL slug, e.g. "json-formatter" -> /tools/json-formatter */
  slug: string;
  /** Display name shown on cards and page headers */
  name: string;
  /** One-line description shown on cards and used for SEO */
  description: string;
  category: Category;
  icon: LucideIcon;
  /** Extra search terms so users can find the tool quickly */
  keywords: string[];
}

/** A full tool = metadata + the interactive component. */
export interface Tool extends ToolMeta {
  component: ComponentType;
}

/** Strip the component so metadata can be passed to client components. */
export function toMeta(tool: Tool): ToolMeta {
  return {
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    icon: tool.icon,
    keywords: tool.keywords,
  };
}
