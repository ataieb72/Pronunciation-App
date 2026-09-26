import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

/**
 * GitHub Pages cannot send headers, so the policy goes in a meta tag, in builds only
 * (the dev server needs inline scripts). Scripts come only from the app itself, and
 * the page can talk only to itself and Azure Speech, which limits where the stored key can go.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.api.cognitive.microsoft.com https://*.stt.speech.microsoft.com wss://*.stt.speech.microsoft.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function contentSecurityPolicy(): Plugin {
  return {
    name: 'pc-content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY }, injectTo: 'head-prepend' },
    ],
  };
}

export default defineConfig(({ mode }) => ({
  // GitHub Pages serves the app from /<repository>/; the Pages workflow sets PC_BASE_PATH.
  base: process.env.PC_BASE_PATH ?? '/',
  plugins: [
    react(),
    contentSecurityPolicy(),
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
            // start_url and scope default to the build's base path.
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
          },
        }),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          // The key scan (tools/key-scan) exempts this chunk name from the header and method rules.
          groups: [{ name: 'azure-speech-sdk', test: /[\\/]node_modules[\\/]microsoft-cognitiveservices-speech-sdk[\\/]/ }],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
}));
