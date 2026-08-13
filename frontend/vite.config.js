import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

// Docker konteynerda ishlayotganligini aniqlash (/.dockerenv mavjud bo'lsa Docker deb olinadi)
const isDocker = fs.existsSync('/.dockerenv')

const defaultBackend = isDocker ? 'http://backend:3000' : 'http://localhost:3000'
const defaultCertificate = isDocker ? 'http://certificate:8000' : 'http://localhost:8000'

const backendTarget = process.env.VITE_BACKEND_URL || process.env.BACKEND_URL || defaultBackend
const certificateTarget = process.env.VITE_CERTIFICATE_URL || defaultCertificate

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'UITS Student Manager',
        short_name: 'UITS',
        description: 'UITS O\'quv Markazi Boshqaruv Tizimi',
        theme_color: '#7c3aed',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    include: ['react-is']
  },
  server: {
    host: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/sertifikat': {
        target: certificateTarget,
        changeOrigin: true,
      },
    },
  },
})
