import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.png", "**/*.svg"],

  // Optional: ensure build paths are clean for Vercel
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});