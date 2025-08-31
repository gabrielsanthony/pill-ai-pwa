// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/', // leave this as-is
  root: '.',
  build: {
    outDir: 'dist'
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // 👇 make Workbox generate sw.js and load our shim
      strategies: 'generateSW',
      workbox: {
        importScripts: ['sw-extra.js'], // loads /public/sw-extra.js at runtime
      },
      manifest: {
        name: 'Pill-AI',
        short_name: 'PillAI',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
});