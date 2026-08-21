"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
];

export default function LanguageSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      aria-label="Language"
      className="select-dark"
      value={value}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) {
          params.set("language", e.target.value);
        } else {
          params.delete("language");
        }
        params.delete("page");
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      }}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang || "any"} value={lang}>
          {lang || "Any language"}
        </option>
      ))}
    </select>
  );
}
