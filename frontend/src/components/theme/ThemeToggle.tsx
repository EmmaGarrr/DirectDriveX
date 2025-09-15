"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      className="inline-flex items-center justify-center sm:size-10 size-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 backdrop-blur-sm transition-colors"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <Sun className="size-4 sm:size-5 text-slate-900 dark:text-slate-100 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 sm:size-5 text-slate-900 dark:text-slate-100 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}