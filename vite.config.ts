import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'lucide-react/icons': fileURLToPath(
        new URL(
          './node_modules/lucide-react/dist/esm/icons',
          import.meta.url,
        ),
      ),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/graphql': { // Match the exact path you're calling
        target: 'https://staging.liveheats.com',
        changeOrigin: true,
      },
    },
  },
})
