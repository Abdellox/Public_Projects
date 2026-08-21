# DevKit — The Open-Source Developer Toolbox

> Every developer tool you need. One beautiful place.

<p align="center">
  <a href="#-tools"><img alt="Tools" src="https://img.shields.io/badge/tools-17-6366f1"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-22d3ee"></a>
  <a href="https://nextjs.org"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black"></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6"></a>
  <a href="#-contributing"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-emerald"></a>
</p>

DevKit is a fast, beautiful collection of free online developer tools. Everything runs **100% client-side** — your tokens, data and images never leave your browser. No accounts, no tracking, no limits.

## ✨ Why DevKit?

- **Privacy first** — every tool runs entirely in your browser. Nothing is ever uploaded.
- **Blazingly fast** — statically generated pages, zero backend, instant navigation.
- **Beautiful** — a modern dark-first UI that's a joy to use every day.
- **Contributor friendly** — adding a tool is *one component + one registry entry*. First-timer PRs welcome!
- **Free forever** — MIT licensed, community driven.

## 🧰 Tools

| Category | Tools |
| --- | --- |
| Formatters | JSON Formatter · SQL Formatter · Markdown Previewer |
| Converters | Base64 · URL Encoder/Decoder · Timestamp Converter · Color Converter · HTML Entities · Number Base |
| Generators | UUID Generator · Lorem Ipsum Generator |
| Security | JWT Decoder · Hash Generator (SHA-1/256/384/512) |
| Testers | Regex Tester |
| Utilities | Cron Parser (with next-run preview) · Diff Checker · Image Compressor |

## 🚀 Getting started

DevKit lives inside the [Public_Projects](https://github.com/Abdellox/Public_Projects) monorepo — each folder is an independent project.

```bash
git clone https://github.com/Abdellox/Public_Projects.git
cd Public_Projects/DevKit
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it.

```bash
npm run build   # production build
npm run lint    # eslint
```

## ➕ Add your own tool in ~10 minutes

DevKit is designed so contributors never touch routing, SEO or layout code.

1. Create `components/tools/my-tool.tsx`:

```tsx
"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { Label, Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

export default function MyTool() {
  const [text, setText] = useState("");
  return (
    <Panel className="flex flex-col gap-3">
      <Label>Input</Label>
      <Textarea value={text} onChange={(e) => setText(e.target.value)} />
      <CopyButton value={text.toUpperCase()} label="Copy uppercase" />
    </Panel>
  );
}
```

2. Register it in `lib/tools/registry.ts`:

```ts
import MyTool from "@/components/tools/my-tool";

export const tools: Tool[] = [
  // ...
  {
    slug: "my-tool",              // becomes /tools/my-tool
    name: "My Tool",
    description: "One-line description shown on cards and search engines.",
    category: "utilities",        // formatters | converters | generators | security | testers | utilities
    icon: Wrench,                 // any lucide-react icon
    keywords: ["my", "search", "terms"],
    component: MyTool,
  },
];
```

Done. Routing, metadata, search, category filters and the home page grid update automatically.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, shared UI components and ideas that need building.

## 🛠 Tech stack

- [Next.js](https://nextjs.org) (App Router, Turbopack) + React 19
- [Tailwind CSS v4](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org) in strict mode
- [lucide-react](https://lucide.dev) icons · [marked](https://marked.js.org) · [DOMPurify](https://github.com/cure53/DOMPurify) · [sql-formatter](https://github.com/sql-formatter-org/sql-formatter)

## 🗺 Roadmap

- [ ] API tester (fetch with CORS notes)
- [ ] PWA / offline support
- [ ] More tools: TOML/YAML converters, JSON↔CSV, HTML preview, JWT encoder, bcrypt playground…
- [ ] i18n / translations
- [ ] Command palette (⌘K)
- [ ] Plugin system for third-party tools

Have an idea? [Open an issue](https://github.com/Abdellox/Public_Projects/issues/new?template=tool_request.yml) or build it yourself — we'll help you ship it.

## 🤝 Contributing

Contributions are what make this project grow. Whether it's a new tool, a bug fix, better copy or a translation — every PR counts. Read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## ⭐ Support

If DevKit saves you time, please consider giving it a star — it helps other developers discover the project.

## 📄 License

[MIT](LICENSE) © DevKit contributors
