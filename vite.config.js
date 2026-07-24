import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de servidor para GitHub Codespaces y desarrollo local
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true // Permitir subdominios de GitHub Codespaces (*.app.github.dev)
  }
})
