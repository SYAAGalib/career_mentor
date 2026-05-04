import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("careermentor_theme") as Theme | null;
    return stored || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("careermentor_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === "dark" ? "light" : "dark"));
  }, []);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  return { theme, toggleTheme, setTheme };
}
