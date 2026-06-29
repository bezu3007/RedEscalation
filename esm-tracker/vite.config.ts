import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  server: {
    proxy: {
      "/api": {
        target: "http://196.191.244.130:7040",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});