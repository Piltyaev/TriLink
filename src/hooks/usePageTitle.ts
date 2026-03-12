import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — TriLink` : "TriLink — Платформа для триатлетов";
    return () => {
      document.title = "TriLink — Платформа для триатлетов";
    };
  }, [title]);
}
