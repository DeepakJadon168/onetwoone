import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Backend API calls ke liye proxy (dev mode me)
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
