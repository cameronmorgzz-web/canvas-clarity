import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        "border-subtle": "hsl(var(--border-subtle))",
        "border-bright": "hsl(var(--border-bright))",
        "border-glow": "hsl(var(--border-glow))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        glass: "hsl(var(--glass))",
        "glass-border": "hsl(var(--glass-border))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          soft: "hsl(var(--primary-soft))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          elevated: "hsl(var(--card-elevated))",
          hover: "hsl(var(--card-hover))",
        },
        status: {
          overdue: "hsl(var(--status-overdue))",
          "overdue-bg": "hsl(var(--status-overdue-bg))",
          "overdue-glow": "hsl(var(--status-overdue-glow))",
          today: "hsl(var(--status-today))",
          "today-bg": "hsl(var(--status-today-bg))",
          "today-glow": "hsl(var(--status-today-glow))",
          soon: "hsl(var(--status-soon))",
          "soon-bg": "hsl(var(--status-soon-bg))",
          "soon-glow": "hsl(var(--status-soon-glow))",
          submitted: "hsl(var(--status-submitted))",
          "submitted-bg": "hsl(var(--status-submitted-bg))",
          "submitted-glow": "hsl(var(--status-submitted-glow))",
          graded: "hsl(var(--status-graded))",
          "graded-bg": "hsl(var(--status-graded-bg))",
          "graded-glow": "hsl(var(--status-graded-glow))",
          missing: "hsl(var(--status-missing))",
          "missing-bg": "hsl(var(--status-missing-bg))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius-xl)",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 20px -4px hsl(var(--primary) / 0.4)",
        "glow-lg": "0 0 40px -8px hsl(var(--primary) / 0.5)",
        "inner-glow": "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)",
        elevated: "0 8px 32px -8px rgba(0, 0, 0, 0.4), 0 4px 12px -4px rgba(0, 0, 0, 0.2)",
        card: "0 2px 8px -2px rgba(0, 0, 0, 0.2), inset 0 1px 0 0 hsl(0 0% 100% / 0.02)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(8px)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(100%)", opacity: "0" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.95)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 0 0 hsl(var(--primary) / 0)",
          },
          "50%": { 
            boxShadow: "0 0 20px 4px hsl(var(--primary) / 0.3)",
          },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
        "accordion-up": "accordion-up 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
        "fade-in": "fade-in 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)",
        "fade-out": "fade-out 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        "slide-in-right": "slide-in-right 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        "slide-out-right": "slide-out-right 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
        "slide-in-bottom": "slide-in-bottom 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
        "scale-in": "scale-in 0.25s cubic-bezier(0.32, 0.72, 0, 1)",
        "scale-out": "scale-out 0.2s cubic-bezier(0.32, 0.72, 0, 1)",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        wiggle: "wiggle 0.3s ease-in-out",
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "24px",
        "3xl": "40px",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "ios": "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
