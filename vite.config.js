import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de servidor para GitHub Codespaces (Puerto 3000)
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    allowedHosts: true
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    allowedHosts: true
  }
})
