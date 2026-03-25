import { defineConfig } from 'vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [cloudflare()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html'    // ← tells Vite to bundle login.html too
      }
    },
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 5173,
    open: true
  }
})