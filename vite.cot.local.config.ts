import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build for local/offline use: relative asset paths so the app
// works when opened from a local folder (no internet required).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist-cot-local',
    rollupOptions: {
      input: 'index.cot.html',
    },
  },
})
