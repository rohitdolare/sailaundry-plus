import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Increase cache size limit to 10 MB
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'SaiLaundry+',
        short_name: 'SaiLaundry+',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4f46e5',
        icons: [
          {
            src: 'pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  build: {
    // Increase chunk size warning threshold to 2 MB
    chunkSizeWarningLimit: 2000,
  },
});
