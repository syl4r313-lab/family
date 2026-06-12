import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build for local/offline use: relative asset paths, PWA manifest + service
// worker so the app installs and runs as a standalone window without
// internet access.
export default defineConfig({
  plugins: [react()],
  base: './',
  publicDir: 'public-cot-local',
  build: {
    outDir: 'dist-cot-local',
    rollupOptions: {
      input: 'index.cot.local.html',
    },
  },
})
