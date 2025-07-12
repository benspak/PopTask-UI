import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // Exclude API endpoints and service worker files from precaching
        globIgnores: [
          '**/api/**',
          'sw.js',
          'workbox-*.js',
          '**/node_modules/**'
        ],
        // Runtime caching for API requests with better tab switching support
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/localhost:3001\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              cacheableResponse: {
                statuses: [0, 200]
              },
              // Add background sync for better offline support
              backgroundSync: {
                name: 'api-queue',
                options: {
                  maxRetentionTime: 24 * 60 // 24 hours
                }
              }
            }
          },
          {
            urlPattern: /^https?:\/\/localhost:5173\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        // Improved service worker behavior for tab switching
        skipWaiting: false, // Don't skip waiting to prevent disruption
        clientsClaim: true,
        // Handle fetch errors gracefully
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        // Clean up old caches
        cleanupOutdatedCaches: true,
        // Disable precaching in development to avoid issues
        disableDevLogs: true,
        // Add custom service worker events for better tab management
        additionalManifestEntries: [
          { url: '/', revision: '1' }
        ]
      },
      manifest: {
        name: 'Task Dashboard',
        short_name: 'Tasks',
        description: 'A modern task management dashboard for organizing your daily workflow',
        theme_color: '#3182ce',
        background_color: '#1a202c',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        shortcuts: [
          {
            name: 'Today\'s Tasks',
            short_name: 'Today',
            description: 'View tasks due today',
            url: '/?filter=today',
            icons: [
              {
                src: '/icons/icon-96x96.png',
                sizes: '96x96'
              }
            ]
          },
          {
            name: 'This Week',
            short_name: 'Week',
            description: 'View tasks due this week',
            url: '/?filter=week',
            icons: [
              {
                src: '/icons/icon-96x96.png',
                sizes: '96x96'
              }
            ]
          }
        ]
      }
    })
  ],
})
