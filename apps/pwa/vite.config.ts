import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // The service worker and manifest matter only in real builds, not in unit tests.
    mode === 'test'
      ? []
      : VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
          manifest: {
            name: 'Pronunciation Coach',
            short_name: 'Coach',
            description: 'Clear-speech practice in English and French.',
            lang: 'en',
            start_url: '/',
            scope: '/',
            display: 'standalone',
            orientation: 'portrait',
            background_color: '#121216',
            theme_color: '#1f5fbf',
            icons: [
              { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
              { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
            // API calls always go to the network, never to the service-worker cache.
            navigateFallbackDenylist: [/^\/api\//],
          },
        }),
  ],
  server: {
    // `npm run dev` in apps/worker serves the API on port 8787.
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
}));
