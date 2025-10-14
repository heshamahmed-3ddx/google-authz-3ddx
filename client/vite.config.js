import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    devSourcemap: true,
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        // Rewrite cookie domain so Set-Cookie from backend applies to the dev server origin
        cookieDomainRewrite: "localhost",
      },
      "/auth": {
        target: "http://localhost:3001",
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
