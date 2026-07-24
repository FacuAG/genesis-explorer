import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración recomendada para GitHub Codespaces y desarrollo local
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Escucha en 0.0.0.0 para que GitHub Codespaces pueda enrutar el puerto
    port: 5173,
    strictPort: true
  }
})
