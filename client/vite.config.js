import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../server/public',
    emptyOutDir: true
  },
  server: {
    host: true, // Exposes server to local network (Wi-Fi)
    port: 3000,
    watch: {
      ignored: ['**/66-ring-ornament/**', '**/*.3dm', '**/*.glb', '**/.git/**']
    }
  }
})
