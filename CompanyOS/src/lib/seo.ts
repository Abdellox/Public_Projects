import { useEffect } from "react";

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} · CompanyOS`;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", description);
    }
  }, [title, description]);
}
