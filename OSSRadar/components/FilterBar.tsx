"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SearchIcon } from "@/components/icons";

const LANGUAGES = [
  "",
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C#",
  "C++",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Dart",
  "Shell",
  "HTML",
  "CSS",
  "Svelte",
  "Zig",
  "Lua",
  "Elixir",
];

const LABEL_OPTIONS = [
  { value: "gfi", label: "Good First Issue" },
  { value: "hw", label: "Help Wanted" },
  { value: "all", label: "Both" },
];

const SORT_OPTIONS = [
  { value: "created", label: "Newest" },
  { value: "updated", label: "Recently updated" },
  { value: "comments", label: "Most discussed" },
  { value: "reactions", label: "Most reacted" },
];

interface FilterBarProps {
  label: string;
  language: string;
  sort: string;
  q: string;
}

export default function FilterBar({ label, language, sort, q }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState(q);

  function update(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete("page");
    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  }

  return (
    <div
      className={`flex flex-col gap-3 transition-opacity ${
        pending ? "pointer-events-none opacity-60" : ""
      }`}
    >
      {/* Label segmented control */}
      <div
        className="flex w-fit rounded-lg border border-edge bg-panel p-1"
        role="group"
        aria-label="Issue label"
      >
        {LABEL_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => update({ label: option.value === "gfi" ? "" : option.value })}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              label === option.value || (option.value === "gfi" && label === "")
                ? "bg-accent/15 font-medium text-accent"
                : "text-muted hover:text-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Language, sort and search */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label="Language"
          className="select-dark"
          value={language}
          onChange={(e) => update({ language: e.target.value })}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang || "any"} value={lang}>
              {lang || "Any language"}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort by"
          className="select-dark"
          value={sort}
          onChange={(e) => update({ sort: e.target.value === "created" ? "" : e.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <form
          className="relative ml-auto flex min-w-[220px] flex-1 items-center sm:max-w-xs"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: text.trim() });
          }}
        >
          <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-muted" />
          <input
            type="search"
            aria-label="Search issues"
            placeholder="Search issues..."
            className="input-dark pl-9"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
