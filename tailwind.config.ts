import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}", // App Router (Next.js 13+)
    "./src/components/**/*.{js,ts,jsx,tsx}", // Reusable components
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A73E8",
        secondary: "#FF6D00",
        accent: "#34A853",
      },
    },
  },
  plugins: [],
};

export default config;
