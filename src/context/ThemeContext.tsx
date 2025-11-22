"use client";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage and apply to document
  useEffect(() => {
    // Check both possible localStorage keys for backward compatibility
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedDarkMode = localStorage.getItem("darkMode");

    let initialTheme: Theme = "light";

    // Priority: theme key > darkMode key > system preference
    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (savedDarkMode !== null) {
      initialTheme = savedDarkMode === "true" ? "dark" : "light";
    } else {
      // Use system preference as last resort
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      initialTheme = systemPrefersDark ? "dark" : "light";
    }

    setThemeState(initialTheme);
    setMounted(true);
  }, []);

  // Apply theme to document when it changes
  useEffect(() => {
    if (!mounted) return;

    // Update document class
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }

    // Save to BOTH localStorage keys for compatibility
    localStorage.setItem("theme", theme);
    localStorage.setItem("darkMode", theme === "dark" ? "true" : "false");
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
};
