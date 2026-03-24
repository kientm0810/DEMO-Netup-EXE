import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Sora'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"],
      },
      colors: {
        ink: "#1F232B",
        steel: "#5B6270",
        aqua: "#B4232A",
        mint: "#9CA3AF",
        ember: "#7F1D1D",
      },
      boxShadow: {
        float: "0 18px 45px -20px rgba(98, 27, 38, 0.45)",
      },
      backgroundImage: {
        "noise-grid":
          "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
