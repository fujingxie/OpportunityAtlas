import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        page: "hsl(var(--color-bg-page) / <alpha-value>)",
        surface: "hsl(var(--color-bg-surface) / <alpha-value>)",
        soft: "hsl(var(--color-bg-soft) / <alpha-value>)",
        ink: "hsl(var(--color-text-main) / <alpha-value>)",
        secondary: "hsl(var(--color-text-secondary) / <alpha-value>)",
        muted: "hsl(var(--color-text-muted) / <alpha-value>)",
        border: "hsl(var(--color-border) / <alpha-value>)",
        primary: "hsl(var(--color-primary) / <alpha-value>)",
        cyan: "hsl(var(--color-cyan) / <alpha-value>)",
        success: "hsl(var(--color-success) / <alpha-value>)",
        warning: "hsl(var(--color-warning) / <alpha-value>)",
        danger: "hsl(var(--color-danger) / <alpha-value>)",
        navy: "hsl(var(--color-navy) / <alpha-value>)"
      },
      boxShadow: {
        card: "var(--shadow-card)",
        panel: "var(--shadow-panel)"
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)"
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Noto Sans SC",
          "Inter",
          "system-ui",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;

