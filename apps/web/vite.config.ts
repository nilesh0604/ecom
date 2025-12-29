import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

/**
 * Vite Configuration
 * 
 * Interview Discussion Points:
 * - Vite vs Webpack: ESBuild for dev, Rollup for prod
 * - HMR: Hot Module Replacement, instant updates
 * - Bundle Analysis: Identify large dependencies, code splitting opportunities
 * - Tree Shaking: Remove unused code, ES modules required
 */

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html in build output
    // Only run in analyze mode: npm run build:analyze
    mode === 'analyze' && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 'sunburst' | 'treemap' | 'network'
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Enable source maps for production debugging
    sourcemap: mode === 'development',
    
    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks - rarely change, cache well
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // UI chunks
          'ui-components': [
            // List shared UI component paths if using barrel exports
          ],
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        
        // Entry file naming
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
  },
  
  // Performance optimizations
  optimizeDeps: {
    // Pre-bundle these dependencies
    include: ['react', 'react-dom', 'react-router-dom', '@reduxjs/toolkit'],
  },
  
  // Server configuration
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    // Proxy API requests to backend during development
    // This avoids CORS issues and simulates production routing
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Uncomment to debug proxy requests
        // configure: (proxy, _options) => {
        //   proxy.on('proxyReq', (proxyReq, req) => {
        //     console.log('[Proxy]', req.method, req.url, '->', proxyReq.path);
        //   });
        // },
      },
    },
  },
  
  // Preview configuration (for production build testing)
  preview: {
    port: 4173,
    strictPort: true,
  },
}))