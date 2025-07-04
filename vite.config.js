import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    host: "0.0.0.0",
    historyApiFallback: true,
  },
  optimizeDeps: {
    include: ["axios"],
  },
  build: {
    outDir: "dist",
  },
});
