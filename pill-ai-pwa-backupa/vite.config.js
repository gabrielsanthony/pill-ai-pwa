import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: '.',  // 👈 ensure Vite starts in this folder
  base: '/', // keeps relative asset paths
  build: {
    outDir: 'dist'  // 👈 ensure Vercel finds the build output
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'Pill-AI',
        short_name: 'PillAI',
        description: 'Pill-AI: Medication info and reminders',
        start_url: ".",
        theme_color: '#ffffff',
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      }
    })
  ]
})