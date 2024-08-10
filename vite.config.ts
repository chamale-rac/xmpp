import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: {},
    "global.WebSocket": "window.WebSocket", // Ensure WebSocket is available globally
    "global.btoa": "window.btoa.bind(window)", // Ensure btoa is available globally
    "process.env": {},
  },
});
