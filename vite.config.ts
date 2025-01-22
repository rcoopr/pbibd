import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
