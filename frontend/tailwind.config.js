/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' if preferred, usually 'class' for manual toggle
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          50: "#FFF9E6",
          100: "#FFF3CC",
          200: "#FFE799",
          300: "#FFDB66",
          400: "#FFCF33",
          500: "#FFC300", // Main brand yellow
          600: "#CC9C00",
          700: "#997500",
          800: "#664E00",
          900: "#332700",
        },
        // Neutral/Background Colors (handled via CSS variables or utility classes usually,
        // but here we map them for direct usage as requested).
        // Note: For dark mode to work seamlessly with these names, we often use CSS variables.
        // However, the user provided separate objects for light and dark.
        // We will add the specific colors. To support dark mode with specific tokens,
        // we can either use the `dark:` variant or CSS variables.
        // Given the prompt asks to map tokens to `theme.extend.colors`, we will add them.
        // Since Tailwind doesn't automatically switch these based on mode unless using CSS vars,
        // we'll map the base palette and likely use standard utilities + dark variants.
        // BUT, the user provided `background` and `text` objects.
        // We will flatten these or namespace them.

        // We will implement the exact palette provided as 'brand' colors and semantic colors.
        // For 'background' and 'text', we will define them but usage might require `dark:bg-background-primary-dark` etc
        // unless we use CSS variables.
        // Let's assume standard usage and just add the palette.

        background: {
          primary: "#FFFFFF", // Light mode default
          secondary: "#F8F9FA",
          tertiary: "#F1F3F5",
          card: "#FFFFFF",
          hover: "#F8F9FA",
          // Dark mode overrides should be handled in usage or via CSS vars if we want `bg-background-primary` to auto-switch.
          // Since we are just configuring tailwind, we'll expose the raw colors.
          "dark-primary": "#1A1D1F",
          "dark-secondary": "#232629",
          "dark-tertiary": "#2C3033",
          "dark-card": "#272B2E",
          "dark-hover": "#2F3538",
          "dark-elevated": "#323639",
        },

        text: {
          primary: "#1A1A1A",
          secondary: "#4A5568",
          tertiary: "#718096",
          disabled: "#A0AEC0",
          inverse: "#FFFFFF",
          // Dark mode
          "dark-primary": "#F8F9FA",
          "dark-secondary": "#E1E3E5",
          "dark-tertiary": "#A8B0B8",
          "dark-disabled": "#6B7280",
          "dark-inverse": "#1A1A1A",
        },

        success: {
          50: "#E6F9F0",
          100: "#CCF3E1",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          // Dark adjustments can be added if needed, or we rely on the main spread.
          "dark-50": "#D1FAE5",
          "dark-100": "#A7F3D0",
          "dark-500": "#34D399",
          "dark-600": "#10B981",
          "dark-700": "#059669",
        },

        error: {
          50: "#FEE2E2",
          100: "#FECACA",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          "dark-50": "#FEE2E2",
          "dark-100": "#FECACA",
          "dark-500": "#F87171",
          "dark-600": "#EF4444",
          "dark-700": "#DC2626",
        },

        warning: {
          50: "#FEF3C7",
          100: "#FDE68A",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          "dark-50": "#FEF3C7",
          "dark-100": "#FDE68A",
          "dark-500": "#FBBF24",
          "dark-600": "#F59E0B",
          "dark-700": "#D97706",
        },

        info: {
          50: "#DBEAFE",
          100: "#BFDBFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          "dark-50": "#DBEAFE",
          "dark-100": "#BFDBFE",
          "dark-500": "#60A5FA",
          "dark-600": "#3B82F6",
          "dark-700": "#2563EB",
        },

        border: {
          light: "#E5E7EB",
          medium: "#D1D5DB",
          dark: "#9CA3AF",
          focus: "#FFC300",
          "dark-light": "#3A3F44",
          "dark-medium": "#4B5259",
          "dark-dark": "#6B7280",
        },

        accent: {
          darkGreen: "#2D3E3A",
          mutfak: "#8B5A3C",
          icecek: "#4A9FBF",
          temizlik: "#8B4A8B",
        },
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.15)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        // We can add the specific dark shadows if needed, or just rely on default.
        "dark-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.2)",
        "dark-md": "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
        "dark-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
        "dark-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
