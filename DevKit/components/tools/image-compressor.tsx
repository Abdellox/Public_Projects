"use client";

import { Download, Image as ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { cn, formatBytes } from "@/lib/utils";

type Format = "image/jpeg" | "image/webp";

interface CompressOptions {
  quality: number;
  maxWidth: string;
  format: Format;
}

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [quality, setQuality] = useState(70);
  const [maxWidth, setMaxWidth] = useState("original");
  const [format, setFormat] = useState<Format>("image/jpeg");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function compress(f: File, opts: CompressOptions) {
    setBusy(true);
    setError(null);
    try {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(f);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not read this image."));
        img.src = objectUrl;
      });
      const limit = opts.maxWidth === "original" ? Infinity : Number(opts.maxWidth);
      const scale = Math.min(1, limit / img.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported in this browser.");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, opts.format, opts.quality / 100)
      );
      URL.revokeObjectURL(objectUrl);
      if (!blob) throw new Error("Compression failed.");
      setResult((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url: URL.createObjectURL(blob), blob };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function loadFile(f: File) {
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setFile(f);
    setOriginalUrl(URL.createObjectURL(f));
    void compress(f, { quality, maxWidth, format });
  }

  function updateQuality(value: number) {
    setQuality(value);
    if (file) void compress(file, { quality: value, maxWidth, format });
  }

  function updateMaxWidth(value: string) {
    setMaxWidth(value);
    if (file) void compress(file, { quality, maxWidth: value, format });
  }

  function updateFormat(value: Format) {
    setFormat(value);
    if (file) void compress(file, { quality, maxWidth, format: value });
  }

  function reset() {
    setFile(null);
    setResult(null);
    setOriginalUrl("");
    setError(null);
  }

  const savings =
    file && result
      ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100))
      : null;

  return (
    <div className="flex flex-col gap-4">
      {!file ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) loadFile(f);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-14 text-center transition-colors",
            dragging
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
              : "border-zinc-300 hover:border-indigo-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          )}
        >
          <ImageIcon className="size-10 text-zinc-400" />
          <div>
            <p className="font-medium text-zinc-700 dark:text-zinc-200">
              Drop an image here or click to browse
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              PNG, JPG or WebP — processed entirely on your device
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) loadFile(f);
            }}
            aria-label="Choose image"
          />
        </div>
      ) : (
        <>
          <Panel className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Quality · {quality}%</Label>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => updateQuality(Number(e.target.value))}
                className="w-40 accent-indigo-600"
                aria-label="Quality"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Max width</Label>
              <Select
                value={maxWidth}
                onChange={(e) => updateMaxWidth(e.target.value)}
                aria-label="Max width"
              >
                <option value="original">Original</option>
                <option value="1920">1920 px</option>
                <option value="1280">1280 px</option>
                <option value="800">800 px</option>
                <option value="400">400 px</option>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Format</Label>
              <Select
                value={format}
                onChange={(e) => updateFormat(e.target.value as Format)}
                aria-label="Output format"
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
              </Select>
            </div>
            <Button size="sm" variant="secondary" className="mb-0.5" onClick={reset}>
              Choose another image
            </Button>
          </Panel>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Panel className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Original</Label>
                <span className="text-xs text-zinc-400">{formatBytes(file.size)}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalUrl}
                alt="Original"
                className="max-h-72 w-full rounded-lg border border-zinc-200 object-contain dark:border-zinc-800"
              />
            </Panel>
            <Panel className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Compressed</Label>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  {result && `${formatBytes(result.blob.size)} · ${savings}% smaller`}
                </span>
              </div>
              {result ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.url}
                    alt="Compressed"
                    className="max-h-72 w-full rounded-lg border border-zinc-200 object-contain dark:border-zinc-800"
                  />
                  <a
                    href={result.url}
                    download={`compressed.${format === "image/webp" ? "webp" : "jpg"}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                  >
                    <Download className="size-4" /> Download
                  </a>
                </>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700">
                  {busy ? "Compressing…" : "Result appears here"}
                </div>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
