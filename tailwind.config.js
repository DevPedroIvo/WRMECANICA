/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wr: {
          bg: 'rgb(var(--wr-bg) / <alpha-value>)',
          surface: 'rgb(var(--wr-surface) / <alpha-value>)',
          surfaceDark: 'rgb(var(--wr-surface-dark) / <alpha-value>)',
          elevated: 'rgb(var(--wr-elevated) / <alpha-value>)',
          sidebar: 'rgb(var(--wr-sidebar) / <alpha-value>)',
          border: 'rgb(var(--wr-border) / <alpha-value>)',
          borderHover: 'rgb(var(--wr-border-hover) / <alpha-value>)',
          text: 'rgb(var(--wr-text) / <alpha-value>)',
          muted: 'rgb(var(--wr-muted) / <alpha-value>)',
          orange: 'rgb(var(--wr-orange) / <alpha-value>)',
          orangeDark: 'rgb(var(--wr-orange-dark) / <alpha-value>)',
          orangeLight: 'rgb(var(--wr-orange-light) / <alpha-value>)',
          orangeSoft: 'rgb(var(--wr-orange-soft) / <alpha-value>)',
          success: 'rgb(var(--wr-success) / <alpha-value>)',
          error: 'rgb(var(--wr-error) / <alpha-value>)',
          alert: 'rgb(var(--wr-alert) / <alpha-value>)',
          gold: 'rgb(var(--wr-gold) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: 'var(--wr-shadow-card)',
        elevated: 'var(--wr-shadow-elevated)',
      }
    },
  },
  plugins: [],
}
