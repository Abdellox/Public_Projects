import { useParams } from "react-router-dom";
import { lessonBySlug, lessons } from "../content/lessons";
import { departments } from "../content/departments";
import { fundamentals } from "../content/fundamentals";
import { usePageMeta } from "../lib/seo";
import { ArticleLayout, Badge } from "../components/ArticleLayout";
import { NotFound } from "./NotFound";

export function LessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const lesson = slug ? lessonBySlug(slug) : undefined;

  usePageMeta(lesson ? lesson.title : "Lesson not found");

  if (!lesson) return <NotFound />;

  return (
    <ArticleLayout
      article={lesson}
      crumbs={[
        { label: "Start Here", to: "/start-here" },
        { label: `Lesson ${String(lesson.number).padStart(2, "0")}` },
      ]}
      basePath="/start-here"
      siblings={lessons}
      meta={
        <Badge tone="indigo">
          Lesson {String(lesson.number).padStart(2, "0")} of {lessons.length}
        </Badge>
      }
      related={
        lesson.number === 3
          ? departments.slice(0, 4).map((d) => ({
              title: d.name,
              to: `/departments/${d.slug}`,
              description: d.tagline,
            }))
          : fundamentals.slice(0, 4).map((f) => ({
              title: f.name,
              to: `/fundamentals/${f.slug}`,
              description: f.tagline,
            }))
      }
    />
  );
}
