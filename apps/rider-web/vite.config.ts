import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Rider web app. Talks to the API at VITE_API_URL (default http://localhost:3000).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  preview: { port: 5173, host: true },
});
