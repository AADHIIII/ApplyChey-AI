import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        headers: {
          // Security headers
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        }
      },
      plugins: [
        react(),
        // Gzip compression
        viteCompression({
          algorithm: 'gzip',
          ext: '.gz',
          threshold: 10240, // Only compress files > 10KB
          deleteOriginFile: false
        }),
        // Brotli compression (better than gzip)
        viteCompression({
          algorithm: 'brotliCompress',
          ext: '.br',
          threshold: 10240,
          deleteOriginFile: false
        }),
        // Bundle analyzer (only in production build)
        isProduction && visualizer({
          filename: './dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true
        })
      ].filter(Boolean),
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        sourcemap: mode === 'development',
        // Improve build performance
        target: 'esnext',
        minify: 'esbuild',
        // Chunk size warnings
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            // Manual chunking for better caching
            manualChunks: {
              // Core React libraries
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              // Firebase services
              'firebase-vendor': [
                'firebase/app', 
                'firebase/auth', 
                'firebase/firestore',
                'firebase/functions'
              ],
              // UI and animations
              'ui-vendor': ['framer-motion'],
              // PDF generation
              'pdf-vendor': ['jspdf'],
              // AI services
              'ai-vendor': ['@google/genai']
            },
            // Clean file names
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
          },
        },
        // Optimize dependencies
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true
        }
      },
      // Optimize dependencies
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          'firebase/app',
          'firebase/auth',
          'firebase/firestore',
          'framer-motion'
        ],
        exclude: ['@google/genai'] // ESM only
      },
      // Performance settings
      esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' },
        // Remove console logs in production
        drop: isProduction ? ['console', 'debugger'] : []
      }
    };
});
