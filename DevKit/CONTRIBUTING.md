# Contributing to DevKit

Thank you for helping DevKit grow! This project is designed from the ground up so that **adding a tool is easy, safe and fun** — even if it's your first open-source contribution.

## Ways to contribute

- 🔧 **Add a new tool** (the most valuable contribution)
- 🐛 Fix a bug in an existing tool
- 🎨 Improve UI/UX or accessibility
- 📝 Improve docs, descriptions and SEO copy
- 🌍 Add translations / i18n support
- 💡 [Request a tool](https://github.com/Abdellox/Public_Projects/issues/new?template=tool_request.yml) if you can't build it yourself

## Getting set up

DevKit lives inside the [Public_Projects](https://github.com/Abdellox/Public_Projects) monorepo — each folder is an independent project.

```bash
git clone https://github.com/Abdellox/Public_Projects.git
cd Public_Projects/DevKit
npm install
npm run dev
```

Before opening a PR, make sure both of these pass:

```bash
npm run lint
npm run build
```

## Adding a new tool

### 1. Create the component

Create `components/tools/<slug>.tsx`. The file must:

- Start with `"use client"` (all tools are interactive and run in the browser)
- Default-export a React component
- Reuse the shared UI primitives instead of raw elements

```tsx
"use client";

import { useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

export default function SlugCase() {
  const [input, setInput] = useState("");
  const output = input.trim().toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel className="flex flex-col gap-3">
        <Label>Input</Label>
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} />
      </Panel>
      <Panel className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Output</Label>
          <CopyButton value={output} />
        </div>
        {output && <pre className="rounded-lg border border-zinc-200 p-3 font-mono text-sm dark:border-zinc-800">{output}</pre>}
      </Panel>
    </div>
  );
}
```

### 2. Register it

Open `lib/tools/registry.ts`, import your component and add an entry to the `tools` array:

```ts
{
  slug: "slug-case",                 // URL: /tools/slug-case — kebab-case, unique
  name: "Slug Case Converter",       // display name
  description: "Convert any text into a URL-friendly slug.",  // shown on cards + SEO
  category: "converters",            // see categories below
  icon: Link2,                       // pick an unused lucide-react icon
  keywords: ["slug", "url", "kebab"],// lowercase search terms
  component: SlugCase,
}
```

**Categories:** `formatters` · `converters` · `generators` · `security` · `testers` · `utilities`

That's everything. Routing (`/tools/<slug>`), page metadata, static generation, home-page grid, search and category filters all update automatically.

### Shared UI components

Use these so every tool feels consistent:

| Import | Use for |
| --- | --- |
| `@/components/ui/button` | `<Button>` actions (variants: primary, secondary, ghost) |
| `@/components/ui/input` | single-line text inputs |
| `@/components/ui/textarea` | multi-line code/text areas (monospace by default) |
| `@/components/ui/select` | dropdowns |
| `@/components/ui/copy-button` | copy-to-clipboard with feedback |
| `@/components/ui/panel` | card containers, `<Label>` captions, `<ErrorText>` errors |

Layout convention: two-pane tools use `grid gap-4 lg:grid-cols-2`, with a `<Panel>` per pane.

### Quality checklist

- [ ] Everything runs client-side — no API calls, no analytics, no uploads
- [ ] Handles invalid input gracefully with a helpful error message
- [ ] Copy buttons on outputs
- [ ] Works in both light and dark themes (use semantic Tailwind classes like `dark:` variants)
- [ ] Responsive down to mobile widths
- [ ] `npm run lint` and `npm run build` pass
- [ ] Description is one clear sentence (it doubles as SEO metadata)

### Rules for dependencies

Prefer zero-dependency implementations using Web APIs (`crypto.subtle`, `canvas`, `Intl`, …). If you truly need a package, it must be tiny, popular and MIT-compatible — explain why in your PR.

## Submitting your PR

1. Fork the repo and create a branch: `devkit/feat-my-tool`
2. Commit with a conventional message: `feat(devkit): add slug case converter`
3. Open a PR describing what the tool does and why developers need it
4. **Keep every change inside the `DevKit/` folder** — other projects live in this repo too
5. Screenshots/GIFs in the PR description are appreciated!

Non-code PRs (docs, translations) are just as welcome.

## Ideas waiting for contributors

- TOML ↔ JSON converter
- JSON ↔ CSV converter
- JWT *encoder* (sign with HS256 demo secret)
- HTML live preview sandbox
- HTTP status code reference
- Chmod calculator
- Crontab generator (visual builder)
- User-agent parser
- Text case converter suite
- QR code generator (client-side)

Claim one by opening an issue so work isn't duplicated.
