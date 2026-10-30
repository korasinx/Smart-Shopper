import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  // GitHub Pages serve em /<repo>/; BASE_PATH vem do workflow de deploy
  base: process.env.BASE_PATH ?? '/',
  server: {
    host: true,
    allowedHosts: ['.text99.com'],
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', '*.png', '*.svg'],
      devOptions: {
        enabled: true, // Enable in development for testing
        type: 'module',
        navigateFallback: 'index.html',
      },
      manifest: {
        name: 'Lista de Compras',
        short_name: 'Compras',
        description:
          'Lista de compras que funciona offline, com leitura de código de barras e entrada por voz',
        lang: 'pt-BR',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: './',
        scope: './',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Adicionar itens',
            short_name: 'Adicionar',
            description: 'Adicione itens rapidamente à sua lista de compras',
            url: './?action=add',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
              },
            ],
          },
          {
            name: 'Entrada por voz',
            short_name: 'Voz',
            description: 'Adicione itens falando',
            url: './?action=voice',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
              },
            ],
          },
        ],
      },
      workbox: {
        // Only precache in production to avoid dev warnings
        globPatterns: mode === 'production' ? ['**/*.{js,css,html,ico,png,svg,woff,woff2}'] : [],
        // Don't cache source maps in production
        globIgnores: ['**/*.map'],
        // Runtime caching strategies
        runtimeCaching: [
          // Cache Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache font files
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Cache all navigation requests (HTML)
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
          // Cache all same-origin requests (JS, CSS, images)
          {
            urlPattern: ({ sameOrigin }) => sameOrigin,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
        // Clean up old caches
        cleanupOutdatedCaches: true,
        // Skip waiting for service worker activation
        skipWaiting: true,
        // Claim clients immediately
        clientsClaim: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
