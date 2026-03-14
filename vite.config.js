import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  root: 'frontend',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../dist', 
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api/germinate': 'http://localhost:8000',
      '/api/login': 'http://localhost:8000',
      '/api/register': 'http://localhost:8000',
      '/api/tasks': 'http://localhost:8000',
      '/api/dailies': 'http://localhost:8000',
      '/api/health': 'http://localhost:8000',
      '/api/check-user': 'http://localhost:8000',
    }
  }
})