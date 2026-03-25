import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Force SVG/asset files to be emitted instead of data: URLs.
    // This avoids environment-specific issues (for example CSP on hosted platforms).
    assetsInlineLimit: 0,
  },
});
