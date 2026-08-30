"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether the "dark" class is currently on <html>, updating live if
 * it changes (theme toggle, settings panel, or OS preference switching
 * while "System" is selected). Needed for canvas-rendered UI (like the
 * graph view) that can't rely on Tailwind's dark: classes.
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}