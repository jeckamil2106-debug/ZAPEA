import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,

    https: {
      key: readFileSync('./192.168.18.42+2-key.pem'),
      cert: readFileSync('./192.168.18.42+2.pem'),
    },

    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
rewrite: (path) =>
  path.replace(/^\/api/, ''),
      },
    },
  },
})