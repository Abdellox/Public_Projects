"use client";

import { Palette } from "lucide-react";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { ErrorText, Label, Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / d + 2) * 60;
        break;
      default:
        h = ((rn - gn) / d + 4) * 60;
    }
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

function toHex({ r, g, b }: Rgb): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function parseColor(raw: string): Rgb | null {
  const input = raw.trim().toLowerCase();
  if (!input) return null;
  const hex = input.replace(/^#/, "");
  if (/^[0-9a-f]{3}$/.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }
  if (/^[0-9a-f]{6}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  const rgbMatch = input.match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/);
  if (rgbMatch) {
    const [r, g, b] = [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
    if ([r, g, b].every((v) => v >= 0 && v <= 255)) return { r, g, b };
    return null;
  }
  const hslMatch = input.match(/^hsla?\(\s*(\d{1,3})[\s,]+(\d{1,3})%?[\s,]+(\d{1,3})%?/);
  if (hslMatch) {
    return hslToRgb({
      h: Number(hslMatch[1]) % 360,
      s: Math.min(100, Number(hslMatch[2])),
      l: Math.min(100, Number(hslMatch[3])),
    });
  }
  return null;
}

export default function ColorConverter() {
  const [input, setInput] = useState("#6366F1");

  const color = useMemo(() => parseColor(input), [input]);
  const rgb = color ?? { r: 99, g: 102, b: 241 };
  const hsl = rgbToHsl(rgb);
  const hex = toHex(rgb);

  const formats = [
    { label: "HEX", value: hex },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "CSS variable", value: `--color: ${hex.toLowerCase()};` },
  ];

  const shades = [90, 75, 55, 35, 20].map((l) => toHex(hslToRgb({ ...hsl, l })));

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-col gap-3">
        <Label>Any format: #hex · rgb() · hsl()</Label>
        <div className="flex items-center gap-3">
          <div
            className="size-14 shrink-0 rounded-xl border border-zinc-200 shadow-inner dark:border-zinc-700"
            style={{ backgroundColor: color ? hex : "transparent" }}
            aria-label="Color preview"
          />
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="#6366F1"
            className="flex-1 font-mono text-lg"
            aria-label="Color value"
          />
          <input
            type="color"
            value={hex}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            className="size-11 cursor-pointer rounded-lg border border-zinc-200 bg-transparent dark:border-zinc-700"
            aria-label="Pick a color"
          />
        </div>
        {!color && input.trim() && <ErrorText>Unrecognized color format.</ErrorText>}
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2">
        {formats.map((f) => (
          <Panel key={f.label} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <Label>{f.label}</Label>
              <p className="mt-1 truncate font-mono text-sm text-zinc-800 dark:text-zinc-100">
                {f.value}
              </p>
            </div>
            <CopyButton value={f.value} label="" />
          </Panel>
        ))}
      </div>

      <Panel className="flex flex-col gap-3">
        <Label>Shades</Label>
        <div className="grid grid-cols-5 gap-2">
          {shades.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInput(s)}
              title={`Use ${s}`}
              className="group flex h-16 cursor-pointer flex-col items-center justify-end rounded-lg border border-zinc-200 pb-1 font-mono text-[10px] text-white transition-transform hover:scale-[1.03] dark:border-zinc-700"
              style={{ backgroundColor: s }}
            >
              <span className="opacity-0 transition-opacity group-hover:opacity-100">{s}</span>
            </button>
          ))}
        </div>
      </Panel>

      <p className="flex items-center gap-2 text-xs text-zinc-400">
        <Palette className="size-3.5" /> Click a shade to load it into the converter.
      </p>
    </div>
  );
}
