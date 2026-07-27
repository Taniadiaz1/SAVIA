import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Esto permite que el Popup de Google hable con tu página
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
})