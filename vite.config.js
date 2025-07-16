import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Fix for @emotion/react multiple instances
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    }),
    // Only enable PWA in production
    ...(mode === 'production' ? [VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false, // Disable in development
        type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // Exclude API endpoints and service worker files from precaching
        globIgnores: [
          '**/api/**',
          'sw.js',
          'workbox-*.js',
          '**/node_modules/**',
          '**/dev-dist/**' // Add development build exclusion
        ],
        // Simplified runtime caching for production
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/localhost:3001\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 2, // Reduced from 3s to 2s
              cacheableResponse: {
                statuses: [0, 200]
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
        // Simplified service worker behavior
        skipWaiting: true,
        clientsClaim: true,
        // Handle fetch errors gracefully
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        // Clean up old caches
        cleanupOutdatedCaches: true,
        // Disable precaching in development to avoid issues
        disableDevLogs: true
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
    })] : [])
  ],
  // Add development optimizations
  server: {
    hmr: {
      overlay: false // Disable error overlay for faster reloads
    },
    // Add these optimizations:
    watch: {
      usePolling: false,
      interval: 1000
    },
    // Force dependency pre-bundling
    force: true
  },
  // Optimize build for development
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined // Disable chunk splitting in dev
      }
    },
    // Disable source maps in development for faster builds
    sourcemap: false
  },
  // Add performance optimizations and fix dependency deduplication
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@chakra-ui/react',
      '@emotion/react',
      '@emotion/styled',
      'react-router-dom',
      'framer-motion'
    ],
    exclude: [],
    // Force deduplication of @emotion packages
    force: true,
    // Disable esbuild optimization to prevent MIME type issues
    esbuildOptions: {
      target: 'es2020'
    },
    // Fix outdated optimize deps by forcing re-optimization
    entries: [
      './src/main.jsx'
    ]
  },
  // Reduce chunk size warnings
  chunkSizeWarningLimit: 1000,
  // Add resolve configuration to ensure single instances
  resolve: {
    dedupe: ['@emotion/react', '@emotion/styled', 'react', 'react-dom'],
    alias: {
      // Force single React instance
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      '@emotion/react': path.resolve(__dirname, 'node_modules/@emotion/react'),
      '@emotion/styled': path.resolve(__dirname, 'node_modules/@emotion/styled')
    }
  },
  // Add esbuild configuration for better module handling
  esbuild: {
    target: 'es2020'
  },
  // Disable PWA in development to prevent module loading issues
  define: {
    __DEV__: mode === 'development'
  }
}))
