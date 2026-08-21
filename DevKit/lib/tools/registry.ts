import {
  AlignLeft,
  Binary,
  Braces,
  Calculator,
  Clock,
  Code,
  Database,
  FileDiff,
  FileText,
  Fingerprint,
  Image as ImageIcon,
  KeyRound,
  Link2,
  Palette,
  Regex,
  ShieldCheck,
  Timer,
} from "lucide-react";
import type { Tool } from "./types";
import Base64Tool from "@/components/tools/base64";
import ColorConverter from "@/components/tools/color-converter";
import CronParser from "@/components/tools/cron-parser";
import DiffChecker from "@/components/tools/diff-checker";
import HashGenerator from "@/components/tools/hash-generator";
import HtmlEntities from "@/components/tools/html-entities";
import ImageCompressor from "@/components/tools/image-compressor";
import JsonFormatter from "@/components/tools/json-formatter";
import JwtDecoder from "@/components/tools/jwt-decoder";
import LoremIpsum from "@/components/tools/lorem-ipsum";
import MarkdownPreviewer from "@/components/tools/markdown-previewer";
import NumberBase from "@/components/tools/number-base";
import RegexTester from "@/components/tools/regex-tester";
import SqlFormatter from "@/components/tools/sql-formatter";
import TimestampConverter from "@/components/tools/timestamp-converter";
import UrlEncoder from "@/components/tools/url-encoder";
import UuidGenerator from "@/components/tools/uuid-generator";

/**
 * The tool registry. To add a new tool:
 *  1. Create `components/tools/<slug>.tsx` (a "use client" component).
 *  2. Import it here and add an entry to the array below.
 * That's it — routing, SEO, search and the home page grid update automatically.
 */
export const tools: Tool[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate and minify JSON with configurable indentation.",
    category: "formatters",
    icon: Braces,
    keywords: ["json", "pretty print", "minify", "validate", "parser"],
    component: JsonFormatter,
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode JWT tokens and inspect header, payload and expiry claims safely in your browser.",
    category: "security",
    icon: KeyRound,
    keywords: ["jwt", "token", "auth", "bearer", "claims", "decode"],
    component: JwtDecoder,
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test regular expressions live with match highlighting, capture groups and flags.",
    category: "testers",
    icon: Regex,
    keywords: ["regex", "regexp", "regular expression", "match", "pattern"],
    component: RegexTester,
  },
  {
    slug: "base64",
    name: "Base64 Encoder / Decoder",
    description: "Encode and decode Base64 text with full Unicode support.",
    category: "converters",
    icon: Binary,
    keywords: ["base64", "encode", "decode", "btoa", "atob"],
    component: Base64Tool,
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    description: "Pretty-print SQL for PostgreSQL, MySQL, SQLite, T-SQL and more.",
    category: "formatters",
    icon: Database,
    keywords: ["sql", "query", "format", "beautify", "postgresql", "mysql"],
    component: SqlFormatter,
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    description: "Convert Unix timestamps to human dates and back, with a live epoch clock.",
    category: "converters",
    icon: Clock,
    keywords: ["unix", "epoch", "timestamp", "date", "time", "iso"],
    component: TimestampConverter,
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate cryptographically secure UUID v4 identifiers in bulk.",
    category: "generators",
    icon: Fingerprint,
    keywords: ["uuid", "guid", "identifier", "random", "v4"],
    component: UuidGenerator,
  },
  {
    slug: "markdown-previewer",
    name: "Markdown Previewer",
    description: "Write Markdown and see a sanitized live preview side by side.",
    category: "formatters",
    icon: FileText,
    keywords: ["markdown", "md", "preview", "readme", "editor"],
    component: MarkdownPreviewer,
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    description: "Compare two texts line by line and highlight additions and deletions.",
    category: "utilities",
    icon: FileDiff,
    keywords: ["diff", "compare", "changes", "text"],
    component: DiffChecker,
  },
  {
    slug: "cron-parser",
    name: "Cron Parser",
    description: "Explain cron expressions in plain English and preview the next scheduled runs.",
    category: "utilities",
    icon: Timer,
    keywords: ["cron", "crontab", "schedule", "expression", "next run"],
    component: CronParser,
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Compute SHA-1, SHA-256, SHA-384 and SHA-512 hashes instantly.",
    category: "security",
    icon: ShieldCheck,
    keywords: ["hash", "sha256", "sha1", "sha512", "checksum", "digest"],
    component: HashGenerator,
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert colors between HEX, RGB and HSL with instant shade palette.",
    category: "converters",
    icon: Palette,
    keywords: ["color", "hex", "rgb", "hsl", "palette", "css"],
    component: ColorConverter,
  },
  {
    slug: "url-encoder",
    name: "URL Encoder / Decoder",
    description: "Encode and decode URLs and URI components, with percent-encoding control.",
    category: "converters",
    icon: Link2,
    keywords: ["url", "uri", "encode", "decode", "percent", "query string"],
    component: UrlEncoder,
  },
  {
    slug: "html-entities",
    name: "HTML Entities",
    description: "Escape and unescape HTML entities, including numeric character references.",
    category: "converters",
    icon: Code,
    keywords: ["html", "entities", "escape", "unescape", "encode"],
    component: HtmlEntities,
  },
  {
    slug: "number-base",
    name: "Number Base Converter",
    description: "Convert numbers between binary, octal, decimal and hexadecimal.",
    category: "converters",
    icon: Calculator,
    keywords: ["binary", "hex", "octal", "decimal", "radix", "base"],
    component: NumberBase,
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder paragraphs, sentences or words for mockups.",
    category: "generators",
    icon: AlignLeft,
    keywords: ["lorem", "ipsum", "placeholder", "dummy text", "filler"],
    component: LoremIpsum,
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Compress and resize images locally in your browser — nothing is uploaded.",
    category: "utilities",
    icon: ImageIcon,
    keywords: ["image", "compress", "optimize", "resize", "webp", "jpeg"],
    component: ImageCompressor,
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getRelated(slug: string, count = 4): Tool[] {
  const current = getTool(slug);
  if (!current) return [];
  const sameCategory = tools.filter((t) => t.slug !== slug && t.category === current.category);
  const others = tools.filter((t) => t.slug !== slug && t.category !== current.category);
  return [...sameCategory, ...others].slice(0, count);
}
