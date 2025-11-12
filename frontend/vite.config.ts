import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'vite.svg', 'icons/*.png'],
      manifest: {
        name: 'JobCrawl - Jobb-søk og søknadshåndtering',
        short_name: 'JobCrawl',
        description: 'Automatisk jobb-søk, søknadshåndtering og AI-genererte søknadstekster',
        theme_color: '#f97316',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        scope: '/JobCrawl/',
        start_url: '/JobCrawl/',
        icons: [
          {
            src: '/JobCrawl/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/JobCrawl/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/JobCrawl/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/JobCrawl/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/JobCrawl/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/JobCrawl/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/JobCrawl/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/JobCrawl/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Søk jobber',
            short_name: 'Søk',
            description: 'Søk etter nye jobber',
            url: '/JobCrawl/jobs',
            icons: [{ src: '/JobCrawl/icons/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Mine søknader',
            short_name: 'Søknader',
            description: 'Se mine søknader',
            url: '/JobCrawl/applications',
            icons: [{ src: '/JobCrawl/icons/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Se oversikt',
            url: '/JobCrawl/dashboard',
            icons: [{ src: '/JobCrawl/icons/icon-96x96.png', sizes: '96x96' }]
          }
        ],
        categories: ['productivity', 'business', 'utilities']
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB (default is 2 MB) - increased for large images
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/jobs/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'jobs-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60 // 5 minutes
              }
            }
          },
          {
            urlPattern: /\/api\/applications/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'applications-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          },
          {
            urlPattern: /\/api\/profile/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'profile-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          },
          {
            urlPattern: /\/api\/auth\/me/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'user-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 5 * 60 // 5 minutes
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true, // Enable PWA in development (needed for Brave)
        type: 'module',
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/]
      }
    })
  ],
  base: '/JobCrawl/', // GitHub Pages base path
  server: {
    port: 5173,
    strictPort: false, // Allow other ports if 5173 is taken
    open: false, // Don't auto-open browser
    host: true, // Listen on all network interfaces (0.0.0.0) - allows mobile/tablet access
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps for faster builds
    minify: 'esbuild', // Use esbuild for faster minification
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion'],
          // Code splitting for better initial load
          api: ['axios'],
        },
      },
    },
    // Enable code splitting
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'framer-motion'],
  },
})
