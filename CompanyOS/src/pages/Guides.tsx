import { useParams } from "react-router-dom";
import { guideBySlug, guides } from "../content/guides";
import { usePageMeta } from "../lib/seo";
import { ArticleLayout } from "../components/ArticleLayout";
import { CardLink, PageHeader } from "../components/PageHeader";
import { ClockIcon } from "../components/icons";
import { NotFound } from "./NotFound";

export function HowCompaniesWork() {
  usePageMeta("How Companies Work", "Company types, sizes, structures, departments, hierarchy, and decision-making — the architecture behind every organization.");

  return (
    <>
      <PageHeader
        eyebrow="The big picture"
        title="How Companies Work"
        description="Six foundational guides covering company types, sizes, organizational structure, departments, hierarchy, and decision-making."
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <CardLink
              key={g.slug}
              to={`/how-companies-work/${g.slug}`}
              title={g.title}
              description={g.description}
              footer={
                <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                  <ClockIcon className="h-3.5 w-3.5" /> {g.readingTime} min · {g.level}
                </span>
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? guideBySlug(slug) : undefined;

  usePageMeta(guide ? guide.title : "Guide not found");

  if (!guide) return <NotFound />;

  return (
    <ArticleLayout
      article={guide}
      crumbs={[{ label: "How Companies Work", to: "/how-companies-work" }, { label: guide.title }]}
      basePath="/how-companies-work"
      siblings={guides}
      related={[
        { title: "Start Here course", to: "/start-here", description: "Ten lessons from zero to full picture" },
        { title: "Departments reference", to: "/departments", description: "All 12 departments in depth" },
      ]}
    />
  );
}
