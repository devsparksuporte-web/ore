"use client";

/**
 * ThemeToggle — habilita o dark mode preparado nos tokens (DT-010).
 * Persistência em localStorage; classe `dark` no <html> remapeia as
 * variáveis semânticas (globals.css) — componentes e gráficos adaptam
 * sem mudança de código (ADR-015: tema é dado, não build).
 */
import * as React from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "crystal-theme";

export function ThemeToggle() {
  const [dark, setDark] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {}
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={dark ? "Tema claro" : "Tema escuro"}
      className="rounded-md p-2 text-muted-foreground transition-colors duration-fast hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
