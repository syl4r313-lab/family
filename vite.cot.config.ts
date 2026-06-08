import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/family/cot/',
  build: {
    outDir: 'dist-cot',
    rollupOptions: {
      input: 'index.cot.html',
    },
  },
})
