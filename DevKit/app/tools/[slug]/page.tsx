import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getRelated, getTool, tools } from "@/lib/tools/registry";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tools/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — Free Online Tool`,
    description: `${tool.description} Runs entirely in your browser — private, instant and free.`,
    keywords: [...tool.keywords, tool.name, "online tool", "free"],
  };
}

export default async function ToolPage({ params }: PageProps<"/tools/[slug]">) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const ToolComponent = tool.component;
  const Icon = tool.icon;
  const related = getRelated(slug);

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1.5 text-sm text-zinc-400"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1 transition-colors hover:text-indigo-500"
          >
            <ArrowLeft className="size-3.5" /> All tools
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-zinc-600 dark:text-zinc-300">{tool.name}</span>
        </nav>

        <div className="mb-8 flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/25">
            <Icon className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {tool.name}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              {tool.description}
            </p>
          </div>
        </div>

        <ToolComponent />

        {related.length > 0 && (
          <section className="mt-14 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Related tools
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {related.map((t) => {
                const RelIcon = t.icon;
                return (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm font-medium text-zinc-700 transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-400"
                  >
                    <RelIcon className="size-4 shrink-0 text-zinc-400 group-hover:text-indigo-500" />
                    <span className="truncate">{t.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
