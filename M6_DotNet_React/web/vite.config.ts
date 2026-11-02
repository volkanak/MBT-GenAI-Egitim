import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// /api isteklerini .NET API'ye yönlendir (CORS derdi olmadan)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:5080" },
  },
});
