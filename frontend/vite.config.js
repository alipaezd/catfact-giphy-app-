import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Necesario para que Docker exponga el puerto
    port: 3000 // Asegúrate de que coincida con el puerto expuesto en Dockerfile y docker-compose
  }
})