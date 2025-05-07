/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9b87f5",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#7E69AB",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ff0000",
          foreground: "#ffffff",
        },
        background: "#ffffff",
        foreground: "#000000",
        accent: "#f3f4f6",
        "accent-foreground": "#111827",
        input: "#d1d5db",
      },
    },
  },
  plugins: [],
}
